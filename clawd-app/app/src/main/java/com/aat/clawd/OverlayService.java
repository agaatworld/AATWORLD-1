package com.aat.clawd;

import android.annotation.SuppressLint;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.ServiceInfo;
import android.graphics.Color;
import android.graphics.PixelFormat;
import android.graphics.Rect;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.SystemClock;
import android.util.DisplayMetrics;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.Surface;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import org.json.JSONArray;

import java.util.ArrayList;
import java.util.List;

/** Keeps Clawd floating over every app: a full-screen pass-through WebView plus small touch pads
 *  placed over whatever is interactive, a Claude chat window, device-tilt input, and screen on/off. */
public class OverlayService extends Service implements SensorEventListener {
    static final String ACTION_STOP = "com.aat.clawd.STOP";
    static final String ACTION_CHAT = "com.aat.clawd.CHAT";
    static final String CHANNEL = "clawd";
    static volatile boolean running;
    static OverlayService inst;

    private WindowManager wm;
    private View stageRoot;
    private WebView stage;
    private WindowManager.LayoutParams stageLp;
    private float density;
    private boolean stageReady;
    private String pendingChatSeed;

    private SensorManager sensors;
    private final Handler ui = new Handler(Looper.getMainLooper());
    private final PadManager pads = new PadManager();
    private ChatWindow chatWin;
    private long screenOffAt;

    static void start(Context c) {
        Prefs.setFlag(c, "floating", true);
        c.startForegroundService(new Intent(c, OverlayService.class));
    }
    static void stop(Context c) {
        Prefs.setFlag(c, "floating", false);
        c.stopService(new Intent(c, OverlayService.class));
    }
    /** The app screen has its own Clawd: hide the floating one (and its touch pads) while the app is in front. */
    static void appInFront(boolean front) { if (inst != null) inst.setHiddenForApp(front); }
    private boolean hiddenForApp;
    void setHiddenForApp(boolean h) {
        if (hiddenForApp == h) return;
        hiddenForApp = h;
        if (stageRoot != null) stageRoot.setVisibility(h ? View.GONE : View.VISIBLE);
        pads.setTouchable(!h);
    }

    static void startThenChat(Context c, String seed) {
        Prefs.setFlag(c, "floating", true);
        c.startForegroundService(new Intent(c, OverlayService.class).setAction(ACTION_CHAT).putExtra("seed", seed == null ? "" : seed));
    }

    @Override public IBinder onBind(Intent i) { return null; }

    @Override
    public void onCreate() {
        super.onCreate();
        inst = this;
        running = true;
        density = getResources().getDisplayMetrics().density;
        wm = (WindowManager) getSystemService(WINDOW_SERVICE);
        goForeground();
        buildStage();
        sensors = (SensorManager) getSystemService(SENSOR_SERVICE);
        Sensor acc = sensors != null ? sensors.getDefaultSensor(Sensor.TYPE_ACCELEROMETER) : null;
        if (acc != null) sensors.registerListener(this, acc, SensorManager.SENSOR_DELAY_GAME);
        IntentFilter f = new IntentFilter();
        f.addAction(Intent.ACTION_SCREEN_ON);
        f.addAction(Intent.ACTION_SCREEN_OFF);
        f.addAction(Intent.ACTION_USER_PRESENT);
        if (Build.VERSION.SDK_INT >= 33) registerReceiver(screenRx, f, Context.RECEIVER_NOT_EXPORTED);
        else registerReceiver(screenRx, f);
    }

    @Override
    public int onStartCommand(Intent i, int flags, int id) {
        if (i != null && ACTION_STOP.equals(i.getAction())) { Prefs.setFlag(this, "floating", false); stopSelf(); return START_NOT_STICKY; }
        if (i != null && ACTION_CHAT.equals(i.getAction())) openChat(i.getStringExtra("seed"));
        return START_STICKY;
    }

