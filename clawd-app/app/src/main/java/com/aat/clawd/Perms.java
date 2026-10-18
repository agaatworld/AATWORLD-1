package com.aat.clawd;

import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.PowerManager;
import android.provider.Settings;

/** Permission checks and the intents that open the right settings page. */
public final class Perms {
    public static boolean ignoringBattery(Context c) {
        PowerManager pm = (PowerManager) c.getSystemService(Context.POWER_SERVICE);
        return pm != null && pm.isIgnoringBatteryOptimizations(c.getPackageName());
    }

    /** True in the full build, which declares the accessibility service. */
    public static boolean eyesAvailable(Context c) {
        try {
            android.content.pm.PackageInfo pi = c.getPackageManager().getPackageInfo(c.getPackageName(), android.content.pm.PackageManager.GET_SERVICES);
            if (pi.services != null) for (android.content.pm.ServiceInfo s : pi.services) if (s.name.endsWith(".ClawdEyes")) return true;
        } catch (Exception ignored) { }
        return false;
    }

    /** Returns the intent to send for a permission key, or null if nothing to do. */
    public static Intent intentFor(Context c, String which) {
        String pkg = c.getPackageName();
        switch (which) {
            case "overlay":
                return new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:" + pkg));
            case "a11y":
                return new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS);
            case "notif":
                return new Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).putExtra(Settings.EXTRA_APP_PACKAGE, pkg);
            case "battery":
                return new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS, Uri.parse("package:" + pkg));
            case "appinfo":
            default:
                return new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:" + pkg));
        }
    }
}
