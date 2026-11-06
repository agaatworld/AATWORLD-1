package com.aatworld.talk;

import android.content.Context;
import android.content.SharedPreferences;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;

/** Loads schedule JSON + per-widget settings and builds the display model shared by the provider and the list factory. */
final class ScheduleStore {
    private ScheduleStore() { }

    static final String PREFS = "schedule_widget";   // per-widget settings
    static final String DATA_PREFS = "schedule";     // saved schedule JSON (key "json")

    static class Day {
        String id = "", name = "";
        int wd = 0;
        String[] times = new String[0], texts = new String[0];
        int[] mins = new int[0];
    }

    static class Cfg {
        boolean dark = false;
        int sizeSp = 14;
        boolean fixed = false;
        String fixedId = "";
        boolean hidePast = false;
    }

    static class Row { String time, text; int state; }

    static class Model {
        String dayName = "";
        boolean isToday;
        int dayIndex;
        int scroll;
        List<Row> rows = new ArrayList<>();
        Cfg cfg = new Cfg();
    }

    // ---- data ----
    static String saved(Context c) {
        return c.getSharedPreferences(DATA_PREFS, Context.MODE_PRIVATE).getString("json", "");
    }

    static String readAsset(Context c) {
        try (InputStream in = c.getAssets().open("schedule.json")) {
            ByteArrayOutputStream bo = new ByteArrayOutputStream();
            byte[] b = new byte[4096];
            int n;
            while ((n = in.read(b)) > 0) bo.write(b, 0, n);
            return bo.toString("UTF-8");
        } catch (Exception e) {
            return "";
        }
    }

    static int fallbackWd(String id) {
        switch (id) {
            case "sun": return Calendar.SUNDAY;
            case "mon": return Calendar.MONDAY;
            case "tue": return Calendar.TUESDAY;
            case "wed": return Calendar.WEDNESDAY;
            case "thu": return Calendar.THURSDAY;
            case "fri": return Calendar.FRIDAY;
            case "sat": return Calendar.SATURDAY;
            default: return 0;
        }
    }

    static List<Day> parse(String json) {
        List<Day> out = new ArrayList<>();
        try {
            JSONArray days = new JSONObject(json).getJSONArray("days");
            for (int i = 0; i < days.length(); i++) {
                JSONObject o = days.getJSONObject(i);
                Day d = new Day();
                d.id = o.optString("id", "d" + i);
                d.name = o.optString("name", d.id);
                d.wd = o.has("wd") ? o.optInt("wd", 0) : fallbackWd(d.id);
                JSONArray its = o.optJSONArray("items");
                int n = its == null ? 0 : its.length();
                List<int[]> order = new ArrayList<>();
                String[] t = new String[n], x = new String[n];
                for (int k = 0; k < n; k++) {
                    JSONObject it = its.getJSONObject(k);
                    t[k] = it.optString("t", "");
                    x[k] = it.optString("x", "");
                    order.add(new int[]{ScheduleLogic.parseMinutes(t[k]), k});
                }
                // stable sort by time (invalid times last)
                java.util.Collections.sort(order, (a, b) -> {
                    int ta = a[0] < 0 ? 99999 : a[0], tb = b[0] < 0 ? 99999 : b[0];
                    return ta != tb ? Integer.compare(ta, tb) : Integer.compare(a[1], b[1]);
                });
                d.times = new String[n]; d.texts = new String[n]; d.mins = new int[n];
                for (int k = 0; k < n; k++) {
                    int src = order.get(k)[1];
                    d.times[k] = t[src]; d.texts[k] = x[src]; d.mins[k] = order.get(k)[0];
                }
                out.add(d);
            }
        } catch (Exception ignored) { }
        return out;
    }

    static List<Day> loadDays(Context c) {
        List<Day> d = parse(saved(c));
        if (d.isEmpty()) d = parse(readAsset(c));
        return d;
    }

