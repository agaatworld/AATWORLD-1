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
import android.content.SharedPreferences;
import android.content.pm.ServiceInfo;
import android.content.res.Configuration;
import android.graphics.Color;
import android.graphics.PixelFormat;
import android.graphics.Rect;
import android.os.Build;
import android.os.IBinder;
import android.util.DisplayMetrics;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.VelocityTracker;
import android.view.ViewConfiguration;
import android.view.WindowManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.FrameLayout;

/** Keeps Clawd floating in a small window above every app. */
public class OverlayService extends Service {
    static final String ACTION_STOP = "com.aat.clawd.STOP";
    static final String CHANNEL = "clawd";
    static volatile boolean running;
    static OverlayService inst;

    private WindowManager wm;
    private WindowManager.LayoutParams lp;
    private DragFrame frame;
    private WebView web;
    private float density;
    // character area inside the window, in CSS px (= dp); touches starting here drag the window
    private final float[] zone = {0, 0, 0, 0};
    private int side = 1;

    static void start(Context c) {
        Bridge.prefs(c).edit().putBoolean("floating", true).apply();
        c.startForegroundService(new Intent(c, OverlayService.class));
    }

    static void stop(Context c) {
        Bridge.prefs(c).edit().putBoolean("floating", false).apply();
        c.stopService(new Intent(c, OverlayService.class));
    }

    @Override
    public IBinder onBind(Intent i) { return null; }

    @Override
    public void onCreate() {
        super.onCreate();
        inst = this;
        running = true;
        goForeground();
        density = getResources().getDisplayMetrics().density;
        wm = (WindowManager) getSystemService(WINDOW_SERVICE);
        buildWindow();
        IntentFilter f = new IntentFilter();
        f.addAction(Intent.ACTION_SCREEN_ON);
        f.addAction(Intent.ACTION_SCREEN_OFF);
        f.addAction(Intent.ACTION_USER_PRESENT);
        if (Build.VERSION.SDK_INT >= 33) registerReceiver(screen, f, Context.RECEIVER_NOT_EXPORTED);
        else registerReceiver(screen, f);
    }

    @Override
    public int onStartCommand(Intent i, int flags, int id) {
        if (i != null && ACTION_STOP.equals(i.getAction())) {
            Bridge.prefs(this).edit().putBoolean("floating", false).apply();
            stopSelf();
            return START_NOT_STICKY;
        }
        return START_STICKY;
    }

    private void goForeground() {
        NotificationManager nm = getSystemService(NotificationManager.class);
        NotificationChannel ch = new NotificationChannel(CHANNEL, "كلود العائم", NotificationManager.IMPORTANCE_MIN);
        ch.setShowBadge(false);
        nm.createNotificationChannel(ch);
        PendingIntent open = PendingIntent.getActivity(this, 0,
                new Intent(this, MainActivity.class), PendingIntent.FLAG_IMMUTABLE);
        PendingIntent stop = PendingIntent.getService(this, 1,
                new Intent(this, OverlayService.class).setAction(ACTION_STOP), PendingIntent.FLAG_IMMUTABLE);
        Notification n = new Notification.Builder(this, CHANNEL)
                .setSmallIcon(R.drawable.ic_stat)
                .setContentTitle("كلود معك 🟧")
                .setContentText("اضرب العصا لتفش خلقك · اضغط لفتح التطبيق")
                .setContentIntent(open)
                .addAction(new Notification.Action.Builder(null, "إيقاف كلود", stop).build())
                .setOngoing(true)
                .build();
        if (Build.VERSION.SDK_INT >= 34) startForeground(7, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE);
        else startForeground(7, n);
    }

    private float scale() {
        String s = Bridge.prefs(this).getString("size", "m");
        return "s".equals(s) ? .8f : "l".equals(s) ? 1.3f : 1f;
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void buildWindow() {
        int w = Math.round(176 * density * scale()), h = Math.round(168 * density * scale());
        lp = new WindowManager.LayoutParams(w, h,
                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE
                        | WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED,
                PixelFormat.TRANSLUCENT);
        lp.gravity = Gravity.TOP | Gravity.LEFT;
        Rect scr = screen();
        SharedPreferences p = Bridge.prefs(this);
        // default: bottom-left corner, above the navigation bar
        lp.x = p.getInt("x", 0);
        lp.y = p.getInt("y", scr.height() - h - Math.round(110 * density));
        clamp();
        side = lp.x + w / 2 > scr.width() / 2 ? -1 : 1;

        web = new WebView(this);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setTextZoom(100);
        s.setAllowFileAccess(true);
        web.setBackgroundColor(Color.TRANSPARENT);
        web.setVerticalScrollBarEnabled(false);
        web.setHorizontalScrollBarEnabled(false);
        web.setOverScrollMode(WebView.OVER_SCROLL_NEVER);
        web.addJavascriptInterface(new Bridge(this, null, this), "A");
        web.loadUrl("file:///android_asset/clawd.html?m=overlay&side=" + side);

        frame = new DragFrame(this);
        frame.addView(web, new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));
        wm.addView(frame, lp);
    }

