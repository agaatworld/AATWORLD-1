package com.aat.clawd;

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

/** Streams one Claude reply straight from the Messages API over HTTPS + SSE.
 *  No third-party SDK, so it is small and runs on any Android version. */
public final class ClaudeClient {
    private final String apiKey;
    public ClaudeClient(String apiKey) { this.apiKey = apiKey; }

    public interface Listener {
        void onDelta(String text);
        void onDone(String full, String stopReason);
        void onError(String message);
    }

    /** history: {role ("u"/"a"), text} pairs oldest first. Blocks until the reply ends. */
    public void stream(String model, String system, List<String[]> history, String userText, Listener l) {
        HttpURLConnection con = null;
        try {
            JSONObject body = new JSONObject();
            body.put("model", model);
            body.put("max_tokens", 1024);
            body.put("stream", true);
            body.put("system", system);
            JSONObject oc = new JSONObject(); oc.put("effort", "low"); body.put("output_config", oc);
            JSONArray msgs = new JSONArray();
            for (String[] m : history) msgs.put(msg("u".equals(m[0]) ? "user" : "assistant", m[1]));
            msgs.put(msg("user", userText));
            body.put("messages", msgs);
            boolean fallback = model.startsWith("claude-opus-5") || model.startsWith("claude-sonnet-5-5") || model.startsWith("claude-fable");
            if (fallback) body.put("fallbacks", "default");

            con = (HttpURLConnection) new URL("https://api.anthropic.com/v1/messages").openConnection();
            con.setRequestMethod("POST");
            con.setConnectTimeout(20000);
            con.setReadTimeout(120000);
            con.setDoOutput(true);
            con.setRequestProperty("content-type", "application/json");
            con.setRequestProperty("accept", "text/event-stream");
            con.setRequestProperty("x-api-key", apiKey);
            con.setRequestProperty("anthropic-version", "2023-06-01");
            if (fallback) con.setRequestProperty("anthropic-beta", "server-side-fallback-2026-07-01");
            try (OutputStream os = con.getOutputStream()) { os.write(body.toString().getBytes(StandardCharsets.UTF_8)); }

            int code = con.getResponseCode();
            if (code < 200 || code >= 300) { l.onError(errorMessage(code, con)); return; }

            StringBuilder full = new StringBuilder();
            String[] stop = {null};
            try (BufferedReader r = new BufferedReader(new InputStreamReader(con.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = r.readLine()) != null) {
                    if (!line.startsWith("data:")) continue;
                    String data = line.substring(5).trim();
                    if (data.isEmpty() || "[DONE]".equals(data)) continue;
                    JSONObject ev;
                    try { ev = new JSONObject(data); } catch (Exception e) { continue; }
                    String type = ev.optString("type");
                    if ("content_block_delta".equals(type)) {
                        JSONObject d = ev.optJSONObject("delta");
                        if (d != null && "text_delta".equals(d.optString("type"))) {
                            String t = d.optString("text");
                            if (!t.isEmpty()) { full.append(t); l.onDelta(t); }
                        }
                    } else if ("message_delta".equals(type)) {
                        JSONObject d = ev.optJSONObject("delta");
                        if (d != null && d.has("stop_reason") && !d.isNull("stop_reason")) stop[0] = d.optString("stop_reason");
                    } else if ("error".equals(type)) {
                        JSONObject er = ev.optJSONObject("error");
                        l.onError(er != null ? friendly(er.optString("message")) : "صار خطأ من الخادم.");
                        return;
                    }
                }
            }
            if ("refusal".equals(stop[0]) && full.length() == 0) { l.onError("اعتذر كلود عن الرد على هذا. جرّب صياغة تانية 😊"); return; }
            l.onDone(full.toString(), stop[0]);
        } catch (java.net.UnknownHostException e) {
            l.onError("ما في اتصال بالإنترنت. تأكد من الشبكة وجرّب.");
        } catch (java.net.SocketTimeoutException e) {
            l.onError("انتهى وقت الانتظار. جرّب بعد شوي.");
        } catch (Exception e) {
            l.onError("صار خطأ: " + e.getClass().getSimpleName());
        } finally {
            if (con != null) con.disconnect();
        }
    }

    private static JSONObject msg(String role, String text) {
        JSONObject o = new JSONObject();
        try { o.put("role", role); o.put("content", text); } catch (Exception ignored) { }
        return o;
    }
    private String errorMessage(int code, HttpURLConnection con) {
        String detail = "";
        try (InputStream es = con.getErrorStream()) {
            if (es != null) {
                BufferedReader r = new BufferedReader(new InputStreamReader(es, StandardCharsets.UTF_8));
                StringBuilder sb = new StringBuilder(); String ln;
                while ((ln = r.readLine()) != null) sb.append(ln);
                JSONObject o = new JSONObject(sb.toString());
                JSONObject er = o.optJSONObject("error");
                if (er != null) detail = er.optString("message");
            }
        } catch (Exception ignored) { }
        if (code == 401) return "المفتاح غير صحيح. تأكد منه بالإعدادات.";
        if (code == 429) return "كتير رسائل بوقت قصير. استنى شوي.";
        if (code == 400 && detail.toLowerCase().contains("credit")) return "ما في رصيد كافٍ بحسابك على Anthropic.";
        if (code == 529 || code >= 500) return "الخادم مشغول حالياً. جرّب بعد شوي.";
        return "صار خطأ (" + code + ")" + (detail.isEmpty() ? "." : ": " + friendly(detail));
    }
    private static String friendly(String m) { return m == null ? "" : (m.length() > 120 ? m.substring(0, 120) + "…" : m); }
}
