package com.aat.clawd;

import android.content.Context;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.provider.Settings;
import android.webkit.JavascriptInterface;

/** The `window.A` object exposed to every page (app screen, floating stage, chat window).
 *  Methods a page never uses simply go unanswered. Anything touching views posts to the main thread. */
public class Bridge {
    private final Context ctx;
    private final Handler ui = new Handler(Looper.getMainLooper());
    private MainActivity activity;      // app screen
    private OverlayService overlay;     // floating stage
    private OverlayService.ChatWindow chat;  // floating chat window

    Bridge(Context c) { ctx = c.getApplicationContext(); }
    Bridge withActivity(MainActivity a) { activity = a; return this; }
    Bridge withOverlay(OverlayService o) { overlay = o; return this; }
    Bridge withChat(OverlayService.ChatWindow c) { chat = c; return this; }

    /* ---- shared ---- */
    @JavascriptInterface public String getSettings() { return Prefs.settings(ctx); }
    @JavascriptInterface public void setSettings(String json) {
        Prefs.setSettings(ctx, json);
        ui.post(() -> { if (OverlayService.inst != null) OverlayService.inst.onSettings(json); });
    }
    @JavascriptInterface public String getPref(String k) { return Prefs.get(ctx, k, ""); }
    @JavascriptInterface public void setPref(String k, String v) { Prefs.set(ctx, k, v); }
    @JavascriptInterface public int fontSize() {
        try { return Integer.parseInt(Prefs.field(Prefs.settings(ctx), "font", "16")); } catch (Exception e) { return 16; }
    }
    @JavascriptInterface public void vibrate(int ms) {
        if (!Prefs.boolField(Prefs.settings(ctx), "vib", true)) return;
        Vibrator v = (Vibrator) ctx.getSystemService(Context.VIBRATOR_SERVICE);
        if (v == null || !v.hasVibrator()) return;
        ms = Math.max(5, Math.min(400, ms));
        try { v.vibrate(VibrationEffect.createOneShot(ms, Math.min(255, 70 + ms * 2))); } catch (Exception ignored) { }
    }
    @JavascriptInterface public void logEvent(String txt) { /* reserved for a future diary screen */ }
    @JavascriptInterface public void ready() { }
    @JavascriptInterface public void ready(String info) { android.util.Log.d("Clawd", "stage ready " + info); }

    /* ---- app screen ---- */
    @JavascriptInterface public boolean overlayRunning() { return OverlayService.running; }
    @JavascriptInterface public void startOverlay() { if (activity != null) ui.post(activity::startFloating); }
    @JavascriptInterface public void stopOverlay() { ui.post(() -> OverlayService.stop(ctx)); }
    @JavascriptInterface public String perms() {
        boolean overlay = Settings.canDrawOverlays(ctx);
        boolean a11y = ClawdEyes.isEnabled(ctx);
        boolean notif = true;
        if (Build.VERSION.SDK_INT >= 33) notif = ctx.checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS) == android.content.pm.PackageManager.PERMISSION_GRANTED;
        boolean battery = Perms.ignoringBattery(ctx);
        boolean eyes = Perms.eyesAvailable(ctx);
        return "{\"overlay\":" + overlay + ",\"a11y\":" + a11y + ",\"eyes\":" + eyes + ",\"notif\":" + notif + ",\"battery\":" + battery + "}";
    }
    @JavascriptInterface public void openPerm(String which) { if (activity != null) ui.post(() -> activity.openPerm(which)); }
    @JavascriptInterface public boolean hasApiKey() { return Prefs.hasApiKey(ctx); }
    @JavascriptInterface public void setApiKey(String k) { Prefs.setApiKey(ctx, k == null ? "" : k.trim()); }

    /* chat is opened from the app screen, the stage, or the chat-button */
    @JavascriptInterface public void openChat(String seed) {
        ui.post(() -> {
            if (OverlayService.running && OverlayService.inst != null) OverlayService.inst.openChat(seed);
            else if (activity != null) activity.openChatFallback(seed);
            else OverlayService.startThenChat(ctx, seed);
        });
    }

    /* ---- floating stage ---- */
    @JavascriptInterface public void setPads(String json) { if (overlay != null) ui.post(() -> overlay.setPads(json)); }
    @JavascriptInterface public void setDragZone(float l, float t, float r, float b) {
        if (chat != null) { ui.post(() -> chat.setDragZone(l, t, r, b)); }
    }

    /* ---- chat window ---- */
    @JavascriptInterface public String chatHistory() { return Prefs.chatHistory(ctx); }
    @JavascriptInterface public void chatReady() { if (chat != null) ui.post(chat::onReady); }
    @JavascriptInterface public void chatSend(String text) { if (chat != null) chat.send(text); }
    @JavascriptInterface public void chatClose() { if (chat != null) ui.post(chat::close); }
    @JavascriptInterface public void chatMin() { if (chat != null) ui.post(chat::close); }
    @JavascriptInterface public void chatBig() { if (chat != null) ui.post(chat::toggleBig); }
}
