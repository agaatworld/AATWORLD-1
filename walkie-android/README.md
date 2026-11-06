# تكلّم · Talk — Android app

A thin native wrapper around the web app in `../walkie/`. The web files are copied into the APK at build time (never stored here).

## Rebuild
    ./build-apk.sh
Result: `Talk.apk` (debug-signed, ready to sideload). Needs Java 17+, Gradle (`/opt/gradle/bin/gradle`) and the Android SDK at `/home/user/android-sdk` (set `ANDROID_HOME` to change).

## What it does
- Full-screen WebView serving the app from `https://appassets.talk.local/` (secure origin, so mic/camera work).
- Asks for microphone, camera, notifications; keeps running in the background via a foreground service ("تكلّم يعمل — Talk is active").
- `window.AATNative.vibrate("0,300,100,300", -1)` / `.cancelVibrate()` for strong vibration.
- Home-screen widget "Talk" and a launcher shortcut; both open `#talk`.

## Verified (in the build sandbox)
Clean build succeeds; package/permissions/launcher activity via `aapt2 dump badging`; web files present in the APK; APK signature verifies.

## NOT tested (no device here)
Real WebView behaviour (mic, camera, WebRTC), widget look, foreground service and battery behaviour on Android 14+, vibration strength.
