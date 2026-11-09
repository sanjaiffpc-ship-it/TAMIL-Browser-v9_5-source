(function () {
  var $ = function (id) { return document.getElementById(id); };
  function applyTheme(t) { document.documentElement.setAttribute('data-theme', t === 'light' ? 'light' : 'dark'); }
  chrome.storage.local.get('theme', function (r) { applyTheme(r.theme); });
  $('theme').onclick = function () {
    var next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    chrome.storage.local.set({ theme: next }); applyTheme(next);
  };
  $('wa').onclick = function () { chrome.tabs.create({ url: 'https://web.whatsapp.com/' }); };
  $('dc').onclick = function () { chrome.tabs.create({ url: 'https://discord.com/app' }); };
  $('opt').onclick = function () { chrome.runtime.openOptionsPage(); };
  $('site').onclick = function () { chrome.tabs.create({ url: 'chrome://settings/content/siteDetails?site=' + encodeURIComponent('https://web.whatsapp.com') }); };

  // Real Chrome site settings for WhatsApp Web (chrome.contentSettings)
  function setting(type, el) {
    try {
      chrome.contentSettings[type].get({ primaryUrl: 'https://web.whatsapp.com/' }, function (d) {
        var s = d && d.setting || 'ask';
        el.textContent = s === 'allow' ? 'ALLOWED' : s === 'block' ? 'BLOCKED' : 'ASK';
        el.className = 'pill ' + (s === 'allow' ? 'allow' : s === 'block' ? 'block' : 'ask');
      });
    } catch (e) { el.textContent = 'n/a'; }
  }
  setting('microphone', $('mic')); setting('camera', $('cam')); setting('notifications', $('not'));

  navigator.mediaDevices.enumerateDevices().then(function (l) {
    var n = function (k) { return l.filter(function (d) { return d.kind === k; }); };
    var lines = [];
    [['audioinput', 'Microphones'], ['audiooutput', 'Speakers'], ['videoinput', 'Cameras']].forEach(function (p) {
      var a = n(p[0]); lines.push(p[1] + ': ' + a.length);
      a.forEach(function (d) { if (d.label) lines.push('  • ' + d.label); });
    });
    if (!l.some(function (d) { return d.label; })) lines.push('(names are hidden until audio access is granted - open "Audio test & settings")');
    $('dev').textContent = lines.join('\n');
  }).catch(function () { $('dev').textContent = 'Could not read devices.'; });

  $('tips').textContent =
    '1. Microphone/Camera must be ALLOWED for web.whatsapp.com.\n' +
    '2. Pick the right mic/speaker inside the call window.\n' +
    '3. Close other apps using the mic (Zoom, Teams).\n' +
    '4. Windows: Settings > Privacy > Microphone ON.\n' +
    '5. Use the red TAMIL panel on the page for gain/noise.';
})();
