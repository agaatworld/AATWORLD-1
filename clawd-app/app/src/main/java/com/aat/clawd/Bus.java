package com.aat.clawd;

import android.os.Handler;
import android.os.Looper;

/** Passes signals from the accessibility service ("Clawd's eyes") to the floating overlay,
 *  on the main thread. Everything is a no-op when the overlay isn't running. */
public final class Bus {
    private static final Handler UI = new Handler(Looper.getMainLooper());
    private static void post(Runnable r) { UI.post(r); }
    private static OverlayService ov() { return OverlayService.inst; }

    public static void app(String kind, String label) { post(() -> { if (ov() != null) ov().jsStage("clawd.app(" + q(kind) + "," + q(label) + ")"); }); }
    public static void icons(String json) { post(() -> { if (ov() != null) ov().jsStage("clawd.icons(" + q(json) + ")"); }); }
    public static void keyboard(boolean open, String fieldJson) {
        post(() -> { if (ov() != null) ov().jsStage("clawd.keyboard(" + open + "," + (fieldJson == null ? "null" : q(fieldJson)) + ")"); });
    }
    public static void typing() { post(() -> { if (ov() != null) ov().jsStage("clawd.typing()"); }); }
    public static void screen(String state, long awayMs) { post(() -> { if (ov() != null) ov().jsStage("clawd.screen(" + q(state) + "," + awayMs + ")"); }); }

    static String q(String s) {
        if (s == null) return "''";
        StringBuilder b = new StringBuilder("'");
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (c == '\'' || c == '\\') b.append('\\').append(c);
            else if (c == '\n') b.append("\\n");
            else if (c == '\r') ; // drop
            else b.append(c);
        }
        return b.append("'").toString();
    }
}
