package com.aatworld.talk;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.util.TypedValue;
import android.widget.RemoteViews;

import java.util.Calendar;

/** Daily schedule widget (collection widget with a scrolling list). */
public class ScheduleWidget extends AppWidgetProvider {
    static final String ACTION_PREV = "com.aatworld.talk.SCHEDULE_PREV";
    static final String ACTION_NEXT = "com.aatworld.talk.SCHEDULE_NEXT";
    static final String ACTION_TICK = "com.aatworld.talk.SCHEDULE_TICK";

    @Override
    public void onUpdate(Context ctx, AppWidgetManager mgr, int[] ids) {
        for (int id : ids) render(ctx, mgr, id);
        scheduleNext(ctx);
    }

    @Override
    public void onAppWidgetOptionsChanged(Context ctx, AppWidgetManager mgr, int id, android.os.Bundle o) {
        render(ctx, mgr, id);
    }

    @Override
    public void onDeleted(Context ctx, int[] ids) {
        ScheduleStore.delete(ctx, ids);
    }

    @Override
    public void onDisabled(Context ctx) {
        cancelAlarm(ctx);
    }

    @Override
    public void onReceive(Context ctx, Intent intent) {
        String a = intent == null ? null : intent.getAction();
        if (a == null) { super.onReceive(ctx, intent); return; }
        switch (a) {
            case ACTION_PREV:
            case ACTION_NEXT: {
                int id = intent.getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID);
                if (id != AppWidgetManager.INVALID_APPWIDGET_ID) {
                    ScheduleStore.shiftDay(ctx, id, ACTION_NEXT.equals(a) ? 1 : -1);
                    refresh(ctx, id);
                }
                return;
            }
            case ACTION_TICK:
            case Intent.ACTION_TIME_CHANGED:
            case Intent.ACTION_TIMEZONE_CHANGED:
            case Intent.ACTION_DATE_CHANGED:
            case Intent.ACTION_BOOT_COMPLETED:
            case Intent.ACTION_MY_PACKAGE_REPLACED:
                refreshAll(ctx);
                return;
            default:
                super.onReceive(ctx, intent);
        }
    }

    // ---- helpers usable from other classes ----
    static int[] ids(Context ctx) {
        return AppWidgetManager.getInstance(ctx).getAppWidgetIds(new ComponentName(ctx, ScheduleWidget.class));
    }

    static void refresh(Context ctx, int id) {
        AppWidgetManager mgr = AppWidgetManager.getInstance(ctx);
        render(ctx, mgr, id);
        mgr.notifyAppWidgetViewDataChanged(id, R.id.sw_list);
        scheduleNext(ctx);
    }

    /** Re-render every schedule widget (also called by NativeBridge.saveSchedule). */
    static void refreshAll(Context ctx) {
        AppWidgetManager mgr = AppWidgetManager.getInstance(ctx);
        int[] ids = ids(ctx);
        for (int id : ids) render(ctx, mgr, id);
        if (ids.length > 0) mgr.notifyAppWidgetViewDataChanged(ids, R.id.sw_list);
        scheduleNext(ctx);
    }

    static void render(Context ctx, AppWidgetManager mgr, int id) {
        ScheduleStore.Model m = ScheduleStore.model(ctx, id);
        boolean dark = m.cfg.dark;
        RemoteViews rv = new RemoteViews(ctx.getPackageName(), R.layout.widget_schedule);

        rv.setInt(R.id.sw_root, "setBackgroundResource", dark ? R.drawable.sw_card_dark : R.drawable.sw_card_light);
        rv.setTextViewText(R.id.sw_day, m.dayName);
        rv.setTextViewTextSize(R.id.sw_day, TypedValue.COMPLEX_UNIT_SP, m.cfg.sizeSp + 3);
        rv.setViewVisibility(R.id.sw_today, m.isToday ? android.view.View.VISIBLE : android.view.View.GONE);
        int arrowBg = dark ? R.drawable.sw_arrow_dark : R.drawable.sw_arrow_light;
        int arrowFg = dark ? 0xFFB8924A : 0xFF3B4944;
        rv.setInt(R.id.sw_prev, "setBackgroundResource", arrowBg);
        rv.setInt(R.id.sw_next, "setBackgroundResource", arrowBg);
        rv.setTextColor(R.id.sw_prev, arrowFg);
        rv.setTextColor(R.id.sw_next, arrowFg);
        rv.setTextColor(R.id.sw_empty, dark ? 0xFFB8C0D8 : 0xFF3B4944);

        // list adapter (unique data URI per widget so factories are not shared)
        Intent svc = new Intent(ctx, ScheduleWidgetService.class);
        svc.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, id);
        svc.setData(Uri.parse(svc.toUri(Intent.URI_INTENT_SCHEME)));
        rv.setRemoteAdapter(R.id.sw_list, svc);
        rv.setEmptyView(R.id.sw_list, R.id.sw_empty);
        rv.setScrollPosition(R.id.sw_list, m.scroll);

        // taps
        PendingIntent open = openApp(ctx, id);
        rv.setOnClickPendingIntent(R.id.sw_pill, open);
        rv.setPendingIntentTemplate(R.id.sw_list, openAppMutable(ctx, id));
        rv.setOnClickPendingIntent(R.id.sw_prev, bcast(ctx, id, ACTION_PREV, 1));
        rv.setOnClickPendingIntent(R.id.sw_next, bcast(ctx, id, ACTION_NEXT, 2));

        mgr.updateAppWidget(id, rv);
    }

    private static Intent openIntent(Context ctx) {
        return new Intent(ctx, MainActivity.class)
                .setAction(Intent.ACTION_MAIN)
                .putExtra("open", "schedule")
                .setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
    }

    private static PendingIntent openApp(Context ctx, int id) {
        return PendingIntent.getActivity(ctx, 2000 + id * 4, openIntent(ctx),
                PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
    }

    /** Template for list rows: must be mutable on API 31+ so fill-in intents can be merged (intent is explicit). */
    private static PendingIntent openAppMutable(Context ctx, int id) {
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= 31) flags |= PendingIntent.FLAG_MUTABLE;
        return PendingIntent.getActivity(ctx, 2001 + id * 4, openIntent(ctx), flags);
    }

    private static PendingIntent bcast(Context ctx, int id, String action, int slot) {
        Intent i = new Intent(ctx, ScheduleWidget.class).setAction(action)
                .putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, id);
        return PendingIntent.getBroadcast(ctx, 2001 + id * 4 + slot, i,
                PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
    }

    // ---- one inexact alarm at the next event boundary (or midnight) ----
    private static PendingIntent alarmPi(Context ctx) {
        Intent i = new Intent(ctx, ScheduleWidget.class).setAction(ACTION_TICK);
        return PendingIntent.getBroadcast(ctx, 1999, i, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
    }

    static void cancelAlarm(Context ctx) {
        AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
        if (am != null) am.cancel(alarmPi(ctx));
    }

    static void scheduleNext(Context ctx) {
        try {
            AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
            if (am == null) return;
            if (ids(ctx).length == 0) { cancelAlarm(ctx); return; }
            Calendar c = Calendar.getInstance();
            long msOfDay = ((c.get(Calendar.HOUR_OF_DAY) * 60L + c.get(Calendar.MINUTE)) * 60L
                    + c.get(Calendar.SECOND)) * 1000L + c.get(Calendar.MILLISECOND);
            long delay = ScheduleLogic.nextBoundaryDelayMillis(ScheduleStore.todayTimes(ctx), msOfDay) + 1500L;
            am.setAndAllowWhileIdle(AlarmManager.RTC, System.currentTimeMillis() + delay, alarmPi(ctx));
        } catch (Throwable ignored) { }
    }
}
