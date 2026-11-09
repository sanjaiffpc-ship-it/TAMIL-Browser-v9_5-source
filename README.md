# TAMIL · Ultimate Premium V1
Owner **TAMIL** · Community **PC COMMUNITY** (OYR)

Android browser with a dark black + red glass UI, built for **WhatsApp Web** and **Discord Web** calls, with a built-in
**Sound Control Panel** extension.

* Engine: Firefox **GeckoView** (the only embeddable engine on Android that runs WebExtensions).
* Top bar: Discord / WhatsApp / Desktop mode / Out (Speaker-Earpiece-Bluetooth-Wired) / Reload / Back, address bar, menu.
* Call keep-alive: a foreground service keeps the microphone running when you switch to another app during a call.
* Full-screen video calls hide the top bars.
* `app/src/main/assets/tamil/` – built-in extension (mic gain, clarity, noise, speaker volume, devices, diagnostics).
* `chrome-extension/` – separate Manifest V3 extension for desktop Chrome/Edge (popup dashboard, permission status, audio test page).

## Get the APK from GitHub
1. Create a repo, upload **everything in this folder** (keep the `.github` folder).
2. Actions tab -> *Build TAMIL APK* runs automatically (or *Run workflow*).
3. Download directly: repo -> **Releases -> "TAMIL latest build" -> TAMIL.apk** (no zip). Also in the run's Artifacts.

## Build locally
`gradle assembleRelease` (JDK 17, Android SDK 35, Gradle 8.7) -> `app/build/outputs/apk/release/app-release.apk`

## Calls not working? (see TROUBLESHOOTING.md)
