package com.aat.clawd;

import com.anthropic.client.AnthropicClient;
import com.anthropic.client.okhttp.AnthropicOkHttpClient;
import com.anthropic.core.JsonValue;
import com.anthropic.core.http.StreamResponse;
import com.anthropic.errors.AnthropicServiceException;
import com.anthropic.errors.RateLimitException;
import com.anthropic.errors.UnauthorizedException;
import com.anthropic.models.messages.CacheControlEphemeral;
import com.anthropic.models.messages.MessageCreateParams;
import com.anthropic.models.messages.OutputConfig;
import com.anthropic.models.messages.RawMessageStreamEvent;

import java.util.List;

/** Streams one Claude reply. Plain Java (no Android types) so it can be compiled and checked anywhere. */
public final class ClaudeClient {
    public interface Listener {
        void onDelta(String text);
        void onDone(String full, String stopReason);
        void onError(String message);
    }

    private final AnthropicClient client;

    public ClaudeClient(String apiKey) {
        client = AnthropicOkHttpClient.builder().apiKey(apiKey).build();
    }

    /** history: pairs of {role ("u" or "a"), text}, oldest first. Blocks until the reply is complete. */
    public void stream(String model, String system, List<String[]> history, String userText, Listener l) {
        MessageCreateParams.Builder b = MessageCreateParams.builder()
                .model(model)
                .maxTokens(64000L)
                .system(system)
                .cacheControl(CacheControlEphemeral.builder().build())
                .outputConfig(OutputConfig.builder().effort(OutputConfig.Effort.LOW).build());
        for (String[] m : history) {
            if ("u".equals(m[0])) b.addUserMessage(m[1]);
            else b.addAssistantMessage(m[1]);
        }
        b.addUserMessage(userText);
        if (!model.startsWith("claude-haiku")) {
            // if a safety classifier declines, the API retries on a suitable model by itself
            b.putAdditionalHeader("anthropic-beta", "server-side-fallback-2026-07-01");
            b.putAdditionalBodyProperty("fallbacks", JsonValue.from("default"));
        }
        StringBuilder full = new StringBuilder();
        String[] stop = {null};
        try (StreamResponse<RawMessageStreamEvent> s = client.messages().createStreaming(b.build())) {
            s.stream().forEach(ev -> {
                ev.contentBlockDelta().flatMap(d -> d.delta().text()).ifPresent(t -> {
                    full.append(t.text());
                    l.onDelta(t.text());
                });
                ev.messageDelta().flatMap(md -> md.delta().stopReason()).ifPresent(r -> stop[0] = r.toString());
            });
            l.onDone(full.toString(), stop[0]);
        } catch (UnauthorizedException e) {
            l.onError("المفتاح غير صحيح. تأكد منه بالإعدادات.");
        } catch (RateLimitException e) {
            l.onError("كتير رسائل بوقت قصير. استنى شوي وجرّب.");
        } catch (AnthropicServiceException e) {
            l.onError("صار خطأ من الخادم (" + e.statusCode() + "). جرّب بعد شوي.");
        } catch (RuntimeException e) {
            l.onError("ما في اتصال بالإنترنت، أو صار خطأ: " + e.getClass().getSimpleName());
        }
    }
}
