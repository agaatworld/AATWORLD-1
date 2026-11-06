package com.aatworld.talk;

import android.Manifest;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;

import java.util.Calendar;
import java.util.List;

/** Ongoing lock-screen notification with the current and next schedule events. */
final class ScheduleNotifier {
    private ScheduleNotifier() { }

    static final String CHANNEL = "schedule2";        // "schedule" was created silent; channel settings are immutable
    static final String OLD_CHANNEL = "schedule";
    static final int NOTIF_ID = 7301;
    static final String PREF_KEY = "sched_notif";

    static boolean isEnabled(Context c) {
        return c.getSharedPreferences(ScheduleStore.DATA_PREFS, Context.MODE_PRIVATE).getBoolean(PREF_KEY, true);
    }

    static void setEnabled(Context c, boolean on) {
        c.getSharedPreferences(ScheduleStore.DATA_PREFS, Context.MODE_PRIVATE).edit().putBoolean(PREF_KEY, on).apply();
    }

    static boolean permitted(Context c) {
        return Build.VERSION.SDK_INT < 33
                || c.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED;
    }

    /** True if the notification should currently be shown (enabled and allowed). */
    static boolean active(Context c) {
        return isEnabled(c) && permitted(c);
    }

    /** Post/update or remove the notification, and (re)arm the single boundary alarm. */
    static void sync(Context c) {
        refresh(c);
        ScheduleTickReceiver.schedule(c);
    }

    static void cancel(Context c) {
        try {
            NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm != null) nm.cancel(NOTIF_ID);
        } catch (Throwable ignored) { }
    }

    static void refresh(Context c) {
        try {
            if (!active(c)) { cancel(c); return; }
            NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm == null) return;
            List<ScheduleStore.Day> days = ScheduleStore.loadDays(c);
            if (days.isEmpty()) { cancel(c); return; }
            int n = days.size();
            int[] wds = new int[n];
            String[] names = new String[n];
            int[][] mins = new int[n][];
            String[][] times = new String[n][], texts = new String[n][];
            for (int i = 0; i < n; i++) {
                ScheduleStore.Day d = days.get(i);
                wds[i] = d.wd; names[i] = d.name; mins[i] = d.mins; times[i] = d.times; texts[i] = d.texts;
            }
            Calendar cal = Calendar.getInstance();
            int nowMin = cal.get(Calendar.HOUR_OF_DAY) * 60 + cal.get(Calendar.MINUTE);
            ScheduleNotifText.Result r = ScheduleNotifText.build(wds, names, mins, times, texts,
                    cal.get(Calendar.DAY_OF_WEEK), nowMin);

            if (Build.VERSION.SDK_INT >= 26) {
                NotificationChannel ch = new NotificationChannel(CHANNEL, "الجدول", NotificationManager.IMPORTANCE_DEFAULT);
                ch.setSound(android.provider.Settings.System.DEFAULT_NOTIFICATION_URI,
                        new android.media.AudioAttributes.Builder()
                                .setUsage(android.media.AudioAttributes.USAGE_NOTIFICATION)
                                .setContentType(android.media.AudioAttributes.CONTENT_TYPE_SONIFICATION).build());
                ch.enableVibration(false);
                ch.setShowBadge(false);
                ch.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
                nm.createNotificationChannel(ch);
                try { nm.deleteNotificationChannel(OLD_CHANNEL); } catch (Throwable ignored) { }
            }
            Intent open = new Intent(c, MainActivity.class)
                    .setAction(Intent.ACTION_MAIN)
                    .putExtra("open", "schedule")
                    .setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            PendingIntent pi = PendingIntent.getActivity(c, 3000, open,
                    PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
            Notification.Builder b = Build.VERSION.SDK_INT >= 26
                    ? new Notification.Builder(c, CHANNEL) : new Notification.Builder(c);
            b.setSmallIcon(R.drawable.ic_stat_talk)
                    .setContentTitle(r.title)
                    .setStyle(new Notification.BigTextStyle().bigText(r.big))
                    .setOngoing(true)
                    .setOnlyAlertOnce(true)
                    .setShowWhen(false)
                    .setCategory(Notification.CATEGORY_STATUS)
                    .setVisibility(Notification.VISIBILITY_PUBLIC)
                    .setContentIntent(pi);
            if (r.text != null && !r.text.isEmpty()) b.setContentText(r.text);
            if (Build.VERSION.SDK_INT < 26) {
                b.setPriority(Notification.PRIORITY_DEFAULT);
                b.setDefaults(Notification.DEFAULT_SOUND);
            }
            nm.notify(NOTIF_ID, b.build());
        } catch (Throwable ignored) { }
    }
}
