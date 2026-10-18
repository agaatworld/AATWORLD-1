# فشّة خلق — Clawd floating buddy (Android)

A small Android app: Clawd (the Claude Code pixel character) floats in a bottom corner above every app,
with a stick next to him. Tap the stick = quick hit, long press = charged heavy hit (full charge = pancake),
rapid taps = accelerating combo (angry at ×8, crying at ×16, K.O. at ×26). Tap Clawd = tickle, drag Clawd = move him,
shake the phone = dizzy.

- `app/src/main/assets/clawd.html` — the whole character, animation, sounds and app screen (also runs in a browser).
- `OverlayService.java` — floating window (draws over other apps, foreground service, drag to move, remembers position).
- `MainActivity.java` — app screen with the "Welcome, Claw'd" loading animation.
- `ci/emu.sh` + `.github/workflows/clawd-apk.yml` — GitHub builds the APK, runs it on an emulator and saves
  `dist/clawd.apk` plus screenshots back to the branch.

Not part of the AAT website; it lives only on this branch.