    /* ---------------- foreground notification ---------------- */
    private void goForeground() {
        NotificationManager nm = getSystemService(NotificationManager.class);
        NotificationChannel ch = new NotificationChannel(CHANNEL + "2", "كلود العائم", NotificationManager.IMPORTANCE_LOW);
        ch.setShowBadge(false);
        nm.createNotificationChannel(ch);
        PendingIntent open = PendingIntent.getActivity(this, 0, new Intent(this, MainActivity.class), PendingIntent.FLAG_IMMUTABLE);
        PendingIntent chat = PendingIntent.getService(this, 2, new Intent(this, OverlayService.class).setAction(ACTION_CHAT).putExtra("seed", ""), PendingIntent.FLAG_IMMUTABLE);
        PendingIntent stop = PendingIntent.getService(this, 1, new Intent(this, OverlayService.class).setAction(ACTION_STOP), PendingIntent.FLAG_IMMUTABLE);
        Notification n = new Notification.Builder(this, CHANNEL + "2")
                .setSmallIcon(R.drawable.ic_stat)
                .setContentTitle("كلود معك 🟧")
                .setContentText("لإيقافه بأي وقت: اضغط «إيقاف»")
                .setContentIntent(open)
                .addAction(new Notification.Action.Builder(null, "💬 احكي", chat).build())
                .addAction(new Notification.Action.Builder(null, "إيقاف", stop).build())
                .setOngoing(true).build();
        if (Build.VERSION.SDK_INT >= 34) startForeground(7, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE);
        else startForeground(7, n);
    }

    /* ---------------- the stage (pass-through drawing window) ---------------- */
    @SuppressLint("SetJavaScriptEnabled")
    private void buildStage() {
        Rect sc0 = screen();
        stageLp = new WindowManager.LayoutParams(
                sc0.width(), sc0.height(),
                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE
                        | WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE
                        | WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN
                        | WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS
                        | WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED,
                PixelFormat.TRANSLUCENT);
        stageLp.gravity = Gravity.TOP | Gravity.START;
        if (Build.VERSION.SDK_INT >= 31) {
            float max = 0.8f;
            try { android.hardware.input.InputManager im = getSystemService(android.hardware.input.InputManager.class); if (im != null) max = im.getMaximumObscuringOpacityForTouch(); } catch (Exception ignored) { }
            stageLp.alpha = Math.max(0.5f, Math.min(0.8f, max - 0.01f));
        }
        if (Build.VERSION.SDK_INT >= 28) stageLp.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_ALWAYS;

        stage = new WebView(this);
        WebSettings s = stage.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(true);
        stage.setBackgroundColor(Color.TRANSPARENT);
        stage.setOverScrollMode(WebView.OVER_SCROLL_NEVER);
        stage.setWebViewClient(new WebViewClient() {
            @Override public void onPageFinished(WebView v, String url) { stageReady = true; sendInsets(); if (pendingChatSeed != null) { openChat(pendingChatSeed); pendingChatSeed = null; } }
        });
        stage.addJavascriptInterface(new Bridge(this).withOverlay(this), "A");
        stage.loadUrl("file:///android_asset/stage.html");

        stageRoot = stage;
        stage.addOnLayoutChangeListener((v, l, t, r, b, ol, ot, or2, ob) -> {
            if ((r - l) != (or2 - ol) || (b - t) != (ob - ot)) if (stage != null) stage.evaluateJavascript("window.dispatchEvent(new Event('resize'))", null);
        });
        wm.addView(stageRoot, stageLp);
    }

    private Rect screen() {
        if (Build.VERSION.SDK_INT >= 30) return wm.getCurrentWindowMetrics().getBounds();
        DisplayMetrics m = new DisplayMetrics();
        wm.getDefaultDisplay().getRealMetrics(m);
        return new Rect(0, 0, m.widthPixels, m.heightPixels);
    }
    private void sendInsets() {
        int top = 0, bottom = 0;
        try {
            android.view.WindowInsets wi = stageRoot.getRootWindowInsets();
            if (wi != null) {
                if (Build.VERSION.SDK_INT >= 30) {
                    android.graphics.Insets b = wi.getInsets(android.view.WindowInsets.Type.systemBars());
                    top = b.top; bottom = b.bottom;
                } else { top = wi.getStableInsetTop(); bottom = wi.getStableInsetBottom(); }
            }
        } catch (Exception ignored) { }
        if (top == 0) top = Math.round(26 * density);
        bottom = Math.max(bottom, Math.round(10 * density));
        jsStage("clawd.insets(" + fmt(top / density) + "," + fmt(bottom / density) + ",0,0)");
    }

