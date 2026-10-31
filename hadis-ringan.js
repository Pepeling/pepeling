/* Menu Hadis versi ringan — sumber: fawazahmed0/hadith-api (via jsDelivr CDN, file statis per hadis)
   Pasang: tambahkan <script src="hadis-ringan.js"></script> SESUDAH script utama, sebelum </body>.
   Skrip ini menimpa fungsi loadHadis, hadisPilih, hadisGoto, hadisHalaman, hadisMuat milik halaman. */
(function () {
  'use strict';
  var CDN = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/';
  var RAW = 'https://raw.githubusercontent.com/fawazahmed0/hadith-api/1/editions/';

  // [id tombol, nama tampil, kode kitab di API]
  var KITAB = [
    ['bukhari', 'Shahih Bukhari', 'bukhari'],
    ['muslim', 'Shahih Muslim', 'muslim'],
    ['abu-daud', 'Sunan Abu Daud', 'abudawud'],
    ['tirmidzi', 'Sunan Tirmidzi', 'tirmidhi'],
    ['nasai', "Sunan An-Nasa'i", 'nasai'],
    ['ibnu-majah', 'Sunan Ibnu Majah', 'ibnmajah'],
    ['malik', "Muwatha' Malik", 'malik']
  ];
  var S = { book: 'bukhari', start: 1, size: 5, token: 0 };
  var cache = {};

  function el(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function find(id) { for (var i = 0; i < KITAB.length; i++) if (KITAB[i][0] === id) return KITAB[i]; return KITAB[0]; }

  // Coba beberapa alamat berurutan (CDN .min, CDN biasa, GitHub raw)
  function getJSON(urls) {
    return urls.reduce(function (p, u) {
      return p.catch(function () {
        return fetch(u).then(function (r) { if (!r.ok) throw new Error('x'); return r.json(); });
      });
    }, Promise.reject(new Error('start')));
  }
  function one(ed, n) {
    var k = ed + '/' + n;
    if (cache[k]) return cache[k];
    var p = getJSON([CDN + ed + '/' + n + '.min.json', CDN + ed + '/' + n + '.json', RAW + ed + '/' + n + '.min.json'])
      .then(function (j) { return (j && j.hadiths) ? (j.hadiths[0] || null) : (j || null); })
      .catch(function () { delete cache[k]; return null; });
    cache[k] = p;
    return p;
  }

  function gradeBadges(h1, h2) {
    var g = (h1 && Array.isArray(h1.grades) && h1.grades.length) ? h1.grades : ((h2 && Array.isArray(h2.grades)) ? h2.grades : []);
    return g.slice(0, 3).map(function (x) {
      var t = (x && typeof x === 'object') ? ((x.name ? x.name + ': ' : '') + (x.grade || '')) : String(x);
      return t ? '<span class="bg-amber-950 text-amber-300 border border-amber-500/40 text-[10px] font-bold px-2.5 py-0.5 rounded-full">' + esc(t) + '</span>' : '';
    }).join('');
  }

  window.loadHadis = function () {
    var box = el('hadis-books');
    if (box) {
      box.innerHTML = KITAB.map(function (k) {
        return '<button onclick="hadisPilih(\'' + k[0] + '\')" id="hb-' + k[0] + '" class="px-3 py-1.5 rounded-lg border border-teal-700/50 text-xs font-bold transition">' + esc(k[1]) + '</button>';
      }).join('');
    }
    var badges = document.querySelectorAll('span');
    for (var i = 0; i < badges.length; i++) {
      if (badges[i].textContent.indexOf('api.hadith.gading.dev') > -1) badges[i].textContent = 'Sumber: hadith-api (jsDelivr)';
    }
    window.hadisMuat();
  };
  window.hadisPilih = function (id) { S.book = id; S.start = 1; window.hadisMuat(); };
  window.hadisGoto = function () {
    var n = parseInt(el('hadis-goto').value, 10);
    if (!n || n < 1) return;
    S.start = Math.floor((n - 1) / S.size) * S.size + 1;
    window.hadisMuat(n);
  };
  window.hadisHalaman = function (d) {
    S.start = Math.max(1, S.start + d * S.size);
    window.hadisMuat();
    window.scrollTo({ top: 320, behavior: 'smooth' });
  };

  window.hadisMuat = async function (sorot) {
    var tok = ++S.token, k = find(S.book), nama = k[1], code = k[2];
    KITAB.forEach(function (x) {
      var b = el('hb-' + x[0]); if (!b) return;
      b.className = 'px-3 py-1.5 rounded-lg border text-xs font-bold transition ' +
        (x[0] === S.book ? 'bg-teal-500/30 border-cyan-400 text-white shadow' : 'bg-teal-900/40 border-teal-700/50 text-cyan-300 hover:bg-teal-800');
    });
    var box = el('hadis-content');
    box.innerHTML = '<div class="text-center text-xs text-teal-300 py-8 animate-pulse">Memuat data…</div>';
    var info = el('hadis-info'); if (info) info.textContent = nama + ' · teks Arab & terjemahan Indonesia';

    var nums = [];
    for (var i = 0; i < S.size; i++) nums.push(S.start + i);
    var rows = await Promise.all(nums.map(function (n) {
      return Promise.all([one('ara-' + code, n), one('ind-' + code, n)]);
    }));
    if (tok !== S.token) return; // pilihan lain sudah dibuka

    var html = '', ada = 0;
    rows.forEach(function (r, idx) {
      var ar = r[0], idn = r[1], n = nums[idx];
      if (!ar && !idn) return;
      ada++;
      html += '<div class="p-4 bg-teal-900/30 rounded-2xl border ' + (sorot === n ? 'border-amber-400' : 'border-teal-700/40') + ' space-y-2">' +
        '<div class="flex flex-wrap items-center gap-2"><span class="bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2.5 py-0.5 rounded-full">' + esc(nama) + ' no. ' + n + '</span>' + gradeBadges(ar, idn) + '</div>' +
        (ar && ar.text ? '<p class="font-arabic text-2xl leading-loose text-amber-200 text-right" dir="rtl">' + esc(ar.text) + '</p>' : '') +
        (idn && idn.text ? '<p class="text-xs text-gray-300 leading-relaxed">' + esc(idn.text) + '</p>' : '<p class="text-[11px] text-gray-500 italic">Terjemahan Indonesia untuk nomor ini belum tersedia.</p>') +
        '</div>';
    });

    if (!ada) {
      box.innerHTML = '<div class="text-center text-xs text-amber-300 py-8 space-y-2"><p>Hadis nomor ' + nums[0] + '–' + nums[nums.length - 1] + ' tidak ditemukan atau koneksi bermasalah.</p>' +
        '<button onclick="hadisMuat()" class="px-3 py-1.5 bg-teal-800 border border-teal-600/50 rounded-lg text-cyan-200 font-bold">Coba lagi</button></div>';
    } else box.innerHTML = html;

    var pg = el('hadis-pager');
    if (pg) {
      pg.innerHTML =
        '<button onclick="hadisHalaman(-1)" ' + (S.start <= 1 ? 'disabled' : '') + ' class="px-3 py-1.5 bg-teal-900/60 hover:bg-teal-800 border border-teal-700/50 text-cyan-300 rounded-lg font-bold disabled:opacity-30">‹ Sebelumnya</button>' +
        '<span class="text-gray-300">Hadis ' + nums[0] + ' – ' + nums[nums.length - 1] + '</span>' +
        '<button onclick="hadisHalaman(1)" ' + (!ada ? 'disabled' : '') + ' class="px-3 py-1.5 bg-teal-900/60 hover:bg-teal-800 border border-teal-700/50 text-cyan-300 rounded-lg font-bold disabled:opacity-30">Berikutnya ›</button>';
    }
  };
})();
