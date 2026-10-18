package com.aat.clawd;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

/** The app screen: the arena, settings, permissions and the Claude key. */
public class MainActivity extends Activity {
    private WebView web;
    private boolean wantFloating;

    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        web = new WebView(this);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setTextZoom(100);
        s.setAllowFileAccess(true);
        web.setBackgroundColor(0xFFF3F2EE);
        web.setOverScrollMode(WebView.OVER_SCROLL_NEVER);
        web.setWebViewClient(new WebViewClient() {
            @Override public WebResourceResponse shouldInterceptRequest(WebView v, WebResourceRequest r) { return null; }
        });
        web.addJavascriptInterface(new Bridge(this).withActivity(this), "A");
        web.loadUrl("file:///android_asset/index.html");
        setContentView(web);

        if (Build.VERSION.SDK_INT >= 33
                && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, 1);
        }
        if (getIntent() != null && getIntent().getBooleanExtra("float", false)) web.postDelayed(this::startFloating, 1200);
    }

    @Override
    protected void onNewIntent(Intent i) {
        super.onNewIntent(i);
        setIntent(i);
        if (i != null && i.getBooleanExtra("float", false)) web.postDelayed(this::startFloating, 300);
    }

    void startFloating() {
        if (!Settings.canDrawOverlays(this)) {
            wantFloating = true;
            Toast.makeText(this, "فعّل «الظهور فوق التطبيقات» لـ فشّة خلق، ثم ارجع", Toast.LENGTH_LONG).show();
            openPerm("overlay");
            return;
        }
        OverlayService.start(this);
        Toast.makeText(this, "كلود صار معك فوق كل التطبيقات 👇", Toast.LENGTH_SHORT).show();
        moveTaskToBack(true);
    }

    void openPerm(String which) {
        try { startActivity(Perms.intentFor(this, which)); }
        catch (Exception e) { Toast.makeText(this, "افتح إعدادات النظام يدوياً", Toast.LENGTH_SHORT).show(); }
    }

    void openChatFallback(String seed) {
        if (Settings.canDrawOverlays(this)) { OverlayService.startThenChat(this, seed); moveTaskToBack(true); }
        else { wantFloating = true; openPerm("overlay"); }
    }

    @Override
    protected void onResume() {
        super.onResume();
        web.onResume();
        if (wantFloating && Settings.canDrawOverlays(this)) { wantFloating = false; startFloating(); return; }
        web.evaluateJavascript("window.app&&app.onResume()", null);
    }

    @Override protected void onPause() { web.onPause(); super.onPause(); }
    @Override protected void onDestroy() { web.destroy(); super.onDestroy(); }
}
