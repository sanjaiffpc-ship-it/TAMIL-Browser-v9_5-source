(function () {
  var $ = function (id) { return document.getElementById(id); };
  var stream = null, ctx = null, raf = 0;
  function applyTheme(t) { document.documentElement.setAttribute('data-theme', t === 'light' ? 'light' : 'dark'); }
  chrome.storage.local.get('theme', function (r) { applyTheme(r.theme); });
  $('theme').onclick = function () { var n = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light'; chrome.storage.local.set({ theme: n }); applyTheme(n); };
  $('notif').onclick = function () { chrome.tabs.create({ url: 'chrome://settings/content/notifications' }); };
  $('cset').onclick = function () { chrome.tabs.create({ url: 'chrome://settings/content/microphone' }); };

  function fill(sel, list, kind) {
    var cur = sel.value; sel.innerHTML = '';
    var n = 0;
    list.forEach(function (d) { if (d.kind !== kind) return; n++; var o = document.createElement('option'); o.value = d.deviceId; o.textContent = d.label || (kind + ' ' + n); sel.appendChild(o); });
    if (!n) { var o = document.createElement('option'); o.textContent = '(none found)'; sel.appendChild(o); }
    if (cur) sel.value = cur;
  }
  function refresh() {
    return navigator.mediaDevices.enumerateDevices().then(function (l) { fill($('mic'), l, 'audioinput'); fill($('spk'), l, 'audiooutput'); fill($('cam'), l, 'videoinput'); return l; });
  }
  function perm() {
    if (!navigator.permissions) return;
    navigator.permissions.query({ name: 'microphone' }).then(function (r) { $('st').textContent = r.state.toUpperCase(); r.onchange = function () { $('st').textContent = r.state.toUpperCase(); refresh(); }; }).catch(function () {});
  }
  function constraints() {
    return { audio: { deviceId: $('mic').value && $('mic').value !== 'undefined' ? { exact: $('mic').value } : undefined, echoCancellation: $('ec').checked, noiseSuppression: $('ns').checked, autoGainControl: $('agc').checked } };
  }
  function stop() { cancelAnimationFrame(raf); if (stream) stream.getTracks().forEach(function (t) { t.stop(); }); if (ctx) ctx.close(); stream = null; ctx = null; $('lvl').style.width = '0'; $('start').textContent = '▶ Start level meter'; }
  function meter() {
    stop();
    return navigator.mediaDevices.getUserMedia(constraints()).then(function (s) {
      stream = s; ctx = new (window.AudioContext || window.webkitAudioContext)();
      var an = ctx.createAnalyser(); an.fftSize = 1024; ctx.createMediaStreamSource(s).connect(an);
      var buf = new Float32Array(an.fftSize);
      (function loop() { an.getFloatTimeDomainData(buf); var sum = 0; for (var i = 0; i < buf.length; i++) sum += buf[i] * buf[i]; var db = 10 * Math.log10(sum / buf.length + 1e-12); $('lvl').style.width = Math.max(0, Math.min(100, (db + 60) / 60 * 100)) + '%'; raf = requestAnimationFrame(loop); })();
      $('start').textContent = '■ Stop'; return refresh();
    });
  }
  $('grant').onclick = function () { meter().then(function () { $('st').textContent = 'GRANTED'; }).catch(function (e) { $('st').textContent = 'FAILED: ' + (e && e.name); }); };
  $('start').onclick = function () { if (stream) stop(); else meter().catch(function (e) { $('st').textContent = 'FAILED: ' + (e && e.name); }); };
  $('tone').onclick = function () {
    var c = new AudioContext(), o = c.createOscillator(), g = c.createGain(); o.frequency.value = 440; g.gain.value = 0.12;
    var dest = c.createMediaStreamDestination(); o.connect(g); g.connect(dest);
    var a = new Audio(); a.srcObject = dest.stream;
    var go = function () { a.play(); o.start(); setTimeout(function () { o.stop(); a.pause(); c.close(); }, 1200); $('spkmsg').textContent = 'Playing 1.2 s tone…'; };
    if (a.setSinkId && $('spk').value) a.setSinkId($('spk').value).then(go).catch(function (e) { $('spkmsg').textContent = 'Could not use that speaker: ' + (e && e.name); go(); });
    else { $('spkmsg').textContent = 'This browser cannot choose an output device; using the system default.'; go(); }
  };
  function diag() {
    navigator.mediaDevices.enumerateDevices().then(function (l) {
      var c = function (k) { return l.filter(function (d) { return d.kind === k; }).length; };
      var t = [
        'Browser: ' + navigator.userAgent,
        'getUserMedia: ' + !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
        'setSinkId (speaker choice): ' + !!HTMLMediaElement.prototype.setSinkId,
        'Mics: ' + c('audioinput') + '  Speakers: ' + c('audiooutput') + '  Cameras: ' + c('videoinput'),
        'Secure context: ' + window.isSecureContext,
        'Opus: ' + (window.RTCRtpSender ? RTCRtpSender.getCapabilities('audio').codecs.some(function (x) { return /opus/i.test(x.mimeType); }) : 'no WebRTC')
      ];
      $('diag').textContent = t.join('\n');
    });
  }
  $('copy').onclick = function () { navigator.clipboard.writeText($('diag').textContent); };
  navigator.mediaDevices.addEventListener('devicechange', function () { refresh().then(diag); });
  perm(); refresh().then(diag);
})();
