/* PEPELING PLUS — penyimpanan Google Sheet/file + Kultum & Catatan */
(function () {
'use strict';

const st = document.createElement('style');
st.textContent = `
.fld{display:flex;flex-direction:column;gap:4px;font-size:.78rem;color:var(--muted)}
.fld .inp{width:100%}
textarea.inp{resize:vertical;min-height:80px;font-family:inherit}
.pre{white-space:pre-wrap;background:#21170b;border:1px solid var(--line);border-radius:12px;padding:12px;font-size:.8rem;line-height:1.6;max-height:420px;overflow:auto;color:var(--text)}
.sw{display:flex;align-items:center;gap:10px;font-size:.84rem;padding:6px 0}
.sw input[type=checkbox]{accent-color:#d8aa52;width:18px;height:18px}
`;
document.head.appendChild(st);

[['kultum', 'KULTUM & CATATAN'], ['pengaturan', 'PENGATURAN']].forEach(([v, t]) => {
  const b = document.createElement('button');
  b.className = 'tab'; b.dataset.v = v; b.textContent = t; b.onclick = () => go(v);
  $('tabs').appendChild(b);
  const s = document.createElement('section');
  s.id = 'v-' + v; s.className = 'view hidden';
  document.querySelector('main').appendChild(s);
  VIEWS.push(v);
});
const _go = window.go;
window.go = function (v) {
  _go(v);
  if (v === 'kultum') kulRender();
  if (v === 'pengaturan') setRender();
};

const opt = (arr, sel) => arr.map(x => `<option ${x === sel ? 'selected' : ''}>${x}</option>`).join('');
window.salin = async function (t) {
  try { await navigator.clipboard.writeText(t); }
  catch (e) { const a = document.createElement('textarea'); a.value = t; document.body.appendChild(a); a.select(); document.execCommand('copy'); a.remove(); }
  toast('✓ Disalin');
};

/* =====================================================
   PENYIMPANAN: GOOGLE SHEET (APPS SCRIPT) & FILE
   ===================================================== */
let NOTES = LS.get('pepeling-catatan', []);
const saveNotes = () => LS.set('pepeling-catatan', NOTES);
const TOMB = 'pepeling-hapus';
const tombs = () => LS.get(TOMB, []);
function addTomb(id) { const t = tombs(); if (!t.includes(id)) { t.push(id); LS.set(TOMB, t); } }
const _hapus = window.hapusRec;
window.hapusRec = function (id) { const n = REC.length; _hapus(id); if (REC.length < n) addTomb(id); };

function gabung(a, b, tomb) {
  const m = new Map();
  [...a, ...b].forEach(r => {
    if (!r || r.id == null || tomb.has(r.id)) return;
    const o = m.get(r.id);
    m.set(r.id, (o && (o.upd || 0) >= (r.upd || 0)) ? o : r);
  });
  return [...m.values()];
}
let muted = false;
function terapkan(d) {
  muted = true;
  try {
    const tb = new Set([...tombs(), ...(d.hapus || [])]); LS.set(TOMB, [...tb]);
    REC.splice(0, REC.length, ...gabung(REC, d.murojaah || [], tb)); saveRec();
    NOTES = gabung(NOTES, d.catatan || [], tb); saveNotes();
  } finally { muted = false; }
}
const _set = LS.set;
let tPush = null;
LS.set = function (k, v) {
  _set.call(LS, k, v);
  if (!muted && /^pepeling-(murojaah|catatan|hapus)$/.test(k)) { clearTimeout(tPush); tPush = setTimeout(() => cloudSync(false), 3000); }
};
async function cloudSync(manual) {
  const c = LS.get('pepeling-cloud', {});
  if (!c.url) { if (manual) toast('Isi URL Apps Script dulu'); return; }
  try {
    const r = await fetch(c.url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'sync', token: c.token || '', data: { murojaah: REC, catatan: NOTES, hapus: tombs() } }) });
    const j = await r.json();
    if (!j.ok) throw new Error(j.error || 'gagal');
    terapkan(j.data);
    LS.set('pepeling-lastsync', Date.now());
    if (manual) toast('✓ Sinkron berhasil');
    const e = $('sync-st'); if (e) e.innerText = 'Terakhir sinkron: ' + new Date().toLocaleString('id-ID');
    if (typeof refreshHome === 'function') refreshHome();
  } catch (e) { if (manual) toast('Sinkron gagal: ' + e.message); }
}
window.syncManual = () => cloudSync(true);
window.simpanCloud = function () {
  LS.set('pepeling-cloud', { url: $('cl-url').value.trim(), token: $('cl-token').value.trim() });
  toast('✓ Pengaturan disimpan'); cloudSync(true);
};
window.eksporSemua = function () {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify({ app: 'pepeling', v: 1, murojaah: REC, catatan: NOTES, hapus: tombs() }, null, 2)], { type: 'application/json' }));
  a.download = `pepeling-cadangan-${todayStr()}.json`; a.click();
};
window.imporSemua = function (inp) {
  const f = inp.files[0]; if (!f) return; const rd = new FileReader();
  rd.onload = () => {
    try {
      let d = JSON.parse(rd.result);
      if (Array.isArray(d)) d = { murojaah: d };
      terapkan(d); toast('✓ Impor berhasil'); setRender();
    } catch (e) { toast('File tidak valid'); }
  };
  rd.readAsText(f);
};
setTimeout(() => cloudSync(false), 3000);

