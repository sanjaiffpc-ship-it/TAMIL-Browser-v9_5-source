# Troubleshooting
1. **Desktop: ON** must be red (WhatsApp Web only offers calls in desktop mode). Tap Reload after changing it.
2. Allow **Microphone** (and Camera for video) when asked. If you tapped Deny: Android Settings -> Apps -> TAMIL -> Permissions.
3. Call audio on the wrong output: tap the **Out:** chip to cycle Speaker / Earpiece / Bluetooth / Wired.
4. "No speakers available" in WhatsApp's device menu is a Firefox-on-Android limitation; the Sound Control Panel adds a
   "Default audio output device" entry, and the Out: chip does the real routing.
5. Open the red floating panel on the page -> **DIAG** -> Copy report, and send it to the owner if something still fails.
6. Allow notifications (Android 13+) so the "Call audio active" notification can keep the mic alive in the background.

7. **Mic shows muted at call start**: tap the green/red mic button on the floating panel (or the big FIX MUTE NOW button in the CALL tab). Auto-fix runs by itself in the first 30 s of each call. DIAG -> "Mic buttons seen" lists the buttons the fix can see.
