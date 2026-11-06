import com.aatworld.talk.ScheduleNotifText;
import com.aatworld.talk.ScheduleNotifText.Result;
import java.util.Calendar;

/** javac -d /tmp/t app/src/main/java/com/aatworld/talk/ScheduleLogic.java app/src/main/java/com/aatworld/talk/ScheduleNotifText.java tests/ScheduleNotifTextTest.java && java -cp /tmp/t ScheduleNotifTextTest */
public class ScheduleNotifTextTest {
    static int fails = 0;
    static void eq(String name, Object exp, Object got) {
        boolean ok = exp.equals(got);
        if (!ok) fails++;
        System.out.println((ok ? "PASS " : "FAIL ") + name + (ok ? "" : "  expected=[" + exp + "] got=[" + got + "]"));
    }
    static int m(String t) { return com.aatworld.talk.ScheduleLogic.parseMinutes(t); }

    public static void main(String[] a) {
        // two program days: Saturday(7) and Sunday(1)
        int[] wds = {Calendar.SATURDAY, Calendar.SUNDAY};
        String[] names = {"السبت", "الأحد"};
        String[][] times = {{"08:00", "9:30", "13:00", "16:00"}, {"10:00", "11:00"}};
        String[][] texts = {{"استقبال", "افتتاح", "غداء", "ختام"}, {"زيارة", "اجتماع"}};
        int[][] mins = new int[2][];
        for (int d = 0; d < 2; d++) { mins[d] = new int[times[d].length]; for (int i = 0; i < times[d].length; i++) mins[d][i] = m(times[d][i]); }

        Result r;
        r = ScheduleNotifText.build(wds, names, mins, times, texts, Calendar.SATURDAY, m("06:30"));
        show("before first (Sat 06:30)", r);
        eq("before.title", "اليوم يبدأ: استقبال (8:00)", r.title);
        eq("before.text", "التالي: افتتاح — 9:30", r.text);
        eq("before.boundary", 480, r.nextBoundaryMin);

        r = ScheduleNotifText.build(wds, names, mins, times, texts, Calendar.SATURDAY, m("09:45"));
        show("middle (Sat 09:45)", r);
        eq("mid.title", "الآن: افتتاح (9:30)", r.title);
        eq("mid.text", "التالي: غداء — 13:00", r.text);
        eq("mid.big", "الآن: 9:30 — افتتاح\n13:00 — غداء\n16:00 — ختام", r.big);
        eq("mid.boundary", 780, r.nextBoundaryMin);

        r = ScheduleNotifText.build(wds, names, mins, times, texts, Calendar.SATURDAY, m("16:00"));
        show("last item (Sat 16:00)", r);
        eq("last.title", "الآن: ختام (16:00)", r.title);
        eq("last.text", "لا فعاليات بعد ذلك اليوم", r.text);
        eq("last.boundary", 18 * 60, r.nextBoundaryMin);

        r = ScheduleNotifText.build(wds, names, mins, times, texts, Calendar.SATURDAY, m("18:00"));
        show("after last (Sat 18:00)", r);
        eq("after.title", "انتهى برنامج اليوم", r.title);
        eq("after.text", "القادم: الأحد 10:00 زيارة", r.text);

        r = ScheduleNotifText.build(wds, names, mins, times, texts, Calendar.MONDAY, m("12:00"));
        show("non-program day (Mon 12:00)", r);
        eq("non.title", "القادم: السبت 8:00 استقبال", r.title);
        eq("non.boundary", 1440, r.nextBoundaryMin);

        r = ScheduleNotifText.build(wds, names, mins, times, texts, Calendar.SUNDAY, m("23:30"));
        show("Sun after last, next = Saturday", r);
        eq("wrap.text", "القادم: السبت 8:00 استقبال", r.text);

        r = ScheduleNotifText.build(new int[0], new String[0], new int[0][], new String[0][], new String[0][], 1, 600);
        eq("empty.title", "لا يوجد برنامج", r.title);

        System.out.println(fails == 0 ? "ALL PASS" : fails + " FAILED");
        System.exit(fails == 0 ? 0 : 1);
    }

    static void show(String label, Result r) {
        System.out.println("--- " + label + "\n  title: " + r.title + "\n  text : " + r.text + "\n  big  : " + r.big.replace("\n", "\n         ") + "\n  next : " + r.nextBoundaryMin);
    }
}
