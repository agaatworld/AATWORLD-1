package com.aat.clawd;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.provider.Settings;

/** Brings Clawd back after a reboot or an app update, if he was floating. */
public class BootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context c, Intent i) {
        if (Prefs.flag(c, "floating") && Settings.canDrawOverlays(c)) {
            try { OverlayService.start(c); } catch (Exception ignored) { }
        }
    }
}
