package com.aat.clawd;

import android.accessibilityservice.AccessibilityService;
import android.content.ComponentName;
import android.content.Context;
import android.graphics.Rect;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;
import android.view.accessibility.AccessibilityEvent;
import android.view.accessibility.AccessibilityNodeInfo;
import android.view.accessibility.AccessibilityWindowInfo;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.List;

/** "عيون كلود": tells the overlay which app is open, whether the keyboard is up (and where),
 *  that the user is typing — WITHOUT ever reading the typed text — and where the home-screen icons are. */
public class ClawdEyes extends AccessibilityService {
    private final Handler h = new Handler(Looper.getMainLooper());
    private String lastKind = "", lastPkg = "";
    private boolean kbOpen;
    private long lastIcons, lastType;
    private String launcherPkg;
    private final java.util.Set<String> imePkgs = new java.util.HashSet<>();

    static boolean isEnabled(Context c) {
        String flat = Settings.Secure.getString(c.getContentResolver(), Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES);
        if (flat == null) return false;
        String me = new ComponentName(c, ClawdEyes.class).flattenToString();
        String me2 = c.getPackageName() + "/.ClawdEyes";
        return flat.contains(me) || flat.contains(me2);
    }

    @Override
    protected void onServiceConnected() {
        super.onServiceConnected();
        launcherPkg = defaultLauncher();
        loadImes();
    }

    @Override public void onInterrupt() { }

    @Override
    public void onAccessibilityEvent(AccessibilityEvent e) {
        if (!OverlayService.running) return;
        int type = e.getEventType();

        if (type == AccessibilityEvent.TYPE_VIEW_TEXT_CHANGED || type == AccessibilityEvent.TYPE_VIEW_TEXT_SELECTION_CHANGED) {
            // user is editing a field — we signal activity only, never the content
            long now = System.currentTimeMillis();
            if (now - lastType > 400) { lastType = now; Bus.typing(); }
            return;
        }

        if (type == AccessibilityEvent.TYPE_VIEW_SCROLLED) { // home screen page swiped: icons moved
            if ("home".equals(lastKind)) { lastIcons = 0; scanIcons(); }
            return;
        }
        if (type == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED || type == AccessibilityEvent.TYPE_WINDOWS_CHANGED) {
            checkKeyboard();
            CharSequence p = e.getPackageName();
            String pkg = p == null ? "" : p.toString();
            if (!pkg.isEmpty() && !pkg.equals(getPackageName())) handleApp(pkg);
        }
    }

    private void handleApp(String pkg) {
        // the keyboard and the system bars are not apps: they used to count as "another app opened",
        // which took away the text field he sits on, so he fell to the bottom when typing
        if (imePkgs.contains(pkg) || pkg.equals("com.android.systemui") || pkg.contains("inputmethod") || pkg.contains("keyboard")) return;
        String kind = classify(pkg);
        if (!pkg.equals(lastPkg) || !kind.equals(lastKind)) {
            lastPkg = pkg; lastKind = kind;
            Bus.app(kind, appLabel(pkg));
        }
        if ("home".equals(kind)) scanIcons();
    }

    private void loadImes() {
        try {
            android.view.inputmethod.InputMethodManager im = (android.view.inputmethod.InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE);
            for (android.view.inputmethod.InputMethodInfo i : im.getInputMethodList()) imePkgs.add(i.getPackageName());
        } catch (Exception ignored) { }
    }

