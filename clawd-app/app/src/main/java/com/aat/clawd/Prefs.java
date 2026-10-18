package com.aat.clawd;

import android.content.Context;
import android.content.SharedPreferences;

/** One place for stored values: settings JSON, the Claude key, chat history, the floating flag. */
public final class Prefs {
    private static SharedPreferences p(Context c) {
        return c.getApplicationContext().getSharedPreferences("clawd", Context.MODE_PRIVATE);
    }

    public static String settings(Context c) { return p(c).getString("settings", "{}"); }
    public static void setSettings(Context c, String json) { p(c).edit().putString("settings", json).apply(); }

    public static String get(Context c, String k, String def) { return p(c).getString(k, def); }
    public static void set(Context c, String k, String v) { p(c).edit().putString(k, v).apply(); }

    public static boolean flag(Context c, String k) { return p(c).getBoolean(k, false); }
    public static void setFlag(Context c, String k, boolean v) { p(c).edit().putBoolean(k, v).apply(); }

    public static String apiKey(Context c) { return p(c).getString("apiKey", ""); }
    public static void setApiKey(Context c, String k) { p(c).edit().putString("apiKey", k == null ? "" : k).apply(); }
    public static boolean hasApiKey(Context c) { return !apiKey(c).isEmpty(); }

    public static String chatHistory(Context c) { return p(c).getString("chatHistory", "[]"); }
    public static void setChatHistory(Context c, String json) { p(c).edit().putString("chatHistory", json).apply(); }

    /** A tiny field read out of the settings JSON without a JSON parser (string search). */
    public static String field(String json, String key, String def) {
        if (json == null) return def;
        int i = json.indexOf("\"" + key + "\"");
        if (i < 0) return def;
        i = json.indexOf(':', i);
        if (i < 0) return def;
        i++;
        while (i < json.length() && json.charAt(i) == ' ') i++;
        if (i >= json.length()) return def;
        char ch = json.charAt(i);
        if (ch == '"') {
            int j = json.indexOf('"', i + 1);
            return j < 0 ? def : json.substring(i + 1, j);
        }
        int j = i;
        while (j < json.length() && ",}] \n".indexOf(json.charAt(j)) < 0) j++;
        return json.substring(i, j);
    }

    public static boolean boolField(String json, String key, boolean def) {
        String v = field(json, key, def ? "true" : "false");
        return "true".equals(v) || "1".equals(v);
    }
}