    private Rect screen() {
        if (Build.VERSION.SDK_INT >= 30) return wm.getCurrentWindowMetrics().getBounds();
        DisplayMetrics m = new DisplayMetrics();
        wm.getDefaultDisplay().getRealMetrics(m);
        return new Rect(0, 0, m.widthPixels, m.heightPixels);
    }

    private void clamp() {
        Rect s = screen();
        lp.x = Math.max(0, Math.min(s.width() - lp.width, lp.x));
        lp.y = Math.max(0, Math.min(s.height() - lp.height, lp.y));
    }

    void setZone(float l, float t, float r, float b) {
        zone[0] = l; zone[1] = t; zone[2] = r; zone[3] = b;
    }

    void onPref(String k, String v) {
        if ("size".equals(k)) {
            wm.removeView(frame);
            web.destroy();
            buildWindow();
        } else if ("sound".equals(k)) {
            js("clawd.setSound(" + ("1".equals(v)) + ")");
        }
    }

    private void js(String code) {
        if (web != null) web.evaluateJavascript("window.clawd&&" + code, null);
    }

    @Override
    public void onConfigurationChanged(Configuration c) {
        super.onConfigurationChanged(c);
        if (frame == null) return;
        clamp();
        wm.updateViewLayout(frame, lp);
    }

    private final BroadcastReceiver screen = new BroadcastReceiver() {
        @Override
        public void onReceive(Context c, Intent i) {
            if (web == null) return;
            if (Intent.ACTION_SCREEN_OFF.equals(i.getAction())) {
                web.onPause();
            } else {
                web.onResume();
                if (Intent.ACTION_USER_PRESENT.equals(i.getAction())) js("clawd.onScreenOn()");
            }
        }
    };

    @Override
    public void onDestroy() {
        running = false;
        inst = null;
        try { unregisterReceiver(screen); } catch (Exception ignored) { }
        if (frame != null) { try { wm.removeView(frame); } catch (Exception ignored) { } }
        if (web != null) web.destroy();
        super.onDestroy();
    }

    /** Touches that start on Clawd and move past the slop drag the whole window; everything else goes to the page. */
    private class DragFrame extends FrameLayout {
        private final int slop;
        private float downX, downY;
        private int startX, startY;
        private boolean candidate, dragging;
        private VelocityTracker vt;

        DragFrame(Context c) {
            super(c);
            slop = ViewConfiguration.get(c).getScaledTouchSlop();
        }

        // dispatchTouchEvent instead of onInterceptTouchEvent: the WebView asks parents not to intercept
        @Override
        public boolean dispatchTouchEvent(MotionEvent e) {
            switch (e.getActionMasked()) {
                case MotionEvent.ACTION_DOWN:
                    downX = e.getRawX(); downY = e.getRawY();
                    startX = lp.x; startY = lp.y;
                    float cx = e.getX() / density, cy = e.getY() / density;
                    candidate = cx >= zone[0] && cx <= zone[2] && cy >= zone[1] && cy <= zone[3];
                    dragging = false;
                    if (vt != null) vt.recycle();
                    vt = VelocityTracker.obtain();
                    vt.addMovement(e);
                    return super.dispatchTouchEvent(e);
                case MotionEvent.ACTION_MOVE:
                    if (vt != null) vt.addMovement(e);
                    if (!dragging && candidate && Math.hypot(e.getRawX() - downX, e.getRawY() - downY) > slop * 1.5) {
                        dragging = true;
                        MotionEvent c = MotionEvent.obtain(e);
                        c.setAction(MotionEvent.ACTION_CANCEL);
                        super.dispatchTouchEvent(c); // the page stops tracking this touch
                        c.recycle();
                        js("clawd.onNativeDrag(1,0)");
                    }
                    if (!dragging) return super.dispatchTouchEvent(e);
                    lp.x = startX + Math.round(e.getRawX() - downX);
                    lp.y = startY + Math.round(e.getRawY() - downY);
                    clamp();
                    wm.updateViewLayout(this, lp);
                    float vx = 0;
                    if (vt != null) { vt.computeCurrentVelocity(1000); vx = vt.getXVelocity() / density; }
                    js("clawd.onNativeDrag(1," + Math.round(vx / 40) + ")");
                    return true;
                case MotionEvent.ACTION_UP:
                case MotionEvent.ACTION_CANCEL:
                    if (vt != null) { vt.recycle(); vt = null; }
                    if (!dragging) return super.dispatchTouchEvent(e);
                    dragging = false;
                    Rect s = screen();
                    int ns = lp.x + lp.width / 2 > s.width() / 2 ? -1 : 1;
                    if (ns != side) { side = ns; js("clawd.setSide(" + side + ")"); }
                    js("clawd.onNativeDrag(0,0)");
                    Bridge.prefs(getContext()).edit().putInt("x", lp.x).putInt("y", lp.y).apply();
                    return true;
                default:
                    return dragging || super.dispatchTouchEvent(e);
            }
        }
    }
}