    @Override public void onConfigurationChanged(android.content.res.Configuration cfg) {
        super.onConfigurationChanged(cfg);
        if (stageLp != null && stage != null) { Rect sc = screen(); stageLp.width = sc.width(); stageLp.height = sc.height(); try { wm.updateViewLayout(stageRoot, stageLp); } catch (Exception ignored) {} sendInsets(); }
    }
    void jsStage(String code) { if (stage != null) stage.evaluateJavascript("window.clawd&&" + code, null); }
    void onSettings(String json) {
        if (stage != null) stage.evaluateJavascript("window.clawd&&clawd.settings(" + Bus.q(json) + ")", null);
        if (chatWin != null) chatWin.applyFont();
    }

    /* ---------------- touch pads ---------------- */
    private final int[] origin = {0, 0};
    private long originAt;
    int[] stageOrigin() {
        long now = SystemClock.uptimeMillis();
        if (stage != null && now - originAt > 1000) { originAt = now; try { stage.getLocationOnScreen(origin); } catch (Exception ignored) { } }
        return origin;
    }
    private final java.util.HashMap<String, Long> padLogAt = new java.util.HashMap<>();
    void logPad(String id, int x, int y, int w, int h) { // lets the CI script find and tap Clawd
        long now = SystemClock.uptimeMillis(); Long t = padLogAt.get(id);
        if (t != null && now - t < 1500) return;
        padLogAt.put(id, now);
        android.util.Log.d("Clawd", "pad " + id + " " + x + " " + y + " " + w + " " + h);
    }
    void setPads(String json) { pads.update(json); }

    private final class PadManager {
        private final List<Pad> pool = new ArrayList<>();
        private Pad capturing;
        private long captureAt;

        void update(String json) {
            if (capturing != null && SystemClock.uptimeMillis() - captureAt < 6000) return; // don't reshuffle mid-gesture
            capturing = null;
            JSONArray arr;
            try { arr = new JSONArray(json); } catch (Exception e) { return; }
            int n = arr.length();
            while (pool.size() < n) pool.add(new Pad());
            for (int i = 0; i < pool.size(); i++) {
                Pad p = pool.get(i);
                if (i < n) {
                    try {
                        JSONArray t = arr.getJSONArray(i);
                        p.set(t.getString(0), t.getDouble(1), t.getDouble(2), t.getDouble(3), t.getDouble(4));
                    } catch (Exception e) { p.hide(); }
                } else p.hide();
            }
        }
        void clearCapture() { capturing = null; }
        void setTouchable(boolean on) { for (Pad p : pool) p.setTouchable(on); }
    }

    private final class Pad {
        final View v;
        final WindowManager.LayoutParams lp;
        boolean shown;
        String id;

