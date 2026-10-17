package com.aat.clawd;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.provider.Settings;

/** Brings Clawd back after a reboot or app update if he was floating before. */
public class BootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context c, Intent i) {
        if (Bridge.prefs(c).getBoolean("floating", false) && Settings.canDrawOverlays(c)) {
            try { OverlayService.start(c); } catch (Exception ignored) { }
        }
    }
}
