package com.aatworld.talk;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.PowerManager;
import android.provider.Settings;
import android.view.View;
import android.view.WindowManager;
import android.webkit.PermissionRequest;
import android.webkit.ServiceWorkerClient;
import android.webkit.ServiceWorkerController;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

public class MainActivity extends Activity {
    static final String HOST = "appassets.talk.local";
    static final String START_URL = "https://" + HOST + "/index.html";
    private static final int REQ_PERMS = 42;

    private WebView webView;
    private PermissionRequest pendingWebPermission;
    private final Map<String, String> mime = new HashMap<>();

    @SuppressLint({"SetJavaScriptEnabled", "AddJavascriptInterface"})
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        initMime();
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        webView = new WebView(this);
        webView.setBackgroundColor(0xFF070A14);
        setContentView(webView);

        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);

        webView.addJavascriptInterface(new NativeBridge(this), "AATNative");

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                return serveAsset(request.getUrl());
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri u = request.getUrl();
                if (HOST.equals(u.getHost())) return false;
                String sch = u.getScheme();
                if ("http".equals(sch) || "https".equals(sch) || "mailto".equals(sch) || "tel".equals(sch)) {
                    try {
                        startActivity(new Intent(Intent.ACTION_VIEW, u));
                    } catch (Exception ignored) { }
                }
                return true;
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                runOnUiThread(() -> handleWebPermission(request));
            }
        });

        // Service worker requests (sw.js fetches) also come from the bundled assets.
        try {
            ServiceWorkerController.getInstance().setServiceWorkerClient(new ServiceWorkerClient() {
                @Override
                public WebResourceResponse shouldInterceptRequest(WebResourceRequest request) {
                    return serveAsset(request.getUrl());
                }
            });
        } catch (Throwable ignored) { }

        requestRuntimePermissions();

        if (savedInstanceState != null) {
            webView.restoreState(savedInstanceState);
        } else {
            webView.loadUrl(urlForIntent(getIntent()));
        }
    }

    private String urlForIntent(Intent i) {
        String o = i == null ? null : i.getStringExtra("open");
        if ("talk".equals(o)) return START_URL + "#talk";
        if ("schedule".equals(o)) return START_URL + "#schedule";
        return START_URL;
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        String o = intent == null ? null : intent.getStringExtra("open");
        if (webView != null && ("talk".equals(o) || "schedule".equals(o))) {
            webView.evaluateJavascript("location.hash='#" + o + "';", null);
        }
    }

    // ---- permissions ----
    private boolean has(String p) {
        return checkSelfPermission(p) == PackageManager.PERMISSION_GRANTED;
    }

    private void requestRuntimePermissions() {
        List<String> need = new ArrayList<>();
        if (!has(Manifest.permission.RECORD_AUDIO)) need.add(Manifest.permission.RECORD_AUDIO);
        if (!has(Manifest.permission.CAMERA)) need.add(Manifest.permission.CAMERA);
        if (Build.VERSION.SDK_INT >= 33 && !has(Manifest.permission.POST_NOTIFICATIONS)) {
            need.add(Manifest.permission.POST_NOTIFICATIONS);
        }
        if (need.isEmpty()) {
            afterPermissions();
        } else {
            requestPermissions(need.toArray(new String[0]), REQ_PERMS);
        }
    }

    @Override
    public void onRequestPermissionsResult(int code, String[] perms, int[] results) {
        super.onRequestPermissionsResult(code, perms, results);
        if (code != REQ_PERMS) return;
        if (pendingWebPermission != null) {
            PermissionRequest r = pendingWebPermission;
            pendingWebPermission = null;
            handleWebPermission(r);
        }
        afterPermissions();
    }

    private void afterPermissions() {
        KeepAliveService.start(this);
        askBatteryOptimizationOnce();
    }

    private void handleWebPermission(PermissionRequest request) {
        List<String> grant = new ArrayList<>();
        List<String> missing = new ArrayList<>();
        for (String res : request.getResources()) {
            if (PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(res)) {
                if (has(Manifest.permission.RECORD_AUDIO)) grant.add(res);
                else missing.add(Manifest.permission.RECORD_AUDIO);
            } else if (PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(res)) {
                if (has(Manifest.permission.CAMERA)) grant.add(res);
                else missing.add(Manifest.permission.CAMERA);
            }
        }
        if (!missing.isEmpty()) {
            pendingWebPermission = request;
            requestPermissions(missing.toArray(new String[0]), REQ_PERMS);
            return;
        }
        if (grant.isEmpty()) request.deny();
        else request.grant(grant.toArray(new String[0]));
    }

    private void askBatteryOptimizationOnce() {
        try {
            SharedPreferences sp = getSharedPreferences("talk", MODE_PRIVATE);
            if (sp.getBoolean("batteryAsked", false)) return;
            sp.edit().putBoolean("batteryAsked", true).apply();
            PowerManager pm = (PowerManager) getSystemService(POWER_SERVICE);
            if (pm != null && !pm.isIgnoringBatteryOptimizations(getPackageName())) {
                Intent i = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS,
                        Uri.parse("package:" + getPackageName()));
                startActivity(i);
            }
        } catch (Exception ignored) { }
    }

    // ---- bundled assets over https://appassets.talk.local/ ----
    private void initMime() {
        mime.put("html", "text/html");
        mime.put("htm", "text/html");
        mime.put("js", "application/javascript");
        mime.put("mjs", "application/javascript");
        mime.put("css", "text/css");
        mime.put("json", "application/json");
        mime.put("webmanifest", "application/manifest+json");
        mime.put("png", "image/png");
        mime.put("jpg", "image/jpeg");
        mime.put("jpeg", "image/jpeg");
        mime.put("gif", "image/gif");
        mime.put("svg", "image/svg+xml");
        mime.put("webp", "image/webp");
        mime.put("ico", "image/x-icon");
        mime.put("mp3", "audio/mpeg");
        mime.put("wav", "audio/wav");
        mime.put("ogg", "audio/ogg");
        mime.put("woff", "font/woff");
        mime.put("woff2", "font/woff2");
        mime.put("ttf", "font/ttf");
        mime.put("txt", "text/plain");
        mime.put("wasm", "application/wasm");
    }

    // Called on WebView background threads; only touches assets (thread-safe).
    private WebResourceResponse serveAsset(Uri uri) {
        if (!HOST.equals(uri.getHost())) return null; // not ours: let the WebView handle it
        String path = uri.getPath(); // excludes query and fragment
        if (path == null || path.isEmpty() || "/".equals(path)) path = "/index.html";
        String rel = path.startsWith("/") ? path.substring(1) : path;
        if (rel.contains("..")) return notFound();
        try {
            InputStream in = getAssets().open(rel);
            String ext = "";
            int dot = rel.lastIndexOf('.');
            if (dot >= 0) ext = rel.substring(dot + 1).toLowerCase(Locale.ROOT);
            String type = mime.get(ext);
            if (type == null) type = "application/octet-stream";
            boolean text = type.startsWith("text/") || type.contains("javascript") || type.contains("json")
                    || type.contains("xml") || type.contains("manifest");
            WebResourceResponse r = new WebResourceResponse(type, text ? "UTF-8" : null, in);
            Map<String, String> h = new HashMap<>();
            h.put("Cache-Control", "no-cache");
            h.put("Access-Control-Allow-Origin", "*");
            r.setResponseHeaders(h);
            return r;
        } catch (IOException e) {
            return notFound();
        }
    }

    private WebResourceResponse notFound() {
        WebResourceResponse r = new WebResourceResponse("text/plain", "UTF-8",
                new java.io.ByteArrayInputStream("Not found".getBytes()));
        r.setStatusCodeAndReasonPhrase(404, "Not Found");
        return r;
    }

    // ---- lifecycle: keep JS alive in background ----
    @Override
    protected void onPause() {
        super.onPause();
        // Intentionally NOT calling webView.onPause(); make sure timers keep running.
        if (webView != null) webView.resumeTimers();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) {
            webView.onResume();
            webView.resumeTimers();
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        if (webView != null) webView.saveState(out);
    }

    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else moveTaskToBack(true);
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            // keep it simple: process is kept alive by the service; destroy view with the activity
            webView.removeJavascriptInterface("AATNative");
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }
}