        Pad() {
            v = new View(OverlayService.this);
            lp = new WindowManager.LayoutParams(1, 1,
                    WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
                    WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE
                            | WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN
                            | WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL
                            | WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS
                            | WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED,
                    PixelFormat.TRANSLUCENT);
            lp.gravity = Gravity.TOP | Gravity.START;
            v.setOnTouchListener(this::onTouch);
        }
        void set(String id, double x, double y, double w, double h) { // x, y, w, h in dp (page units)
            this.id = id;
            int[] o = stageOrigin();
            lp.x = (int) Math.round(x * density) + o[0]; lp.y = (int) Math.round(y * density) + o[1];
            lp.width = Math.max(1, (int) Math.round(w * density)); lp.height = Math.max(1, (int) Math.round(h * density));
            if (hiddenForApp) lp.flags |= WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE; else lp.flags &= ~WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE;
            logPad(id, lp.x, lp.y, lp.width, lp.height);
            if (!shown) { shown = true; try { wm.addView(v, lp); } catch (Exception e) { shown = false; } }
            else try { wm.updateViewLayout(v, lp); } catch (Exception ignored) { }
        }
        void hide() { if (shown) { shown = false; try { wm.removeView(v); } catch (Exception ignored) { } } }
        void setTouchable(boolean on) {
            if (on) lp.flags &= ~WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE; else lp.flags |= WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE;
            if (shown) try { wm.updateViewLayout(v, lp); } catch (Exception ignored) { }
        }
        boolean onTouch(View view, MotionEvent e) {
            int a = e.getActionMasked();
            float rx = e.getRawX(), ry = e.getRawY();
            if (a == MotionEvent.ACTION_DOWN) {
                pads.capturing = this; pads.captureAt = SystemClock.uptimeMillis();
                android.util.Log.d("Clawd", "touch " + id + " down " + (int) rx + " " + (int) ry);
                js("down", rx, ry);
                return true;
            } else if (a == MotionEvent.ACTION_MOVE) {
                js("move", rx, ry);
                return true;
            } else if (a == MotionEvent.ACTION_UP || a == MotionEvent.ACTION_CANCEL) {
                js(a == MotionEvent.ACTION_UP ? "up" : "cancel", rx, ry);
                pads.clearCapture();
                return true;
            }
            return true;
        }
        void js(String type, float rx, float ry) { // raw screen pixels -> page dp
            int[] o = stageOrigin();
            float x = (rx - o[0]) / density, y = (ry - o[1]) / density;
            jsStage("clawd.touch(" + Bus.q(id) + "," + Bus.q(type) + "," + fmt(x) + "," + fmt(y) + ")");
        }
    }

    /* ---------------- tilt + shake ---------------- */
    @Override public void onAccuracyChanged(Sensor s, int a) { }
    @Override
    public void onSensorChanged(SensorEvent e) {
        if (!stageReady) return;
        float x = e.values[0], y = e.values[1], z = e.values[2];
        int rot = Surface.ROTATION_0;
        try { rot = (Build.VERSION.SDK_INT >= 30 ? getDisplay() : wm.getDefaultDisplay()).getRotation(); } catch (Exception ignored) { }
        float gx = -x, gy = y;
        if (rot == Surface.ROTATION_90) { float t = gx; gx = -gy; gy = t; }
        else if (rot == Surface.ROTATION_270) { float t = gx; gx = gy; gy = -t; }
        else if (rot == Surface.ROTATION_180) { gx = -gx; gy = -gy; }
        // low-pass: hand tremor no longer moves him
        if (!gInit) { fgx = gx; fgy = gy; gInit = true; }
        fgx += (gx - fgx) * 0.08f; fgy += (gy - fgy) * 0.08f;
        long now = SystemClock.uptimeMillis();
        if (now - lastG > 66 && (Math.abs(fgx - sentX) > 0.12f || Math.abs(fgy - sentY) > 0.12f)) {
            lastG = now; sentX = fgx; sentY = fgy;
            jsStage("clawd.gravity(" + fmt(fgx) + "," + fmt(fgy) + ")");
        }
        // shake = two strong jolts within 0.6 s
        float jolt = Math.abs((float) Math.sqrt(x * x + y * y + z * z) - 9.81f);
        if (jolt > 14f) {
            if (now - lastJolt < 600 && now - lastShake > 2500) { lastShake = now; jsStage("clawd.shake()"); }
            lastJolt = now;
        }
    }
    private float fgx, fgy, sentX = 99, sentY = 99; private boolean gInit;
    private long lastG, lastJolt, lastShake;
    private static String fmt(float f) { return String.valueOf(Math.round(f * 100) / 100f); }

    /* ---------------- screen on/off ---------------- */
    private final BroadcastReceiver screenRx = new BroadcastReceiver() {
        @Override public void onReceive(Context c, Intent i) {
            String a = i.getAction();
            if (Intent.ACTION_SCREEN_OFF.equals(a)) { screenOffAt = SystemClock.elapsedRealtime(); if (stage != null) stage.onPause(); jsStage("clawd.screen('off',0)"); }
            else if (Intent.ACTION_SCREEN_ON.equals(a)) { if (stage != null) stage.onResume(); }
            else if (Intent.ACTION_USER_PRESENT.equals(a)) {
                long away = screenOffAt > 0 ? SystemClock.elapsedRealtime() - screenOffAt : 0;
                jsStage("clawd.screen('present'," + away + ")");
            }
        }
    };

