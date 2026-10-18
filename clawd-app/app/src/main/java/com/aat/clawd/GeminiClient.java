package com.aat.clawd;

import android.content.Context;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** Streams one reply from Google's Gemini API (free tier with a key from aistudio.google.com) over HTTPS + SSE.
 *  Google renames its models often, so the model is picked from the live model list and remembered for a week. */
public final class GeminiClient {
    private static final String BASE = "https://generativelanguage.googleapis.com/v1beta/";
    private final Context ctx;
    private final String apiKey;
    public GeminiClient(Context ctx, String apiKey) { this.ctx = ctx.getApplicationContext(); this.apiKey = apiKey; }

    /** Same listener as ClaudeClient. Blocks until the reply ends. */
    public void stream(String system, List<String[]> history, String userText, int maxTokens, ClaudeClient.Listener l) {
        String model = model(false);
        int code = streamOnce(model, system, history, userText, maxTokens, l);
        if (code == 404) { // the remembered model was retired: pick again and retry once
            model = model(true);
            code = streamOnce(model, system, history, userText, maxTokens, l);
            if (code == 404) l.onError("ما لقيت نموذج Gemini مناسب. جرّب بعد شوي.");
        }
    }

    /** Returns 404 when the model doesn't exist (caller retries), 0 otherwise (listener already told). */
    private int streamOnce(String model, String system, List<String[]> history, String userText, int maxTokens, ClaudeClient.Listener l) {
        HttpURLConnection con = null;
        try {
            JSONObject body = new JSONObject();
            body.put("systemInstruction", new JSONObject().put("parts", new JSONArray().put(new JSONObject().put("text", system))));
            JSONArray contents = new JSONArray();
            for (String[] m : history) contents.put(turn("u".equals(m[0]) ? "user" : "model", m[1]));
            contents.put(turn("user", userText));
            body.put("contents", contents);
            body.put("generationConfig", new JSONObject().put("maxOutputTokens", maxTokens).put("temperature", 0.9));

            con = (HttpURLConnection) new URL(BASE + "models/" + model + ":streamGenerateContent?alt=sse").openConnection();
            con.setRequestMethod("POST");
            con.setConnectTimeout(20000);
            con.setReadTimeout(120000);
            con.setDoOutput(true);
            con.setRequestProperty("content-type", "application/json");
            con.setRequestProperty("x-goog-api-key", apiKey);
            try (OutputStream os = con.getOutputStream()) { os.write(body.toString().getBytes(StandardCharsets.UTF_8)); }

            int code = con.getResponseCode();
            if (code == 404) return 404;
            if (code < 200 || code >= 300) { l.onError(errorMessage(code, con)); return 0; }

            StringBuilder full = new StringBuilder();
            String finish = null;
            try (BufferedReader r = new BufferedReader(new InputStreamReader(con.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = r.readLine()) != null) {
                    if (!line.startsWith("data:")) continue;
                    String data = line.substring(5).trim();
                    if (data.isEmpty()) continue;
                    JSONObject ev;
                    try { ev = new JSONObject(data); } catch (Exception e) { continue; }
                    JSONArray cands = ev.optJSONArray("candidates");
                    if (cands == null || cands.length() == 0) continue;
                    JSONObject cand = cands.getJSONObject(0);
                    if (cand.has("finishReason")) finish = cand.optString("finishReason");
                    JSONObject content = cand.optJSONObject("content");
                    JSONArray parts = content == null ? null : content.optJSONArray("parts");
                    if (parts == null) continue;
                    for (int i = 0; i < parts.length(); i++) {
                        JSONObject p = parts.getJSONObject(i);
                        if (p.optBoolean("thought")) continue; // never show the model's private reasoning
                        String t = p.optString("text");
                        if (!t.isEmpty()) { full.append(t); l.onDelta(t); }
                    }
                }
            }
            if (full.length() == 0 && ("SAFETY".equals(finish) || "PROHIBITED_CONTENT".equals(finish))) { l.onError("اعتذر عن الرد على هذا. جرّب صياغة تانية 😊"); return 0; }
            if (full.length() == 0) { l.onError("ما وصل رد. جرّب مرة تانية."); return 0; }
            l.onDone(full.toString(), finish);
            return 0;
        } catch (java.net.UnknownHostException e) {
            l.onError("ما في اتصال بالإنترنت. تأكد من الشبكة وجرّب.");
        } catch (java.net.SocketTimeoutException e) {
            l.onError("انتهى وقت الانتظار. جرّب بعد شوي.");
        } catch (Exception e) {
            l.onError("صار خطأ: " + e.getClass().getSimpleName());
        } finally {
            if (con != null) con.disconnect();
        }
        return 0;
    }