function setRender() {
  const c = LS.get('pepeling-cloud', { url: '', token: '' });
  const last = LS.get('pepeling-lastsync', 0);
  $('v-pengaturan').innerHTML = `
  <div class="card">
    <div class="ttl">☁️ PENYIMPANAN GOOGLE SHEET</div>
    <p class="xs muted" style="margin:4px 0 10px">Murojaah & catatan tersimpan sebagai tabel di Google Sheet Anda dan sinkron antar perangkat. Password boleh dikosongkan.</p>
    <div class="grid g2">
      <label class="fld">URL Web App Apps Script<input id="cl-url" class="inp" value="${esc(c.url)}" placeholder="https://script.google.com/macros/s/.../exec"></label>
      <label class="fld">Password (opsional)<input id="cl-token" class="inp" type="password" value="${esc(c.token)}" placeholder="kosongkan jika tanpa password"></label>
    </div>
    <div class="row" style="margin-top:10px"><button class="btn gold" onclick="simpanCloud()">💾 Simpan & Sinkron</button><button class="btn" onclick="syncManual()">🔄 Sinkron sekarang</button><span id="sync-st" class="xs muted">${last ? 'Terakhir sinkron: ' + new Date(last).toLocaleString('id-ID') : 'Belum pernah sinkron'}</span></div>
  </div>
  <div class="card">
    <div class="ttl">📁 CADANGAN FILE</div>
    <p class="xs muted" style="margin:4px 0 10px">Simpan semua data ke file .json di perangkat, atau pulihkan dari file.</p>
    <div class="row"><button class="btn gold" onclick="eksporSemua()">⬇ Ekspor semua data</button><label class="btn" style="cursor:pointer">⬆ Impor file<input type="file" accept=".json" hidden onchange="imporSemua(this)"></label></div>
  </div>`;
}

/* =====================================================
   KULTUM & CATATAN (PROMPT AI)
   ===================================================== */
