package com.aatworld.talk;

/** Pure text builder for the lock-screen schedule notification. No Android imports (unit-testable with plain javac). */
public final class ScheduleNotifText {
    private ScheduleNotifText() { }

    /** The last event of a day counts as "current" this long after it starts, then the day is "finished". */
    public static final int LAST_EVENT_GRACE_MIN = 120;
    static final int MAX_UPCOMING = 3;

    public static final class Result {
        public String title = "";
        public String text = "";      // second line; empty if none
        public String big = "";       // expanded text, one event per line
        public int nextBoundaryMin = ScheduleLogic.DAY_MINUTES; // minute of the day when this text changes
    }

    private static String line(String time, String text) {
        return ScheduleLogic.displayTime(time) + " — " + text;
    }

    /**
     * @param wds   weekday (Calendar.DAY_OF_WEEK) of each program day
     * @param names display name of each day
     * @param mins  per day: event times in minutes, sorted ascending (invalid = -1, last)
     * @param times per day: event time strings "H:MM"
     * @param texts per day: event texts
     */
    public static Result build(int[] wds, String[] names, int[][] mins, String[][] times, String[][] texts,
                               int todayWd, int nowMin) {
        Result r = new Result();
        int idx = ScheduleLogic.pickDay(wds, todayWd);
        if (idx < 0 || valid(mins[idx]) == 0) {
            r.title = "لا يوجد برنامج";
            r.big = r.title;
            return r;
        }
        boolean isToday = wds[idx] == todayWd;
        if (isToday) {
            int[] m = mins[idx];
            int cur = ScheduleLogic.currentIndex(m, nowMin);
            int lastMin = -1, lastIdx = -1;
            for (int i = 0; i < m.length; i++) if (m[i] >= lastMin && m[i] >= 0) { lastMin = m[i]; lastIdx = i; }
            boolean finished = cur >= 0 && cur == lastIdx && nowMin >= lastMin + LAST_EVENT_GRACE_MIN;
            if (!finished) {
                StringBuilder big = new StringBuilder();
                int shown = 0, firstUp = -1;
                int nextIdx = -1;
                for (int i = 0; i < m.length; i++) {
                    if (m[i] > nowMin) {
                        if (nextIdx < 0) nextIdx = i;
                    }
                }
                if (cur < 0) {
                    int f = nextIdx;
                    r.title = "اليوم يبدأ: " + texts[idx][f] + " (" + ScheduleLogic.displayTime(times[idx][f]) + ")";
                    firstUp = f + 1;
                    big.append(line(times[idx][f], texts[idx][f]));
                    shown = 1;
                    if (firstUp < m.length && m[firstUp] >= 0) {
                        r.text = "التالي: " + texts[idx][firstUp] + " — " + ScheduleLogic.displayTime(times[idx][firstUp]);
                    }
                    for (int i = firstUp; i < m.length && shown < MAX_UPCOMING + 1; i++) {
                        if (m[i] < 0) break;
                        big.append('\n').append(line(times[idx][i], texts[idx][i]));
                        shown++;
                    }
                    r.nextBoundaryMin = m[f];
                } else {
                    r.title = "الآن: " + texts[idx][cur] + " (" + ScheduleLogic.displayTime(times[idx][cur]) + ")";
                    big.append("الآن: ").append(line(times[idx][cur], texts[idx][cur]));
                    if (nextIdx >= 0) {
                        r.text = "التالي: " + texts[idx][nextIdx] + " — " + ScheduleLogic.displayTime(times[idx][nextIdx]);
                        int up = 0;
                        for (int i = nextIdx; i < m.length && up < MAX_UPCOMING; i++) {
                            if (m[i] < 0) break;
                            big.append('\n').append(line(times[idx][i], texts[idx][i]));
                            up++;
                        }
                        r.nextBoundaryMin = m[nextIdx];
                    } else {
                        r.text = "لا فعاليات بعد ذلك اليوم";
                        r.nextBoundaryMin = Math.min(ScheduleLogic.DAY_MINUTES, lastMin + LAST_EVENT_GRACE_MIN);
                    }
                }
                r.big = big.toString();
                return r;
            }
            // finished today: show the next program day
            r.title = "انتهى برنامج اليوم";
            int ni = ScheduleLogic.pickDay(wds, todayWd % 7 + 1);
            if (ni >= 0 && valid(mins[ni]) > 0) fillNextDay(r, names[ni], times[ni], texts[ni], mins[ni], "القادم: ", true);
            else r.big = r.title;
            r.nextBoundaryMin = ScheduleLogic.DAY_MINUTES;
            return r;
        }
        // not a program day: show the next program day
        fillNextDay(r, names[idx], times[idx], texts[idx], mins[idx], "القادم: ", false);
        r.nextBoundaryMin = ScheduleLogic.DAY_MINUTES;
        return r;
    }

    private static void fillNextDay(Result r, String dayName, String[] t, String[] x, int[] m, String prefix, boolean titleSet) {
        String first = prefix + dayName + " " + ScheduleLogic.displayTime(t[0]) + " " + x[0];
        StringBuilder big = new StringBuilder();
        if (titleSet) {
            r.text = first;
            big.append(r.title).append('\n');
        } else {
            r.title = first;
        }
        big.append(dayName);
        for (int i = 0; i < m.length && i < MAX_UPCOMING + 1; i++) {
            if (m[i] < 0) break;
            big.append('\n').append(line(t[i], x[i]));
        }
        r.big = big.toString();
    }

    private static int valid(int[] m) {
        int n = 0;
        for (int v : m) if (v >= 0) n++;
        return n;
    }
}
