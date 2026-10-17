package com.aat.clawd;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.Toast;

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
        web.addJavascriptInterface(new Bridge(this, this, null), "A");
        web.loadUrl("file:///android_asset/clawd.html");
        setContentView(web);

        if (Build.VERSION.SDK_INT >= 33
                && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, 1);
        }
        if (getIntent().getBooleanExtra("float", false)) web.postDelayed(this::startFloating, 1500);
    }

    @Override
    protected void onNewIntent(Intent i) {
        super.onNewIntent(i);
        setIntent(i);
        if (i.getBooleanExtra("float", false)) web.postDelayed(this::startFloating, 800);
    }

    /** Called from the page's "start floating" button. */
    void startFloating() {
        if (!Settings.canDrawOverlays(this)) {
            wantFloating = true;
            Toast.makeText(this, "فعّل «الظهور فوق التطبيقات» لـ فشّة خلق، ثم ارجع", Toast.LENGTH_LONG).show();
            startActivity(new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:" + getPackageName())));
            return;
        }
        OverlayService.start(this);
        Toast.makeText(this, "كلود صار معك بالركن السفلي 👇", Toast.LENGTH_SHORT).show();
        moveTaskToBack(true);
    }

    @Override
    protected void onResume() {
        super.onResume();
        web.onResume();
        if (wantFloating) {
            wantFloating = false;
            if (Settings.canDrawOverlays(this)) startFloating();
        }
        web.evaluateJavascript("window.clawd&&clawd.onPerm()", null);
    }

    @Override
    protected void onPause() {
        web.onPause();
        super.onPause();
    }

    @Override
    protected void onDestroy() {
        web.destroy();
        super.onDestroy();
    }
}
