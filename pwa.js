/* Pepeling PWA — favicon aksara Jawa (ꦥ) coklat, ikon aplikasi, manifest, tombol pasang */
(function () {
  'use strict';
  var BROWN = '#5b3a17', GOLD = '#f2d68e', GOLD2 = '#d8aa52', GLYPH = 'ꦥ';
  var BASE = new URL('./', location.href).href;
  var CACHE_KEY = 'pepeling-icons-v1';

  function head(tag, attrs) {
    var el = document.createElement(tag);
    Object.keys(attrs).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    document.head.appendChild(el);
    return el;
  }
  function setLink(rel, href, extra) {
    document.querySelectorAll('link[rel="' + rel + '"]').forEach(function (n) { n.remove(); });
    var a = { rel: rel, href: href };
    if (extra) Object.keys(extra).forEach(function (k) { a[k] = extra[k]; });
    head('link', a);
  }

  function draw(size, maskable) {
    var c = document.createElement('canvas'); c.width = c.height = size;
    var x = c.getContext('2d');
    var g = x.createLinearGradient(0, 0, size, size);
    g.addColorStop(0, '#f8e3a8'); g.addColorStop(1, GOLD2);
    x.fillStyle = g;
    if (maskable) {
      x.fillRect(0, 0, size, size);
    } else {
      var r = size * 0.22; x.beginPath();
      x.moveTo(r, 0); x.arcTo(size, 0, size, size, r); x.arcTo(size, size, 0, size, r);
      x.arcTo(0, size, 0, 0, r); x.arcTo(0, 0, size, 0, r); x.closePath(); x.fill();
      x.lineWidth = size * 0.03; x.strokeStyle = BROWN; x.globalAlpha = 0.55;
      x.stroke(); x.globalAlpha = 1;
    }
    x.fillStyle = BROWN; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.font = '700 ' + Math.round(size * (maskable ? 0.46 : 0.6)) + 'px "Noto Sans Javanese", serif';
    x.fillText(GLYPH, size / 2, size / 2 + size * 0.03);
    return c.toDataURL('image/png');
  }

  function build() {
    return {
      fav: draw(64, false), apple: draw(180, true),
      i192: draw(192, false), i512: draw(512, false), m512: draw(512, true)
    };
  }

  function applyIcons(ic) {
    setLink('icon', ic.fav, { type: 'image/png', sizes: '64x64' });
    setLink('apple-touch-icon', ic.apple, { sizes: '180x180' });
    var m = {
      name: 'Pepeling — Pengingat Salat, Murojaah & Dzikir',
      short_name: 'Pepeling',
      description: 'Pengingat salat, murojaah Al-Qur\'an, dan dzikir pagi petang.',
      lang: 'id', dir: 'ltr',
      start_url: BASE, scope: BASE, id: BASE,
      display: 'standalone', orientation: 'any',
      background_color: '#1a1209', theme_color: '#1a1209',
      icons: [
        { src: ic.i192, sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: ic.i512, sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: ic.m512, sizes: '512x512', type: 'image/png', purpose: 'maskable' }
      ]
    };
    var url = URL.createObjectURL(new Blob([JSON.stringify(m)], { type: 'application/manifest+json' }));
    setLink('manifest', url);
  }

  function ensureMeta() {
    if (!document.querySelector('meta[name="apple-mobile-web-app-capable"]')) {
      head('meta', { name: 'apple-mobile-web-app-capable', content: 'yes' });
      head('meta', { name: 'mobile-web-app-capable', content: 'yes' });
      head('meta', { name: 'apple-mobile-web-app-title', content: 'Pepeling' });
      head('meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' });
    }
  }

  function initIcons() {
    ensureMeta();
    var cached = null;
    try { cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null'); } catch (e) {}
    if (cached) applyIcons(cached);
    var ready = (document.fonts && document.fonts.load)
      ? Promise.race([
          document.fonts.load('700 100px "Noto Sans Javanese"', GLYPH),
          new Promise(function (r) { setTimeout(r, 5000); })
        ])
      : Promise.resolve();
    ready.then(function () {
      // Hanya gambar ulang jika font aksara Jawa benar-benar tersedia
      if (document.fonts && document.fonts.check && !document.fonts.check('700 100px "Noto Sans Javanese"', GLYPH)) return;
      var ic = build(); applyIcons(ic);
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(ic)); } catch (e) {}
    }).catch(function () {});
  }

  /* ---- Tombol pasang aplikasi ---- */
  var deferred = null, btn = null;
  var standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

  function floatBtn(text, onclick) {
    if (btn) btn.remove();
    btn = document.createElement('button');
    btn.textContent = text;
    btn.style.cssText = 'position:fixed;left:14px;bottom:18px;z-index:150;font:700 .8rem Lora,serif;padding:11px 16px;border-radius:14px;border:1px solid #f2d68e;background:linear-gradient(180deg,#e8c068,#b98a33);color:#2a1a07;box-shadow:0 6px 18px rgba(0,0,0,.5);cursor:pointer';
    btn.onclick = onclick;
    document.body.appendChild(btn);
  }
  function hideBtn() { if (btn) { btn.remove(); btn = null; } }

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault(); deferred = e;
    if (standalone) return;
    floatBtn('⬇ Pasang Aplikasi', function () {
      if (!deferred) return;
      deferred.prompt();
      deferred.userChoice.then(function () { deferred = null; hideBtn(); });
    });
  });
  window.addEventListener('appinstalled', hideBtn);

  function iosHint() {
    var ua = navigator.userAgent || '';
    var ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (!ios || standalone || sessionStorage.getItem('pepeling-ios-hint')) return;
    floatBtn('⬇ Cara pasang di iPhone/iPad', function () {
      alert('Di Safari: ketuk tombol Bagikan (kotak dengan panah ke atas), lalu pilih "Tambah ke Layar Utama".');
      sessionStorage.setItem('pepeling-ios-hint', '1'); hideBtn();
    });
  }

  /* ---- Service worker ---- */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { initIcons(); iosHint(); });
  } else { initIcons(); iosHint(); }
})();
