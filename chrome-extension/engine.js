/* TAMIL SOUND CONTROL PANEL – Ultra Edition v2
   Owner: TAMIL | Co-Owners: ITACHI SASUKE SPEED, SANJU | OYR PC Community
   WhatsApp Web + Discord Web call audio engine (original code).
   Uses only standard Web APIs: getUserMedia, WebAudio, WebRTC (observe), HTMLMediaElement. */
(function () {
  'use strict';
  if (window.__tvhEngine) return;
  window.__tvhEngine = true;

  var H = location.hostname;
  var SITE = /discord/.test(H) ? 'discord' : (/whatsapp/.test(H) ? 'whatsapp' : 'other');
  if (SITE === 'other') return;

  /* ───────────────────────── LOGO ───────────────────────── */
  var LOGO_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">' +
    '<defs><radialGradient id="g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#3a0a14"/><stop offset="1" stop-color="#050507"/></radialGradient>' +
    '<linearGradient id="r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff4d6a"/><stop offset="1" stop-color="#9c0f2a"/></linearGradient>' +
    '<linearGradient id="y" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe27a"/><stop offset="1" stop-color="#d89a12"/></linearGradient></defs>' +
    '<circle cx="100" cy="100" r="94" fill="url(#g)" stroke="url(#r)" stroke-width="6"/>' +
    '<circle cx="100" cy="100" r="80" fill="none" stroke="#ff2d5566" stroke-width="1.5" stroke-dasharray="3 5"/>' +
    '<path d="M62 58 L72 38 L86 52 L100 32 L114 52 L128 38 L138 58 Z" fill="url(#y)"/>' +
    '<rect x="62" y="58" width="76" height="6" rx="2" fill="#b8820e"/>' +
    '<path d="M54 76 H146 V98 H116 V158 H84 V98 H54 Z" fill="url(#r)"/>' +
    '<path d="M54 76 H146" stroke="#ffb3c0" stroke-width="2" opacity=".6"/>' +
    '<text x="100" y="180" text-anchor="middle" font-family="Georgia,serif" font-weight="900" font-size="20" letter-spacing="5" fill="#fff">TAMIL</text>' +
    '</svg>';
  var LOGO_URI = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(LOGO_SVG);

  /* ───────────────────────── SPLASH (full screen) ───────────────────────── */
  function splash() {
    try {
      if (sessionStorage.getItem('tvh_splash_v2')) return;
      sessionStorage.setItem('tvh_splash_v2', '1');
    } catch (e) {}
    var el = null, done = false;
    function build() {
      if (el || done) return;
      var host = document.documentElement;
      if (!host) { setTimeout(build, 15); return; }
      el = document.createElement('div');
      el.id = 'tvh-splash';
      el.style.cssText = 'position:fixed;left:0;top:0;width:100vw;height:100vh;z-index:2147483647;display:flex;flex-direction:column;align-items:center;justify-content:center;' +
        'background:radial-gradient(circle at 50% 30%,#4a0c1a 0,#0b0b10 55%,#000 100%);color:#fff;font-family:Georgia,serif;transition:opacity .6s;opacity:1;text-align:center;padding:20px;box-sizing:border-box';
      el.innerHTML =
        '<style>@keyframes tvhp{0%,100%{transform:scale(1);filter:drop-shadow(0 0 14px #ff2d55aa)}50%{transform:scale(1.06);filter:drop-shadow(0 0 34px #ff2d55)}}' +
        '@keyframes tvhl{from{width:0}to{width:100%}}</style>' +
        '<img src="' + LOGO_URI + '" style="width:46vmin;max-width:300px;animation:tvhp 1.6s ease-in-out infinite">' +
        '<div style="margin-top:18px;font-size:11px;letter-spacing:5px;color:#ff6b84;font-family:system-ui,sans-serif">SOUND CONTROL PANEL · ULTRA EDITION</div>' +
        '<div style="margin-top:26px;font-size:12px;letter-spacing:4px;color:#9a9aa8;font-family:system-ui,sans-serif">POWERED BY</div>' +
        '<div style="margin-top:6px;font-size:26px;font-weight:900;letter-spacing:6px;color:#ffd23f">👑 OWNER TAMIL</div>' +
        '<div style="margin-top:18px;font-size:11px;letter-spacing:3px;color:#9a9aa8;font-family:system-ui,sans-serif">CO-OWNERS</div>' +
        '<div style="margin-top:6px;font-size:16px;font-weight:800;letter-spacing:3px;color:#ff4d6a">⚔️ ITACHI SASUKE SPEED &nbsp;·&nbsp; ⚔️ SANJU</div>' +
        '<div style="margin-top:34px;width:56vw;max-width:260px;height:4px;border-radius:3px;background:#1c1c26;overflow:hidden"><div style="height:100%;background:linear-gradient(90deg,#ff2d55,#ffd23f);animation:tvhl 2.6s linear forwards"></div></div>' +
        '<div style="margin-top:22px;font-size:10px;letter-spacing:2px;color:#6d6d7a;font-family:system-ui,sans-serif">OYR PC COMMUNITY</div>';
      host.appendChild(el);
    }
    build();
    setTimeout(function () { if (el) el.style.opacity = '0'; }, 2800);
    setTimeout(function () { done = true; if (el && el.parentNode) el.parentNode.removeChild(el); }, 3500);
  }
  /* native splash is shown by the app */

  /* ───────────────────────── DESKTOP IDENTITY ─────────────────────────
     When the app is in Desktop mode, make the whole JS-visible browser identity
     consistent with desktop Chrome (WebView otherwise reports "Android WebView"
     in navigator.userAgentData, which WhatsApp Web's browser check can read). */
  var spoofed = false;
  (function desktopIdentity() {
    try {
      var ua = navigator.userAgent || '';
      if (/Firefox\//.test(ua)) return; // real Firefox engine: nothing to fake
      if (window.__tvhNoSpoof) return; // desktop Chrome extension: the browser already is a real desktop browser
      if (/Android|Mobile/i.test(ua)) return; // mobile mode: leave untouched
      var v = (ua.match(/Chrome\/(\d+)/) || [0, '131'])[1];
      var brands = [{ brand: 'Not_A Brand', version: '24' }, { brand: 'Chromium', version: v }, { brand: 'Google Chrome', version: v }];
      var full = brands.map(function (b) { return { brand: b.brand, version: b.version + '.0.0.0' }; });
      var uad = {
        brands: brands, mobile: false, platform: 'Linux',
        getHighEntropyValues: function () {
          return Promise.resolve({ architecture: 'x86', bitness: '64', brands: brands, fullVersionList: full, mobile: false, model: '', platform: 'Linux', platformVersion: '6.5.0', uaFullVersion: v + '.0.0.0', wow64: false });
        },
        toJSON: function () { return { brands: brands, mobile: false, platform: 'Linux' }; }
      };
      Object.defineProperty(navigator, 'userAgentData', { get: function () { return uad; }, configurable: true });
      Object.defineProperty(navigator, 'platform', { get: function () { return 'Linux x86_64'; }, configurable: true });
      Object.defineProperty(navigator, 'vendor', { get: function () { return 'Google Inc.'; }, configurable: true });
      if (!window.chrome) window.chrome = { runtime: {}, app: { isInstalled: false } };
      spoofed = true;
    } catch (e) {}
  })();

  /* ───────────────────────── CONFIG ───────────────────────── */
  var KEY = 'tvh_cfg3';
  var DEF = {
    on: true, safe: false, preset: 'Ultra Clear',
    gainDb: 12, clarity: 7, noise: 65, bass: -1, warmth: -1, air: 3, compAmt: 55, ceiling: -4,
    maxLoud: false, drive: 2, clip: 'Smooth',
    agc: false, echo: true, ns: true, stereo: false,
    reverb: 0, width: 0, master: 0,
    spkVol: 100, spkBass: 0, spkTreble: 0, clearVoice: false, norm: false,
    inDev: '', outDev: '', autoUnmute: true
  };
  var cfg = {};
  Object.keys(DEF).forEach(function (k) { cfg[k] = DEF[k]; });
  try { var saved = JSON.parse(localStorage.getItem(KEY) || '{}'); Object.keys(saved).forEach(function (k) { if (k in DEF) cfg[k] = saved[k]; }); } catch (e) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify(cfg)); } catch (e) {} }

  var PRESETS = {
    'Ultra Clear': { gainDb: 12, clarity: 7, noise: 65, bass: -1, warmth: -1, air: 3, compAmt: 55 },
    'Natural':     { gainDb: 6,  clarity: 2, noise: 35, bass: 0,  warmth: 1,  air: 1, compAmt: 30 },
    'Studio':      { gainDb: 8,  clarity: 4, noise: 45, bass: 1,  warmth: 2,  air: 3, compAmt: 45 },
    'Deep':        { gainDb: 10, clarity: 3, noise: 50, bass: 7,  warmth: 4,  air: -2, compAmt: 50 },
    'Broadcast':   { gainDb: 14, clarity: 6, noise: 60, bass: 3,  warmth: 2,  air: 2, compAmt: 75 },
    'Gaming':      { gainDb: 16, clarity: 8, noise: 70, bass: 1,  warmth: 0,  air: 3, compAmt: 65 },
    'Custom':      null
  };
  var MAX_DB = 36; // hard cap on preamp; limiter + safety clip are always on

  /* ───────────────────────── STATE ───────────────────────── */
  var AC = window.AudioContext || window.webkitAudioContext;
  var chains = [];      // microphone (outgoing) chains
  var spks = [];        // speaker (incoming) chains
  var localIds = {};    // ids of tracks that are OURS (never treated as remote)
  var remoteIds = {};   // ids of remote tracks seen via RTCPeerConnection 'track'
  var calls = [];       // observed peer connections
  var warnings = {};    // key -> message
  var wantVideo = false;
  var connectedAt = 0;
  var lastGum = 'none', fakeOut = false;

  function warn(k, msg) { if (msg) warnings[k] = msg; else delete warnings[k]; }

  /* ───────────────────────── DSP HELPERS ───────────────────────── */
  function dbToLin(d) { return Math.pow(10, d / 20); }
  function rmsDb(an, buf) {
    an.getFloatTimeDomainData(buf);
    var s = 0; for (var i = 0; i < buf.length; i++) s += buf[i] * buf[i];
    return 10 * Math.log10(s / buf.length + 1e-12);
  }
  function makeCurve(mode, drive) {
    var n = 4096, c = new Float32Array(n);
    for (var i = 0; i < n; i++) {
      var x = i * 2 / (n - 1) - 1, y, x2 = x * drive;
      switch (mode) {
        case 'Hard':     y = Math.max(-1, Math.min(1, x2)); break;
        case 'Tube':     y = x2 >= 0 ? Math.tanh(x2) : 0.85 * Math.tanh(x2 * 1.4); break;
        case 'Foldback': var m = (((x2 - 1) % 4) + 4) % 4; y = Math.abs(m - 2) - 1; break;
        case 'Crush':    var lv = Math.max(6, 48 / drive); y = Math.round(Math.max(-1, Math.min(1, x2)) * lv) / lv; break;
        case 'Bypass':   y = x; break;
        default:         y = Math.tanh(x2) / Math.tanh(drive); // Smooth
      }
      c[i] = y;
    }
    return c;
  }
  function safetyCurve() {
    var n = 1024, c = new Float32Array(n);
    for (var i = 0; i < n; i++) { var x = i * 2 / (n - 1) - 1; c[i] = Math.max(-0.97, Math.min(0.97, x)); }
    return c;
  }
  function makeIR(ctx, sec) {
    var len = Math.max(1, Math.floor(ctx.sampleRate * sec)), buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (var ch = 0; ch < 2; ch++) {
      var d = buf.getChannelData(ch);
      for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    }
    return buf;
  }
  function resumeOnGesture(ctx) {
    if (ctx.state === 'suspended') ctx.resume().catch(function () {});
    ['click', 'touchstart', 'keydown', 'pointerdown'].forEach(function (ev) {
      window.addEventListener(ev, function () { if (ctx.state === 'suspended') ctx.resume().catch(function () {}); }, { passive: true });
    });
  }

  /* ───────────────────────── MIC CHAIN (outgoing audio) ───────────────────────── */
  function applyMic(ch) {
    var t = ch.ctx.currentTime, active = cfg.on && !cfg.safe;
    ch.dry.gain.setTargetAtTime(active ? 0 : 1, t, 0.02);
    ch.wet.gain.setTargetAtTime(active ? 1 : 0, t, 0.02);
    ch.pre.gain.setTargetAtTime(dbToLin(Math.min(MAX_DB, Math.max(0, cfg.gainDb))), t, 0.02);
    ch.low.gain.value = cfg.bass;
    ch.warm.gain.value = cfg.warmth;
    ch.pres.gain.value = cfg.clarity;
    ch.high.gain.value = cfg.air + cfg.clarity / 2;
    ch.hp.frequency.value = 60 + cfg.noise * 1.2;
    ch.comp.threshold.value = -12 - cfg.compAmt * 0.3;
    ch.comp.ratio.value = 2 + cfg.compAmt * 0.1;
    var key = (cfg.maxLoud ? cfg.clip : 'Bypass') + '|' + (cfg.maxLoud ? cfg.drive : 1);
    if (ch.curveKey !== key) { ch.shaper.curve = makeCurve(cfg.maxLoud ? cfg.clip : 'Bypass', cfg.maxLoud ? cfg.drive : 1); ch.curveKey = key; }
    ch.driveG.gain.value = 1;
    ch.master.gain.setTargetAtTime(dbToLin(cfg.master), t, 0.02);
    ch.lim.threshold.value = cfg.ceiling;
    ch.revWet.gain.value = cfg.reverb / 100 * 0.6;
    ch.delay.delayTime.value = (SITE === 'discord' && cfg.stereo ? cfg.width : 0) / 100 * 0.015;
  }
  function applyMicAll() { chains.forEach(applyMic); applyConstraintsLive(); }
  function applyConstraintsLive() {
    chains.forEach(function (ch) {
      try {
        ch.rawStream.getAudioTracks().forEach(function (tr) {
          if (tr.applyConstraints) tr.applyConstraints({ echoCancellation: !!cfg.echo, noiseSuppression: !!cfg.ns, autoGainControl: !!cfg.agc }).catch(function () {});
        });
      } catch (e) {}
    });
  }

  function buildMic(stream) {
    var ctx = new AC({ latencyHint: 'interactive' });
    var src = ctx.createMediaStreamSource(stream);
    var hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 100;
    var inAn = ctx.createAnalyser(); inAn.fftSize = 1024;
    var gate = ctx.createGain();
    var low = ctx.createBiquadFilter(); low.type = 'lowshelf'; low.frequency.value = 160;
    var warm = ctx.createBiquadFilter(); warm.type = 'peaking'; warm.frequency.value = 250; warm.Q.value = 0.8;
    var pres = ctx.createBiquadFilter(); pres.type = 'peaking'; pres.frequency.value = 3000; pres.Q.value = 0.9;
    var high = ctx.createBiquadFilter(); high.type = 'highshelf'; high.frequency.value = 6500;
    var comp = ctx.createDynamicsCompressor(); comp.knee.value = 18; comp.attack.value = 0.004; comp.release.value = 0.18;
    var pre = ctx.createGain();
    var driveG = ctx.createGain();
    var shaper = ctx.createWaveShaper(); shaper.oversample = '2x';
    var revConv = ctx.createConvolver(); revConv.buffer = makeIR(ctx, 1.4);
    var revWet = ctx.createGain(); revWet.gain.value = 0;
    var master = ctx.createGain();
    var lim = ctx.createDynamicsCompressor(); lim.knee.value = 0; lim.ratio.value = 20; lim.attack.value = 0.001; lim.release.value = 0.08;
    var safe = ctx.createWaveShaper(); safe.curve = safetyCurve();
    var wet = ctx.createGain(), dry = ctx.createGain();
    var stereo = SITE === 'discord' && cfg.stereo;
    var outNode = stereo ? ctx.createChannelMerger(2) : ctx.createGain();
    var delay = ctx.createDelay(0.05);
    var outAn = ctx.createAnalyser(); outAn.fftSize = 1024;
    var mon = ctx.createGain(); mon.gain.value = 0;

    src.connect(hp); hp.connect(inAn); hp.connect(gate);
    gate.connect(low); low.connect(warm); warm.connect(pres); pres.connect(high); high.connect(comp);
    comp.connect(pre); pre.connect(driveG); driveG.connect(shaper); shaper.connect(master);
    shaper.connect(revConv); revConv.connect(revWet); revWet.connect(master);
    master.connect(lim); lim.connect(safe); safe.connect(wet);
    src.connect(dry);
    if (stereo) {
      wet.connect(outNode, 0, 0); wet.connect(delay); delay.connect(outNode, 0, 1);
      dry.connect(outNode, 0, 0); dry.connect(outNode, 0, 1);
    } else { wet.connect(outNode); dry.connect(outNode); } // WhatsApp = mono
    outNode.connect(outAn);
    outNode.connect(mon); mon.connect(ctx.destination); // local monitor (gain 0 unless MIC TEST)

    var dest = ctx.createMediaStreamDestination();
    dest.channelCount = stereo ? 2 : 1;
    outNode.connect(dest);

    var ch = { ctx: ctx, src: src, hp: hp, dry: dry, inAn: inAn, gate: gate, low: low, warm: warm, pres: pres, high: high, comp: comp, pre: pre, driveG: driveG,
      shaper: shaper, revWet: revWet, master: master, lim: lim, wet: wet, delay: delay, outAn: outAn, mon: mon, rawStream: stream, dest: dest, curveKey: '' };
    var buf = new Float32Array(1024);
    ch.timer = setInterval(function () {
      var db = rmsDb(inAn, buf), thr = -70 + cfg.noise * 0.35, open = db > thr;
      gate.gain.setTargetAtTime(open ? 1 : 0, ctx.currentTime, open ? 0.01 : 0.12);
    }, 30);
    chains.push(ch);
    applyMic(ch);
    resumeOnGesture(ctx);

    stream.getTracks().forEach(function (t) { localIds[t.id] = 1; });
    dest.stream.getTracks().forEach(function (t) { localIds[t.id] = 1; });
    var track = dest.stream.getAudioTracks()[0];
    var rawTrack = stream.getAudioTracks()[0];
    try {
      Object.defineProperty(track, 'label', { get: function () { return rawTrack.label; }, configurable: true });
      track.getSettings = function () { try { return rawTrack.getSettings(); } catch (e) { return {}; } };
      track.getCapabilities = function () { try { return rawTrack.getCapabilities ? rawTrack.getCapabilities() : {}; } catch (e) { return {}; } };
      track.applyConstraints = function (c) { try { return rawTrack.applyConstraints ? rawTrack.applyConstraints(c) : Promise.resolve(); } catch (e) { return Promise.resolve(); } };
    } catch (e) {}
    ch.outTrack = track;
    var origStop = track.stop.bind(track);
    track.stop = function () { origStop(); dropMic(ch, true); };
    stream.getAudioTracks().forEach(function (t) { t.addEventListener('ended', function () { dropMic(ch, false); }); });
    return dest.stream;
  }
  function dropMic(ch, stopRaw) {
    if (ch.dropped) return; ch.dropped = true;
    clearInterval(ch.timer);
    if (stopRaw) { try { ch.rawStream.getTracks().forEach(function (t) { t.stop(); }); } catch (e) {} }
    var i = chains.indexOf(ch); if (i >= 0) chains.splice(i, 1);
    try { ch.ctx.close(); } catch (e) {}
  }

  // swap physical microphone live (input device selector) – the call keeps the same processed track
  function switchInput(deviceId) {
    var md = navigator.mediaDevices;
    if (!md || !origGUM) return;
    chains.forEach(function (ch) {
      origGUM({ audio: { deviceId: deviceId ? { exact: deviceId } : undefined, echoCancellation: !!cfg.echo, noiseSuppression: !!cfg.ns, autoGainControl: !!cfg.agc } }).then(function (ns) {
        try { ch.src.disconnect(); } catch (e) {}
        try { ch.rawStream.getTracks().forEach(function (t) { t.stop(); }); } catch (e) {}
        ch.rawStream = ns;
        ns.getTracks().forEach(function (t) { localIds[t.id] = 1; });
        ch.src = ch.ctx.createMediaStreamSource(ns);
        ch.src.connect(ch.hp); ch.src.connect(ch.dry);
        warn('indev', '');
      }).catch(function (e) { warn('indev', 'Input device switch failed: ' + (e && e.name || e)); });
    });
  }

  var origGUM = null;
  (function hookGUM() {
    var md = navigator.mediaDevices;
    if (!md || !md.getUserMedia) { warn('gum', 'This browser has no getUserMedia – WhatsApp calling cannot work here.'); return; }
    origGUM = md.getUserMedia.bind(md);
    md.getUserMedia = function (constraints) {
      if (!constraints || !constraints.audio) return origGUM(constraints);
      if (constraints.video) wantVideo = true;
      var c = Object.assign({}, constraints);
      var a = (typeof c.audio === 'object') ? Object.assign({}, c.audio) : {};
      a.echoCancellation = !!cfg.echo; a.noiseSuppression = !!cfg.ns; a.autoGainControl = !!cfg.agc;
      if (cfg.inDev && !a.deviceId) a.deviceId = { exact: cfg.inDev };
      c.audio = a;
      return origGUM(c).then(function (stream) {
        if (!stream.getAudioTracks().length || cfg.safe) return stream;
        try {
          var processed = buildMic(stream);
          warn('mic', '');
          var out = new MediaStream();
          processed.getAudioTracks().forEach(function (t) { out.addTrack(t); });
          stream.getVideoTracks().forEach(function (t) { out.addTrack(t); localIds[t.id] = 1; });
          return out;
        } catch (e) {
          warn('mic', 'Mic processing failed (' + (e && e.message || e) + ') – raw mic is being used.');
          return stream;
        }
      });
    };
    var inner = md.getUserMedia;
    md.getUserMedia = function (c) {
      return inner.call(md, c).then(function (st) { lastGum = 'OK (' + st.getAudioTracks().length + ' audio, ' + st.getVideoTracks().length + ' video)'; warn('gum', ''); return st; },
        function (e) { lastGum = 'FAILED: ' + (e && e.name || e); warn('gum', 'Microphone request failed (' + (e && e.name || e) + '). Allow the microphone for this app, then Reload.'); throw e; });
    };
  })();

  // Android/Gecko expose no audio OUTPUT devices -> WhatsApp shows "No speakers available". Offer the system default.
  (function hookDevices() {
    try {
      var md = navigator.mediaDevices;
      if (md && md.enumerateDevices) {
        var oe = md.enumerateDevices.bind(md);
        md.enumerateDevices = function () {
          return oe().then(function (list) {
            var out = Array.prototype.slice.call(list);
            if (!out.some(function (d) { return d.kind === 'audiooutput'; })) {
              fakeOut = true;
              out.push({ deviceId: 'default', kind: 'audiooutput', label: 'Default audio output device', groupId: 'tvh-out',
                toJSON: function () { return { deviceId: 'default', kind: 'audiooutput', label: 'Default audio output device', groupId: 'tvh-out' }; } });
            }
            return out;
          });
        };
      }
      if (window.HTMLMediaElement && !HTMLMediaElement.prototype.setSinkId) HTMLMediaElement.prototype.setSinkId = function () { return Promise.resolve(); };
    } catch (e) {}
  })();

  /* ───────────────────────── SPEAKER CHAIN (incoming audio) ───────────────────────── */
  function applySpk(ch) {
    var t = ch.ctx.currentTime, active = cfg.on && !cfg.safe;
    ch.bass.gain.value = cfg.spkBass;
    ch.treble.gain.value = cfg.spkTreble;
    ch.clear.gain.value = cfg.clearVoice ? 5 : 0;
    ch.normComp.ratio.value = cfg.norm ? 6 : 1;
    ch.normComp.threshold.value = cfg.norm ? -30 : 0;
    ch.vol.gain.setTargetAtTime(cfg.spkVol / 100, t, 0.02);
    ch.wet.gain.setTargetAtTime(active ? 1 : 0, t, 0.02);
    if (ch.el) {
      if (active) ch.el.muted = true; else ch.el.muted = !!ch.prevMuted; // avoid duplicate audio
    }
    if (cfg.outDev && ch.ctx.setSinkId && ch.sink !== cfg.outDev) {
      ch.sink = cfg.outDev;
      ch.ctx.setSinkId(cfg.outDev).then(function () { warn('outdev', ''); }).catch(function (e) { warn('outdev', 'Output device not available in this browser: ' + (e && e.name || e)); });
    }
  }
  function applySpkAll() { spks.forEach(applySpk); }

  function buildSpk(stream) {
    var ctx = new AC({ latencyHint: 'interactive' });
    var src = ctx.createMediaStreamSource(stream);
    var hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 70;
    var bass = ctx.createBiquadFilter(); bass.type = 'lowshelf'; bass.frequency.value = 180;
    var treble = ctx.createBiquadFilter(); treble.type = 'highshelf'; treble.frequency.value = 5000;
    var clear = ctx.createBiquadFilter(); clear.type = 'peaking'; clear.frequency.value = 2800; clear.Q.value = 0.9;
    var normComp = ctx.createDynamicsCompressor(); normComp.knee.value = 20; normComp.attack.value = 0.01; normComp.release.value = 0.25;
    var vol = ctx.createGain();
    var lim = ctx.createDynamicsCompressor(); lim.threshold.value = -3; lim.knee.value = 0; lim.ratio.value = 20; lim.attack.value = 0.001; lim.release.value = 0.08;
    var safe = ctx.createWaveShaper(); safe.curve = safetyCurve();
    var wet = ctx.createGain();
    var an = ctx.createAnalyser(); an.fftSize = 1024;
    src.connect(hp); hp.connect(bass); bass.connect(treble); treble.connect(clear); clear.connect(normComp); normComp.connect(vol);
    vol.connect(lim); lim.connect(safe); safe.connect(wet); wet.connect(an); wet.connect(ctx.destination);
    resumeOnGesture(ctx);
    return { ctx: ctx, bass: bass, treble: treble, clear: clear, normComp: normComp, vol: vol, wet: wet, an: an, stream: stream };
  }
  function liveAudio(s) { return s.getAudioTracks().filter(function (t) { return t.readyState === 'live'; }); }
  function isLocalStream(s) { return s.getAudioTracks().some(function (t) { return localIds[t.id]; }); }

  function attachSpk(el, s) {
    if (el.__tvhSpk && el.__tvhSpk.stream === s) return;
    detachSpk(el);
    if (!liveAudio(s).length) {
      if (!s.__tvhWait) { s.__tvhWait = true; s.addEventListener('addtrack', function () { if (el.srcObject === s) attachSpk(el, s); }); }
      return;
    }
    try {
      var ch = buildSpk(s);
      ch.el = el; ch.prevMuted = el.muted; el.__tvhSpk = ch; spks.push(ch);
      applySpk(ch);
      warn('spk', '');
    } catch (e) { warn('spk', 'Incoming audio processing failed: ' + (e && e.message || e)); }
  }
  function detachSpk(el) {
    var ch = el.__tvhSpk; if (!ch) return;
    try { el.muted = !!ch.prevMuted; } catch (e) {}
    var i = spks.indexOf(ch); if (i >= 0) spks.splice(i, 1);
    try { ch.ctx.close(); } catch (e) {}
    el.__tvhSpk = null;
  }
  (function hookSrcObject() {
    try {
      var d = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'srcObject');
      if (!d || !d.set) { warn('spk', 'Cannot observe incoming audio in this browser (no srcObject hook).'); return; }
      Object.defineProperty(HTMLMediaElement.prototype, 'srcObject', {
        configurable: true, enumerable: d.enumerable, get: d.get,
        set: function (s) {
          d.set.call(this, s);
          try {
            if (s && s.getAudioTracks && !isLocalStream(s)) attachSpk(this, s); else if (!s) detachSpk(this);
          } catch (e) {}
        }
      });
    } catch (e) { warn('spk', 'Incoming audio hook failed: ' + (e && e.message || e)); }
  })();
  setInterval(function () { // clean up finished remote streams
    spks.slice().forEach(function (ch) {
      if (!liveAudio(ch.stream).length) { if (ch.el) detachSpk(ch.el); }
    });
  }, 2000);

  /* ───────────────────────── CALL DETECTION (observe WebRTC state only) ───────────────────────── */
  function pcState(c) { try { return c.pc.connectionState || c.pc.iceConnectionState || 'new'; } catch (e) { return 'closed'; } }
  function onCallState() {
    var st = callInfo();
    if (st.state === 'CONNECTED' && !connectedAt) {
      connectedAt = Date.now();
      setTimeout(function () {
        if (callInfo().state !== 'CONNECTED') return;
        if (cfg.on && !cfg.safe) {
          if (!chains.length) warn('mic', 'Call connected but the microphone was not routed through the processor (start the call after the panel loaded, or press Reload).');
          if (!spks.length) warn('spk', 'Call connected but incoming audio route was not found – WhatsApp may play audio in a way that cannot be processed here.');
        }
      }, 4000);
    }
    if (st.state === 'NONE') { connectedAt = 0; wantVideo = false; warn('spk', ''); warn('mic', ''); }
  }
  function callInfo() {
    calls = calls.filter(function (c) { return pcState(c) !== 'closed'; });
    var conn = null, ing = null;
    calls.forEach(function (c) {
      var s = pcState(c);
      if (s === 'connected' || s === 'completed') conn = c;
      else if (s === 'connecting' || s === 'checking') ing = c;
    });
    var c = conn || ing;
    if (!c) return { state: 'NONE', dir: '', kind: '' };
    return { state: conn ? 'CONNECTED' : 'CONNECTING', dir: c.dir || 'UNKNOWN', kind: (c.video || wantVideo) ? 'VIDEO' : 'VOICE' };
  }
  (function hookPC() {
    var Native = window.RTCPeerConnection;
    if (!Native) { warn('rtc', 'This browser has no WebRTC (RTCPeerConnection) – WhatsApp Web calls are not possible here.'); return; }
    function reg(pc) {
      var c = { pc: pc, dir: '', video: false };
      calls.push(c);
      pc.addEventListener('track', function (e) {
        if (!e.track) return;
        if (e.track.kind === 'video') c.video = true;
        if (e.track.kind === 'audio') remoteIds[e.track.id] = 1;
      });
      ['connectionstatechange', 'iceconnectionstatechange'].forEach(function (ev) { pc.addEventListener(ev, onCallState); });
      var sr = pc.setRemoteDescription;
      pc.setRemoteDescription = function (d) { if (!c.dir && d && d.type === 'offer') c.dir = 'INCOMING'; return sr.apply(pc, arguments); };
      var co = pc.createOffer;
      pc.createOffer = function () { if (!c.dir) c.dir = 'OUTGOING'; return co.apply(pc, arguments); };
    }
    var Wrapped = class extends Native { constructor() { super(...arguments); try { reg(this); } catch (e) {} } };
    try {
      window.RTCPeerConnection = Wrapped;
      if (window.webkitRTCPeerConnection) window.webkitRTCPeerConnection = Wrapped;
    } catch (e) { warn('rtc', 'Could not observe WebRTC calls: ' + (e && e.message || e)); }
  })();

  /* ───────────────────────── MIC UNMUTE FIX ─────────────────────────
     WhatsApp Web sometimes starts a call with its own mic button on "muted".
     This finds that button / disabled track, fixes both, and (optionally) does it
     automatically during the first seconds of every call. If YOU tap WhatsApp's mute
     button yourself, auto-fix stops for that call so it never fights you. */
  var RE_UNMUTE = /un-?mute|turn on (the )?(mic|microphone)|(mic|microphone) (is )?(off|muted)/i;
  var RE_SKIP = /notification|chat|sound|group|message|status/i;
  var userMuteAt = 0, callStartAt = 0, autoClicks = 0, lastAuto = 0, toastEl = null, toastTimer = 0;

  function btnLabel(el) {
    return ((el.getAttribute('aria-label') || '') + ' ' + (el.getAttribute('title') || '') + ' ' + (el.getAttribute('data-tooltip') || '')).replace(/\s+/g, ' ').trim();
  }
  function scanMicButtons() {
    var out = [];
    try {
      var els = document.querySelectorAll('button,[role="button"]');
      for (var i = 0; i < els.length; i++) {
        var el = els[i];
        if (el.closest && el.closest('#tvh-root')) continue;
        var lb = btnLabel(el), ic = el.querySelector && el.querySelector('[data-icon],[data-testid]');
        var di = ic ? ((ic.getAttribute('data-icon') || '') + ' ' + (ic.getAttribute('data-testid') || '')) : '';
        if (!/mic|mute/i.test(lb + ' ' + di) || RE_SKIP.test(lb)) continue;
        var muted = RE_UNMUTE.test(lb) || (!/un-?mute/i.test(di) && /(mic.*(mute|off|slash))|((mute|off|slash).*mic)/i.test(di));
        out.push({ el: el, label: lb || di, muted: muted });
      }
    } catch (e) {}
    return out;
  }
  function clickEl(el) {
    try {
      ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach(function (t) {
        el.dispatchEvent(new MouseEvent(t, { bubbles: true, cancelable: true, view: window }));
      });
    } catch (e) { try { el.click(); } catch (e2) {} }
  }
  // remember when the real user taps a mute/unmute control
  ['pointerdown', 'click'].forEach(function (ev) {
    document.addEventListener(ev, function (e) {
      try {
        if (!e.isTrusted) return;
        var b = e.target && e.target.closest && e.target.closest('button,[role="button"]');
        if (b && !(b.closest && b.closest('#tvh-root')) && /mute|mic/i.test(btnLabel(b))) userMuteAt = Date.now();
      } catch (x) {}
    }, true);
  });

  // 'idle' (no call) | 'live' | 'muted'
  function micState() {
    if (callInfo().state === 'NONE') return 'idle';
    var ch = chains[chains.length - 1];
    if (ch && ch.outTrack && !ch.outTrack.enabled) return 'muted';
    return scanMicButtons().some(function (b) { return b.muted; }) ? 'muted' : 'live';
  }

  function fixMic(manual) {
    var did = [], ci = callInfo();
    if (ci.state === 'NONE') { if (manual) toast('Start a call first, then tap again', false); return; }
    chains.forEach(function (ch) {
      try {
        if (ch.outTrack && !ch.outTrack.enabled) { ch.outTrack.enabled = true; did.push('mic track'); }
        ch.rawStream.getAudioTracks().forEach(function (t) { if (!t.enabled) { t.enabled = true; did.push('raw mic'); } });
        if (ch.ctx.state !== 'running') { ch.ctx.resume(); did.push('audio engine'); }
      } catch (e) {}
    });
    var mb = scanMicButtons().filter(function (b) { return b.muted; })[0];
    if (mb) { clickEl(mb.el); did.push("WhatsApp's mic button"); }
    if (did.length) toast('Mic unmuted ✔', true);
    else if (manual) {
      var ch0 = chains[chains.length - 1], raw = ch0 && ch0.rawStream.getAudioTracks()[0];
      if (raw && raw.muted) toast('Phone is muting the mic – tap the app\'s 🎤 Fix Mic chip', false);
      else toast('Mic is already live ✔', true);
    }
  }

  // auto-fix during the first 30 s of each call
  setInterval(function () {
    var ci = callInfo();
    if (ci.state === 'NONE') { callStartAt = 0; autoClicks = 0; return; }
    if (!callStartAt) { callStartAt = Date.now(); autoClicks = 0; }
    var now = Date.now();
    if (!cfg.autoUnmute || now - callStartAt > 30000 || autoClicks >= 8) return;
    if (userMuteAt > callStartAt) return; // the user took control of mute
    if (now - lastAuto < 900) return;
    if (micState() === 'muted') { lastAuto = now; autoClicks++; fixMic(false); }
  }, 500);

  function toast(msg, ok) {
    try {
      if (!root) return;
      if (!toastEl) {
        toastEl = mk('div', 'position:absolute;right:72px;bottom:70px;max-width:230px;padding:10px 14px;border-radius:14px;font-size:12px;font-weight:700;line-height:1.4;color:#fff;box-shadow:0 6px 24px #000a;opacity:0;transform:translateY(8px);transition:opacity .25s,transform .25s;pointer-events:none;text-align:right', null, root);
      }
      toastEl.textContent = msg;
      toastEl.style.background = ok ? 'linear-gradient(135deg,#12a85a,#0a5e34)' : 'linear-gradient(135deg,#ff2d55,#7a0f26)';
      toastEl.style.border = '1px solid ' + (ok ? '#1fd16a99' : '#ff6b8499');
      toastEl.style.opacity = '1'; toastEl.style.transform = 'translateY(0)';
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () { toastEl.style.opacity = '0'; toastEl.style.transform = 'translateY(8px)'; }, 3200);
    } catch (e) {}
  }
  function svgMic(size, slash) {
    var NS = 'http://www.w3.org/2000/svg';
    var s = document.createElementNS(NS, 'svg');
    s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('width', size); s.setAttribute('height', size);
    s.setAttribute('fill', 'none'); s.setAttribute('stroke', 'currentColor'); s.setAttribute('stroke-width', '2');
    s.setAttribute('stroke-linecap', 'round'); s.setAttribute('stroke-linejoin', 'round');
    function el(n, a) { var e = document.createElementNS(NS, n); Object.keys(a).forEach(function (k) { e.setAttribute(k, a[k]); }); s.appendChild(e); }
    el('rect', { x: 9, y: 3, width: 6, height: 11, rx: 3 });
    el('path', { d: 'M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6' });
    if (slash) el('path', { d: 'M4 4l16 16', stroke: '#fff', 'stroke-width': 2.5 });
    return s;
  }
  var MIC_THEME = {
    idle:  { bg: 'linear-gradient(180deg,#ff2d55,#8a1028)', glow: '#ff2d5566', txt: 'NO CALL', sub: 'Start a call – the fix runs automatically', col: '#9a9aa8', anim: 'none' },
    live:  { bg: 'linear-gradient(180deg,#22e07a,#0b7a40)', glow: '#1fd16a99', txt: 'MIC LIVE', sub: 'Caller can hear you', col: '#1fd16a', anim: 'tvhBreath 2.2s ease-in-out infinite' },
    muted: { bg: 'linear-gradient(180deg,#ff2d55,#9c0f2a)', glow: '#ff2d55cc', txt: 'MUTED DETECTED', sub: 'Tap FIX MUTE NOW', col: '#ff4d6a', anim: 'tvhShake 1.1s ease-in-out infinite' }
  };
  var micRailBtn = null, micHero = null, lastMicState = '';
  function paintMic() {
    var st = micState(), T = MIC_THEME[st];
    if (micRailBtn) {
      micRailBtn.style.background = T.bg; micRailBtn.style.boxShadow = '0 0 14px ' + T.glow; micRailBtn.style.animation = T.anim;
      if (lastMicState !== st) { micRailBtn.textContent = ''; micRailBtn.appendChild(svgMic(24, st === 'muted')); }
    }
    if (micHero) {
      micHero.btn.style.background = T.bg; micHero.btn.style.boxShadow = '0 0 26px ' + T.glow + ',inset 0 0 0 2px #ffffff22'; micHero.btn.style.animation = T.anim;
      micHero.ring.style.borderColor = T.col; micHero.ring.style.animation = st === 'idle' ? 'none' : 'tvhRing 1.8s ease-out infinite';
      micHero.title.textContent = T.txt; micHero.title.style.color = T.col; micHero.sub.textContent = T.sub;
      if (lastMicState !== st) { micHero.btn.textContent = ''; micHero.btn.appendChild(svgMic(40, st === 'muted')); }
    }
    lastMicState = st;
  }

  /* ───────────────────────── UI ───────────────────────── */
  var root, panel, fab, rail, powerBtn, meterTimer, refreshers = [], tabBtns = {}, pages = {}, curTab = 'call';
  var elStatus = {}, micBar, micTxt, spkBar, spkTxt, warnEl, devIn, devOut;

  function mk(tag, css, text, parent) {
    var e = document.createElement(tag);
    if (css) e.style.cssText = css;
    if (text != null) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }
  function changed(cb, custom) {
    if (custom !== false && cfg.preset !== 'Custom') { cfg.preset = 'Custom'; refreshAll(); }
    save(); applyMicAll(); applySpkAll(); if (cb) cb();
  }
  function refreshAll() { refreshers.forEach(function (f) { try { f(); } catch (e) {} }); }

  function section(p, t) { return mk('div', 'margin:16px 2px 6px;font-size:11px;letter-spacing:3px;color:#ff6b84;font-weight:800', t + ' ▾', p); }
  function card(p) { return mk('div', 'background:#14141c;border:1px solid #ff2d5533;border-radius:16px;padding:4px 12px;margin-bottom:6px', null, p); }
  function toggle(p, title, sub, key, cb, noCustom) {
    var r = mk('div', 'display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid #ffffff0d', null, p);
    var l = mk('div', 'flex:1;padding-right:10px', null, r);
    mk('div', 'font-size:14px;font-weight:600;color:#f1f1f5', title, l);
    if (sub) mk('div', 'font-size:11px;color:#9a9aa8;margin-top:2px', sub, l);
    var sw = mk('div', 'width:46px;height:26px;border-radius:13px;position:relative;cursor:pointer;flex:none;transition:background .15s', null, r);
    var kn = mk('div', 'position:absolute;top:3px;width:20px;height:20px;border-radius:50%;background:#fff;transition:left .15s', null, sw);
    function draw() { sw.style.background = cfg[key] ? 'linear-gradient(90deg,#ff2d55,#b3162f)' : '#2a2a36'; kn.style.left = cfg[key] ? '23px' : '3px'; }
    sw.onclick = function () { cfg[key] = !cfg[key]; draw(); changed(cb, noCustom ? false : undefined); };
    refreshers.push(draw); draw();
  }
  function slider(p, title, key, min, max, step, fmt, cb) {
    var w = mk('div', 'padding:10px 0;border-bottom:1px solid #ffffff0d', null, p);
    var h = mk('div', 'display:flex;justify-content:space-between;font-size:14px;font-weight:600;color:#f1f1f5', null, w);
    mk('span', null, title, h);
    var val = mk('span', 'color:#ff6b84;font-weight:800', '', h);
    var inp = mk('input', 'width:100%;margin-top:8px;accent-color:#ff2d55', null, w);
    inp.type = 'range'; inp.min = min; inp.max = max; inp.step = step;
    function draw() { inp.value = cfg[key]; val.textContent = fmt ? fmt(cfg[key]) : cfg[key]; }
    inp.oninput = function () { cfg[key] = parseFloat(inp.value); draw(); changed(cb); };
    refreshers.push(draw); draw();
  }
  function chips(p, opts, get, set) {
    var w = mk('div', 'display:flex;flex-wrap:wrap;gap:6px;padding:10px 0', null, p), btns = [];
    opts.forEach(function (o) {
      var b = mk('div', 'padding:8px 12px;border-radius:18px;font-size:12px;font-weight:700;cursor:pointer;border:1px solid #ff2d5544', o.label || o, w);
      b.onclick = function () { set(o.value !== undefined ? o.value : o); draw(); };
      btns.push([b, o]);
    });
    function draw() { btns.forEach(function (x) { var on = get() === (x[1].value !== undefined ? x[1].value : x[1]); x[0].style.background = on ? 'linear-gradient(180deg,#ff2d55,#b3162f)' : '#1c1c26'; x[0].style.color = on ? '#fff' : '#c9c9d6'; }); }
    refreshers.push(draw); draw();
  }
  function btn(p, text, css, fn) { var b = mk('div', 'text-align:center;padding:12px;border-radius:14px;font-weight:800;letter-spacing:1.5px;font-size:12px;cursor:pointer;' + (css || ''), text, p); b.onclick = fn; return b; }
  function row(p, k, v) {
    var r = mk('div', 'display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #ffffff0d;font-size:12px', null, p);
    mk('span', 'color:#9a9aa8;letter-spacing:1px', k, r);
    return mk('span', 'font-weight:800;color:#eee;text-align:right;max-width:60%', v, r);
  }
  function meter(p, label) {
    var w = mk('div', 'margin:8px 0', null, p);
    var t = mk('div', 'font-size:9px;letter-spacing:2px;color:#9a9aa8;margin-bottom:3px', label, w);
    var b = mk('div', 'height:7px;border-radius:4px;background:#1c1c26;overflow:hidden', null, w);
    var f = mk('div', 'height:100%;width:0;background:linear-gradient(90deg,#1fd16a,#ffd23f,#ff2d55);transition:width .1s', null, b);
    return { t: t, f: f, label: label };
  }
  function selectBox(p, title, onchange) {
    var w = mk('div', 'padding:10px 0;border-bottom:1px solid #ffffff0d', null, p);
    mk('div', 'font-size:14px;font-weight:600;color:#f1f1f5;margin-bottom:6px', title, w);
    var s = mk('select', 'width:100%;padding:10px;border-radius:10px;background:#1c1c26;color:#eee;border:1px solid #ff2d5544;font-size:13px', null, w);
    s.onchange = function () { onchange(s.value); };
    return s;
  }

  /* ----- tab pages ----- */
  function pageCall(p) {
    section(p, 'WHATSAPP CALL');
    var c = card(p);
    elStatus.conn = row(c, 'CONNECTION', '…');
    elStatus.call = row(c, 'CALL DETECTION', '…');
    elStatus.mic = row(c, 'MIC → CALL', '…');
    elStatus.spk = row(c, 'CALL → SPEAKER', '…');
    elStatus.trk = row(c, 'MIC TRACK', '…');
    elStatus.id = row(c, 'DESKTOP IDENTITY', spoofed ? 'ON (Chrome desktop)' : 'OFF (mobile UA)');
    micBar = meter(p, 'MICROPHONE INPUT METER (sent to caller)');
    spkBar = meter(p, 'SPEAKER OUTPUT METER (incoming)');
    warnEl = mk('div', 'display:none;margin:8px 0;padding:10px 12px;border-radius:12px;background:#3a0a14;border:1px solid #ff2d55;color:#ffb3c0;font-size:12px;line-height:1.5', '', p);
    section(p, 'PRESET');
    chips(p, Object.keys(PRESETS), function () { return cfg.preset; }, function (n) {
      if (PRESETS[n]) Object.keys(PRESETS[n]).forEach(function (k) { cfg[k] = PRESETS[n][k]; });
      cfg.preset = n; save(); applyMicAll(); applySpkAll(); refreshAll();
    });
    section(p, 'MICROPHONE');
    var m = card(p);
    slider(m, 'Microphone Gain', 'gainDb', 0, MAX_DB, 0.5, function (v) { return '+' + v.toFixed(1) + ' dB ×' + dbToLin(v).toFixed(1); });
    slider(m, 'Voice Clarity', 'clarity', 0, 10, 0.5, function (v) { return v.toFixed(1); });
    slider(m, 'Noise Reduction', 'noise', 0, 100, 1, function (v) { return v + '%'; });
    section(p, 'SPEAKER (INCOMING)');
    var s = card(p);
    slider(s, 'Speaker Volume', 'spkVol', 0, 300, 5, function (v) { return v + '%'; }, null);
    section(p, 'MIC UNMUTE FIX');
    var hero = mk('div', 'display:flex;align-items:center;gap:14px;padding:14px;border-radius:20px;background:linear-gradient(135deg,#1a0a10,#0f0f15);border:1px solid #ff2d5544;box-shadow:inset 0 0 30px #ff2d5514', null, p);
    var hw = mk('div', 'position:relative;width:72px;height:72px;flex:none', null, hero);
    var ring = mk('div', 'position:absolute;left:0;top:0;width:72px;height:72px;border-radius:50%;border:2px solid #9a9aa8;box-sizing:border-box;opacity:.0', null, hw);
    var hb = mk('div', 'position:absolute;left:6px;top:6px;width:60px;height:60px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;cursor:pointer', null, hw);
    hb.onclick = function () { fixMic(true); paintMic(); };
    var ht = mk('div', 'flex:1;min-width:0', null, hero);
    var htt = mk('div', 'font-size:15px;font-weight:900;letter-spacing:2px;color:#9a9aa8', 'NO CALL', ht);
    var hs = mk('div', 'font-size:11px;color:#9a9aa8;margin-top:3px;line-height:1.4', '', ht);
    micHero = { btn: hb, ring: ring, title: htt, sub: hs };
    btn(p, '⚡ FIX MUTE NOW', 'margin-top:10px;color:#fff;font-size:14px;letter-spacing:3px;padding:15px;background:linear-gradient(135deg,#ff2d55,#8a1028);box-shadow:0 0 18px #ff2d5588,inset 0 1px 0 #ffffff44;border:1px solid #ff8fa3aa', function () { fixMic(true); paintMic(); });
    var ac = card(p); ac.style.marginTop = '10px';
    toggle(ac, 'Auto-fix at call start', 'Unmutes automatically in the first 30 s of every call. Stops if you tap mute yourself.', 'autoUnmute', null, true);
    paintMic();
    section(p, 'TEST');
    btn(p, '🎧 MIC TEST – HEAR MYSELF 5s (use earphones!)', 'background:#1c1c26;border:1px solid #ff2d5566;color:#ffd23f', function () {
      var ch = chains[chains.length - 1];
      if (!ch) { warn('test', 'MIC TEST needs an active call/mic. Start a WhatsApp call first.'); return; }
      warn('test', ''); ch.mon.gain.value = 1;
      setTimeout(function () { ch.mon.gain.value = 0; }, 5000);
    });
  }
  function pageLoud(p) {
    section(p, 'SIGNAL');
    var c = card(p);
    if (SITE === 'discord') toggle(c, 'Stereo (2 channels)', 'Enables 2ch wide stereo output', 'stereo', null, true);
    toggle(c, 'Auto Gain Control', 'Keeps mic volume consistent', 'agc', null, true);
    toggle(c, 'Echo Cancellation', 'Reduces room echo', 'echo', null, true);
    toggle(c, 'Noise Suppression', 'Browser background noise filter', 'ns', null, true);
    section(p, 'DYNAMICS');
    var d = card(p);
    slider(d, 'Gain (Preamp)', 'gainDb', 0, MAX_DB, 0.5, function (v) { return '+' + v.toFixed(1) + ' dB ×' + dbToLin(v).toFixed(1); });
    toggle(d, 'MAX Loudness', 'Saturation / clipping boost', 'maxLoud');
    slider(d, 'Drive', 'drive', 1, 5, 0.1, function (v) { return v.toFixed(1); });
    var w = mk('div', 'padding:10px 0', null, d);
    mk('div', 'font-size:14px;font-weight:600;color:#f1f1f5', 'Clipping Mode', w);
    chips(w, [{ label: 'Smooth (Sat)', value: 'Smooth' }, { label: 'Hard Clip', value: 'Hard' }, { label: 'Tube (Warm)', value: 'Tube' }, { label: 'Foldback', value: 'Foldback' }, { label: 'Crush (Bit)', value: 'Crush' }, { label: 'Bypass (normal mic)', value: 'Bypass' }],
      function () { return cfg.clip; }, function (v) { cfg.clip = v; changed(); });
    section(p, 'BOOST QUICK SET');
    chips(p, [{ label: '1×', value: 0 }, { label: '2×', value: 6 }, { label: '4×', value: 12 }, { label: '16×', value: 24 }, { label: '63× MAX', value: 36 }],
      function () { return cfg.gainDb; }, function (v) { cfg.gainDb = v; changed(); refreshAll(); });
    section(p, 'EQ');
    var e = card(p);
    slider(e, 'Bass Boost', 'bass', -12, 12, 0.5, function (v) { return (v >= 0 ? '+' : '') + v.toFixed(1) + ' dB'; });
    slider(e, 'Air (Treble)', 'air', -9, 9, 0.5, function (v) { return (v >= 0 ? '+' : '') + v.toFixed(1) + ' dB'; });
  }
  function pageSpace(p) {
    section(p, 'SPACE');
    var c = card(p);
    slider(c, 'Reverb (Room)', 'reverb', 0, 100, 1, function (v) { return v + '%'; });
    if (SITE === 'discord') slider(c, 'Stereo Width', 'width', 0, 100, 1, function (v) { return v + '%'; });
    else mk('div', 'font-size:11px;color:#9a9aa8;padding:10px 0', 'Stereo width is Discord-only. WhatsApp calls are mono, so it is disabled here on purpose.', c);
    section(p, 'MONITOR');
    var m = card(p);
    mk('div', 'font-size:11px;color:#9a9aa8;padding:10px 0', 'Use the MIC TEST button on the CALL tab to hear your processed voice for 5 seconds. Always use earphones to avoid feedback.', m);
  }
  function pageMaster(p) {
    section(p, 'MASTER – MIC OUTPUT');
    var c = card(p);
    slider(c, 'Master Level', 'master', -12, 6, 0.5, function (v) { return (v >= 0 ? '+' : '') + v.toFixed(1) + ' dB'; });
    slider(c, 'Voice Peak Protection (ceiling)', 'ceiling', -12, -1, 0.5, function (v) { return v.toFixed(1) + ' dBFS'; });
    section(p, 'MASTER – SPEAKER');
    var s = card(p);
    slider(s, 'Speaker Volume', 'spkVol', 0, 300, 5, function (v) { return v + '%'; }, null);
    slider(s, 'Speaker Bass', 'spkBass', -12, 12, 0.5, function (v) { return (v >= 0 ? '+' : '') + v + ' dB'; }, null);
    slider(s, 'Speaker Treble', 'spkTreble', -12, 12, 0.5, function (v) { return (v >= 0 ? '+' : '') + v + ' dB'; }, null);
    toggle(s, 'Clear Voice Mode', 'Boosts speech frequencies of the caller', 'clearVoice', null, true);
    toggle(s, 'Smart Audio Normalization', 'Evens out quiet and loud callers', 'norm', null, true);
    section(p, 'DEVICES');
    var d = card(p);
    devIn = selectBox(d, 'Input (Microphone)', function (v) { cfg.inDev = v; save(); switchInput(v); });
    devOut = selectBox(d, 'Output (Speaker)', function (v) { cfg.outDev = v; save(); applySpkAll(); });
    section(p, 'COMPATIBILITY');
    var k = card(p);
    toggle(k, 'Safe mode (raw mic, no processing)', 'Use if a call misbehaves. Takes effect on the next call.', 'safe', null, true);
    btn(p, '↻ REFRESH DEVICES', 'background:#1c1c26;border:1px solid #ff2d5544;color:#eee;margin-top:8px', listDevices);
  }
  function pageVoice(p) {
    section(p, 'VOICE');
    var c = card(p);
    slider(c, 'Voice Clarity (presence)', 'clarity', 0, 10, 0.5, function (v) { return v.toFixed(1); });
    slider(c, 'Warmth', 'warmth', -6, 6, 0.5, function (v) { return (v >= 0 ? '+' : '') + v + ' dB'; });
    slider(c, 'Noise Gate / Reduction', 'noise', 0, 100, 1, function (v) { return v + '%'; });
    slider(c, 'Dynamic Compressor', 'compAmt', 0, 100, 1, function (v) { return v + '%'; });
  }

  function pageDiag(p) {
    section(p, 'DIAGNOSTICS');
    var c = card(p);
    var box = mk('div', 'font-size:11px;line-height:1.7;color:#ddd;white-space:pre-wrap;word-break:break-all;padding:8px 0;font-family:monospace', '', c);
    function run() {
      var L = [];
      function add(k, v) { L.push(k + ': ' + v); }
      function has(f) { try { return !!f(); } catch (e) { return false; } }
      var ua = navigator.userAgent;
      add('ENGINE', 'v2 · injected ' + (window.__tvhNativeSplash ? 'at document-start' : 'LATE (after page start)'));
      add('UA', ua);
      add('Desktop identity', spoofed ? 'ON' : 'OFF');
      try { var u = navigator.userAgentData; add('uaData', u ? ('mobile=' + u.mobile + ' platform=' + u.platform + ' brands=' + u.brands.map(function (b) { return b.brand + ' ' + b.version; }).join(', ')) : 'none'); } catch (e) { add('uaData', 'err'); }
      add('navigator.platform', navigator.platform);
      add('window.chrome', typeof window.chrome);
      add('secureContext', window.isSecureContext);
      add('RTCPeerConnection', typeof window.RTCPeerConnection);
      add('getUserMedia', has(function () { return navigator.mediaDevices.getUserMedia; }));
      add('enumerateDevices', has(function () { return navigator.mediaDevices.enumerateDevices; }));
      add('createEncodedStreams', has(function () { return 'createEncodedStreams' in window.RTCRtpSender.prototype; }));
      add('RTCRtpScriptTransform', typeof window.RTCRtpScriptTransform);
      add('MediaStreamTrackProcessor', typeof window.MediaStreamTrackProcessor);
      add('WebAssembly', typeof window.WebAssembly);
      add('SharedArrayBuffer', typeof window.SharedArrayBuffer + ' / isolated=' + window.crossOriginIsolated);
      add('Opus codec', has(function () { return RTCRtpSender.getCapabilities('audio').codecs.some(function (x) { return /opus/i.test(x.mimeType); }); }));
      add('H264/VP8 video', has(function () { var m = RTCRtpSender.getCapabilities('video').codecs.map(function (x) { return x.mimeType; }).join(); return /H264/i.test(m) + '/' + /VP8/i.test(m); }));
      add('AudioContext', typeof AC + ' setSinkId=' + has(function () { return AC.prototype.setSinkId; }));
      add('Screen/inner', screen.width + 'x' + screen.height + ' / ' + innerWidth + 'x' + innerHeight + ' dpr ' + window.devicePixelRatio);
      var ci = callInfo();
      add('Last mic request', lastGum);
      add('Mic state', micState() + ' · auto-fix ' + (cfg.autoUnmute ? 'ON' : 'OFF') + ' · auto clicks ' + autoClicks);
      add('Mic buttons seen', scanMicButtons().map(function (b) { return '"' + b.label + '"' + (b.muted ? ' [MUTED]' : ''); }).join(' | ') || 'none');
      add('Fake output device added', fakeOut);
      add('Call', ci.state + ' ' + ci.kind + ' ' + ci.dir + ' | mic chains=' + chains.length + ' spk chains=' + spks.length + ' pcs=' + calls.length);
      add('Warnings', Object.keys(warnings).map(function (k) { return k + ': ' + warnings[k]; }).join(' | ') || 'none');
      box.textContent = L.join('\n');
      try {
        navigator.permissions.query({ name: 'microphone' }).then(function (r) { box.textContent += '\nMic permission: ' + r.state; }).catch(function () {});
      } catch (e) {}
    }
    run();
    btn(p, '↻ RUN DIAGNOSTICS', 'background:#1c1c26;border:1px solid #ff2d5566;color:#ffd23f;margin-top:8px', run);
    btn(p, '📋 COPY REPORT', 'background:#1c1c26;border:1px solid #ff2d5566;color:#eee;margin-top:8px', function () {
      try { navigator.clipboard.writeText(box.textContent); } catch (e) {}
    });
    p.__diagRun = run;
  }

  function pageOwners(p) {
    var par = mk('div', 'padding-bottom:6px', null, p);
    mk('div', 'text-align:center;margin:14px 0 10px;font-size:13px;letter-spacing:4px;color:#ff6b84;font-weight:800;font-family:Georgia,serif', 'TAMIL SOUND CONTROL PANEL', par);
    mk('div', 'text-align:center;font-size:10px;letter-spacing:3px;color:#ff5c6c;margin-bottom:10px', 'ONE BRAND. ONE ECOSYSTEM.', par);
    function oc(icon, role, name, quote) {
      var c = mk('div', 'border:1px solid #ff2d5555;border-radius:16px;padding:14px;margin-bottom:10px;text-align:center;background:#0f0f15', null, par);
      mk('div', 'font-size:26px', icon, c);
      mk('div', 'display:inline-block;margin:6px 0;padding:4px 14px;border-radius:12px;background:#e11d48;font-size:10px;letter-spacing:3px;font-weight:800', role, c);
      mk('div', 'font-size:16px;font-weight:800;letter-spacing:1px;font-family:Georgia,serif', name, c);
      mk('div', 'font-size:11px;font-style:italic;color:#ff9aa8;margin-top:4px', quote, c);
    }
    oc('👑', 'OWNER', 'TAMIL', '"The boss has arrived. The sound has changed."');
    oc('⚔️', 'CO-OWNER', 'ITACHI SASUKE SPEED', '"The power is in the speed."');
    oc('⚔️', 'CO-OWNER', 'SANJU', '"Loyalty. Power. Respect."');
    var a = mk('a', 'display:block;text-align:center;text-decoration:none;margin-top:10px;padding:12px;border-radius:12px;color:#fff;font-weight:800;letter-spacing:2px;font-size:12px;background:linear-gradient(90deg,#5865f2,#7c3aed)', 'JOIN OUR DISCORD', par);
    a.href = 'https://discord.gg/GGc5TwpJb'; a.target = '_blank';
    mk('div', 'text-align:center;margin-top:12px;font-size:10px;color:#8a8a99;line-height:1.5', 'Made with 🔥 by Tamil | Co-Owners: Itachi Sasuke Speed & Sanju | OYR PC Community', par);
  }

  function listDevices() {
    var md = navigator.mediaDevices;
    if (!md || !md.enumerateDevices || !devIn) return;
    md.enumerateDevices().then(function (list) {
      function fill(sel, kind, cur) {
        sel.innerHTML = '';
        var o = document.createElement('option'); o.value = ''; o.textContent = 'System default'; sel.appendChild(o);
        var n = 0;
        list.forEach(function (d) { if (d.kind !== kind) return; n++; var x = document.createElement('option'); x.value = d.deviceId; x.textContent = d.label || (kind + ' ' + n); sel.appendChild(x); });
        sel.value = cur || '';
        return n;
      }
      fill(devIn, 'audioinput', cfg.inDev);
      var no = fill(devOut, 'audiooutput', cfg.outDev);
      var sinkOK = !!(AC && AC.prototype.setSinkId);
      if (!sinkOK) warn('outdev', 'This phone does not let web pages pick the output. Use the “Out:” button of the app (Speaker / Earpiece / Bluetooth).');
      else if (!no) warn('outdev', 'No selectable output devices – use the “Out:” button of the app (Speaker / Earpiece / Bluetooth).');
      else warn('outdev', '');
    }).catch(function () {});
  }

  function showTab(k) {
    curTab = k;
    Object.keys(pages).forEach(function (p) {
      pages[p].style.display = p === k ? 'block' : 'none';
      tabBtns[p].style.background = p === k ? 'linear-gradient(180deg,#ff2d55,#b3162f)' : '#1c1c26';
      tabBtns[p].style.color = p === k ? '#fff' : '#b9b9c6';
    });
  }

  function layout() {
    if (!root) return;
    var k = Math.max(1, innerWidth / (screen.width || innerWidth));
    root.style.zoom = k;
    panel.style.width = Math.min(420, innerWidth / k - 24) + 'px';
    panel.style.maxHeight = (innerHeight / k - 110) + 'px';
  }

  function fmtDur(ms) { var s = Math.floor(ms / 1000), m = Math.floor(s / 60); s = s % 60; return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s; }

  function refreshStatus() {
    var ci = callInfo();
    if (elStatus.conn) {
      var okRTC = !!window.RTCPeerConnection && !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      elStatus.conn.textContent = okRTC ? 'Calling APIs ready' : 'Calling APIs MISSING';
      elStatus.conn.style.color = okRTC ? '#1fd16a' : '#ff4d6a';
      elStatus.call.textContent = ci.state === 'NONE' ? 'No active call' : (ci.state === 'CONNECTING' ? 'Connecting… ' : 'In call ' + fmtDur(Date.now() - connectedAt) + ' · ') + (ci.state === 'NONE' ? '' : ci.kind + ' · ' + ci.dir);
      elStatus.call.style.color = ci.state === 'CONNECTED' ? '#1fd16a' : (ci.state === 'CONNECTING' ? '#ffd23f' : '#eee');
      var micOk = chains.length > 0, spkOk = spks.length > 0, act = cfg.on && !cfg.safe;
      elStatus.mic.textContent = !act ? 'Processing OFF' : (micOk ? 'Processed mic is the call mic' : 'Waiting for mic (start a call)');
      elStatus.mic.style.color = !act ? '#9a9aa8' : (micOk ? '#1fd16a' : '#ffd23f');
      elStatus.spk.textContent = !act ? 'Processing OFF' : (spkOk ? 'Processing incoming audio' : 'Waiting for incoming audio');
      elStatus.spk.style.color = !act ? '#9a9aa8' : (spkOk ? '#1fd16a' : '#ffd23f');
    }
    if (elStatus.trk) {
      var oc = chains[chains.length - 1], tk = oc && oc.outTrack;
      elStatus.trk.textContent = tk ? ('enabled=' + tk.enabled + ' muted=' + tk.muted + ' ' + tk.readyState + ' · ctx ' + oc.ctx.state) : ('none · last request: ' + lastGum);
      elStatus.trk.style.color = tk && tk.enabled && !tk.muted ? '#1fd16a' : '#ffd23f';
    }
    // WhatsApp's own "browser doesn't support calling" notice
    try {
      var bad = false;
      var dl = document.querySelectorAll('[role="dialog"],[data-animate-modal-popup="true"]');
      for (var i = 0; i < dl.length; i++) { if (/doesn.t support calling/i.test(dl[i].textContent || '')) { bad = true; break; } }
      warn('wa', bad ? 'WhatsApp says this browser does not support calling. Tap "Desktop: ON" in the top bar, then Reload. If it still shows, WhatsApp is rejecting this WebView and calls cannot start here.' : '');
    } catch (e) {}
    var keys = Object.keys(warnings);
    if (warnEl) { warnEl.style.display = keys.length ? 'block' : 'none'; warnEl.textContent = '⚠ ' + keys.map(function (k) { return warnings[k]; }).join('  ⚠ '); }
    if (powerBtn) { powerBtn.style.opacity = cfg.on ? '1' : '.45'; }
  }
  function meterLoop() {
    refreshStatus();
    var ch = chains[chains.length - 1], buf = new Float32Array(1024);
    if (ch && ch.ctx.state !== 'running') { ch.ctx.resume().catch(function () {}); micBar.t.textContent = 'AUDIO ENGINE PAUSED – tap the screen once'; }
    else if (ch) {
      var db = rmsDb(ch.outAn, buf);
      micBar.f.style.width = Math.max(0, Math.min(100, (db + 60) / 60 * 100)) + '%';
      micBar.t.textContent = db < -55 ? micBar.label + ' · silent' : micBar.label + ' · ' + db.toFixed(0) + ' dB';
    } else { micBar.f.style.width = '0%'; micBar.t.textContent = micBar.label + ' · waiting for call'; }
    var sp = spks[spks.length - 1];
    if (sp) {
      var d2 = rmsDb(sp.an, buf);
      spkBar.f.style.width = Math.max(0, Math.min(100, (d2 + 60) / 60 * 100)) + '%';
      spkBar.t.textContent = d2 < -55 ? spkBar.label + ' · silent' : spkBar.label + ' · ' + d2.toFixed(0) + ' dB';
    } else { spkBar.f.style.width = '0%'; spkBar.t.textContent = spkBar.label + ' · waiting for call'; }
  }

  function ui() {
    if (document.getElementById('tvh-root')) return;
    if (!document.body) { setTimeout(ui, 300); return; }
    root = mk('div', 'position:fixed;right:8px;bottom:90px;z-index:2147483646;font-family:system-ui,Segoe UI,sans-serif;transform-origin:bottom right');
    root.id = 'tvh-root';
    var sty = document.createElement('style');
    sty.textContent = '@keyframes tvhBreath{0%,100%{transform:scale(1)}50%{transform:scale(1.07)}}' +
      '@keyframes tvhShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-2px) rotate(-4deg)}40%{transform:translateX(2px) rotate(4deg)}60%{transform:translateX(-2px)}80%{transform:translateX(2px)}}' +
      '@keyframes tvhRing{0%{transform:scale(.85);opacity:.9}100%{transform:scale(1.35);opacity:0}}';
    root.appendChild(sty);

    panel = mk('div', 'display:none;position:absolute;right:0;bottom:62px;overflow-y:auto;border-radius:20px;background:radial-gradient(circle at 50% 0,#3a0a14 0,#0b0b10 45%);color:#eee;border:1px solid #ff2d5577;box-shadow:0 10px 40px #000c', null, root);
    var hd = mk('div', 'padding:14px 14px 8px;display:flex;align-items:center;gap:10px', null, panel);
    var lg = mk('img', 'width:44px;height:44px;border-radius:50%;flex:none;box-shadow:0 0 12px #ff2d5588', null, hd); lg.src = LOGO_URI;
    var tt = mk('div', 'flex:1', null, hd);
    mk('div', 'font-weight:800;letter-spacing:2px;color:#ff4d6a;font-size:13px;font-family:Georgia,serif', 'TAMIL SOUND CONTROL PANEL', tt);
    mk('div', 'font-size:9px;letter-spacing:2px;color:#9a9aa8;margin-top:2px', 'ULTRA EDITION · ' + (SITE === 'whatsapp' ? 'WHATSAPP CALL' : 'DISCORD VOICE'), tt);
    var x = mk('div', 'width:32px;height:32px;border-radius:50%;background:#24242e;text-align:center;line-height:32px;cursor:pointer;flex:none', '✕', hd);
    x.onclick = function () { togglePanel(); };

    var tabs = mk('div', 'display:flex;gap:6px;margin:8px 14px 0;overflow-x:auto;padding-bottom:4px', null, panel);
    [['call', 'CALL'], ['loud', 'LOUD'], ['space', 'SPACE'], ['master', 'MASTER'], ['voice', 'VOICE'], ['diag', 'DIAG'], ['owners', 'OWNERS']].forEach(function (t) {
      tabBtns[t[0]] = mk('div', 'padding:9px 14px;border-radius:18px;font-size:12px;font-weight:800;letter-spacing:1px;cursor:pointer;flex:none;background:#1c1c26', t[1], tabs);
      tabBtns[t[0]].onclick = function () { showTab(t[0]); if (t[0] === 'master') listDevices(); if (t[0] === 'diag' && pages.diag.__diagRun) pages.diag.__diagRun(); };
    });
    var body = mk('div', 'padding:0 14px 18px', null, panel);
    pages.call = mk('div', null, null, body); pageCall(pages.call);
    pages.loud = mk('div', null, null, body); pageLoud(pages.loud);
    pages.space = mk('div', null, null, body); pageSpace(pages.space);
    pages.master = mk('div', null, null, body); pageMaster(pages.master);
    pages.voice = mk('div', null, null, body); pageVoice(pages.voice);
    pages.diag = mk('div', null, null, body); pageDiag(pages.diag);
    pages.owners = mk('div', null, null, body); pageOwners(pages.owners);
    showTab('call');

    // right-side rail (settings / power / discord) + TAMIL pill
    rail = mk('div', 'position:absolute;right:0;bottom:62px;display:' + 'flex' + ';flex-direction:column;gap:8px;padding:8px;border-radius:22px;background:#0b0b10dd;border:1px solid #ff2d5566', null, root);
    rail.style.bottom = '58px'; rail.style.right = '0';
    function rbtn(txt, fn) { var b = mk('div', 'width:44px;height:44px;border-radius:14px;background:linear-gradient(180deg,#ff2d55,#8a1028);display:flex;align-items:center;justify-content:center;font-size:20px;color:#fff;cursor:pointer;box-shadow:0 0 10px #ff2d5566', txt, rail); b.onclick = fn; return b; }
    micRailBtn = rbtn('', function () { fixMic(true); paintMic(); });
    micRailBtn.style.width = '52px'; micRailBtn.style.height = '52px'; micRailBtn.style.borderRadius = '50%'; micRailBtn.style.alignSelf = 'center';
    lastMicState = ''; paintMic();
    rbtn('🎚', togglePanel);
    powerBtn = rbtn('⚡', function () { cfg.on = !cfg.on; save(); applyMicAll(); applySpkAll(); refreshAll(); refreshStatus(); });
    rbtn('💬', function () { window.open('https://discord.gg/GGc5TwpJb', '_blank'); });
    fab = mk('div', 'display:flex;align-items:center;gap:8px;padding:10px 18px;border-radius:24px;background:linear-gradient(135deg,#ff2d55,#7a0f26);color:#fff;font-weight:800;letter-spacing:3px;font-size:12px;box-shadow:0 0 16px #ff2d55bb;cursor:pointer;margin-left:auto;width:max-content;position:relative', null, root);
    var fi = mk('img', 'width:22px;height:22px;border-radius:50%', null, fab); fi.src = LOGO_URI;
    mk('span', null, 'TAMIL', fab);
    fab.onclick = togglePanel;
    rail.style.display = 'none'; // rail only while panel hidden would clash with panel; show rail with fab tap
    document.documentElement.appendChild(root);
    layout();
    window.addEventListener('resize', layout);
    listDevices();
    // rail is shown while panel is closed; panel itself carries the same controls
    rail.style.display = 'flex'; rail.style.bottom = '58px';
    refreshStatus();
  }
  function togglePanel() {
    var open = panel.style.display === 'none';
    panel.style.display = open ? 'block' : 'none';
    rail.style.display = open ? 'none' : 'flex';
    if (open) { layout(); meterLoop(); meterTimer = setInterval(meterLoop, 150); } else { clearInterval(meterTimer); }
  }

  function boot() { if (document.body) ui(); else setTimeout(boot, 300); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  setInterval(function () { if (!document.getElementById('tvh-root')) { root = null; refreshers = []; boot(); } }, 3000);
  setInterval(function () { if (!meterTimer || !panel || panel.style.display === 'none') refreshStatus(); }, 1500);
  setInterval(function () { if (root) paintMic(); }, 700);

  window.__tvh = { cfg: cfg, calls: callInfo, mics: function () { return chains.length; }, spks: function () { return spks.length; } };
})();
