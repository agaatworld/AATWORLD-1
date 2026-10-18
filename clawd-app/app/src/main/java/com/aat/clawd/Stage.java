package com.aat.clawd;

import android.annotation.SuppressLint;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.graphics.Color;
import android.graphics.PixelFormat;
import android.graphics.Rect;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.os.SystemClock;
import android.util.DisplayMetrics;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.Surface;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowManager;
import android.view.inputmethod.InputMethodManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

/**
 * The floating stage: one full-screen, see-through window that never takes touches (Clawd, the tool and the bubbles
 * are drawn there), plus small invisible "pads" placed over whatever can be touched, plus the floating chat window.
 * Hosted by OverlayService (normal overlay) or by ClawdEyes (accessibility overlay, fully opaque).
 */
public class Stage implements SensorEventListener {
    static Stage inst;

    final Context ctx;
    final int type;
    final WindowManager wm;
    final float d;
    final Handler ui = new Handler(Looper.getMainLooper());
    WebView web;
    FrameLayout root;
    WindowManager.LayoutParams lp;
    final Map<String, Pad> pads = new HashMap<>();
    final int[] loc = new int[2];
    boolean hidden, ready, kbOpen;
    ChatWin chat;
    private SensorManager sm;
    private final float[] grav = {0, 9.8f, 0};
    private long lastGrav, offAt;
    private final Runnable typingTick = new Runnable() {
        @Override public void run() { if (kbOpen) { js("clawd.typing()"); ui.postDelayed(this, 4500); } }
    };

    Stage(Context ctx, int type) {
        this.ctx = ctx;
        this.type = type;
        this.wm = (WindowManager) ctx.getSystemService(Context.WINDOW_SERVICE);
        this.d = ctx.getResources().getDisplayMetrics().density;
        inst = this;
        build();
        startSensors();
        IntentFilter f = new IntentFilter();
        f.addAction(Intent.ACTION_SCREEN_OFF);
        f.addAction(Intent.ACTION_USER_PRESENT);
        if (Build.VERSION.SDK_INT >= 33) ctx.registerReceiver(screen, f, Context.RECEIVER_NOT_EXPORTED);
        else ctx.registerReceiver(screen, f);
    }

    /* ---------------- windows */
    WindowManager.LayoutParams params(int w, int h, int flags) {
        WindowManager.LayoutParams p = new WindowManager.LayoutParams(w, h, type,
                flags | WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN | WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS
                        | WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED, PixelFormat.TRANSLUCENT);
        p.gravity = Gravity.TOP | Gravity.LEFT;
        if (Build.VERSION.SDK_INT >= 30) p.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_ALWAYS;
        else if (Build.VERSION.SDK_INT >= 28) p.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
        return p;
    }

    Rect screen() {
        if (Build.VERSION.SDK_INT >= 30) return wm.getCurrentWindowMetrics().getBounds();
        DisplayMetrics m = new DisplayMetrics();
        wm.getDefaultDisplay().getRealMetrics(m);
        return new Rect(0, 0, m.widthPixels, m.heightPixels);
    }

    @SuppressLint("SetJavaScriptEnabled")
    WebView makeWeb(int role) {
        WebView w = new WebView(ctx);
        WebSettings s = w.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setTextZoom(100);
        s.setAllowFileAccess(true);
        w.setBackgroundColor(Color.TRANSPARENT);
        w.setVerticalScrollBarEnabled(false);
        w.setHorizontalScrollBarEnabled(false);
        w.setOverScrollMode(View.OVER_SCROLL_NEVER);
        w.addJavascriptInterface(new Bridge(ctx, role, null), "A");
        return w;
    }

    private void build() {
        Rect s = screen();
        lp = params(s.width(), s.height(), WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE | WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE);
        // Android 12+ lets touches pass through another app's overlay only if it is at most 80% opaque.
        // The accessibility overlay is trusted, so it can stay fully opaque.
        if (type == WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY && Build.VERSION.SDK_INT >= 31) lp.alpha = 0.8f;
        web = makeWeb(Bridge.STAGE);
        web.setWebViewClient(new WebViewClient() {
            @Override public void onPageFinished(WebView v, String url) { ready = true; sendInsets(); sendSettings(); }
        });
        web.loadUrl("file:///android_asset/stage.html");
        root = new FrameLayout(ctx);
        root.addView(web, new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));
        wm.addView(root, lp);
        root.post(()