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
adb shell input tap $(( W*30/100 )) $(( H*95/100 )); sleep 1; shot 06_settings
adb shell input swipe $(( W/2 )) $(( H*70/100 )) $(( W/2 )) $(( H*25/100 )) 400; sleep 0.5; shot 07_settings2
adb shell input keyevent 4  # back out of settings

# ---- floating overlay ----
adb shell am start -n $P/.MainActivity --ez float true
sleep 5
adb shell input keyevent 3   # home
sleep 4; shot 08_home_floating
# tap where Clawd starts (bottom-left) to make him react over the home screen
adb shell input tap $(( W*16/100 )) $(( H - $(dp 150) )); sleep 0.6; shot 09_home_tap
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
adb logcat -d | grep -E "AndroidRuntime|FATAL|E $P|chromium.*Uncaught" > "$OUT/log.txt" || true
echo "=== services ===" >> "$OUT/log.txt"
adb shell dumpsys activity services $P | head -20 >> "$OUT/log.txt"
echo "=== accessibility ===" >> "$OUT/log.txt"
adb shell settings get secure enabled_accessibility_services >> "$OUT/log.txt"
exit 0
