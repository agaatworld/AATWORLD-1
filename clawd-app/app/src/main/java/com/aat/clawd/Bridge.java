package com.aat.clawd;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.webkit.JavascriptInterface;

/** Exposed to clawd.html as window.A (both in the app screen and in the floating window). */
public class Bridge {
    private final Context ctx;
    private final MainActivity activity;   // null inside the floating window
    private final OverlayService overlay;  // null inside the app screen
    private final Handler ui = new Handler(Looper.getMainLooper());

    Bridge(Context ctx, MainActivity activity, OverlayService overlay) {
        this.ctx = ctx.getApplicationContext();
        this.activity = activity;
        this.overlay = overlay;
    }

    static SharedPreferences prefs(Context c) {
        return c.getApplicationContext().getSharedPreferences("clawd", Context.MODE_PRIVATE);
    }

    @JavascriptInterface
    public void vibrate(int ms) {
        Vibrator v = (Vibrator) ctx.getSystemService(Context.VIBRATOR_SERVICE);
        if (v == null || !v.hasVibrator()) return;
        ms = Math.max(5, Math.min(400, ms));
        int amp = Math.min(255, 70 + ms * 2);
        v.vibrate(VibrationEffect.createOneShot(ms, amp));
    }

    @JavascriptInterface
    public boolean overlayRunning() { return OverlayService.running; }

    @JavascriptInterface
    public void startOverlay() { if (activity != null) ui.post(activity::startFloating); }

    @JavascriptInterface
    public void stopOverlay() { ui.post(() -> OverlayService.stop(ctx)); }

    @JavascriptInterface
    public String getPref(String k) { return prefs(ctx).getString(k, ""); }

    @JavascriptInterface
    public void setPref(String k, String v) {
        prefs(ctx).edit().putString(k, v).apply();
        ui.post(() -> { if (OverlayService.inst != null) OverlayService.inst.onPref(k, v); });
    }

    @JavascriptInterface
    public void setDragZone(float l, float t, float r, float b) {
        if (overlay != null) ui.post(() -> overlay.setZone(l, t, r, b));
    }
}
