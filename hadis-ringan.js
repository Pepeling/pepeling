/* Menu Hadis versi ringan untuk PEPELING — sumber: fawazahmed0/hadith-api (via jsDelivr CDN)
   Pasang: tambahkan <script src="hadis-ringan.js"></script> SESUDAH script utama dan pwa.js, sebelum </body>.
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
      return t ? '<span class="pill" style="color:var(--warn)">' + esc(t) + '</span>' : '';
    }).join(' ');
  }

  window.loadHadis = function () {
    var box = el('hadis-books');
    if (box) {
      box.innerHTML = KITAB.map(function (k) {
        return '<button class="btn" id="hb-' + k[0] + '" onclick="hadisPilih(\'' + k[0] + '\')">' + esc(k[1]) + '</button>';
      }).join('');
    }
    var ps = document.querySelectorAll('p');
    for (var i = 0; i < ps.length; i++) {
      if (ps[i].textContent.indexOf('api.hadith.gading.dev') > -1) ps[i].textContent = 'Kitab hadis para perawi terpercaya, teks Arab & terjemahan Indonesia (sumber: hadith-api via jsDelivr)';
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  window.hadisMuat = async function (sorot) {
    var tok = ++S.token, k = find(S.book), nama = k[1], code = k[2];
    KITAB.forEach(function (x) {
      var b = el('hb-' + x[0]); if (b) b.classList.toggle('on', x[0] === S.book);
    });
    var box = el('hadis-content');
    box.innerHTML = '<div class="spin">Memuat data…</div>';
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
      html += '<div class="ayt"' + (sorot === n ? ' style="border-color:var(--gold)"' : '') + '>' +
        '<div class="row"><span class="pill">' + esc(nama) + ' no. ' + n + '</span>' + gradeBadges(ar, idn) + '</div>' +
        (ar && ar.text ? '<div class="a mq">' + esc(ar.text) + '</div>' : '') +
        (idn && idn.text ? '<div class="i">' + esc(idn.text) + '</div>' : '<div class="i muted"><i>Terjemahan Indonesia untuk nomor ini belum tersedia.</i></div>') +
        '</div>';
    });

    if (!ada) {
      box.innerHTML = '<div class="spin" style="animation:none;color:var(--warn)">Hadis nomor ' + nums[0] + '–' + nums[nums.length - 1] + ' tidak ditemukan atau koneksi bermasalah.<br><br><button class="btn" onclick="hadisMuat()">Coba lagi</button></div>';
    } else box.innerHTML = html;

    var pg = el('hadis-pager');
    if (pg) {
      pg.innerHTML =
        '<button class="btn" onclick="hadisHalaman(-1)" ' + (S.start <= 1 ? 'disabled' : '') + '>‹ Sebelumnya</button>' +
        '<span class="sm muted">Hadis ' + nums[0] + ' – ' + nums[nums.length - 1] + '</span>' +
        '<button class="btn" onclick="hadisHalaman(1)" ' + (!ada ? 'disabled' : '') + '>Berikutnya ›</button>';
    }
  };
})();
