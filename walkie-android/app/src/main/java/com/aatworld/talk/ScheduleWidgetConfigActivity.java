package com.aatworld.talk;

import android.app.Activity;
import android.appwidget.AppWidgetManager;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.drawable.GradientDrawable;
import android.os.Bundle;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.RadioButton;
import android.widget.RadioGroup;
import android.widget.ScrollView;
import android.widget.Switch;
import android.widget.TextView;

import java.util.List;

/** Per-widget settings. Result stays CANCELED unless the user taps Save. */
public class ScheduleWidgetConfigActivity extends Activity {
    private static final int GOLD = 0xFFB8924A, SLATE = 0xFF3B4944;
    private int widgetId = AppWidgetManager.INVALID_APPWIDGET_ID;
    private RadioGroup theme, size, mode, days;
    private Switch hide;
    private List<ScheduleStore.Day> dayList;
    private ScheduleStore.Cfg cfg;

    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        setResult(RESULT_CANCELED);
        Intent in = getIntent();
        if (in != null && in.getExtras() != null) {
            widgetId = in.getExtras().getInt(AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID);
        }
        if (widgetId == AppWidgetManager.INVALID_APPWIDGET_ID) { finish(); return; }

        cfg = ScheduleStore.cfg(this, widgetId);
        dayList = ScheduleStore.loadDays(this);

        ScrollView sv = new ScrollView(this);
        sv.setFillViewport(true);
        sv.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setPadding(dp(20), dp(24), dp(20), dp(24));
        sv.addView(root, new ViewGroup.LayoutParams(-1, -2));

        TextView title = text(getString(R.string.swc_title), 22, true);
        title.setTextColor(Color.WHITE);
        title.setGravity(Gravity.CENTER);
        title.setPadding(dp(16), dp(12), dp(16), dp(12));
        title.setBackground(pill(GOLD));
        root.addView(title, lp(0, 0, 0, 16));

        root.addView(label(R.string.swc_theme));
        theme = group(root, new int[]{R.string.swc_light, R.string.swc_dark}, cfg.dark ? 1 : 0);

        root.addView(label(R.string.swc_size));
        int sizeIdx = cfg.sizeSp <= 12 ? 0 : (cfg.sizeSp >= 17 ? 2 : 1);
        size = group(root, new int[]{R.string.swc_small, R.string.swc_medium, R.string.swc_large}, sizeIdx);

        root.addView(label(R.string.swc_daymode));
        mode = group(root, new int[]{R.string.swc_auto, R.string.swc_fixed}, cfg.fixed ? 1 : 0);

        days = new RadioGroup(this);
        days.setOrientation(RadioGroup.VERTICAL);
        int sel = 0;
        for (int i = 0; i < dayList.size(); i++) {
            RadioButton rb = radio(dayList.get(i).name, 100 + i);
            days.addView(rb);
            if (dayList.get(i).id.equals(cfg.fixedId)) sel = i;
        }
        if (!dayList.isEmpty()) days.check(100 + sel);
        days.setPadding(dp(16), 0, dp(16), 0);
        root.addView(days);
        mode.setOnCheckedChangeListener((g, id) -> days.setVisibility(checkedIndex(g) == 1 ? View.VISIBLE : View.GONE));
        days.setVisibility(cfg.fixed ? View.VISIBLE : View.GONE);

        hide = new Switch(this);
        hide.setText(R.string.swc_hide);
        hide.setTextSize(TypedValue.COMPLEX_UNIT_SP, 17);
        hide.setTextColor(SLATE);
        hide.setChecked(cfg.hidePast);
        hide.setPadding(dp(8), dp(14), dp(8), dp(14));
        root.addView(hide, lp(0, 12, 0, 0));

        View spacer = new View(this);
        root.addView(spacer, new LinearLayout.LayoutParams(1, 0, 1f));

        TextView save = text(getString(R.string.swc_save), 20, true);
        save.setTextColor(Color.WHITE);
        save.setGravity(Gravity.CENTER);
        save.setPadding(dp(16), dp(14), dp(16), dp(14));
        save.setBackground(pill(SLATE));
        save.setOnClickListener(v -> save());
        root.addView(save, lp(0, 20, 0, 0));

        setContentView(sv);
    }

    private void save() {
        ScheduleStore.Cfg g = new ScheduleStore.Cfg();
        g.dark = checkedIndex(theme) == 1;
        int s = checkedIndex(size);
        g.sizeSp = s == 0 ? 12 : (s == 2 ? 17 : 14);
        g.fixed = checkedIndex(mode) == 1 && !dayList.isEmpty();
        int d = checkedIndex(days);
        g.fixedId = (d >= 0 && d < dayList.size()) ? dayList.get(d).id : "";
        g.hidePast = hide.isChecked();
        ScheduleStore.saveCfg(this, widgetId, g);
        ScheduleWidget.refresh(this, widgetId);
        setResult(RESULT_OK, new Intent().putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, widgetId));
        finish();
    }

    // ---- tiny UI helpers ----
    private static int checkedIndex(RadioGroup g) {
        View v = g.findViewById(g.getCheckedRadioButtonId());
        return v == null ? -1 : g.indexOfChild(v);
    }

    private int dp(int v) { return (int) (v * getResources().getDisplayMetrics().density + 0.5f); }

    private LinearLayout.LayoutParams lp(int l, int t, int r, int bt) {
        LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(-1, -2);
        p.setMargins(dp(l), dp(t), dp(r), dp(bt));
        return p;
    }

    private GradientDrawable pill(int color) {
        GradientDrawable g = new GradientDrawable();
        g.setColor(color);
        g.setCornerRadius(dp(40));
        return g;
    }

    private TextView text(String s, int sp, boolean bold) {
        TextView t = new TextView(this);
        t.setText(s);
        t.setTextSize(TypedValue.COMPLEX_UNIT_SP, sp);
        if (bold) t.setTypeface(t.getTypeface(), android.graphics.Typeface.BOLD);
        return t;
    }

    private TextView label(int res) {
        TextView t = text(getString(res), 17, true);
        t.setTextColor(GOLD);
        t.setPadding(0, dp(18), 0, dp(4));
        return t;
    }

    private RadioButton radio(String s, int id) {
        RadioButton r = new RadioButton(this);
        r.setId(id);
        r.setText(s);
        r.setTextSize(TypedValue.COMPLEX_UNIT_SP, 17);
        r.setTextColor(SLATE);
        r.setMinHeight(dp(48));
        r.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        return r;
    }

    /** ids: theme 2000+i, size 3000+i, mode 1000+i (matches save()). */
    private RadioGroup group(LinearLayout parent, int[] labels, int checked) {
        RadioGroup g = new RadioGroup(this);
        g.setOrientation(RadioGroup.HORIZONTAL);
        g.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        int base = labels.length == 3 ? 3000 : (labels[0] == R.string.swc_light ? 2000 : 1000);
        for (int i = 0; i < labels.length; i++) {
            RadioButton r = radio(getString(labels[i]), base + i);
            g.addView(r, new RadioGroup.LayoutParams(0, -2, 1f));
        }
        g.check(base + checked);
        parent.addView(g, lp(0, 0, 0, 0));
        return g;
    }
}
