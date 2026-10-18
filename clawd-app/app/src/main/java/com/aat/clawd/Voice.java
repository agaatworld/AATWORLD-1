package com.aat.clawd;

import android.Manifest;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.speech.tts.TextToSpeech;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/** Talking to him by voice: hold your finger on him and speak; he answers in a bubble and, if the phone
 *  has an Arabic voice, out loud. Uses the phone's own speech recognizer and text-to-speech. */
final class Voice {
    private final OverlayService ov;
    private SpeechRecognizer rec;
    private TextToSpeech tts;
    private boolean ttsOk, listening;

    Voice(OverlayService ov) { this.ov = ov; }

    static boolean hasMic(Context c) { return c.checkSelfPermission(Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED; }

    void start() {
        if (!hasMic(ov)) { // the permission can only be asked from a screen: open the app and ask there
            ov.jsStage("clawd.voiceReply('اسمحلي أسمعك من التطبيق أول مرة 🎙️','pleading')");
            Intent i = new Intent(ov, MainActivity.class).putExtra("askMic", true).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            try { ov.startActivity(i); } catch (Exception ignored) { }
            return;
        }
        if (!SpeechRecognizer.isRecognitionAvailable(ov)) { ov.jsStage("clawd.voiceReply('هاتفك ما فيه خدمة تحويل الصوت لكلام 😔','sad')"); return; }
        if (tts == null) tts = new TextToSpeech(ov, st -> { if (st == TextToSpeech.SUCCESS) ttsOk = setup(ov, tts); });
        else if (ttsOk) setup(ov, tts); // the chosen voice may have changed in the settings
        if (tts != null) tts.stop();
        if (rec == null) {
            rec = SpeechRecognizer.createSpeechRecognizer(ov);
            rec.setRecognitionListener(new RecognitionListener() {
                @Override public void onReadyForSpeech(Bundle b) { }
                @Override public void onBeginningOfSpeech() { }
                @Override public void onRmsChanged(float v) { }
                @Override public void onBufferReceived(byte[] b) { }
                @Override public void onEndOfSpeech() { listening = false; }
                @Override public void onError(int e) { listening = false; ov.jsStage("clawd.voiceHeard('')"); }
                @Override public void onResults(Bundle b) {
                    listening = false;
                    ArrayList<String> r = b.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                    String text = r != null && !r.isEmpty() ? r.get(0).trim() : "";
                    ov.jsStage("clawd.voiceHeard(" + Bus.q(text) + ")");
                    if (!text.isEmpty()) ask(text);
                }
                @Override public void onPartialResults(Bundle b) { }
                @Override public void onEvent(int t, Bundle b) { }
            });
        }
        Intent in = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        in.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
        in.putExtra(RecognizerIntent.EXTRA_LANGUAGE, "ar");
        in.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1);
        try { rec.startListening(in); listening = true; } catch (Exception e) { listening = false; }
    }

    /* ---------------- his speaking voice: a man's voice, a little deeper than the engine's default */
    /** Arabic, the voice chosen in the settings (or a male one), and a lower pitch. False when there is no Arabic voice. */
    static boolean setup(Context c, TextToSpeech t) {
        int r = t.setLanguage(new Locale("ar"));
        if (r == TextToSpeech.LANG_MISSING_DATA || r == TextToSpeech.LANG_NOT_SUPPORTED) return false;
        String st = Prefs.settings(c);
        try { android.speech.tts.Voice v = choose(t, Prefs.field(st, "voiceName", "")); if (v != null) t.setVoice(v); } catch (Exception ignored) { }
        float pitch = 0.8f;
        try { pitch = Float.parseFloat(Prefs.field(st, "voicePitch", "0.8")); } catch (Exception ignored) { }
        t.setPitch(Math.max(0.5f, Math.min(1.5f, pitch)));
        t.setSpeechRate(1.0f);
        return true;
    }
    /** Arabic voices, voices that work offline first. */
    static List<android.speech.tts.Voice> arabic(TextToSpeech t) {
        List<android.speech.tts.Voice> out = new ArrayList<>();
        try { for (android.speech.tts.Voice v : t.getVoices()) if (v.getLocale() != null && "ar".equals(v.getLocale().getLanguage())) out.add(v); } catch (Exception ignored) { }
        out.sort((a, b) -> a.isNetworkConnectionRequired() != b.isNetworkConnectionRequired() ? (a.isNetworkConnectionRequired() ? 1 : -1) : a.getName().compareTo(b.getName()));
        return out;
    }
    private static android.speech.tts.Voice choose(TextToSpeech t, String wanted) {
        List<android.speech.tts.Voice> ar = arabic(t);
        if (ar.isEmpty()) return null;
        for (android.speech.tts.Voice v : ar) if (v.getName().equals(wanted)) return v;
        for (android.speech.tts.Voice v : ar) { String n = v.getName().toLowerCase(Locale.US); if (n.contains("male") && !n.contains("female")) return v; }
        // a guess for Google's offline Arabic voices (the owner can pick another one in the settings and hear it)
        for (android.speech.tts.Voice v : ar) { String n = v.getName(); if ((n.contains("-ard-") || n.contains("-arz-")) && !v.isNetworkConnectionRequired()) return v; }
        return null; // keep the engine's own Arabic voice; the lower pitch still makes it deeper
    }

    void stop() { if (rec != null && listening) try { rec.stopListening(); } catch (Exception ignored) { } }

    /** Sends what he heard to the AI (same persona as the chat, but a short spoken answer) and says the reply. */
    private void ask(String text) {
        if (!Mind.ready(ov)) { ov.jsStage("clawd.voiceReply(" + Bus.q(Mind.missingKey(ov)) + ",'pleading')"); return; }
        final List<String[]> past = new ArrayList<>();
        try { JSONArray a = new JSONArray(Prefs.chatHistory(ov)); for (int i = Math.max(0, a.length() - 8); i < a.length(); i++) { JSONObject o = a.getJSONObject(i); past.add(new String[]{o.getString("r"), o.getString("t")}); } } catch (Exception ignored) { }
        ov.withContext(context -> new Thread(() -> {
            String sys = Mind.systemPrompt(ov, context) + " هذا كلام صوتي: رد بجملة أو جملتين قصيرتين تصلحان للنطق، بلا رموز ولا قوائم.";
            Mind.stream(ov, sys, past, text, 400, new ClaudeClient.Listener() {
                @Override public void onDelta(String t) { }
                @Override public void onDone(String full, String stop) {
                    String ans = full == null ? "" : full;
                    Mind.learnFrom(ov, ans);
                    String face = OverlayService.tag(ans, "face");
                    String clean = ans.replaceAll("\\[\\[[a-zA-Z]+:[^\\]]*\\]\\]", "").trim();
                    ov.saveExchange(text, ans);
                    ov.runOnUi(() -> {
                        ov.jsStage("clawd.voiceReply(" + Bus.q(clean) + "," + Bus.q(face) + ")");
                        if (ttsOk && Prefs.boolField(Prefs.settings(ov), "voiceSpeak", true)) tts.speak(clean, TextToSpeech.QUEUE_FLUSH, null, "clawd");
                    });
                }
                @Override public void onError(String m) { ov.runOnUi(() -> ov.jsStage("clawd.voiceReply(" + Bus.q(m) + ",'embarrassed')")); }
            });
        }).start());
    }

    void destroy() {
        try { if (rec != null) rec.destroy(); } catch (Exception ignored) { }
        try { if (tts != null) tts.shutdown(); } catch (Exception ignored) { }
    }
}