const kul = { sub: 'kultum' };
window.kulSub = s => { kul.sub = s; kulRender(); };
function kulRender() {
  $('v-kultum').innerHTML = `
  <div class="card" style="padding:10px"><div class="row">
    ${[['kultum', '✨ Prompt Kultum'], ['rangkum', '📝 Rangkum Pengajian'], ['catatan', `📚 Catatan Saya (${NOTES.length})`]].map(([k, t]) => `<button class="btn ${kul.sub === k ? 'on' : ''}" onclick="kulSub('${k}')">${t}</button>`).join('')}
  </div></div><div id="kul-body" class="view"></div>`;
  ({ kultum: kKultum, rangkum: kRangkum, catatan: kCatatan })[kul.sub]();
}
const kotakOut = () => `
  <div class="card"><div class="row between"><div class="ttl">📋 PROMPT SIAP SALIN</div>
    <div class="row"><button class="btn gold" onclick="salin($('kl-out').textContent)">Salin</button><button class="btn" onclick="bukaAI('claude')">Buka di Claude</button><button class="btn" onclick="bukaAI('chatgpt')">Buka di ChatGPT</button></div></div>
    <div id="kl-out" class="pre" style="margin-top:10px"></div>
    <p class="xs muted" style="margin:8px 0 0">Untuk Gemini atau AI lain: salin lalu tempel. Selalu cek ulang dalil (ayat & hadis) sebelum disampaikan.</p></div>`;
const kotakSimpan = jenis => `
  <div class="card"><div class="ttl">💾 SIMPAN HASIL DARI AI</div>
    <div class="grid g2" style="margin-top:10px">
      <label class="fld">Judul<input id="kl-sj" class="inp"></label>
      <label class="fld">Pemateri / penulis (opsional)<input id="kl-sp" class="inp"></label>
    </div>
    <label class="fld" style="margin-top:10px">Tempel hasil dari AI di sini<textarea id="kl-si" class="inp" rows="6"></textarea></label>
    <div class="row" style="margin-top:10px"><button class="btn gold" onclick="simpanNote('${jenis}')">💾 Simpan ke Catatan Saya</button></div></div>`;
window.bukaAI = function (w) {
  const p = $('kl-out').textContent;
  window.open((w === 'claude' ? 'https://claude.ai/new?q=' : 'https://chatgpt.com/?q=') + encodeURIComponent(p), '_blank');
};
window.simpanNote = function (jenis) {
  const isi = $('kl-si').value.trim();
  if (!isi) { toast('Isi catatan masih kosong'); return; }
  NOTES.unshift({ id: Date.now(), tgl: todayStr(), judul: $('kl-sj').value.trim() || '(tanpa judul)', pemateri: $('kl-sp').value.trim(), jenis, isi, upd: Date.now() });
  saveNotes(); toast('✓ Catatan tersimpan'); kul.sub = 'catatan'; kulRender();
};

