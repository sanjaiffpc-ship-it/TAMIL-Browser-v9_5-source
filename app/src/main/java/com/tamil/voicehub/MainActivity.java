package com.tamil.voicehub;

import android.animation.ObjectAnimator;
import android.animation.ValueAnimator;
import android.app.Dialog;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.ColorDrawable;
import android.graphics.drawable.GradientDrawable;
import android.media.AudioDeviceInfo;
import android.media.AudioManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.animation.OvershootInterpolator;
import android.view.inputmethod.EditorInfo;
import android.view.inputmethod.InputMethodManager;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.HorizontalScrollView;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import org.mozilla.geckoview.GeckoResult;
import org.mozilla.geckoview.GeckoRuntime;
import org.mozilla.geckoview.GeckoSession;
import org.mozilla.geckoview.GeckoSessionSettings;
import org.mozilla.geckoview.GeckoView;

import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.List;

/**
 * TAMIL - Ultimate Premium V1
 * Gecko (Firefox engine) browser shell: WhatsApp Web + Discord Web calling, built-in Sound Control Panel extension.
 */
public class MainActivity extends android.app.Activity {
    static final String WA = "https://web.whatsapp.com";
    static final String DC = "https://discord.com/app";
    static final int REQ_PERM = 77;
    static final int REQ_BASE = 78;
    static final int RED = 0xFFFF2D55;
    static GeckoRuntime sRuntime;

    GeckoView view;
    GeckoSession session;
    TextView desktopBtn, outBtn, titleTv;
    EditText urlBox;
    View progressFill;
    LinearLayout topBars;
    FrameLayout root;
    ValueAnimator glowAnim;
    AudioManager am;
    int routeIdx = -1;
    int lastProgress = 0;
    boolean speakerOn = false;
    boolean desktop, canBack, fullscreen;
    SharedPreferences prefs;
    GeckoSession.PermissionDelegate.Callback androidCb;

    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        prefs = getSharedPreferences("tvh", MODE_PRIVATE);
        am = (AudioManager) getSystemService(AUDIO_SERVICE);
        desktop = prefs.getBoolean("desktop", true); // WhatsApp Web calling needs desktop mode

