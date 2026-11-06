package com.aatworld.talk;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

import java.util.Calendar;

/** Fires at the next schedule boundary (one inexact alarm), refreshes widgets + notification, re-arms itself. */
public class ScheduleTickReceiver extends BroadcastReceiver {
    static final String ACTION_TICK = "com.aatworld.talk.SCHEDULE_TICK";

    @Override
    public void onReceive(Context ctx, Intent intent) {
        ScheduleWidget.refreshAll(ctx); // re-renders widgets, refreshes the notification, re-arms the alarm
    }

    private static PendingIntent alarmPi(Context ctx) {
        Intent i = new Intent(ctx, ScheduleTickReceiver.class).setAction(ACTION_TICK);
        return PendingIntent.getBroadcast(ctx, 1998, i, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
    }

    static void cancel(Context ctx) {
        try {
            AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
            if (am != null) am.cancel(alarmPi(ctx));
        } catch (Throwable ignored) { }
    }

    /** Arms one alarm at the next boundary if any widget exists or the notification is active; else cancels. */
    static void schedule(Context ctx) {
        try {
            AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
            if (am == null) return;
            if (ScheduleWidget.ids(ctx).length == 0 && !ScheduleNotifier.active(ctx)) { cancel(ctx); return; }
            Calendar c = Calendar.getInstance();
            long msOfDay = ((c.get(Calendar.HOUR_OF_DAY) * 60L + c.get(Calendar.MINUTE)) * 60L
                    + c.get(Calendar.SECOND)) * 1000L + c.get(Calendar.MILLISECOND);
            long delay = ScheduleLogic.nextBoundaryDelayMillis(ScheduleStore.todayTimes(ctx), msOfDay);
            // the notification also changes when the last event's grace period ends
            long grace = lastGraceDelay(ctx, msOfDay);
            if (grace > 0 && grace < delay) delay = grace;
            am.setAndAllowWhileIdle(AlarmManager.RTC, System.currentTimeMillis() + delay + 1500L, alarmPi(ctx));
        } catch (Throwable ignored) { }
    }

    private static long lastGraceDelay(Context ctx, long msOfDay) {
        int[] t = ScheduleStore.todayTimes(ctx);
        int last = -1;
        for (int v : t) if (v > last) last = v;
        if (last < 0) return -1;
        long at = (last + ScheduleNotifText.LAST_EVENT_GRACE_MIN) * 60000L;
        return at > msOfDay ? at - msOfDay : -1;
    }
}