function kKultum() {
  $('kul-body').innerHTML = `
  <div class="card"><div class="ttl">✨ PEMBUAT PROMPT KULTUM</div>
    <p class="xs muted" style="margin:4px 0 12px">Isi data → prompt tersusun otomatis → salin ke AI.</p>
    <div class="grid g3">
      <label class="fld">Tema<input id="kl-tema" class="inp" placeholder="mis. Sabar dalam ujian" oninput="kBuat()"></label>
      <label class="fld">Jenis acara<select id="kl-jenis" class="inp" onchange="kBuat()">${opt(['Kultum setelah Subuh', 'Kultum Ramadhan / Tarawih', 'Khutbah Jumat singkat', 'Kultum Dhuha', 'Kultum Maghrib', 'Kultum umum'])}</select></label>
      <label class="fld">Durasi (menit)<select id="kl-durasi" class="inp" onchange="kBuat()">${[3, 5, 7, 10, 15].map(x => `<option value="${x}" ${x === 7 ? 'selected' : ''}>${x} menit</option>`).join('')}</select></label>
      <label class="fld">Pendengar<select id="kl-aud" class="inp" onchange="kBuat()">${opt(['Jamaah umum', 'Remaja / pemuda', 'Anak-anak', 'Ibu-ibu majelis taklim', 'Karyawan / kantor', 'Lansia'])}</select></label>
      <label class="fld">Gaya<select id="kl-gaya" class="inp" onchange="kBuat()">${opt(['Santai dan hangat', 'Menyentuh hati', 'Tegas namun santun', 'Ringan dan mudah diingat'])}</select></label>
      <label class="fld">Bahasa<select id="kl-bhs" class="inp" onchange="kBuat()">${opt(['Indonesia baku', 'Indonesia santai', 'Indonesia dengan sisipan Jawa halus'])}</select></label>
    </div>
    <div class="row" style="margin-top:8px">
      <label class="sw"><input type="checkbox" id="kl-kisah" checked onchange="kBuat()"> Sertakan kisah</label>
      <label class="sw"><input type="checkbox" id="kl-arab" checked onchange="kBuat()"> Teks Arab dalil + terjemah</label>
      <label class="sw"><input type="checkbox" id="kl-humor" onchange="kBuat()"> Humor ringan</label>
    </div>
  </div>
  ${kotakOut()}${kotakSimpan('Kultum')}`;
  kBuat();
}
window.kBuat = function () {
  const v = id => $(id).value.trim(), c = id => $(id).checked;
  const dur = +v('kl-durasi'), kata = Math.round(dur * 130);
  const tema = v('kl-tema') || '(isi tema, mis. Sabar dalam ujian)';
  const ops = [];
  if (c('kl-kisah')) ops.push('- Sertakan satu kisah singkat (nabi/sahabat/teladan) yang relevan dan terpercaya.');
  if (c('kl-arab')) ops.push('- Tulis teks Arab dalil disertai terjemahan Indonesia.');
  if (c('kl-humor')) ops.push('- Boleh selipkan humor ringan yang sopan, tanpa merendahkan siapa pun.');
  $('kl-out').textContent = `Peran: Kamu penulis naskah ceramah (kultum) yang berilmu, santun, dan sangat berhati-hati dalam menyebut dalil.

TUGAS
Tulis naskah kultum siap baca dengan data berikut:
- Tema: ${tema}
- Jenis acara: ${v('kl-jenis')}
- Durasi: sekitar ${dur} menit (±${kata} kata)
- Pendengar: ${v('kl-aud')}
- Gaya penyampaian: ${v('kl-gaya')}
- Bahasa: ${v('kl-bhs')}

STRUKTUR
1. Salam, hamdalah, dan shalawat singkat.
2. Pembuka yang menarik perhatian (pertanyaan, kejadian sehari-hari, atau kisah singkat).
3. Isi: 3 poin utama, masing-masing disertai dalil dan penjelasan sederhana.
4. Penerapan praktis: 2–3 langkah yang bisa dilakukan hari ini.
5. Penutup: kesimpulan satu kalimat, doa, dan salam.

ATURAN DALIL (WAJIB)
- Hanya gunakan ayat Al-Qur'an dan hadis yang kamu yakin keberadaannya. Tulis nama surah dan nomor ayat; untuk hadis tulis perawi dan nomor bila tahu.
- Jangan mengarang dalil, kisah, atau ucapan ulama. Jika ragu, tulis "[perlu diverifikasi]" di sampingnya.
- Hindari hadis dhaif/maudhu'; utamakan Bukhari, Muslim, dan hadis shahih lainnya.
- Hindari isu khilafiyah tajam, takfir, dan politik praktis.
${ops.join('\n')}

FORMAT KELUARAN
a) Judul kultum
b) Naskah lengkap
c) Poin ringkas 5 baris untuk dibawa di kertas
d) Daftar semua dalil beserta sumbernya agar saya bisa memverifikasi`;
};