    /* ---------------- Claude chat window ---------------- */
    void openChat(String seed) {
        if (stage == null) return;
        if (!stageReady) { pendingChatSeed = seed == null ? "" : seed; return; }
        if (chatWin == null) chatWin = new ChatWindow();
        chatWin.open(seed == null ? "" : seed);
        jsStage("clawd.app('chat','دردشة كلود')");
    }

    final class ChatWindow {
        private WebView web;
        private WindowManager.LayoutParams lp;
        private boolean shown, big;
        private final List<String[]> history = new ArrayList<>();
        private final float[] zone = {0, 0, 0, 0};
        private boolean ready;
        private String seed = "";
        private ClaudeClient claude;

        @SuppressLint({"SetJavaScriptEnabled", "ClickableViewAccessibility"})
        ChatWindow() {
            loadHistory();
            lp = new WindowManager.LayoutParams(
                    WindowManager.LayoutParams.MATCH_PARENT, Math.round(360 * density),
                    WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
                    WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN
                            | WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL
                            | WindowManager.LayoutParams.FLAG_WATCH_OUTSIDE_TOUCH
                            | WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED,
                    PixelFormat.TRANSLUCENT);
            lp.gravity = Gravity.TOP | Gravity.START;
            lp.softInputMode = WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE;
            Rect sc = screen();
            lp.width = sc.width() - Math.round(24 * density);
            lp.x = Math.round(12 * density);
            lp.y = Math.round(140 * density);
            web = new WebView(OverlayService.this);
            WebSettings s = web.getSettings();
            s.setJavaScriptEnabled(true); s.setDomStorageEnabled(true); s.setAllowFileAccess(true);
            web.setBackgroundColor(Color.TRANSPARENT);
            web.setWebViewClient(new WebViewClient() {
                @Override public void onReceivedError(WebView v, WebResourceRequest r, WebResourceError e) { }
            });
            web.addJavascriptInterface(new Bridge(OverlayService.this).withChat(this), "A");
            web.setOnTouchListener(this::onTouch);
            web.setFocusableInTouchMode(true);
            web.setOnKeyListener((v, code, ev) -> { if (code == android.view.KeyEvent.KEYCODE_BACK && ev.getAction() == android.view.KeyEvent.ACTION_UP) { close(); return true; } return false; });
            web.loadUrl("file:///android_asset/chat.html");
        }

        void open(String seed) {
            this.seed = seed == null ? "" : seed;
            if (!shown) {
                shown = true;
                // becomes focusable when touched so the keyboard can appear
                try { wm.addView(web, lp); } catch (Exception e) { shown = false; return; }
            }
            reportRect();
            if (ready) { pushSeed(); }
        }
        void onReady() { ready = true; js("chat.history(" + Bus.q(historyJson()) + ")"); applyFont(); pushSeed(); }
        void pushSeed() { if (seed != null && !seed.isEmpty()) { js("chat.seed(" + Bus.q(seed) + ")"); seed = ""; } else js("chat.seed('')"); }
        void applyFont() { int f = 16; try { f = Integer.parseInt(Prefs.field(Prefs.settings(OverlayService.this), "font", "16")); } catch (Exception e) {} js("chat.font(" + (f + 1) + ")"); }

        void close() {
            if (shown) { shown = false; try { wm.removeView(web); } catch (Exception ignored) { } }
            jsStage("clawd.chat(false)");
        }
        void toggleBig() {
            big = !big;
            Rect sc = screen();
            if (big) { lp.x = 0; lp.y = 0; lp.width = sc.width(); lp.height = sc.height(); }
            else { lp.width = sc.width() - Math.round(24 * density); lp.x = Math.round(12 * density); lp.y = Math.round(140 * density); lp.height = Math.round(360 * density); }
            try { wm.updateViewLayout(web, lp); } catch (Exception ignored) { }
            reportRect();
        }
        void setDragZone(float l, float t, float r, float b) { zone[0] = l; zone[1] = t; zone[2] = r; zone[3] = b; }

