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
        if (tts == null) tts = new TextToSpeech(ov, st -> {
            if (st == TextToSpeech.SUCCESS) { int r = tts.setLanguage(new Locale("ar")); ttsOk = r != TextToSpeech.LANG_MISSING_DATA && r != TextToSpeech.LANG_NOT_SUPPORTED; }
        });
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