const FORMAT_R = {
  'Ringkasan poin': 'Buat ringkasan 7–10 poin inti, berurutan sesuai penyampaian.',
  'Poin + hikmah + amalan': 'Buat: (1) ringkasan 5–8 poin inti, (2) 3 hikmah utama, (3) 3 amalan yang bisa dipraktikkan minggu ini.',
  'Kultum 5 menit': 'Ubah isi pengajian menjadi naskah kultum 5 menit (±650 kata) dengan salam pembuka dan penutup.',
  'Kartu muhasabah': 'Buat kartu muhasabah: 5 pertanyaan renungan untuk diri sendiri dan 3 komitmen kecil beserta cara mengukurnya.'
};
function kRangkum() {
  $('kul-body').innerHTML = `
  <div class="card"><div class="ttl">📝 RANGKUM CATATAN PENGAJIAN</div>
    <p class="xs muted" style="margin:4px 0 12px">Tempel catatan mentah / transkrip, pilih format, salin prompt ke AI.</p>
    <div class="grid g3">
      <label class="fld">Judul / tema<input id="kl-rj" class="inp" oninput="rBuat()"></label>
      <label class="fld">Pemateri<input id="kl-rp" class="inp" oninput="rBuat()"></label>
      <label class="fld">Tanggal<input id="kl-rt" type="date" class="inp" value="${todayStr()}" oninput="rBuat()"></label>
      <label class="fld">Tempat / sumber<input id="kl-rs" class="inp" placeholder="mis. Masjid Al-Hidayah / kajian YouTube" oninput="rBuat()"></label>
      <label class="fld">Format hasil<select id="kl-rf" class="inp" onchange="rBuat()">${opt(Object.keys(FORMAT_R))}</select></label>
    </div>
    <label class="fld" style="margin-top:10px">Catatan mentah / transkrip<textarea id="kl-rc" class="inp" rows="8" placeholder="Tempel catatan Anda di sini…" oninput="rBuat()"></textarea></label>
  </div>
  ${kotakOut()}${kotakSimpan('Rangkuman')}`;
  rBuat();
}
window.rBuat = function () {
  const v = id => $(id).value.trim();
  $('kl-out').textContent = `Peran: Kamu asisten pencatat pengajian yang teliti dan jujur.

DATA PENGAJIAN
- Judul/tema: ${v('kl-rj') || '-'}
- Pemateri: ${v('kl-rp') || '-'}
- Tanggal: ${v('kl-rt') || '-'}
- Tempat/sumber: ${v('kl-rs') || '-'}

CATATAN MENTAH (bisa berantakan atau berupa transkrip):
"""
${v('kl-rc') || '(tempel catatan di sini)'}
"""

TUGAS
${FORMAT_R[v('kl-rf')]}

ATURAN
- Hanya rangkum isi yang ada di catatan; jangan menambah fakta atau dalil sendiri. Jika menambahkan penjelasan dari luar catatan, tandai "[tambahan AI]".
- Perbaiki salah ketik dan ejaan Arab-Latin seperlunya; tandai bagian yang tidak jelas dengan "[tidak jelas]".
- Gunakan bahasa Indonesia yang ringkas dan rapi.
- Di akhir, daftar semua dalil yang disebut pemateri agar saya bisa memeriksanya kembali.`;
};

function kCatatan() {
  $('kul-body').innerHTML = `<input id="kl-q" class="inp" placeholder="Cari catatan…" oninput="kList()"><div id="kl-list" class="view"></div>`;
  kList();
}
window.kList = function () {
  const q = ($('kl-q').value || '').toLowerCase();
  $('kl-list').innerHTML = NOTES.filter(n => !q || (n.judul + ' ' + n.pemateri + ' ' + n.isi).toLowerCase().includes(q)).map(n => `
    <div class="card2"><div class="row between"><b class="gold2">${esc(n.judul)}</b><span class="pill">${esc(n.jenis)}</span></div>
      <div class="xs muted">${esc(n.tgl)}${n.pemateri ? ' · ' + esc(n.pemateri) : ''}</div>
      <details style="margin-top:8px"><summary class="sm gold2" style="cursor:pointer">Lihat isi</summary><div class="pre" style="margin-top:8px">${esc(n.isi)}</div></details>
      <div class="row" style="margin-top:8px"><button class="btn" onclick="salinNote(${n.id})">Salin</button><button class="btn" onclick="hapusNote(${n.id})">🗑 Hapus</button></div></div>`).join('')
    || '<div class="spin" style="animation:none">Belum ada catatan.</div>';
};
window.salinNote = id => { const n = NOTES.find(x => x.id === id); if (n) salin(n.isi); };
window.hapusNote = id => {
  if (!confirm('Hapus catatan ini?')) return;
  NOTES = NOTES.filter(n => n.id !== id); addTomb(id); saveNotes(); kulRender();
};

})();