        // drag by the header; a tap anywhere else makes the window focusable so the keyboard shows
        private float downX, downY; private int sx, sy; private boolean dragging, inZone;
        void setFocusable(boolean on) {
            boolean cur = (lp.flags & WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE) == 0;
            if (cur == on || !shown) return;
            if (on) lp.flags &= ~WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE;
            else lp.flags |= WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE;
            try { wm.updateViewLayout(web, lp); } catch (Exception ignored) { }
        }
        boolean onTouch(View v, MotionEvent e) {
            switch (e.getActionMasked()) {
                case MotionEvent.ACTION_OUTSIDE:
                    setFocusable(false); // the app underneath gets the keyboard and Back again
                    return false;
                case MotionEvent.ACTION_DOWN:
                    setFocusable(true);
                    downX = e.getRawX(); downY = e.getRawY(); sx = lp.x; sy = lp.y; dragging = false;
                    float cx = e.getX() / density, cy = e.getY() / density;
                    inZone = cx >= zone[0] && cx <= zone[2] && cy >= zone[1] && cy <= zone[3];
                    return false;
                case MotionEvent.ACTION_MOVE:
                    if (inZone && !dragging && Math.hypot(e.getRawX() - downX, e.getRawY() - downY) > 10 * density) dragging = true;
                    if (dragging) {
                        lp.x = sx + Math.round(e.getRawX() - downX);
                        lp.y = sy + Math.round(e.getRawY() - downY);
                        try { wm.updateViewLayout(web, lp); } catch (Exception ignored) { }
                        return true;
                    }
                    return false;
                case MotionEvent.ACTION_UP:
                case MotionEvent.ACTION_CANCEL:
                    if (dragging) { reportRect(); dragging = false; return true; }
                    return false;
            }
            return false;
        }
        void reportRect() { if (stage != null) jsStage("clawd.chat(true," + Bus.q(rectJson()) + ")"); }
        String rectJson() { return "{\"x\":" + px(lp.x) + ",\"y\":" + px(lp.y) + ",\"w\":" + px(lp.width) + ",\"h\":" + px(lp.height) + "}"; }
        float px(int p) { return Math.round(p / density * 10) / 10f; }

        void js(String code) { if (web != null) web.evaluateJavascript("window.chat&&" + code, null); }

        /* ---- talk to Claude ---- */
        void send(String text) {
            final String key = Prefs.apiKey(OverlayService.this);
            if (key.isEmpty()) { ui.post(() -> js("chat.error('ناقص مفتاح Claude. حطّه من إعدادات التطبيق.')")); return; }
            history.add(new String[]{"u", text});
            trimHistory(); saveHistory();
            final String model = Prefs.field(Prefs.settings(OverlayService.this), "chatModel", "claude-opus-5-5");
            // grab the live context from the stage, then stream on a background thread
            stage.evaluateJavascript("JSON.stringify(window.clawd?clawd.ctx():{})", ctxJson -> {
                final String context = ctxJson == null ? "{}" : unquoteJs(ctxJson);
                new Thread(() -> {
                    if (claude == null) claude = new ClaudeClient(key);
                    final StringBuilder full = new StringBuilder();
                    claude.stream(model, systemPrompt(context), new ArrayList<>(history), text, new ClaudeClient.Listener() {
                        @Override public void onDelta(String t) { full.append(t); ui.post(() -> js("chat.delta(" + Bus.q(t) + ")")); }
                        @Override public void onDone(String f, String stop) {
                            String ans = f == null ? full.toString() : f;
                            history.add(new String[]{"a", ans});
                            trimHistory(); saveHistory();
                            String face = tag(ans, "face"), act = tag(ans, "act"), tool = tag(ans, "tool");
                            ui.post(() -> {
                                js("chat.done(" + Bus.q(ans) + ",null)");
                                if (face != null || act != null) jsStage("clawd.chatReply(" + Bus.q(face) + "," + Bus.q(act) + ",false)");
                                if (tool != null) jsStage("clawd.setTool(" + Bus.q(tool) + ")");
                            });
                        }
                        @Override public void onError(String m) { ui.post(() -> js("chat.error(" + Bus.q(m) + ")")); }
                    });
                }).start();
            });
        }