        root = new FrameLayout(this);
        LinearLayout col = new LinearLayout(this);
        col.setOrientation(LinearLayout.VERTICAL);
        root.addView(col, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));

        topBars = new LinearLayout(this);
        topBars.setOrientation(LinearLayout.VERTICAL);
        col.addView(topBars, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));

        buildHeader();
        buildUrlBar();
        buildProgress();
        buildChips();

        FrameLayout frame = new FrameLayout(this);
        col.addView(frame, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f));
        view = new GeckoView(this);
        frame.addView(view, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        setContentView(root);

        if (sRuntime == null) sRuntime = GeckoRuntime.create(getApplicationContext());

        GeckoSessionSettings st = new GeckoSessionSettings.Builder()
                .usePrivateMode(false)
                .userAgentMode(desktop ? GeckoSessionSettings.USER_AGENT_MODE_DESKTOP : GeckoSessionSettings.USER_AGENT_MODE_MOBILE)
                .viewportMode(desktop ? GeckoSessionSettings.VIEWPORT_MODE_DESKTOP : GeckoSessionSettings.VIEWPORT_MODE_MOBILE)
                .build();
        session = new GeckoSession(st);
        session.setPermissionDelegate(new Perm());
        session.setNavigationDelegate(new GeckoSession.NavigationDelegate() {
            @Override
            public void onCanGoBack(GeckoSession s, boolean can) { canBack = can; }

            @Override
            public GeckoResult<GeckoSession> onNewSession(GeckoSession s, String uri) {
                try { startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(uri))); } catch (Exception e) { /* ignore */ }
                return null;
            }
        });
        session.setProgressDelegate(new GeckoSession.ProgressDelegate() {
            public void onPageStart(GeckoSession s, String url) { showUrl(url); updateProgress(6); }

            public void onPageStop(GeckoSession s, boolean success) { updateProgress(100); }

            public void onProgressChange(GeckoSession s, int p) { updateProgress(p); }
        });
        session.setContentDelegate(new GeckoSession.ContentDelegate() {
            // Full-screen video calling: hide our bars so the call fills the screen
            public void onFullScreen(GeckoSession s, boolean fs) { setFullscreen(fs); }
        });
        session.open(sRuntime);
        view.setSession(session);
        applyDesktop();

        showSplash();
        startGlow();
        animateIn();

        // Install the built-in Tamil Sound Control Panel extension FIRST, then load the page.
        final String start = prefs.getString("last", WA);
        try {
            sRuntime.getWebExtensionController()
                    .ensureBuiltIn("resource://android/assets/tamil/", "tamil@oyr.community")
                    .accept(ext -> session.loadUri(start), err -> session.loadUri(start));
        } catch (Throwable t) {
            session.loadUri(start);
        }

        // Ask for the helper permissions once, after the splash (notification for the call service, Bluetooth for headset routing)
        root.postDelayed(this::askHelperPermissions, 3000);
    }

    /* ───────────── UI building ───────────── */

    void buildHeader() {
        LinearLayout h = new LinearLayout(this);
        h.setOrientation(LinearLayout.HORIZONTAL);
        h.setGravity(Gravity.CENTER_VERTICAL);
        h.setPadding(dp(14), dp(10), dp(10), dp(4));

        ImageView logo = new ImageView(this);
        logo.setImageResource(logoRes());
        logo.setScaleType(ImageView.ScaleType.FIT_CENTER);
        h.addView(logo, new LinearLayout.LayoutParams(dp(42), dp(42)));
        ObjectAnimator pulseX = ObjectAnimator.ofFloat(logo, "scaleX", 1f, 1.07f);
        ObjectAnimator pulseY = ObjectAnimator.ofFloat(logo, "scaleY", 1f, 1.07f);
        for (ObjectAnimator a : new ObjectAnimator[]{pulseX, pulseY}) {
            a.setDuration(1300);
            a.setRepeatCount(ValueAnimator.INFINITE);
            a.setRepeatMode(ValueAnimator.REVERSE);
            a.start();
        }

        LinearLayout names = new LinearLayout(this);
        names.setOrientation(LinearLayout.VERTICAL);
        names.setPadding(dp(12), 0, 0, 0);
        titleTv = new TextView(this);
        titleTv.setText("TAMIL");
        titleTv.setTextSize(24);
        titleTv.setTypeface(Typeface.DEFAULT_BOLD);
        titleTv.setTextColor(RED);
        titleTv.setLetterSpacing(0.22f);
        titleTv.setShadowLayer(14, 0, 0, RED);
        names.addView(titleTv);
        TextView sub = new TextView(this);
        sub.setText("ULTIMATE PREMIUM V1");
        sub.setTextSize(9);
        sub.setTextColor(0xFF9A9AA8);
        sub.setLetterSpacing(0.25f);
        names.addView(sub);
        h.addView(names, new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f));

        TextView menu = new TextView(this);
        menu.setText("⋮");
        menu.setTextSize(22);
        menu.setTextColor(Color.WHITE);
        menu.setGravity(Gravity.CENTER);
        menu.setBackground(glass(14, false));
        pressFx(menu);
        menu.setOnClickListener(v -> showMenu());
        h.addView(menu, new LinearLayout.LayoutParams(dp(42), dp(42)));
        topBars.addView(h);
    }

    void buildUrlBar() {
        LinearLayout row = new LinearLayout(this);
        row.setGravity(Gravity.CENTER_VERTICAL);
        row.setBackground(glass(22, false));
        row.setPadding(dp(14), 0, dp(6), 0);

        TextView lock = new TextView(this);
        lock.setText("🔒");
        lock.setTextSize(12);
        row.addView(lock);

        urlBox = new EditText(this);
        urlBox.setSingleLine(true);
        urlBox.setHint("Search or type address");
        urlBox.setHintTextColor(0xFF6D6D7A);
        urlBox.setTextColor(Color.WHITE);
        urlBox.setTextSize(13);
        urlBox.setBackground(null);
        urlBox.setSelectAllOnFocus(true);
        urlBox.setPadding(dp(8), dp(10), dp(8), dp(10));
        urlBox.setInputType(android.text.InputType.TYPE_CLASS_TEXT | android.text.InputType.TYPE_TEXT_VARIATION_URI);
        urlBox.setImeOptions(EditorInfo.IME_ACTION_GO);
        urlBox.setOnEditorActionListener((tv, action, ev) -> {
            String u = toUrl(urlBox.getText().toString());
            if (u != null) {
                session.loadUri(u);
                hideKeyboard();
                urlBox.clearFocus();
                view.requestFocus();
            }
            return true;
        });
        row.addView(urlBox, new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f));

        TextView go = new TextView(this);
        go.setText("GO");
        go.setTextColor(Color.WHITE);
        go.setTextSize(11);
        go.setTypeface(Typeface.DEFAULT_BOLD);
        go.setGravity(Gravity.CENTER);
        go.setBackground(glass(16, true));
        pressFx(go);
        go.setOnClickListener(v -> urlBox.onEditorAction(EditorInfo.IME_ACTION_GO));
        row.addView(go, new LinearLayout.LayoutParams(dp(46), dp(30)));

        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        lp.setMargins(dp(12), dp(6), dp(12), dp(4));
        topBars.addView(row, lp);
    }

    void buildProgress() {
        FrameLayout track = new FrameLayout(this);
        progressFill = new View(this);
        GradientDrawable g = grad(GradientDrawable.Orientation.LEFT_RIGHT);
        g.setColors(new int[]{0xFFFF2D55, 0xFFFFD23F});
        progressFill.setBackground(g);
        progressFill.setPivotX(0f);
        progressFill.setScaleX(0f);
        track.addView(progressFill, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        topBars.addView(track, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(3)));
    }

    void buildChips() {
        HorizontalScrollView sv = new HorizontalScrollView(this);
        sv.setHorizontalScrollBarEnabled(false);
        LinearLayout bar = new LinearLayout(this);
        bar.setPadding(dp(10), dp(6), dp(10), dp(6));
        sv.addView(bar);

        TextView bDc = chip("🎮 Discord"), bWa = chip("💬 WhatsApp"), bRe = chip("⟳ Reload"), bBk = chip("◀ Back");
        desktopBtn = chip("");
        outBtn = chip("🔊 Out: Auto");
        for (TextView x : new TextView[]{bWa, bDc, desktopBtn, outBtn, bRe, bBk}) {
            LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, dp(36));
            lp.setMargins(dp(4), 0, dp(4), 0);
            bar.addView(x, lp);
        }
        bDc.setOnClickListener(v -> session.loadUri(DC));
        bWa.setOnClickListener(v -> session.loadUri(WA));
        bRe.setOnClickListener(v -> session.reload());
        bBk.setOnClickListener(v -> { if (canBack) session.goBack(); });
        desktopBtn.setOnClickListener(v -> {
            desktop = !desktop;
            prefs.edit().putBoolean("desktop", desktop).apply();
            applyDesktop();
            session.reload();
        });
        outBtn.setOnClickListener(v -> cycleRoute());
        topBars.addView(sv);
    }

    TextView chip(String t) {
        TextView c = new TextView(this);
        c.setText(t);
        c.setTextColor(Color.WHITE);
        c.setTextSize(12);
        c.setGravity(Gravity.CENTER);
        c.setPadding(dp(14), 0, dp(14), 0);
        c.setBackground(glass(18, false));
        pressFx(c);
        return c;
    }

    /** Glass look: translucent white/red gradient + thin red edge (hot = solid red accent). */
    GradientDrawable glass(int rDp, boolean hot) {
        GradientDrawable g = grad(GradientDrawable.Orientation.TL_BR);
        if (hot) g.setColors(new int[]{0xFFFF2D55, 0xFF9C0F2A});
        else g.setColors(new int[]{0x33FFFFFF, 0x14FF2D55});
        g.setCornerRadius(dp(rDp));
        g.setStroke(dp(1), hot ? 0x66FFFFFF : 0x55FF2D55);
        return g;
    }

    void pressFx(View v) {
        v.setOnTouchListener((x, e) -> {
            int a = e.getAction();
            if (a == MotionEvent.ACTION_DOWN) x.animate().scaleX(0.93f).scaleY(0.93f).setDuration(80).start();
            else if (a == MotionEvent.ACTION_UP || a == MotionEvent.ACTION_CANCEL) x.animate().scaleX(1f).scaleY(1f).setDuration(120).start();
            return false;
        });
    }

    void startGlow() {
        glowAnim = ValueAnimator.ofFloat(6f, 26f);
        glowAnim.setDuration(1400);
        glowAnim.setRepeatCount(ValueAnimator.INFINITE);
        glowAnim.setRepeatMode(ValueAnimator.REVERSE);
        glowAnim.addUpdateListener(a -> titleTv.setShadowLayer((Float) a.getAnimatedValue(), 0, 0, RED));
        glowAnim.start();
    }

    void animateIn() {
        topBars.setAlpha(0f);
        topBars.setTranslationY(-dp(24));
        topBars.animate().alpha(1f).translationY(0).setStartDelay(2300).setDuration(600).start();
    }

    void showSplash() {
        final LinearLayout sp = new LinearLayout(this);
        sp.setOrientation(LinearLayout.VERTICAL);
        sp.setGravity(Gravity.CENTER);
        GradientDrawable bg = grad(GradientDrawable.Orientation.TOP_BOTTOM);
        bg.setColors(new int[]{0xFF050507, 0xFF1A0409, 0xFF3A0716});
        sp.setBackground(bg);
        sp.setClickable(true);

        ImageView logo = new ImageView(this);
        logo.setImageResource(logoRes());
        sp.addView(logo, new LinearLayout.LayoutParams(dp(220), dp(220)));
        logo.setScaleX(0.4f);
        logo.setScaleY(0.4f);
        logo.setAlpha(0f);
        logo.animate().scaleX(1f).scaleY(1f).alpha(1f).setDuration(900).setInterpolator(new OvershootInterpolator(1.4f)).start();

        TextView name = t("TAMIL", 44, "#FF2D55", true, 14);
        name.setLetterSpacing(0.3f);
        name.setShadowLayer(24, 0, 0, RED);
        sp.addView(name);
        sp.addView(t("ULTIMATE PREMIUM V1", 11, "#FF8FA3", false, 4));
        sp.addView(t("WHATSAPP · DISCORD · SOUND CONTROL PANEL", 9, "#9A9AA8", false, 18));
        sp.addView(t("👑 OWNER TAMIL", 20, "#FFD23F", true, 26));
        sp.addView(t("CO-OWNERS", 10, "#9A9AA8", false, 14));
        sp.addView(t("ITACHI SASUKE SPEED  ·  SANJU", 14, "#FF4D6A", true, 4));
        sp.addView(t("OYR PC COMMUNITY", 10, "#6D6D7A", false, 22));

        FrameLayout barTrack = new FrameLayout(this);
        barTrack.setBackgroundColor(0xFF1C1C26);
        final View fill = new View(this);
        GradientDrawable fg = grad(GradientDrawable.Orientation.LEFT_RIGHT);
        fg.setColors(new int[]{0xFFFF2D55, 0xFFFFD23F});
        fill.setBackground(fg);
        fill.setPivotX(0f);
        fill.setScaleX(0f);
        barTrack.addView(fill, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        LinearLayout.LayoutParams blp = new LinearLayout.LayoutParams(dp(220), dp(4));
        blp.topMargin = dp(26);
        sp.addView(barTrack, blp);
        fill.animate().scaleX(1f).setDuration(2300).start();

        root.addView(sp, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        sp.postDelayed(() -> sp.animate().alpha(0f).setDuration(600).withEndAction(() -> root.removeView(sp)).start(), 2500);
    }

    TextView t(String s, int sz, String col, boolean bold, int topDp) {
        TextView v = new TextView(this);
        v.setText(s);
        v.setTextSize(sz);
        v.setTextColor(Color.parseColor(col));
        v.setGravity(Gravity.CENTER);
        v.setLetterSpacing(0.12f);
        if (bold) v.setTypeface(Typeface.DEFAULT_BOLD);
        v.setPadding(dp(12), dp(topDp), dp(12), 0);
        return v;
    }

    /* ───────────── Menu / info dialogs ───────────── */

    void showMenu() {
        final Dialog d = glassDialog();
        LinearLayout col = (LinearLayout) ((ViewGroup) d.findViewById(android.R.id.content)).getChildAt(0);
        col.addView(dlgTitle("TAMIL MENU"));
        addItem(col, d, "◀  Back", () -> { if (canBack) session.goBack(); });
        addItem(col, d, "▶  Forward", () -> session.goForward());
        addItem(col, d, "💬  WhatsApp Web", () -> session.loadUri(WA));
        addItem(col, d, "🎮  Discord", () -> session.loadUri(DC));
        addItem(col, d, "🎛  Extensions", this::showExtensions);
        addItem(col, d, "ℹ  About TAMIL", this::showAbout);
        popIn(col);
        d.show();
        sizeDialog(d);
    }

    void showExtensions() {
        showInfo("EXTENSIONS",
                "✅ Tamil Sound Control Panel (built-in, active)\n\n"
                        + "Runs inside WhatsApp Web and Discord Web. Use the red floating button on the page to open it:\n"
                        + "• Microphone gain, voice clarity, noise reduction\n"
                        + "• Speaker volume / bass / treble\n"
                        + "• Input / output device selection\n"
                        + "• Call diagnostics report\n\n"
                        + "Out: chip (top bar) switches the phone's call audio between Speaker, Earpiece, Bluetooth and Wired.\n\n"
                        + "Desktop Chrome / Edge: install the separate TAMIL-Chrome-Extension.zip from the GitHub release.");
    }

    void showAbout() {
        showInfo("TAMIL · ULTIMATE PREMIUM V1",
                "Owner: TAMIL\nCommunity: PC COMMUNITY\nEngine: Firefox GeckoView (supports WebExtensions)\n\n"
                        + "Privacy: this app does not collect passwords or WhatsApp session data. Logins stay inside the browser engine on your device.\n\n"
                        + "Keep Desktop mode ON for WhatsApp Web calling.");
    }

    void showInfo(String title, String body) {
        final Dialog d = glassDialog();
        LinearLayout col = (LinearLayout) ((ViewGroup) d.findViewById(android.R.id.content)).getChildAt(0);
        col.addView(dlgTitle(title));
        TextView tv = new TextView(this);
        tv.setText(body);
        tv.setTextColor(0xFFE6E6EE);
        tv.setTextSize(13);
        tv.setLineSpacing(0, 1.15f);
        tv.setPadding(dp(4), dp(10), dp(4), dp(10));
        col.addView(tv);
        TextView ok = chip("OK");
        ok.setBackground(glass(18, true));
        ok.setOnClickListener(v -> d.dismiss());
        col.addView(ok, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(40)));
        popIn(col);
        d.show();
        sizeDialog(d);
    }

    Dialog glassDialog() {
        Dialog d = new Dialog(this);
        d.requestWindowFeature(Window.FEATURE_NO_TITLE);
        LinearLayout col = new LinearLayout(this);
        col.setOrientation(LinearLayout.VERTICAL);
        col.setPadding(dp(16), dp(16), dp(16), dp(16));
        GradientDrawable g = grad(GradientDrawable.Orientation.TL_BR);
        g.setColors(new int[]{0xF2200610, 0xF20B0B10});
        g.setCornerRadius(dp(24));
        g.setStroke(dp(1), 0x88FF2D55);
        col.setBackground(g);
        d.setContentView(col);
        d.getWindow().setBackgroundDrawable(new ColorDrawable(Color.TRANSPARENT));
        return d;
    }

    void sizeDialog(Dialog d) {
        int w = (int) (getResources().getDisplayMetrics().widthPixels * 0.88f);
        d.getWindow().setLayout(w, ViewGroup.LayoutParams.WRAP_CONTENT);
    }

    void popIn(View v) {
        v.setScaleX(0.9f);
        v.setScaleY(0.9f);
        v.setAlpha(0f);
        v.animate().scaleX(1f).scaleY(1f).alpha(1f).setDuration(220).start();
    }

    TextView dlgTitle(String s) {
        TextView tv = new TextView(this);
        tv.setText(s);
        tv.setTextColor(RED);
        tv.setTextSize(15);
        tv.setTypeface(Typeface.DEFAULT_BOLD);
        tv.setLetterSpacing(0.15f);
        tv.setShadowLayer(12, 0, 0, RED);
        tv.setPadding(dp(4), 0, 0, dp(8));
        return tv;
    }

    void addItem(LinearLayout col, final Dialog d, String text, final Runnable r) {
        TextView it = chip(text);
        it.setGravity(Gravity.CENTER_VERTICAL);
        it.setTextSize(14);
        it.setOnClickListener(v -> { d.dismiss(); r.run(); });
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(44));
        lp.setMargins(0, dp(3), 0, dp(3));
        col.addView(it, lp);
    }

    /* ───────────── Browser helpers ───────────── */

    String toUrl(String in) {
        in = in.trim();
        if (in.isEmpty()) return null;
        if (in.matches("^[a-zA-Z][a-zA-Z0-9+.-]*://.*")) return in;
        if (!in.contains(" ") && in.contains(".")) return "https://" + in;
        try { return "https://www.google.com/search?q=" + URLEncoder.encode(in, "UTF-8"); } catch (Exception e) { return null; }
    }

    void showUrl(String u) {
        if (u == null) return;
        if (!urlBox.hasFocus()) urlBox.setText(u);
        if (u.startsWith("http")) prefs.edit().putString("last", u).apply();
    }

    void updateProgress(int p) {
        lastProgress = p;
        progressFill.animate().cancel();
        progressFill.setAlpha(1f);
        progressFill.animate().scaleX(Math.max(0.04f, p / 100f)).setDuration(250).start();
        if (p >= 100) {
            progressFill.postDelayed(() -> {
                if (lastProgress >= 100) progressFill.animate().alpha(0f).setDuration(300).start();
            }, 450);
        }
    }

    void setFullscreen(boolean fs) {
        fullscreen = fs;
        topBars.setVisibility(fs ? View.GONE : View.VISIBLE);
        int flags = fs ? (View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                | View.SYSTEM_UI_FLAG_LAYOUT_STABLE) : 0;
        getWindow().getDecorView().setSystemUiVisibility(flags);
    }

    void hideKeyboard() {
        try {
            InputMethodManager imm = (InputMethodManager) getSystemService(INPUT_METHOD_SERVICE);
            imm.hideSoftInputFromWindow(urlBox.getWindowToken(), 0);
        } catch (Throwable t) { /* ignore */ }
    }

    void applyDesktop() {
        session.getSettings().setUserAgentMode(desktop ? GeckoSessionSettings.USER_AGENT_MODE_DESKTOP : GeckoSessionSettings.USER_AGENT_MODE_MOBILE);
        session.getSettings().setViewportMode(desktop ? GeckoSessionSettings.VIEWPORT_MODE_DESKTOP : GeckoSessionSettings.VIEWPORT_MODE_MOBILE);
        desktopBtn.setText(desktop ? "🖥 Desktop: ON" : "📱 Desktop: OFF");
        desktopBtn.setBackground(glass(18, desktop));
    }

    /* ───────────── Call audio ───────────── */

    // Android audio routing for calls: Speaker / Earpiece / Bluetooth / Wired (web pages cannot choose this)
    void cycleRoute() {
        try {
            am.setMode(AudioManager.MODE_IN_COMMUNICATION);
            if (Build.VERSION.SDK_INT >= 31) {
                List<AudioDeviceInfo> devs = am.getAvailableCommunicationDevices();
                if (devs == null || devs.isEmpty()) { outBtn.setText("🔊 Out: none"); return; }
                routeIdx = (routeIdx + 1) % devs.size();
                AudioDeviceInfo d = devs.get(routeIdx);
                am.setCommunicationDevice(d);
                outBtn.setText("🔊 Out: " + devName(d));
            } else {
                speakerOn = !speakerOn;
                am.setSpeakerphoneOn(speakerOn);
                outBtn.setText(speakerOn ? "🔊 Out: Speaker" : "🔊 Out: Earpiece");
            }
        } catch (Throwable t) {
            outBtn.setText("🔊 Out: error");
        }
    }

    String devName(AudioDeviceInfo d) {
        switch (d.getType()) {
            case AudioDeviceInfo.TYPE_BUILTIN_SPEAKER: return "Speaker";
            case AudioDeviceInfo.TYPE_BUILTIN_EARPIECE: return "Earpiece";
            case AudioDeviceInfo.TYPE_BLUETOOTH_SCO: return "Bluetooth";
            case AudioDeviceInfo.TYPE_WIRED_HEADSET:
            case AudioDeviceInfo.TYPE_WIRED_HEADPHONES: return "Wired";
            case AudioDeviceInfo.TYPE_USB_HEADSET: return "USB";
            default: return "Other";
        }
    }

    void startCallService() {
        try {
            if (checkSelfPermission(android.Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) {
                startForegroundService(callIntent());
            }
        } catch (Throwable t) { /* best effort */ }
    }

    void askHelperPermissions() {
        try {
            ArrayList<String> need = new ArrayList<>();
            // Microphone first: asking during a live call can be missed and the call stays silent
            if (checkSelfPermission(android.Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED)
                need.add(android.Manifest.permission.RECORD_AUDIO);
            if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED)
                need.add(android.Manifest.permission.POST_NOTIFICATIONS);
            if (Build.VERSION.SDK_INT >= 31 && checkSelfPermission(android.Manifest.permission.BLUETOOTH_CONNECT) != PackageManager.PERMISSION_GRANTED)
                need.add(android.Manifest.permission.BLUETOOTH_CONNECT);
            if (!need.isEmpty()) requestPermissions(need.toArray(new String[0]), REQ_BASE);
        } catch (Throwable t) { /* ignore */ }
    }

    class Perm implements GeckoSession.PermissionDelegate {
        @Override
        public void onAndroidPermissionsRequest(GeckoSession s, String[] perms, Callback cb) {
            androidCb = cb;
            requestPermissions(perms, REQ_PERM);
        }

        @Override
        public void onMediaPermissionRequest(GeckoSession s, String uri, MediaSource[] video, MediaSource[] audio, MediaCallback cb) {
            cb.grant(video != null && video.length > 0 ? video[0] : null, audio != null && audio.length > 0 ? audio[0] : null);
            if (audio != null && audio.length > 0) { unmuteSystemMic(); startCallService(); }
        }
    }

    // If Android itself has the phone microphone muted, no web page can fix it - clear it here.
    void unmuteSystemMic() {
        try { if (am.isMicrophoneMute()) am.setMicrophoneMute(false); } catch (Throwable t) { /* ignore */ }
    }

    @Override
    protected void onResume() {
        super.onResume();
        unmuteSystemMic();
    }

    @Override
    public void onRequestPermissionsResult(int c, String[] p, int[] g) {
        super.onRequestPermissionsResult(c, p, g);
        if (c != REQ_PERM || androidCb == null) return;
        boolean ok = g.length > 0;
        for (int r : g) if (r != PackageManager.PERMISSION_GRANTED) ok = false;
        if (ok) { androidCb.grant(); startCallService(); } else androidCb.reject();
        androidCb = null;
    }

    @Override
    protected void onDestroy() {
        try { if (glowAnim != null) glowAnim.cancel(); } catch (Throwable t) { /* ignore */ }
        try { stopService(callIntent()); } catch (Throwable t) { /* ignore */ }
        try {
            if (Build.VERSION.SDK_INT >= 31) am.clearCommunicationDevice();
            am.setMode(AudioManager.MODE_NORMAL);
        } catch (Throwable t) { /* ignore */ }
        super.onDestroy();
    }

    GradientDrawable grad(GradientDrawable.Orientation o) {
        GradientDrawable g = new GradientDrawable();
        g.setOrientation(o);
        return g;
    }

    int logoRes() { return getResources().getIdentifier("tamil_logo", "drawable", getPackageName()); }

    Intent callIntent() { return new Intent().setClassName(this, "com.tamil.voicehub.CallService"); }

    int dp(int v) { return (int) (v * getResources().getDisplayMetrics().density + 0.5f); }

    @Override
    public void onBackPressed() {
        if (fullscreen) { try { session.exitFullScreen(); } catch (Throwable t) { setFullscreen(false); } return; }
        if (canBack) session.goBack(); else super.onBackPressed();
    }
}
