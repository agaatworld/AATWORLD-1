#!/bin/bash
# Runs on the GitHub emulator: installs the app, grants what Clawd needs, exercises the app screen,
# the floating overlay over other apps, and the chat window, saving screenshots to clawd-app/dist/.
set -x
OUT=clawd-app/dist
APK=$OUT/clawd.apk
P=com.aat.clawd
shot(){ adb exec-out screencap -p > "$OUT/$1.png"; }
adb wait-for-device
adb shell settings put global window_animation_scale 0
adb shell settings put global transition_animation_scale 0
adb install -r "$APK"
adb shell appops set $P SYSTEM_ALERT_WINDOW allow
adb shell pm grant $P android.permission.POST_NOTIFICATIONS || true
# turn on "Clawd's eyes" (accessibility) so app/keyboard/typing awareness is live
adb shell settings put secure enabled_accessibility_services $P/$P.ClawdEyes
adb shell settings put secure accessibility_enabled 1

SIZE=$(adb shell wm size | grep -o '[0-9]*x[0-9]*' | tail -1); W=${SIZE%x*}; H=${SIZE#*x}
D=$(adb shell wm density | grep -o '[0-9]*' | tail -1); [ -z "$D" ] && D=320
dp(){ echo $(( $1 * D / 160 )); }

# ---- app screen ----
adb shell am start -n $P/.MainActivity
sleep 2;  shot 01_splash
sleep 4;  shot 02_app
# hit the stick a few times in the arena (lower third of the screen)
AX=$(( W * 55 / 100 )); AY=$(( H * 72 / 100 ))
for i in $(seq 1 10); do adb shell input tap $AX $AY & sleep 0.12; done; wait
shot 03_arena_hits
# long-press for a charged hit
adb shell input swipe $AX $AY $AX $AY 1400 & sleep 1.1; shot 04_charge; wait; sleep 0.2; shot 05_after
# settings
adb shell input tap $(( W*75/100 )) $(( H*95/100 )); sleep 1; shot 06_settings
adb shell input swipe $(( W/2 )) $(( H*70/100 )) $(( W/2 )) $(( H*25/100 )) 400; sleep 0.5; shot 07_settings2
adb shell input keyevent 4  # back closes the settings page

# ---- floating overlay (start the service directly, over the home screen) ----
adb shell input keyevent 3   # home
sleep 1
# the service isn't exported, so start it the way the app's button does: through the activity
adb shell am start -n $P/.MainActivity --ez float true
sleep 6
adb shell input keyevent 3   # back to home, Clawd should stay floating
sleep 4; shot 08_home_floating
adb shell dumpsys window windows | grep -iE "clawd|TYPE_APPLICATION_OVERLAY|Window #" | head -40 > "$OUT/windows.txt" || true
adb shell dumpsys window windows | grep -iE "clawd|Window #" | head -40 > "$OUT/windows.txt" || true
# find Clawd's real touch pad (logged by the app in screen pixels) and tap it
pad(){ adb logcat -d -s Clawd:D | grep " pad $1 " | tail -1 | awk '{print $(NF-3)+$(NF-1)/2, $(NF-2)+$NF/2}'; }
read CXP CYP <<< "$(pad char)"; echo "char pad at $CXP $CYP"
if [ -n "$CXP" ]; then adb shell input tap ${CXP%.*} ${CYP%.*}; fi
sleep 0.8; shot 09_home_tap
read TXP TYP <<< "$(pad tool)"; echo "tool pad at $TXP $TYP"
if [ -n "$TXP" ]; then for i in $(seq 1 6); do adb shell input tap ${TXP%.*} ${TYP%.*} & sleep 0.15; done; wait; fi
sleep 0.3; shot 09b_home_hits
sleep 3
# hold the tool and drag it towards Clawd: he should run away from it
read TXP TYP <<< "$(pad tool)"; read CXP CYP <<< "$(pad char)"
if [ -n "$TXP" ] && [ -n "$CXP" ]; then
  adb shell input swipe ${TXP%.*} ${TYP%.*} ${CXP%.*} ${TYP%.*} 3200 &
  sleep 1.3; shot 09f_run1; sleep 1.2; shot 09g_run2; wait; sleep 0.6; shot 09h_run_end
fi
sleep 2
# ---- the tool is chosen in the app only: open the app, tap «مخدة», go home, the floating Clawd should hold the pillow
adb shell am start -n $P/.MainActivity; sleep 4; adb shell input keyevent 4; sleep 1; adb shell am start -n $P/.MainActivity; sleep 2; shot 13_app_again
adb shell uiautomator dump /sdcard/ui.xml >/dev/null 2>&1; adb shell cat /sdcard/ui.xml > "$OUT/ui.xml" 2>/dev/null
POS=$(python3 - "$OUT/ui.xml" <<'PY'
import re, sys
s = open(sys.argv[1], encoding='utf-8', errors='ignore').read()
for n in re.findall(r'<node [^>]*>', s):
    if 'مخدة' in n:
        b = re.search(r'bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"', n)
        if b:
            x1, y1, x2, y2 = map(int, b.groups()); print((x1 + x2) // 2, (y1 + y2) // 2); break
PY
)
echo "pillow button at $POS"
if [ -n "$POS" ]; then adb shell input tap $POS; fi
sleep 1; shot 13b_app_pillow
adb shell input keyevent 3; sleep 3; shot 13c_home_pillow
# typing: open a message compose box with the keyboard
adb shell am start -a android.intent.action.SENDTO -d sms:5551234 --es sms_body " "; sleep 4; shot 09d_keyboard
adb shell input text "salam"; sleep 2; shot 09e_typing
adb shell input keyevent 4; adb shell input keyevent 4; adb shell input keyevent 3; sleep 2
# over another app
adb shell am start -a android.settings.SETTINGS; sleep 3; shot 10_over_settings
adb shell input keyevent 3; sleep 3

# ---- chat window (no API key in CI -> should show the missing-key message, not crash) ----
adb shell am startservice -n $P/.OverlayService -a com.aat.clawd.CHAT --es seed ""
sleep 3; shot 11_chat_open
adb shell input tap $(( W/2 )) $(( H*28/100 )); sleep 1  # focus the field
adb shell input text "مرحبا"; sleep 0.5
# tap send (right side of the input bar)
adb shell input tap $(( W*8/100 )) $(( H*45/100 )); sleep 2; shot 12_chat_send

# ---- diagnostics ----
adb logcat -d | grep -E "AndroidRuntime|FATAL|E $P|chromium.*Uncaught|Clawd|OverlayService|ntrusted touch|occlu|CONSOLE" > "$OUT/log.txt" || true
echo "=== services ===" >> "$OUT/log.txt"
adb shell dumpsys activity services $P | head -20 >> "$OUT/log.txt"
echo "=== accessibility ===" >> "$OUT/log.txt"
adb shell settings get secure enabled_accessibility_services >> "$OUT/log.txt"
exit 0