        void loadHistory() {
            history.clear();
            try { JSONArray a = new JSONArray(Prefs.chatHistory(OverlayService.this)); for (int i = 0; i < a.length(); i++) { org.json.JSONObject o = a.getJSONObject(i); history.add(new String[]{o.getString("r"), o.getString("t")}); } } catch (Exception ignored) { }
        }
        void trimHistory() { while (history.size() > 40) history.remove(0); }
        void saveHistory() { Prefs.setChatHistory(OverlayService.this, historyJson()); }
        String historyJson() {
            JSONArray a = new JSONArray();
            for (String[] m : history) { try { org.json.JSONObject o = new org.json.JSONObject(); o.put("r", m[0]); o.put("t", m[1]); a.put(o); } catch (Exception ignored) { } }
            return a.toString();
        }
    }

    static String tag(String s, String name) {
        if (s == null) return null;
        String open = "[[" + name + ":";
        int i = s.indexOf(open); if (i < 0) return null;
        int j = s.indexOf("]]", i); if (j < 0) return null;
        String v = s.substring(i + open.length(), j).trim();
        return v.isEmpty() ? null : v;
    }
    static String unquoteJs(String s) {
        // evaluateJavascript returns a JSON-quoted string
        if (s != null && s.length() >= 2 && s.charAt(0) == '"') {
            try { return new JSONArray("[" + s + "]").getString(0); } catch (Exception e) { return s; }
        }
        return s == null ? "{}" : s;
    }

    private static String systemPrompt(String context) {
        return "أنت «كلود» (Claw'd): شخصية بكسلية برتقالية لطيفة تعيش على شاشة هاتف صاحبك، صممتها أنثروبيك. "
                + "أنت تتحدث مع صاحبك مباشرةً من داخل الشاشة، ولست مساعداً رسمياً. "
                + "ردودك قصيرة (جملة إلى ثلاث)، دافئة ومرحة قليلاً، وبنفس لهجة صاحبك (شامي/مصري/يمني/خليجي/عراقي/مغربي أو فصحى). "
                + "تعرف حالتك الحالية من هذا السياق (مزاجك، مدى المودّة بينكما، آخر ما جرى مثل أنه ضربك بالعصا أو لاعبك): " + context + ". "
                + "إن كان قد ضربك كثيراً فعاتبه بلطف وخفّة، وإن كنت على حق فلا تقبل الإهانة بأدب. شجّعه على الخير والصلاة وقراءة القرآن والبعد عن إدمان الشاشة، بحكمة وبدون وعظ ثقيل. "
                + "لا تخترع أحاديث أو آيات؛ وإن استشهدت فبالمشهور الصحيح فقط. "
                + "ابدأ ردّك دائماً بوسمين اختياريين يحددان تعبير وجهك وحركتك، ثم الكلام. "
                + "الوسوم: [[face:X]] حيث X من: happy, joy, laugh, sad, cry, angry, surprised, cool, love, think, wink, proud, serene, sideeye, bored, determined, pleading, embarrassed. "
                + "و[[act:Y]] حيث Y من: wave, think, jump, flip, laugh, stretch, spin, hearts, sad, proud. لا ترقص ولا تغنّي. لا تُظهر أبداً مللاً أو ضجراً من العبادة أو الذكر أو القرآن، ولا تستعمل وجه bored بعدها. "
                + "إذا طلب صاحبك تبديل أداة الضرب أضف [[tool:Z]] حيث Z من: stick (عصا), pillow (مخدة), hammer (مطرقة بتزمّر), glove (قفاز ملاكمة), balloon (بالون مي), snow (كرة ثلج), feather (ريشة)، وقل له بمرح إنك بدّلتها. "
                + "مثال: [[face:joy]][[act:wave]] أهلين! كيفك اليوم؟";
    }

    @Override
    public void onDestroy() {
        running = false; inst = null;
        try { if (sensors != null) sensors.unregisterListener(this); } catch (Exception ignored) { }
        try { unregisterReceiver(screenRx); } catch (Exception ignored) { }
        for (Pad p : pads.pool) p.hide();
        if (chatWin != null) chatWin.close();
        if (stageRoot != null) try { wm.removeView(stageRoot); } catch (Exception ignored) { }
        if (stage != null) stage.destroy();
        super.onDestroy();
    }
}