    // ---- settings ----
    static SharedPreferences prefs(Context c) {
        return c.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    static Cfg cfg(Context c, int id) {
        SharedPreferences p = prefs(c);
        Cfg g = new Cfg();
        g.dark = p.getBoolean("dark_" + id, false);
        g.sizeSp = p.getInt("size_" + id, 14);
        g.fixed = p.getBoolean("fixed_" + id, false);
        g.fixedId = p.getString("fixedId_" + id, "");
        g.hidePast = p.getBoolean("hide_" + id, false);
        return g;
    }

    static void saveCfg(Context c, int id, Cfg g) {
        prefs(c).edit()
                .putBoolean("dark_" + id, g.dark).putInt("size_" + id, g.sizeSp)
                .putBoolean("fixed_" + id, g.fixed).putString("fixedId_" + id, g.fixedId)
                .putBoolean("hide_" + id, g.hidePast)
                .remove("ov_" + id).remove("ovk_" + id)
                .apply();
    }

    static void delete(Context c, int[] ids) {
        SharedPreferences.Editor e = prefs(c).edit();
        for (int id : ids) {
            e.remove("dark_" + id).remove("size_" + id).remove("fixed_" + id)
                    .remove("fixedId_" + id).remove("hide_" + id).remove("ov_" + id).remove("ovk_" + id);
        }
        e.apply();
    }

    static int dateKey(Calendar cal) {
        return cal.get(Calendar.YEAR) * 1000 + cal.get(Calendar.DAY_OF_YEAR);
    }

    /** Which day index this widget shows now (temporary arrow override is valid for the same calendar date). */
    static int shownIndex(Context c, int id, List<Day> days, Cfg g, Calendar cal) {
        if (days.isEmpty()) return -1;
        SharedPreferences p = prefs(c);
        int ov = p.getInt("ov_" + id, -1);
        if (ov >= 0 && ov < days.size() && p.getInt("ovk_" + id, 0) == dateKey(cal)) return ov;
        if (g.fixed) {
            for (int i = 0; i < days.size(); i++) if (days.get(i).id.equals(g.fixedId)) return i;
        }
        int[] wds = new int[days.size()];
        for (int i = 0; i < wds.length; i++) wds[i] = days.get(i).wd;
        return ScheduleLogic.pickDay(wds, cal.get(Calendar.DAY_OF_WEEK));
    }

    static void shiftDay(Context c, int id, int delta) {
        List<Day> days = loadDays(c);
        if (days.isEmpty()) return;
        Calendar cal = Calendar.getInstance();
        int cur = shownIndex(c, id, days, cfg(c, id), cal);
        int ni = ScheduleLogic.shift(cur, delta, days.size());
        prefs(c).edit().putInt("ov_" + id, ni).putInt("ovk_" + id, dateKey(cal)).apply();
    }

    static Model model(Context c, int id) {
        Model m = new Model();
        m.cfg = cfg(c, id);
        List<Day> days = loadDays(c);
        Calendar cal = Calendar.getInstance();
        int idx = shownIndex(c, id, days, m.cfg, cal);
        if (idx < 0) return m;
        Day d = days.get(idx);
        m.dayIndex = idx;
        m.dayName = d.name;
        m.isToday = d.wd == cal.get(Calendar.DAY_OF_WEEK);
        int nowMin = cal.get(Calendar.HOUR_OF_DAY) * 60 + cal.get(Calendar.MINUTE);
        int cur = m.isToday ? ScheduleLogic.currentIndex(d.mins, nowMin) : -2; // -2: no highlighting on other days
        int curRow = -1;
        for (int i = 0; i < d.mins.length; i++) {
            int st = cur == -2 ? ScheduleLogic.UPCOMING : ScheduleLogic.state(i, cur);
            if (m.cfg.hidePast && st == ScheduleLogic.PAST) continue;
            Row r = new Row();
            r.time = ScheduleLogic.displayTime(d.times[i]);
            r.text = d.texts[i];
            r.state = st;
            m.rows.add(r);
            if (st == ScheduleLogic.CURRENT) curRow = m.rows.size() - 1;
        }
        m.scroll = ScheduleLogic.scrollPosition(curRow);
        return m;
    }

    /** Times (minutes) of today's program day, used for alarm scheduling. */
    static int[] todayTimes(Context c) {
        List<Day> days = loadDays(c);
        int wd = Calendar.getInstance().get(Calendar.DAY_OF_WEEK);
        for (Day d : days) if (d.wd == wd) return d.mins;
        return new int[0];
    }
}
