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
    @JavascriptInterface public void log(String s) { android.util.Log.d("Clawd", "js " + s); }

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
    @JavascriptInterface public boolean hasGeminiKey() { return Prefs.hasGeminiKey(ctx); }
    @JavascriptInterface public void setGeminiKey(String k) { Prefs.setGeminiKey(ctx, k == null ? "" : k.trim()); }
    @JavascriptInterface public String aiProvider() { return Mind.provider(ctx); }
    @JavascriptInterface public boolean aiReady() { return Mind.ready(ctx); }
    /* what he remembers about his owner, and the lines the AI wrote for him */
    @JavascriptInterface public String getMemory() { return Mind.memory(ctx).toString(); }
    @JavascriptInterface public void setMemory(String json) { try { Prefs.set(ctx, "memory", new org.json.JSONArray(json).toString()); } catch (Exception ignored) { } }
    @JavascriptInterface public String getGenLines() { return Mind.genLines(ctx); }
    @JavascriptInterface public int genCount() { return Mind.genCount(ctx); }
    @JavascriptInterface public void clearGenLines() { Prefs.set(ctx, "genLines", "{}"); }
    @JavascriptInterface public void genNow() {
        Mind.generate(ctx, OverlayService.inst != null ? OverlayService.inst.recentChat() : "", (ok, msg) -> ui.post(() -> {
            if (activity != null) activity.js("window.app&&app.genDone(" + ok + "," + Bus.q(msg) + ")");
            if (OverlayService.inst != null) OverlayService.inst.pushGenLines();
        }));
    }
    /** "lat,lng" from the phone (coarse is enough for prayer times); "" while asking for permission or waiting. */
    @JavascriptInterface public String locate() {
        if (ctx.checkSelfPermission(android.Manifest.permission.ACCESS_COARSE_LOCATION) != android.content.pm.PackageManager.PERMISSION_GRANTED) {
            if (activity != null) ui.post(() -> activity.requestPermissions(new String[]{android.Manifest.permission.ACCESS_COARSE_LOCATION}, 3));
            return "";
        }
        try {
            android.location.LocationManager lm = (android.location.LocationManager) ctx.getSystemService(Context.LOCATION_SERVICE);
            android.location.Location best = null;
            for (String p : lm.getProviders(true)) { android.location.Location l = lm.getLastKnownLocation(p); if (l != null && (best == null || l.getTime() > best.getTime())) best = l; }
            if (best != null) return best.getLatitude() + "," + best.getLongitude();
            if (android.os.Build.VERSION.SDK_INT >= 30 && activity != null) {
                String prov = lm.isProviderEnabled(android.location.LocationManager.NETWORK_PROVIDER) ? android.location.LocationManager.NETWORK_PROVIDER : android.location.LocationManager.GPS_PROVIDER;
                lm.getCurrentLocation(prov, null, ctx.getMainExecutor(), l -> { if (l != null && activity != null) activity.js("window.app&&app.located(" + l.getLatitude() + "," + l.getLongitude() + ")"); });
            }
        } catch (Exception ignored) { }
        return "";
    }
    @JavascriptInterface public void openUrl(String url) {
        ui.post(() -> { try { android.content.Intent i = new android.content.Intent(android.content.Intent.ACTION_VIEW, android.net.Uri.parse(url)); i.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK); ctx.startActivity(i); } catch (Exception ignored) { } });
    }
    @JavascriptInterface public void setApiKey(String k) { Prefs.setApiKey(ctx, k == null ? "" : k.trim()); }

    /* ---- his voice: list the phone's Arabic voices and let the owner hear each one ---- */
    private android.speech.tts.TextToSpeech tts;
    private boolean ttsReady;
    private void ensureTts(Runnable then) {
        if (tts != null) { if (ttsReady) then.run(); return; }
        tts = new android.speech.tts.TextToSpeech(ctx, st -> { ttsReady = st == android.speech.tts.TextToSpeech.SUCCESS; if (ttsReady) ui.post(then); });
    }
    /** JSON [{n: name, net: needs internet}] — empty the first time while the speech engine starts; the page asks again. */
    @JavascriptInterface public String voices() {
        if (!ttsReady) { ui.post(() -> ensureTts(() -> { if (activity != null) activity.js("window.app&&app.voicesReady&&app.voicesReady()"); })); return "[]"; }
        org.json.JSONArray a = new org.json.JSONArray();
        for (android.speech.tts.Voice v : Voice.arabic(tts)) { try { a.put(new org.json.JSONObject().put("n", v.getName()).put("net", v.isNetworkConnectionRequired())); } catch (Exception ignored) { } }
        return a.toString();
    }
    /** Says a sample sentence with the voice and pitch now in the settings. */
    @JavascriptInterface public void tryVoice() {
        ui.post(() -> ensureTts(() -> { if (Voice.setup(ctx, tts)) tts.speak("السلام عليكم ورحمة الله، أنا صاحبك. الحمد لله على كل حال.", android.speech.tts.TextToSpeech.QUEUE_FLUSH, null, "try"); }));
    }

    /* ---- the day's news (searched once a day by the AI), sent to the floating stage ---- */
    @JavascriptInterface public void newsToday() {
        Mind.news(ctx, (ok, json) -> { if (ok && json != null) ui.post(() -> { if (OverlayService.inst != null) OverlayService.inst.jsStage("clawd.news(" + Bus.q(json) + ")"); }); });
    }

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
    @JavascriptInterface public void voiceStart() { if (overlay != null) ui.post(overlay::voiceStart); }
    @JavascriptInterface public void voiceStop() { if (overlay != null) ui.post(overlay::voiceStop); }
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