    /** The model to use: remembered for 7 days, otherwise the newest stable "flash" model that can generate text. */
    private String model(boolean refresh) {
        String saved = Prefs.get(ctx, "geminiModel", "");
        long at = 0;
        try { at = Long.parseLong(Prefs.get(ctx, "geminiModelAt", "0")); } catch (Exception ignored) { }
        if (!refresh && !saved.isEmpty() && System.currentTimeMillis() - at < 7L * 24 * 3600 * 1000) return saved;
        String best = pickModel();
        if (best == null) best = saved.isEmpty() ? "gemini-2.5-flash" : saved;
        Prefs.set(ctx, "geminiModel", best);
        Prefs.set(ctx, "geminiModelAt", String.valueOf(System.currentTimeMillis()));
        return best;
    }

    private String pickModel() {
        HttpURLConnection con = null;
        try {
            con = (HttpURLConnection) new URL(BASE + "models?pageSize=1000").openConnection();
            con.setConnectTimeout(15000); con.setReadTimeout(20000);
            con.setRequestProperty("x-goog-api-key", apiKey);
            if (con.getResponseCode() != 200) return null;
            StringBuilder sb = new StringBuilder();
            try (BufferedReader r = new BufferedReader(new InputStreamReader(con.getInputStream(), StandardCharsets.UTF_8))) { String ln; while ((ln = r.readLine()) != null) sb.append(ln); }
            JSONArray models = new JSONObject(sb.toString()).optJSONArray("models");
            if (models == null) return null;
            String best = null, bestPreview = null; double bv = -1, bpv = -1;
            Pattern ver = Pattern.compile("gemini-(\\d+(?:\\.\\d+)?)");
            for (int i = 0; i < models.length(); i++) {
                JSONObject m = models.getJSONObject(i);
                String name = m.optString("name").replace("models/", "");
                JSONArray methods = m.optJSONArray("supportedGenerationMethods");
                if (methods == null || !methods.toString().contains("generateContent")) continue;
                if (!name.contains("flash") || name.matches(".*(lite|live|image|tts|audio|embed|thinking|computer|vision|8b).*")) continue;
                Matcher mv = ver.matcher(name);
                double v = mv.find() ? Double.parseDouble(mv.group(1)) : 0;
                boolean preview = name.matches(".*(preview|exp|latest|\\d{2}-\\d{2}|\\d{3}).*");
                if (preview) { if (v > bpv) { bpv = v; bestPreview = name; } }
                else if (v > bv) { bv = v; best = name; }
            }
            return best != null ? best : bestPreview;
        } catch (Exception e) {
            return null;
        } finally {
            if (con != null) con.disconnect();
        }
    }

    private static JSONObject turn(String role, String text) {
        JSONObject o = new JSONObject();
        try { o.put("role", role); o.put("parts", new JSONArray().put(new JSONObject().put("text", text))); } catch (Exception ignored) { }
        return o;
    }
    private String errorMessage(int code, HttpURLConnection con) {
        String detail = "";
        try (InputStream es = con.getErrorStream()) {
            if (es != null) {
                BufferedReader r = new BufferedReader(new InputStreamReader(es, StandardCharsets.UTF_8));
                StringBuilder sb = new StringBuilder(); String ln;
                while ((ln = r.readLine()) != null) sb.append(ln);
                JSONObject er = new JSONObject(sb.toString()).optJSONObject("error");
                if (er != null) detail = er.optString("message");
            }
        } catch (Exception ignored) { }
        String d = detail.toLowerCase();
        if (code == 400 && d.contains("api key")) return "مفتاح Gemini غير صحيح. تأكد منه بالإعدادات.";
        if (code == 403 || d.contains("location")) return "خدمة Gemini مش متاحة بهالمنطقة أو المفتاح بلا صلاحية.";
        if (code == 429) return "وصلت لحد الاستعمال المجاني لهلّق. جرّب بعد شوي 😊";
        if (code >= 500) return "خادم Google مشغول حالياً. جرّب بعد شوي.";
        return "صار خطأ (" + code + ")" + (detail.isEmpty() ? "." : ": " + (detail.length() > 120 ? detail.substring(0, 120) + "…" : detail));
    }
}
