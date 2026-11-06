package com.aatworld.talk;

import android.content.Context;
import android.media.AudioAttributes;
import android.os.Build;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.webkit.JavascriptInterface;

import org.json.JSONArray;
import org.json.JSONObject;

/** Exposed to JS as window.AATNative. Methods run on a WebView binder thread. */
public class NativeBridge {
    private final Context ctx;

    public NativeBridge(Context c) {
        ctx = c.getApplicationContext();
    }

    private Vibrator vib() {
        return (Vibrator) ctx.getSystemService(Context.VIBRATOR_SERVICE);
    }

    @JavascriptInterface
    public void vibrate(String patternCsv, int repeat) {
        try {
            Vibrator v = vib();
            if (v == null || !v.hasVibrator()) return;
            String[] parts = (patternCsv == null ? "" : patternCsv).split(",");
            long[] t = new long[parts.length];
            int n = 0;
            for (String p : parts) {
                p = p.trim();
                if (p.isEmpty()) continue;
                try { t[n++] = Math.max(0, Long.parseLong(p)); } catch (NumberFormatException ignored) { }
            }
            if (n == 0) return;
            long[] timings = java.util.Arrays.copyOf(t, n);
            if (repeat >= n) repeat = -1;
            if (repeat < -1) repeat = -1;

            AudioAttributes attrs = new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_ALARM)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .build();

            if (Build.VERSION.SDK_INT >= 26) {
                VibrationEffect e;
                if (v.hasAmplitudeControl()) {
                    int[] amps = new int[n];
                    // pattern is off,on,off,on...: even index = wait (0), odd = vibrate (max)
                    for (int i = 0; i < n; i++) amps[i] = (i % 2 == 1) ? 255 : 0;
                    e = VibrationEffect.createWaveform(timings, amps, repeat);
                } else {
                    e = VibrationEffect.createWaveform(timings, repeat);
                }
                v.vibrate(e, attrs);
            } else {
                v.vibrate(timings, repeat, attrs);
            }
        } catch (Throwable ignored) { }
    }

    @JavascriptInterface
    public void cancelVibrate() {
        try {
            Vibrator v = vib();
            if (v != null) v.cancel();
        } catch (Throwable ignored) { }
    }

    // ---- schedule widget data (web screen <-> native widget) ----
    /** Validates and stores the schedule JSON, then refreshes all schedule widgets. Returns true if saved. */
    @JavascriptInterface
    public boolean saveSchedule(String json) {
        try {
            if (json == null || json.length() > 500000) return false;
            JSONArray days = new JSONObject(json).getJSONArray("days");
            if (days.length() == 0) return false;
            for (int i = 0; i < days.length(); i++) {
                JSONObject d = days.getJSONObject(i);
                JSONArray its = d.getJSONArray("items");
                for (int k = 0; k < its.length(); k++) {
                    JSONObject it = its.getJSONObject(k);
                    it.getString("t");
                    it.getString("x");
                }
            }
            ctx.getSharedPreferences(ScheduleStore.DATA_PREFS, Context.MODE_PRIVATE)
                    .edit().putString("json", json).apply();
            ScheduleWidget.refreshAll(ctx);
            return true;
        } catch (Throwable e) {
            return false;
        }
    }

    /** Saved schedule JSON, or "" if the user never saved one (web side then uses its own schedule.json). */
    @JavascriptInterface
    public String loadSchedule() {
        try {
            return ScheduleStore.saved(ctx);
        } catch (Throwable e) {
            return "";
        }
    }
}