    /* ---------------- keyboard ---------------- */
    private void checkKeyboard() {
        boolean open = false; Rect kb = null;
        try {
            List<AccessibilityWindowInfo> ws = getWindows();
            for (AccessibilityWindowInfo w : ws) {
                if (w.getType() == AccessibilityWindowInfo.TYPE_INPUT_METHOD) { open = true; kb = new Rect(); w.getBoundsInScreen(kb); }
            }
        } catch (Exception ignored) { }
        if (open) {
            Rect field = focusedField();
            int kbTop = kb != null ? kb.top : 0;
            try {
                JSONObject o = new JSONObject();
                float d = getResources().getDisplayMetrics().density; // the page works in dp
                o.put("kbTop", kbTop / d);
                if (field != null) { o.put("x", field.left / d); o.put("y", field.top / d); o.put("w", field.width() / d); o.put("h", field.height() / d); }
                else { o.put("x", 12); o.put("y", kbTop / d - 70); o.put("w", 200); o.put("h", 50); }
                Bus.keyboard(true, o.toString());
            } catch (Exception ignored) { }
            kbOpen = true;
        } else if (kbOpen) { kbOpen = false; Bus.keyboard(false, null); }
    }
    private Rect focusedField() {
        try {
            AccessibilityNodeInfo f = findFocus(AccessibilityNodeInfo.FOCUS_INPUT);
            if (f != null && f.isEditable()) { Rect r = new Rect(); f.getBoundsInScreen(r); if (r.width() > 0 && r.height() > 0) return r; }
        } catch (Exception ignored) { }
        return null;
    }

    /* ---------------- home-screen icons (best effort) ---------------- */
    private void scanIcons() {
        long now = System.currentTimeMillis();
        if (now - lastIcons < 1500) return;
        lastIcons = now;
        h.postDelayed(() -> {
            try {
                AccessibilityNodeInfo root = getRootInActiveWindow();
                if (root == null) return;
                JSONArray out = new JSONArray();
                collectIcons(root, out, 0);
                root.recycle();
                if (out.length() >= 3) Bus.icons(out.toString());
            } catch (Exception ignored) { }
        }, 250);
    }
    private void collectIcons(AccessibilityNodeInfo n, JSONArray out, int depth) {
        if (n == null || depth > 24 || out.length() > 40) return;
        int cc = n.getChildCount();
        boolean leaf = cc == 0;
        if ((leaf || cc <= 1) && n.isClickable()) {
            Rect r = new Rect(); n.getBoundsInScreen(r);
            int w = r.width(), hh = r.height();
            if (w > 90 && w < 320 && hh > 90 && hh < 360 && Math.abs(w - hh) < w * 0.9) {
                float d = getResources().getDisplayMetrics().density;
                try { JSONObject o = new JSONObject(); o.put("x", r.left / d); o.put("y", r.top / d); o.put("w", w / d); o.put("h", hh / d); out.put(o); } catch (Exception ignored) { }
            }
        }
        for (int i = 0; i < cc; i++) { AccessibilityNodeInfo ch = n.getChild(i); if (ch != null) { collectIcons(ch, out, depth + 1); ch.recycle(); } }
    }

    /* ---------------- app classification ---------------- */
    private String classify(String pkg) {
        if (pkg.equals(launcherPkg) || isLauncher(pkg)) return "home";
        for (String v : VIDEO) if (pkg.contains(v)) return "video";
        for (String ch : CHAT) if (pkg.contains(ch)) return "chat";
        return "other";
    }
    private static final String[] VIDEO = {"youtube", "tiktok", "trill", "instagram", "snapchat", "com.facebook.katana", "kwai", "likee", "triller", "reels"};
    private static final String[] CHAT = {"whatsapp", "telegram", "org.thoughtcrime", "signal", "com.facebook.orca", "viber", "com.imo.", "wechat", "jp.naver.line", "com.google.android.apps.messaging", "com.android.mms", "discord", "slack", "skype", "com.google.android.gm"};
    private boolean isLauncher(String pkg) {
        return pkg.contains("launcher") || pkg.contains("home") || pkg.contains("trebuchet") || pkg.contains("nexuslauncher") || pkg.endsWith(".home");
    }
    private String defaultLauncher() {
        try {
            android.content.Intent i = new android.content.Intent(android.content.Intent.ACTION_MAIN).addCategory(android.content.Intent.CATEGORY_HOME);
            android.content.pm.ResolveInfo r = getPackageManager().resolveActivity(i, android.content.pm.PackageManager.MATCH_DEFAULT_ONLY);
            return r != null && r.activityInfo != null ? r.activityInfo.packageName : null;
        } catch (Exception e) { return null; }
    }
    private String appLabel(String pkg) {
        try {
            android.content.pm.PackageManager pm = getPackageManager();
            CharSequence l = pm.getApplicationLabel(pm.getApplicationInfo(pkg, 0));
            return l == null ? pkg : l.toString();
        } catch (Exception e) { return pkg; }
    }
}
