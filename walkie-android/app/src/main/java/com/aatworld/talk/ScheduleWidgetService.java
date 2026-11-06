package com.aatworld.talk;

import android.appwidget.AppWidgetManager;
import android.content.Context;
import android.content.Intent;
import android.widget.RemoteViews;
import android.widget.RemoteViewsService;

public class ScheduleWidgetService extends RemoteViewsService {
    @Override
    public RemoteViewsFactory onGetViewFactory(Intent intent) {
        return new Factory(getApplicationContext(),
                intent.getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID));
    }

    static class Factory implements RemoteViewsFactory {
        private final Context ctx;
        private final int id;
        private ScheduleStore.Model model = new ScheduleStore.Model();

        Factory(Context c, int id) { this.ctx = c; this.id = id; }

        @Override public void onCreate() { }

        /** Runs on a binder thread (not the main thread): safe to read prefs/assets here. */
        @Override public void onDataSetChanged() { model = ScheduleStore.model(ctx, id); }

        @Override public void onDestroy() { }

        @Override public int getCount() { return model.rows.size(); }

        @Override
        public RemoteViews getViewAt(int pos) {
            RemoteViews rv = new RemoteViews(ctx.getPackageName(), R.layout.widget_schedule_item);
            if (pos < 0 || pos >= model.rows.size()) return rv;
            ScheduleStore.Row r = model.rows.get(pos);
            boolean dark = model.cfg.dark;
            int bg, fg;
            if (r.state == ScheduleLogic.CURRENT) {
                bg = R.drawable.sw_pill_gold; fg = 0xFF2B2417;
            } else if (r.state == ScheduleLogic.PAST) {
                bg = dark ? R.drawable.sw_pill_dark_past : R.drawable.sw_pill_past;
                fg = dark ? 0xFF8E97B5 : 0xFFE6ECEA;
            } else {
                bg = dark ? R.drawable.sw_pill_dark_normal : R.drawable.sw_pill_normal;
                fg = 0xFFFFFFFF;
            }
            rv.setTextViewText(R.id.sw_time, r.time);
            rv.setTextViewText(R.id.sw_event, r.text);
            rv.setTextColor(R.id.sw_time, fg);
            rv.setTextColor(R.id.sw_event, fg);
            rv.setInt(R.id.sw_time, "setBackgroundResource", bg);
            rv.setInt(R.id.sw_event, "setBackgroundResource", bg);
            rv.setTextViewTextSize(R.id.sw_time, android.util.TypedValue.COMPLEX_UNIT_SP, model.cfg.sizeSp);
            rv.setTextViewTextSize(R.id.sw_event, android.util.TypedValue.COMPLEX_UNIT_SP, model.cfg.sizeSp);
            // Merged into the PendingIntent template set by the provider.
            rv.setOnClickFillInIntent(R.id.sw_row, new Intent().putExtra("open", "schedule"));
            return rv;
        }

        @Override public RemoteViews getLoadingView() { return null; }
        @Override public int getViewTypeCount() { return 1; }
        @Override public long getItemId(int pos) { return pos; }
        @Override public boolean hasStableIds() { return false; }
    }
}
