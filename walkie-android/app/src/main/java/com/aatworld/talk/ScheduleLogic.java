package com.aatworld.talk;

/** Pure time/day logic for the schedule widget. No Android imports (unit-testable with plain javac). */
public final class ScheduleLogic {
    private ScheduleLogic() { }

    public static final int PAST = 0, CURRENT = 1, UPCOMING = 2;
    public static final int DAY_MINUTES = 1440;

    /** "H:MM" or "HH:MM" to minutes since midnight; -1 if invalid. */
    public static int parseMinutes(String t) {
        if (t == null) return -1;
        t = t.trim();
        int c = t.indexOf(':');
        if (c < 1 || c > 2 || t.length() - c != 3) return -1;
        try {
            int h = Integer.parseInt(t.substring(0, c));
            int m = Integer.parseInt(t.substring(c + 1));
            if (h < 0 || h > 23 || m < 0 || m > 59) return -1;
            return h * 60 + m;
        } catch (NumberFormatException e) {
            return -1;
        }
    }

    /** "08:00" -> "8:00", "13:00" -> "13:00". */
    public static String displayTime(String t) {
        int m = parseMinutes(t);
        if (m < 0) return t == null ? "" : t;
        return (m / 60) + ":" + (m % 60 < 10 ? "0" : "") + (m % 60);
    }

    /**
     * Index of the day to show for weekday todayWd (java.util.Calendar.DAY_OF_WEEK, 1=Sun..7=Sat).
     * Exact match, else the next upcoming program day. -1 if the list is empty.
     */
    public static int pickDay(int[] wds, int todayWd) {
        int best = -1, bestDist = 99;
        for (int i = 0; i < wds.length; i++) {
            int d = ((wds[i] - todayWd) % 7 + 7) % 7;
            if (d < bestDist) { bestDist = d; best = i; }
        }
        return best;
    }

    /** Index of the last event whose time <= now (the greatest such time); -1 before the first event. */
    public static int currentIndex(int[] times, int nowMin) {
        int best = -1, bestT = -1;
        for (int i = 0; i < times.length; i++) {
            if (times[i] >= 0 && times[i] <= nowMin && times[i] >= bestT) { best = i; bestT = times[i]; }
        }
        return best;
    }

    public static int state(int i, int cur) {
        return i < cur ? PAST : (i == cur ? CURRENT : UPCOMING);
    }

    /** First list row to scroll to: one row of context above the current event. */
    public static int scrollPosition(int cur) {
        return cur <= 0 ? 0 : cur - 1;
    }

    /** Wrap-around day shift. */
    public static int shift(int idx, int delta, int n) {
        if (n <= 0) return 0;
        return (((idx + delta) % n) + n) % n;
    }

    /** Next boundary in minutes of the day: smallest time > now, else midnight (1440). */
    public static int nextBoundaryMinute(int[] times, int nowMin) {
        int best = DAY_MINUTES;
        for (int t : times) if (t > nowMin && t < best) best = t;
        return best;
    }

    /** Milliseconds from now (millis since local midnight) until the next boundary. Always > 0. */
    public static long nextBoundaryDelayMillis(int[] times, long nowMillisOfDay) {
        int nowMin = (int) (nowMillisOfDay / 60000L);
        long b = nextBoundaryMinute(times, nowMin) * 60000L;
        return Math.max(1000L, b - nowMillisOfDay);
    }
}
