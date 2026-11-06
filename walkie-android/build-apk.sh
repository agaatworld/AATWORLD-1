#!/usr/bin/env bash
# Rebuilds Talk.apk from the current ../walkie sources.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
export ANDROID_HOME="${ANDROID_HOME:-/home/user/android-sdk}"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
GRADLE="${GRADLE:-/opt/gradle/bin/gradle}"
cd "$HERE"
echo "sdk.dir=$ANDROID_HOME" > local.properties
"$GRADLE" --no-daemon assembleDebug
cp app/build/outputs/apk/debug/app-debug.apk "$HERE/Talk.apk"
ls -l "$HERE/Talk.apk"
