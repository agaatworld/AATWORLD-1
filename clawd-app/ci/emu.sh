#!/bin/bash
# Runs on the GitHub emulator: installs the app, opens it, starts the floating Clawd,
# hits the stick in different ways and saves screenshots to clawd-app/dist/.
set -x
OUT=clawd-app/dist
APK=$OUT/clawd.apk
P=com.aat.clawd
shot(){ adb exec-out screencap -p > $OUT/$1.png; }
adb wait-for-device
adb shell settings put global window_animation_scale 0
adb install -r $APK
adb shell appops set $P SYSTEM_ALERT_WINDOW allow
adb shell pm grant $P android.permission.POST_NOTIFICATIONS || true
adb shell am start -n $P/.MainActivity --ez float false
sleep 6; shot 01_splash
sleep 10; shot 02_app
adb shell am start -n $P/.MainActivity --ez float true
sleep 5
adb shell input keyevent 3
sleep 4; shot 03_home_floating
SIZE=$(adb shell wm size | grep -o '[0-9]*x[0-9]*' | tail -1); W=${SIZE%x*}; H=${SIZE#*x}
D=$(adb shell wm density | grep -o '[0-9]*' | tail -1)
dp(){ echo $(( $1 * D / 160 )); }
SX=$(dp 140); SY=$(( H - $(dp 152) ))
adb shell input tap $SX $SY; sleep 0.15; shot 04_tap
sleep 2
adb shell input swipe $SX $SY $SX $SY 2200 & sleep 1.6; shot 05_charging; wait; sleep 0.1; shot 06_mega
sleep 3
for i in $(seq 1 14); do adb shell input tap $SX $SY & sleep 0.12; done; wait; shot 07_combo
sleep 3
# drag Clawd to the right half of the screen
CX=$(dp 64); CY=$(( H - $(dp 170) ))
adb shell input swipe $CX $CY $(( W - $(dp 90) )) $(( H / 2 )) 900; sleep 1.5; shot 08_dragged
adb shell am start -n com.android.settings/.Settings; sleep 3; shot 09_over_settings
adb shell am start -n $P/.MainActivity; sleep 5; shot 10_app_again
adb logcat -d | grep -E "AndroidRuntime|FATAL|Uncaught|chromium.*Error|Clawd" > $OUT/log.txt || true
adb shell dumpsys activity services $P | head -30 >> $OUT/log.txt
exit 0
