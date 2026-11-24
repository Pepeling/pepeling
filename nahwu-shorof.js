/* =====================================================================
   PEPELING — Modul Belajar Bahasa Arab (Nahwu & Shorof) untuk pemula
   Cara pasang: simpan file ini sebagai nahwu-shorof.js di folder yang sama
   dengan index.html, lalu tambahkan SATU baris ini sebelum </body>
   (setelah pepeling-plus.js):
       <script src="nahwu-shorof.js"></script>
   Modul ini menambah tab "BAHASA ARAB" sendiri; kode lama tidak diubah.
   Progres tersimpan di localStorage (kunci: pepeling-arab).
   ===================================================================== */
(function () {
'use strict';
if (window.__nsLoaded) return; window.__nsLoaded = true;

/* ---------- Utilitas mandiri ---------- */
const $ = id => document.getElementById(id);
const KEY = 'pepeling-arab';
const DEF = { done: {}, st: { h: { b: 0, s: 0 }, k: { b: 0, s: 0 }, u: { b: 0, s: 0 } }, ok: {}, bad: {}, intip: 0, poin: 0, sesi: [], best: 0 };
const clone = o => JSON.parse(JSON.stringify(o));
function load() { try { const v = JSON.parse(localStorage.getItem(KEY)); return Object.assign(clone(DEF), v || {}); } catch (e) { return clone(DEF); } }
let S = load();
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
function say(m) { const t = $('toast'); if (!t) return; t.innerText = m; t.style.display = 'block'; clearTimeout(say.h); say.h = setTimeout(() => t.style.display = 'none', 2200); }
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick1 = a => a[Math.floor(Math.random() * a.length)];
const todayISO = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

/* ---------- Helper tampilan materi ---------- */
const A = (t, c) => `<span class="ns-ar ${c || ''}">${t}</span>`;
const ex = (ar, id, note) => `<div class="ns-ex"><div class="ns-ar ns-big">${ar}</div><div><b>${id}</b>${note ? `<div class="xs muted">${note}</div>` : ''}</div></div>`;
const tip = t => `<div class="ns-tip">💡 ${t}</div>`;
const warn = t => `<div class="ns-tip ns-warn">⚠️ ${t}</div>`;
const tbl = (head, rows) => `<div class="ns-tbl"><table><thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;

/* ---------- Bedah kalimat (Level 4) ---------- */
const SENT = {};
function sent(id, ar, ter, words) {
  SENT[id] = words;
  return `<div class="ns-sent card2">
    <div class="ns-chips">${words.map((w, i) => `<button class="ns-chip ${i === 0 ? 'on' : ''}" data-s="${id}" data-i="${i}" onclick="nsChip('${id}',${i})">${w[0]}</button>`).join('')}</div>
    <div class="ns-detail" id="d-${id}">${chipDetail(words[0])}</div>
    <div class="xs muted" style="margin-top:8px">Terjemah: <i>${ter}</i></div></div>`;
}
function chipDetail(w) { return `<div class="ns-ar ns-big" style="text-align:center">${w[0]}</div><div class="sm"><b class="gold2">Arti:</b> ${w[1]}</div><div class="sm" style="margin-top:4px"><b class="gold2">I'rab ringkas:</b> ${w[2]}</div>`; }
window.nsChip = function (id, i) {
  const d = $('d-' + id); if (!d) return; d.innerHTML = chipDetail(SENT[id][i]);
  document.querySelectorAll(`.ns-chip[data-s="${id}"]`).forEach(b => b.classList.toggle('on', +b.dataset.i === i));
};

/* ===================== KURIKULUM ===================== */
const LV = [
{ judul: 'Pengenalan Kata (Al-Kalimah)', ikon: '🔤', ket: 'Isim, fi\'il, huruf — dan ciri praktisnya', les: [
 { id: '1.1', judul: 'Tiga Golongan Kata', body: () => `
  <p>Dalam bahasa Arab, <b>setiap kata</b> pasti masuk salah satu dari tiga golongan. Mengenali golongannya adalah langkah pertama membaca kitab gundul.</p>
  ${tbl(['Golongan', 'Artinya', 'Contoh'], [
   ['<b>Isim</b>', 'Kata benda, nama, sifat', A('رَبٌّ') + ' · ' + A('عِلْمٌ') + ' · ' + A('اللَّهُ')],
   ['<b>Fi\'il</b>', 'Kata kerja (ada perbuatan + waktu)', A('كَتَبَ') + ' · ' + A('يَعْلَمُ') + ' · ' + A('اُكْتُبْ')],
   ['<b>Huruf</b>', 'Kata tugas (di, ke, dari, dan, tidak) — baru bermakna jika bersama kata lain', A('فِي') + ' · ' + A('مِنْ') + ' · ' + A('وَ')]])}
  <h4 class="cz gold2">Contoh dari kitab Ushul Tsalatsah</h4>
  ${ex('اِعْلَمْ', 'Ketahuilah', 'fi\'il (kata kerja perintah)')}
  ${ex('اللَّهُ', 'Allah', 'isim')}
  ${ex('عَلَيْنَا', 'atas kita', 'huruf ' + A('عَلَى') + ' + kata ganti ' + A('نَا'))}
  ${tip('Bayangkan kalimat seperti rumah: <b>isim</b> = perabot (benda), <b>fi\'il</b> = orang yang bergerak, <b>huruf</b> = paku/penyambung.')}` },
 { id: '1.2', judul: 'Ciri-ciri Isim', body: () => `
  <p>Cara paling mudah mengenali isim adalah lewat <b>tanda-tandanya</b>. Cukup salah satu tanda ada, kata itu pasti isim.</p>
  ${tbl(['Ciri', 'Contoh', 'Keterangan'], [
   ['Berakhiran <b>tanwin</b>', A('كِتَابٌ') + ' ' + A('رَجُلٍ'), 'ـٌ ـً ـٍ di akhir kata'],
   ['Diawali <b>ال</b> (Al)', A('الْعِلْمُ') + ' ' + A('الدِّينُ'), '“si/sang/yang tertentu”'],
   ['Didahului <b>huruf jar</b>', A('فِي الْبَيْتِ'), 'di/ke/dari + isim'],
   ['Bisa <b>dipanggil</b> (nida\')', A('يَا رَبِّ'), 'ya + isim'],
   ['Bisa <b>disandari</b> (idhafah)', A('رَبُّ الْعَالَمِينَ'), 'kata pertama menyandar ke kata kedua']])}
  ${tip('Cara cepat: kalau di depan kata itu bisa disisipi “<b>di / ke / dari</b>” dan masuk akal, ia pasti isim.')}
  <h4 class="cz gold2">Coba kenali</h4>
  ${ex('الْإِسْلَامُ', 'isim', 'ada awalan ' + A('ال'))}
  ${ex('رَسُولٌ', 'isim', 'ada tanwin')}
  ${ex('بِالْأَدِلَّةِ', 'isim (dengan huruf jar)', A('بِ') + ' + ' + A('الْأَدِلَّةِ'))}` },
 { id: '1.3', judul: 'Ciri Fi\'il & Huruf', body: () => `
  <h4 class="cz gold2">Ciri fi'il</h4>
  ${tbl(['Ciri', 'Contoh'], [
   ['Didahului <b>قَدْ</b>', A('قَدْ عَلِمَ') + ' (sungguh ia telah tahu)'],
   ['Didahului <b>سَـ / سَوْفَ</b> (akan)', A('سَيَعْلَمُ') + ' (ia akan tahu)'],
   ['Berakhiran <b>ta\' sakinah</b> (ـتْ)', A('كَتَبَتْ') + ' (dia perempuan menulis)'],
   ['Berakhiran <b>ta\' pelaku</b> (ـتُ ـتَ)', A('عَلِمْتُ') + ' (aku tahu) · ' + A('كَتَبْتَ') + ' (kamu menulis)']])}
  <p>Fi'il perintah (<i>amr</i>) dikenali dari maknanya (“lakukan!”) dan bisa diberi ya' mukhatabah: ${A('اِعْلَمْ')} → ${A('اِعْلَمِي')}.</p>
  <h4 class="cz gold2">Ciri huruf</h4>
  <p><b>Huruf</b> = kata yang <u>tidak punya ciri isim maupun fi'il</u>. Contoh: ${A('مِنْ')} ${A('إِلَى')} ${A('فِي')} ${A('عَلَى')} ${A('وَ')} ${A('لَمْ')} ${A('لَنْ')} ${A('إِنَّ')} ${A('أَنَّ')}.</p>
  <h4 class="cz gold2">Alur 3 langkah</h4>
  <ol class="sm" style="line-height:1.8"><li>Ada tanwin / ال / huruf jar di depannya? → <b>Isim</b></li><li>Ada قد / سـ / ta' sakinah / ta' pelaku? → <b>Fi'il</b></li><li>Bukan keduanya → <b>Huruf</b></li></ol>
  <h4 class="cz gold2">Latihan mata: ${A('اِعْلَمْ رَحِمَكَ اللَّهُ')}</h4>
  ${tbl(['Kata', 'Golongan', 'Alasan'], [[A('اِعْلَمْ'), 'Fi\'il amr', 'perintah “ketahuilah”'], [A('رَحِمَكَ'), 'Fi\'il madhi', 'lampau, makna doa “semoga merahmatimu”'], [A('اللَّهُ'), 'Isim', 'nama/benda, bukan perbuatan']])}` }
]},
{ judul: 'Pondasi Shorof (Perubahan Kata)', ikon: '🔁', ket: 'Madhi, mudhari\', amr, dan pelaku (dhamir)', les: [
 { id: '2.1', judul: 'Tiga Bentuk Fi\'il', body: () => `
  <p>Satu kata kerja punya tiga “wajah” menurut waktunya:</p>
  ${tbl(['Madhi (lampau)', 'Mudhari\' (kini/akan)', 'Amr (perintah)', 'Arti'], [
   [A('كَتَبَ'), A('يَكْتُبُ'), A('اُكْتُبْ'), 'menulis'], [A('ضَرَبَ'), A('يَضْرِبُ'), A('اِضْرِبْ'), 'memukul'],
   [A('عَلِمَ'), A('يَعْلَمُ'), A('اِعْلَمْ'), 'mengetahui'], [A('فَتَحَ'), A('يَفْتَحُ'), A('اِفْتَحْ'), 'membuka'],
   [A('خَلَقَ'), A('يَخْلُقُ'), A('اُخْلُقْ'), 'menciptakan'], [A('رَحِمَ'), A('يَرْحَمُ'), A('اِرْحَمْ'), 'merahmati'],
   [A('عَبَدَ'), A('يَعْبُدُ'), A('اُعْبُدْ'), 'menyembah']])}
  <h4 class="cz gold2">Ciri praktis</h4>
  <ul class="sm" style="line-height:1.8"><li><b>Madhi</b>: bentuk dasar, akhir berharakat <i>fathah</i> (${A('كَتَبَ')}).</li><li><b>Mudhari'</b>: diawali salah satu huruf <b>أ ن ي ت</b> (${A('يَكْتُبُ')}, ${A('نَكْتُبُ')}, ${A('تَكْتُبُ')}, ${A('أَكْتُبُ')}); akhir biasanya dhammah.</li><li><b>Amr</b>: akhir <i>sukun</i>, dan diawali hamzah (${A('اُكْتُبْ')}).</li></ul>
  ${tip('Dalam Ushul Tsalatsah: ' + A('اِعْلَمْ') + ' (amr), ' + A('رَحِمَكَ') + ' (madhi), ' + A('يَجِبُ') + ' (mudhari\'), ' + A('خَلَقْتُ') + ' (madhi).')}` },
 { id: '2.2', judul: 'Pelaku Perbuatan (Dhamir)', body: () => `
  <p>Akhiran kata kerja memberi tahu <b>siapa pelakunya</b>. Contoh tabel dengan ${A('كَتَبَ')} (menulis):</p>
  ${tbl(['Pelaku', 'Arti', 'Madhi', 'Mudhari\''], [
   [A('هُوَ'), 'dia (lk)', A('كَتَبَ'), A('يَكْتُبُ')], [A('هُمَا'), 'mereka berdua (lk)', A('كَتَبَا'), A('يَكْتُبَانِ')], [A('هُمْ'), 'mereka (lk)', A('كَتَبُوا'), A('يَكْتُبُونَ')],
   [A('هِيَ'), 'dia (pr)', A('كَتَبَتْ'), A('تَكْتُبُ')], [A('هُمَا'), 'mereka berdua (pr)', A('كَتَبَتَا'), A('تَكْتُبَانِ')], [A('هُنَّ'), 'mereka (pr)', A('كَتَبْنَ'), A('يَكْتُبْنَ')],
   [A('أَنْتَ'), 'kamu (lk)', A('كَتَبْتَ'), A('تَكْتُبُ')], [A('أَنْتُمَا'), 'kalian berdua (lk)', A('كَتَبْتُمَا'), A('تَكْتُبَانِ')], [A('أَنْتُمْ'), 'kalian (lk)', A('كَتَبْتُمْ'), A('تَكْتُبُونَ')],
   [A('أَنْتِ'), 'kamu (pr)', A('كَتَبْتِ'), A('تَكْتُبِينَ')], [A('أَنْتُمَا'), 'kalian berdua (pr)', A('كَتَبْتُمَا'), A('تَكْتُبَانِ')], [A('أَنْتُنَّ'), 'kalian (pr)', A('كَتَبْتُنَّ'), A('تَكْتُبْنَ')],
   [A('أَنَا'), 'aku', A('كَتَبْتُ'), A('أَكْتُبُ')], [A('نَحْنُ'), 'kami/kita', A('كَتَبْنَا'), A('نَكْتُبُ')]])}
  ${tip('Untuk pemula, hafalkan dulu <b>akhiran madhi</b>: ' + A('ـَ') + ' (dia) · ' + A('ـَتْ') + ' (dia pr) · ' + A('ـُوا') + ' (mereka) · ' + A('ـْتَ') + ' (kamu) · ' + A('ـْتُ') + ' (aku) · ' + A('ـْنَا') + ' (kami). Inilah yang paling sering muncul di kitab.')}` },
 { id: '2.3', judul: 'Kata Ganti Sambung', body: () => `
  <p>Kata ganti bisa <b>menempel</b> di akhir kata. Ini sangat sering di kitab:</p>
  ${tbl(['Menempel', 'Arti', 'Contoh dari kitab'], [
   [A('ـهُ / ـهِ'), '-nya (lk)', A('نَبِيِّهِ') + ' nabi-Nya/nabinya'], [A('ـهَا'), '-nya (pr)', A('عِلْمُهَا') + ' ilmunya'],
   [A('ـكَ'), '-mu (lk)', A('رَبُّكَ') + ' · ' + A('دِينُكَ') + ' · ' + A('نَبِيُّكَ')], [A('ـكِ'), '-mu (pr)', A('رَبُّكِ')],
   [A('ـكُمْ'), '-mu (kalian)', A('رَبُّكُمْ')], [A('ـي / ـيَ'), '-ku', A('رَبِّي') + ' · ' + A('دِينِي')],
   [A('ـنَا'), '-kami / kita', A('عَلَيْنَا') + ' atas kita'], [A('ـهُمْ'), '-mereka', A('أَيْدِيهِمْ')]])}
  <p class="sm">Bila menempel pada <b>fi'il</b>, ia menjadi objek: ${A('رَحِمَكَ اللَّهُ')} “Allah merahmatimu”. Bila menempel pada <b>isim</b>, ia menjadi kepemilikan: ${A('رَبُّكَ')} “Tuhanmu”.</p>
  ${warn('Huruf ' + A('ك') + ' pada ' + A('رَبُّكَ') + ' adalah kata ganti. Saat menentukan harakat kata, perhatikan huruf <b>sebelum</b> kata ganti.')}` }
]},
{ judul: 'Pondasi Nahwu (Jabatan & Harakat Akhir)', ikon: '🏛️', ket: 'I\'rab, mubtada\'-khabar, fi\'il-fa\'il-maf\'ul, huruf jar & idhafah', les: [
 { id: '3.1', judul: 'Empat Harakat Akhir (I\'rab)', body: () => `
  <p>Inilah inti “baca gundul”: <b>harakat akhir kata ditentukan oleh jabatannya</b> dalam kalimat.</p>
  ${tbl(['I\'rab', 'Harakat', 'Biasanya untuk', 'Contoh'], [
   ['<b>Rafa\'</b>', 'dhammah ' + A('ـُ ـٌ'), 'mubtada\', khabar, fa\'il', A('الْعِلْمُ نُورٌ')],
   ['<b>Nashab</b>', 'fathah ' + A('ـَ ـً'), 'maf\'ul bih (objek)', A('عَلِمْتُ الْحَقَّ')],
   ['<b>Jar</b>', 'kasrah ' + A('ـِ ـٍ'), 'setelah huruf jar & mudhaf ilaih', A('فِي الْمَسْجِدِ')],
   ['<b>Jazm</b>', 'sukun ' + A('ـْ'), 'fi\'il mudhari\' setelah ' + A('لَمْ'), A('لَمْ يَكْتُبْ')]])}
  <p class="sm">Contoh satu kata, tiga harakat: ${A('الطَّالِبُ')} (pelaku) · ${A('الطَّالِبَ')} (objek) · ${A('الطَّالِبِ')} (setelah huruf jar).</p>
  ${tip('Kata yang <b>tidak berubah</b> disebut <i>mabni</i>: fi\'il madhi (fathah), fi\'il amr (sukun), dan kata tanya seperti ' + A('مَنْ') + ' (sukun).')}
  ${warn('Ada pengecualian (mis. kata pola ' + A('مَسَائِلَ') + ' dijarkan dengan fathah). Kita jumpai satu per satu saat membedah kitab.')}` },
 { id: '3.2', judul: 'Mubtada\' & Khabar', body: () => `
  <p>Kalimat tanpa kata kerja disebut <b>jumlah ismiyyah</b>. Ia terdiri dari:</p>
  <ul class="sm" style="line-height:1.8"><li><b>Mubtada'</b> = pokok/yang dibicarakan (awal kalimat)</li><li><b>Khabar</b> = keterangan/kabar tentangnya</li></ul>
  <p>Keduanya <b>marfu'</b> (dhammah).</p>
  ${ex('الْعِلْمُ نُورٌ', 'Ilmu adalah cahaya', 'الْعِلْمُ = mubtada\' · نُورٌ = khabar')}
  ${ex('اللَّهُ رَبُّنَا', 'Allah adalah Tuhan kita', 'اللَّهُ = mubtada\' · رَبُّنَا = khabar')}
  ${ex('دِينُنَا الْإِسْلَامُ', 'Agama kita adalah Islam', 'دِينُنَا = mubtada\' · الْإِسْلَامُ = khabar')}
  ${ex('الدِّينُ النَّصِيحَةُ', 'Agama adalah nasihat', 'hadis Arbain no. 7')}
  ${tip('Kata “adalah” tidak ditulis dalam bahasa Arab; ia tersirat. Saat menerjemah, <b>sisipkan sendiri</b> “adalah”.')}` },
 { id: '3.3', judul: 'Fi\'il – Fa\'il – Maf\'ul Bih', body: () => `
  <p>Kalimat berkata kerja (<b>jumlah fi'liyyah</b>) berpola: <b>Fi'il → Fa'il → Maf'ul bih</b>.</p>
  ${tbl(['Peran', 'Pertanyaan pemandu', 'I\'rab'], [['<b>Fa\'il</b>', 'Siapa pelakunya?', 'rafa\' (dhammah)'], ['<b>Maf\'ul bih</b>', 'Apa yang dikenai perbuatan?', 'nashab (fathah)']])}
  ${ex('كَتَبَ الطَّالِبُ الدَّرْسَ', 'Siswa itu menulis pelajaran', 'كَتَبَ fi\'il · الطَّالِبُ fa\'il (dhammah) · الدَّرْسَ maf\'ul bih (fathah)')}
  ${ex('خَلَقَ اللَّهُ الْإِنْسَانَ', 'Allah menciptakan manusia', 'اللَّهُ fa\'il · الْإِنْسَانَ maf\'ul bih')}
  ${ex('وَمَا خَلَقْتُ الْجِنَّ', 'Dan Aku tidak menciptakan jin', 'ـتُ fa\'il · الْجِنَّ maf\'ul bih (QS. Adz-Dzariyat: 56)')}
  ${tip('Urutan di kitab bisa berbeda, jadi pakai <b>pertanyaan pemandu</b>, bukan sekadar urutan kata.')}` },
 { id: '3.4', judul: 'Huruf Jar & Idhafah', body: () => `
  <h4 class="cz gold2">Huruf jar</h4>
  <p>Isim setelah huruf jar dibaca <b>majrur (kasrah)</b>.</p>
  ${tbl(['Huruf jar', 'Arti', 'Contoh'], [
   [A('مِنْ'), 'dari', A('مِنَ الْإِيمَانِ')], [A('إِلَى'), 'ke, hingga', A('إِلَى الْمَسْجِدِ')], [A('عَنْ'), 'dari, tentang', A('عَنِ الشِّرْكِ')],
   [A('عَلَى'), 'atas', A('عَلَى الْأَذَى')], [A('فِي'), 'di, dalam', A('فِي الْمَسْجِدِ')], [A('بِ'), 'dengan, di', A('بِالنِّيَّاتِ') + ' · ' + A('بِالْأَدِلَّةِ')],
   [A('لِ'), 'untuk, milik', A('لِلَّهِ')], [A('كَ'), 'seperti', A('كَالنُّورِ')]])}
  <h4 class="cz gold2">Idhafah (mudhaf – mudhaf ilaih)</h4>
  <p>Dua isim bersambung: yang pertama = <b>mudhaf</b>, yang kedua = <b>mudhaf ilaih</b> (selalu <b>kasrah/jar</b>).</p>
  ${ex('رَبُّ الْعَالَمِينَ', 'Tuhan semesta alam', 'رَبُّ mudhaf (ikut jabatannya) · الْعَالَمِينَ mudhaf ilaih (jar)')}
  ${ex('مَعْرِفَةُ اللَّهِ', 'mengenal Allah', 'اللَّهِ = mudhaf ilaih → kasrah')}
  ${ex('أَرْكَانُ الْإِسْلَامِ', 'rukun-rukun Islam', 'الْإِسْلَامِ = mudhaf ilaih → kasrah')}
  ${warn('<b>Mudhaf</b> tidak boleh bertanwin dan tidak boleh berawalan ' + A('ال') + '. Jadi kita katakan ' + A('رَسُولُ اللَّهِ') + ', bukan ' + A('الرَّسُولُ اللَّهِ') + '.')}` }
]},
{ judul: 'Bedah Teks Kitab Ringan', ikon: '📖', ket: 'Ushul Tsalatsah & hadis dasar — analisis kata demi kata', les: [
 { id: '4.1', judul: 'Ushul Tsalatsah: Pembukaan', body: () => `
  <p>Ketuk tiap kata untuk melihat <b>arti</b> dan <b>i'rab ringkas</b>-nya. Baca dari kanan ke kiri.</p>
  ${sent('s41a', 'اِعْلَمْ رَحِمَكَ اللَّهُ أَنَّهُ يَجِبُ عَلَيْنَا تَعَلُّمُ أَرْبَعِ مَسَائِلَ', 'Ketahuilah, semoga Allah merahmatimu, bahwa wajib atas kita mempelajari empat masalah.', [
   ['اِعْلَمْ', 'Ketahuilah', 'Fi\'il amr, <i>mabni</i> sukun. Pelakunya (kamu) tersembunyi.'],
   ['رَحِمَكَ', 'semoga (Allah) merahmatimu', 'Fi\'il madhi (doa), mabni fathah. <b>ـكَ</b> = maf\'ul bih (objek).'],
   ['اللَّهُ', 'Allah', '<b>Fa\'il</b> dari <i>rahima</i> → marfu\' dhammah.'],
   ['أَنَّهُ', 'bahwasanya (perkara ini)', 'Huruf <i>anna</i> + kata ganti <b>ـهُ</b> sebagai isimnya.'],
   ['يَجِبُ', 'wajib', 'Fi\'il mudhari\' → marfu\' dhammah.'],
   ['عَلَيْنَا', 'atas kita', 'Huruf jar <b>عَلَى</b> + kata ganti <b>نَا</b> (majrur).'],
   ['تَعَلُّمُ', 'mempelajari', '<b>Fa\'il</b> dari <i>yajibu</i> → marfu\' dhammah; ia <b>mudhaf</b>.'],
   ['أَرْبَعِ', 'empat', '<b>Mudhaf ilaih</b> → majrur kasrah; sekaligus mudhaf bagi kata berikutnya.'],
   ['مَسَائِلَ', 'masalah-masalah', '<b>Mudhaf ilaih</b> → majrur. Pengecualian: pola jamak ini dijarkan dengan <b>fathah</b>, bukan kasrah.']])}
  ${sent('s41b', 'وَهُوَ مَعْرِفَةُ اللَّهِ وَمَعْرِفَةُ نَبِيِّهِ وَمَعْرِفَةُ دِينِ الْإِسْلَامِ بِالْأَدِلَّةِ', 'Ia adalah mengenal Allah, mengenal Nabi-Nya, dan mengenal agama Islam dengan dalil-dalil.', [
   ['وَهُوَ', 'dan ia (ilmu itu)', 'Huruf <i>wawu</i> + dhamir <b>هُوَ</b> sebagai <b>mubtada\'</b>.'],
   ['مَعْرِفَةُ', 'mengenal', '<b>Khabar</b> → marfu\' dhammah; ia mudhaf.'],
   ['اللَّهِ', 'Allah', '<b>Mudhaf ilaih</b> → majrur kasrah.'],
   ['وَمَعْرِفَةُ', 'dan mengenal', '<i>Athaf</i> (sambungan) pada khabar → marfu\' dhammah.'],
   ['نَبِيِّهِ', 'Nabi-Nya', 'Mudhaf ilaih → kasrah; <b>ـهِ</b> = kata ganti “-Nya”.'],
   ['وَمَعْرِفَةُ', 'dan mengenal', '<i>Athaf</i> lagi → marfu\' dhammah.'],
   ['دِينِ', 'agama', '<b>Mudhaf ilaih</b> → kasrah; juga mudhaf.'],
   ['الْإِسْلَامِ', 'Islam', '<b>Mudhaf ilaih</b> → kasrah.'],
   ['بِالْأَدِلَّةِ', 'dengan dalil-dalil', 'Huruf jar <b>بِ</b> + isim majrur → kasrah.']])}
  ${tip('Pola “A-nya B-nya C-nya” (mudhaf–mudhaf ilaih beruntun) sangat sering. Kuncinya: <b>hanya mudhaf ilaih yang selalu kasrah</b>.')}` },
 { id: '4.2', judul: 'Ushul Tsalatsah: Tiga Pertanyaan', body: () => `
  <p>Tiga pertanyaan inti dalam kitab, plus satu ayat tentang tujuan penciptaan.</p>
  ${sent('s42a', 'مَنْ رَبُّكَ؟ فَقُلْ: رَبِّيَ اللَّهُ', 'Siapa Tuhanmu? Maka katakanlah: Tuhanku adalah Allah.', [
   ['مَنْ', 'siapa', 'Kata tanya, <i>mabni</i> sukun; berkedudukan mubtada\'.'],
   ['رَبُّكَ', 'Tuhanmu', '<b>Khabar</b> → marfu\' dhammah (pada ب). <b>ـكَ</b> kata ganti.'],
   ['فَقُلْ', 'maka katakanlah', 'Huruf <i>fa</i> + fi\'il amr, mabni sukun.'],
   ['رَبِّيَ', 'Tuhanku', '<b>Mubtada\'</b> (marfu\', dhammah tidak tampak karena huruf sebelum ya\' mesti kasrah).'],
   ['اللَّهُ', 'Allah', '<b>Khabar</b> → marfu\' dhammah.']])}
  ${sent('s42b', 'دِينِيَ الْإِسْلَامُ', 'Agamaku adalah Islam.', [
   ['دِينِيَ', 'agamaku', '<b>Mubtada\'</b> marfu\' (dhammah tidak tampak); <b>ـيَ</b> = “-ku”.'],
   ['الْإِسْلَامُ', 'Islam', '<b>Khabar</b> → marfu\' dhammah.']])}
  ${sent('s42c', 'مَنْ نَبِيُّكَ؟ فَقُلْ: مُحَمَّدٌ', 'Siapa nabimu? Maka katakanlah: Muhammad.', [
   ['مَنْ', 'siapa', 'Kata tanya mabni sukun (mubtada\').'],
   ['نَبِيُّكَ', 'nabimu', '<b>Khabar</b> → marfu\' dhammah (pada ي bersyaddah).'],
   ['فَقُلْ', 'maka katakanlah', 'Fa + fi\'il amr mabni sukun.'],
   ['مُحَمَّدٌ', 'Muhammad', '<b>Khabar</b> (dari mubtada\' tersirat “nabiku”) → marfu\' bertanwin dhammah.']])}
  ${sent('s42d', 'وَمَا خَلَقْتُ الْجِنَّ وَالْإِنْسَ إِلَّا لِيَعْبُدُونِ', 'Aku tidak menciptakan jin dan manusia melainkan agar mereka menyembah-Ku.', [
   ['وَمَا', 'dan tidak', 'Huruf <i>wawu</i> + <i>ma</i> nafi (penafian).'],
   ['خَلَقْتُ', 'Aku menciptakan', 'Fi\'il madhi; <b>ـتُ</b> = fa\'il (pelaku, “Aku”) dengan dhammah.'],
   ['الْجِنَّ', 'jin', '<b>Maf\'ul bih</b> → manshub fathah.'],
   ['وَالْإِنْسَ', 'dan manusia', '<i>Athaf</i> pada maf\'ul bih → manshub fathah.'],
   ['إِلَّا', 'kecuali / melainkan', 'Huruf <i>istitsna\'</i> (pengecualian).'],
   ['لِيَعْبُدُونِ', 'agar mereka menyembah-Ku', '<b>لِ</b> = “agar”, <b>يَعْبُدُونِ</b> = fi\'il mudhari\' “mereka menyembah”, <b>ـنِ/ـي</b> = “-Ku”. Bentuk lanjutan; cukup pahami maknanya dulu.']])}` },
 { id: '4.3', judul: 'Hadis Dasar: Aqidah, Akhlak, Fiqih', body: () => `
  <p>Ungkapan pendek yang sering ada di matan kitab-kitab dasar.</p>
  ${sent('s43a', 'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ', 'Sesungguhnya amal-amal itu tergantung niat. (Arbain no. 1)', [
   ['إِنَّمَا', 'sesungguhnya (hanyalah)', 'Huruf pembatas; kata setelahnya dibaca rafa\' sebagai mubtada\'.'],
   ['الْأَعْمَالُ', 'amal-amal', '<b>Mubtada\'</b> → marfu\' dhammah.'],
   ['بِالنِّيَّاتِ', 'dengan/tergantung niat', 'Huruf jar <b>بِ</b> + isim majrur kasrah; ia <i>khabar</i> (jar-majrur).']])}
  ${sent('s43b', 'الدِّينُ النَّصِيحَةُ', 'Agama adalah nasihat. (Arbain no. 7)', [
   ['الدِّينُ', 'agama', '<b>Mubtada\'</b> → marfu\' dhammah.'], ['النَّصِيحَةُ', 'nasihat', '<b>Khabar</b> → marfu\' dhammah.']])}
  ${sent('s43c', 'الْحَيَاءُ مِنَ الْإِيمَانِ', 'Malu itu sebagian dari iman. (Akhlak; HR. Bukhari & Muslim)', [
   ['الْحَيَاءُ', 'rasa malu', '<b>Mubtada\'</b> → marfu\' dhammah.'], ['مِنَ', 'sebagian dari', 'Huruf jar.'], ['الْإِيمَانِ', 'iman', 'Majrur oleh huruf jar → kasrah.']])}
  ${sent('s43d', 'الطُّهُورُ شَطْرُ الْإِيمَانِ', 'Bersuci adalah setengah dari iman. (Fiqih thaharah; HR. Muslim)', [
   ['الطُّهُورُ', 'bersuci', '<b>Mubtada\'</b> → marfu\' dhammah.'], ['شَطْرُ', 'setengah', '<b>Khabar</b> → marfu\'; ia mudhaf.'], ['الْإِيمَانِ', 'iman', '<b>Mudhaf ilaih</b> → kasrah.']])}
  ${sent('s43e', 'أَرْكَانُ الْإِسْلَامِ خَمْسَةٌ', 'Rukun Islam ada lima. (Ungkapan umum di matan aqidah/fiqih dasar)', [
   ['أَرْكَانُ', 'rukun-rukun', '<b>Mubtada\'</b> → marfu\' dhammah; mudhaf.'], ['الْإِسْلَامِ', 'Islam', '<b>Mudhaf ilaih</b> → kasrah.'], ['خَمْسَةٌ', 'lima', '<b>Khabar</b> → marfu\' bertanwin dhammah.']])}
  ${sent('s43f', 'الْكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ', 'Perkataan yang baik adalah sedekah. (Akhlak; HR. Bukhari & Muslim)', [
   ['الْكَلِمَةُ', 'perkataan', '<b>Mubtada\'</b> → marfu\' dhammah.'], ['الطَّيِّبَةُ', 'yang baik', '<i>Na\'at</i> (sifat); ikut mubtada\' → marfu\' dhammah.'], ['صَدَقَةٌ', 'sedekah', '<b>Khabar</b> → marfu\' tanwin dhammah.']])}
  ${tip('Setelah level ini, kamu sudah bisa membaca ungkapan dasar sendiri. Lanjut ke tab <b>Latihan</b> untuk mengasah!')}` }
]}
];
const TOTAL_LES = LV.reduce((a, l) => a + l.les.length, 0);

/* ===================== BANK SOAL ===================== */
const HAR = [['d', 'Dhammah', 'ـُ'], ['f', 'Fathah', 'ـَ'], ['k', 'Kasrah', 'ـِ'], ['s', 'Sukun', 'ـْ']];
// g = gundul, v = berharakat, t = indeks kata target, p = posisi huruf (default: huruf terakhir), a = jawaban
const HK = [
 { id: 'h1', g: 'الحمد لله رب العالمين', v: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', t: 0, a: 'd', r: 'Kata «الحمد» adalah mubtada\' (pokok kalimat) → rafa\' → dibaca dhammah.', s: 'Al-Fatihah' },
 { id: 'h2', g: 'الحمد لله رب العالمين', v: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', t: 1, a: 'k', r: 'Dibaca kasrah karena didahului huruf jar <b>لِ</b> (lam) → majrur.', s: 'Al-Fatihah' },
 { id: 'h3', g: 'من ربك', v: 'مَنْ رَبُّكَ', t: 1, p: 1, a: 'd', r: '«رب» adalah khabar → rafa\' → dhammah pada huruf ب. Huruf ك hanya kata ganti “-mu”, jadi tidak dihitung.', s: 'Ushul Tsalatsah' },
 { id: 'h4', g: 'من نبيك', v: 'مَنْ نَبِيُّكَ', t: 0, a: 's', r: '«مَنْ» (siapa) adalah kata <i>mabni</i> (tidak berubah); akhirnya selalu sukun.', s: 'Ushul Tsalatsah' },
 { id: 'h5', g: 'اعلم رحمك الله', v: 'اِعْلَمْ رَحِمَكَ اللَّهُ', t: 0, a: 's', r: 'Fi\'il amr (kata perintah) bersifat <i>mabni</i> → akhirnya sukun.', s: 'Ushul Tsalatsah' },
 { id: 'h6', g: 'اعلم رحمك الله', v: 'اِعْلَمْ رَحِمَكَ اللَّهُ', t: 2, a: 'd', r: '«اللهُ» adalah fa\'il (pelaku “merahmati”) → rafa\' → dhammah.', s: 'Ushul Tsalatsah' },
 { id: 'h7', g: 'يجب علينا تعلم أربع مسائل', v: 'يَجِبُ عَلَيْنَا تَعَلُّمُ أَرْبَعِ مَسَائِلَ', t: 0, a: 'd', r: 'Fi\'il mudhari\' yang tidak didahului pengaruh (لم، لن، أن) → marfu\' → dhammah.', s: 'Ushul Tsalatsah' },
 { id: 'h8', g: 'يجب علينا تعلم أربع مسائل', v: 'يَجِبُ عَلَيْنَا تَعَلُّمُ أَرْبَعِ مَسَائِلَ', t: 3, a: 'k', r: '«أربع» adalah mudhaf ilaih (disandari «تعلم») → majrur → kasrah.', s: 'Ushul Tsalatsah' },
 { id: 'h9', g: 'العلم معرفة الله', v: 'الْعِلْمُ مَعْرِفَةُ اللَّهِ', t: 2, a: 'k', r: '«الله» adalah mudhaf ilaih dari «معرفة» → majrur → kasrah.', s: 'Ushul Tsalatsah' },
 { id: 'h10', g: 'وما خلقت الجن والإنس إلا ليعبدون', v: 'وَمَا خَلَقْتُ الْجِنَّ وَالْإِنْسَ إِلَّا لِيَعْبُدُونِ', t: 2, a: 'f', r: '«الجن» adalah maf\'ul bih (objek) → manshub → fathah.', s: 'QS. Adz-Dzariyat: 56' },
 { id: 'h11', g: 'وما خلقت الجن والإنس إلا ليعبدون', v: 'وَمَا خَلَقْتُ الْجِنَّ وَالْإِنْسَ إِلَّا لِيَعْبُدُونِ', t: 1, a: 'd', r: 'Huruf <b>ت</b> di akhir adalah dhamir pelaku “Aku” (ta\' mutakallim) → dibaca dhammah.', s: 'QS. Adz-Dzariyat: 56' },
 { id: 'h12', g: 'إنما الأعمال بالنيات', v: 'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ', t: 1, a: 'd', r: 'Setelah «إنما», «الأعمال» menjadi mubtada\' → rafa\' → dhammah.', s: 'Arbain no. 1' },
 { id: 'h13', g: 'إنما الأعمال بالنيات', v: 'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ', t: 2, a: 'k', r: 'Dibaca kasrah karena didahului huruf jar <b>بِ</b>.', s: 'Arbain no. 1' },
 { id: 'h14', g: 'الدين النصيحة', v: 'الدِّينُ النَّصِيحَةُ', t: 0, a: 'd', r: 'Mubtada\' (pokok kalimat) → rafa\' → dhammah.', s: 'Arbain no. 7' },
 { id: 'h15', g: 'الدين النصيحة', v: 'الدِّينُ النَّصِيحَةُ', t: 1, a: 'd', r: 'Khabar (keterangan) → rafa\' → dhammah. Mubtada\' dan khabar sama-sama marfu\'.', s: 'Arbain no. 7' },
 { id: 'h16', g: 'الحياء من الإيمان', v: 'الْحَيَاءُ مِنَ الْإِيمَانِ', t: 2, a: 'k', r: 'Didahului huruf jar <b>مِنْ</b> → majrur → kasrah.', s: 'Akhlak — HR. Bukhari & Muslim' },
 { id: 'h17', g: 'أركان الإسلام خمسة', v: 'أَرْكَانُ الْإِسْلَامِ خَمْسَةٌ', t: 1, a: 'k', r: '«الإسلام» adalah mudhaf ilaih → majrur → kasrah.', s: 'Aqidah/Fiqih dasar' },
 { id: 'h18', g: 'كتب الطالب الدرس', v: 'كَتَبَ الطَّالِبُ الدَّرْسَ', t: 0, a: 'f', r: 'Fi\'il madhi bersifat <i>mabni</i> → akhirnya fathah.', s: 'Contoh nahwu' },
 { id: 'h19', g: 'كتب الطالب الدرس', v: 'كَتَبَ الطَّالِبُ الدَّرْسَ', t: 1, a: 'd', r: '«الطالب» adalah fa\'il (pelaku menulis) → rafa\' → dhammah.', s: 'Contoh nahwu' },
 { id: 'h20', g: 'كتب الطالب الدرس', v: 'كَتَبَ الطَّالِبُ الدَّرْسَ', t: 2, a: 'f', r: '«الدرس» adalah maf\'ul bih (objek) → nashab → fathah.', s: 'Contoh nahwu' },
 { id: 'h21', g: 'الكلمة الطيبة صدقة', v: 'الْكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ', t: 2, a: 'd', r: '«صدقة» adalah khabar → rafa\' → dhammah (di sini berbentuk tanwin ـٌ).', s: 'Akhlak — HR. Bukhari & Muslim' },
 { id: 'h22', g: 'الطهور شطر الإيمان', v: 'الطُّهُورُ شَطْرُ الْإِيمَانِ', t: 1, a: 'd', r: '«شطر» adalah khabar → rafa\' → dhammah. (Ia mudhaf; «الإيمان» mudhaf ilaih → kasrah.)', s: 'Fiqih thaharah — HR. Muslim' }
];
// Kosakata kunci: [Arab berharakat, arti, sumber]
const VO = [
 ['رَبّ', 'Tuhan, Pemelihara'], ['دِين', 'agama'], ['نَبِيّ', 'nabi'], ['عِلْم', 'ilmu'], ['عَمَل', 'amal, perbuatan'], ['دَعْوَة', 'dakwah, seruan'],
 ['صَبْر', 'sabar'], ['أَذَى', 'gangguan, sakit hati'], ['عِبَادَة', 'ibadah, penghambaan'], ['تَوْحِيد', 'mengesakan Allah'], ['شِرْك', 'menyekutukan Allah'],
 ['طَاعَة', 'ketaatan'], ['دَلِيل', 'dalil, bukti'], ['مَسْأَلَة', 'masalah, persoalan'], ['يَجِبُ', 'wajib, harus'], ['اِعْلَمْ', 'ketahuilah'],
 ['رَحِمَ', 'merahmati'], ['خَلَقَ', 'menciptakan'], ['الْعَالَمِينَ', 'seluruh alam'], ['نِيَّة', 'niat'], ['حَيَاء', 'rasa malu'], ['صَدَقَة', 'sedekah'],
 ['طَهَارَة', 'bersuci'], ['صَلَاة', 'salat'], ['زَكَاة', 'zakat'], ['صَوْم', 'puasa'], ['حَجّ', 'haji'], ['إِيمَان', 'iman'], ['إِحْسَان', 'berbuat baik (ihsan)'],
 ['أَخ', 'saudara'], ['مَاء', 'air'], ['طَهُور', 'suci dan menyucikan'], ['نِعْمَة', 'nikmat'], ['جَمِيع', 'semua, seluruh'], ['الْأَدِلَّة', 'dalil-dalil'],
 ['بَرَاءَة', 'berlepas diri'], ['اِنْقِيَاد', 'tunduk, patuh'], ['اِسْتِسْلَام', 'berserah diri'], ['أَهْل', 'keluarga, pengikut'], ['مَعْرِفَة', 'mengenal, pengetahuan'], ['رَسُول', 'utusan, rasul'], ['خَمْسَة', 'lima']
];
// Susun arti
const SU = [
 { id: 'u1', g: 'الحمد لله رب العالمين', v: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', ch: ['Segala puji', 'bagi Allah', 'Tuhan', 'seluruh alam'], n: '«الحمد» = segala puji (mubtada\'), «لله» = bagi Allah, «رب» = Tuhan, «العالمين» = seluruh alam (mudhaf ilaih).', s: 'Al-Fatihah' },
 { id: 'u2', g: 'من ربك', v: 'مَنْ رَبُّكَ', ch: ['Siapakah', 'Tuhanmu?'], n: '«من» = siapa (kata tanya), «ربك» = Tuhan + «mu».', s: 'Ushul Tsalatsah' },
 { id: 'u3', g: 'ديني الإسلام', v: 'دِينِيَ الْإِسْلَامُ', ch: ['Agamaku', '(adalah)', 'Islam'], n: 'Mubtada\' + khabar; kata “adalah” disisipkan saat menerjemah.', s: 'Ushul Tsalatsah' },
 { id: 'u4', g: 'اعلم رحمك الله', v: 'اِعْلَمْ رَحِمَكَ اللَّهُ', ch: ['Ketahuilah,', 'semoga Allah', 'merahmatimu'], n: 'Pembuka khas matan: «اعلم» (amr), «رحمك الله» (doa).', s: 'Ushul Tsalatsah' },
 { id: 'u5', g: 'إنما الأعمال بالنيات', v: 'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ', ch: ['Sesungguhnya', 'amal-amal', 'tergantung pada', 'niat'], n: '«بالنيات» jar-majrur sebagai khabar: “(tergantung) pada niat”.', s: 'Arbain no. 1' },
 { id: 'u6', g: 'الدين النصيحة', v: 'الدِّينُ النَّصِيحَةُ', ch: ['Agama', '(adalah)', 'nasihat'], n: 'Jumlah ismiyyah: mubtada\' + khabar.', s: 'Arbain no. 7' },
 { id: 'u7', g: 'أركان الإسلام خمسة', v: 'أَرْكَانُ الْإِسْلَامِ خَمْسَةٌ', ch: ['Rukun-rukun', 'Islam', '(ada)', 'lima'], n: '«أركان الإسلام» = mudhaf – mudhaf ilaih (“rukun Islam”), «خمسة» = khabar.', s: 'Aqidah/Fiqih dasar' },
 { id: 'u8', g: 'وما خلقت الجن والإنس إلا ليعبدون', v: 'وَمَا خَلَقْتُ الْجِنَّ وَالْإِنْسَ إِلَّا لِيَعْبُدُونِ', ch: ['Aku tidak menciptakan', 'jin', 'dan manusia', 'melainkan', 'agar mereka menyembah-Ku'], n: '«ما…إلا» = “tidak…melainkan”. «ليعبدون» = agar mereka menyembah-Ku.', s: 'QS. Adz-Dzariyat: 56' },
 { id: 'u9', g: 'الحياء من الإيمان', v: 'الْحَيَاءُ مِنَ الْإِيمَانِ', ch: ['Malu', 'sebagian dari', 'iman'], n: '«من» di sini bermakna “sebagian dari”.', s: 'Akhlak — HR. Bukhari & Muslim' },
 { id: 'u10', g: 'لا يؤمن أحدكم حتى يحب لأخيه ما يحب لنفسه', v: 'لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ', ch: ['Tidak (sempurna) iman', 'salah seorang dari kalian', 'hingga', 'ia mencintai untuk saudaranya', 'apa yang ia cintai', 'untuk dirinya'], n: '«حتى» = hingga; «ما» = apa yang; «لأخيه / لنفسه» = untuk saudaranya / dirinya.', s: 'Arbain no. 13' }
];
const TOTAL_Q = HK.length + VO.length + SU.length;
const MODE = { h: 'Tebak Harakat', k: 'Terjemah Kosakata', u: 'Susun Arti' };

/* ===================== STATE & RENDER ===================== */
const ns = { tab: 'belajar', lvl: null, les: null, run: null };
const TIER = [[0, 'Mubtadi\' (Pemula)'], [100, 'Thalib (Pelajar)'], [300, 'Mutaqaddim (Maju)'], [600, 'Mahir']];
const tier = () => TIER.filter(t => S.poin >= t[0]).pop()[1];
const pct = (b, s) => (b + s) ? Math.round(b / (b + s) * 100) : 0;
function scrollTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }

function render() {
  const r = $('ns-root'); if (!r) return;
  const done = Object.keys(S.done).filter(k => S.done[k]).length;
  const nok = Object.keys(S.ok).length;
  r.innerHTML = `
  <div class="card hero" style="padding:20px 14px">
    <div class="ns-ar" style="font-size:2.4rem;color:var(--gold);text-align:center;line-height:1.6">نَحْوٌ وَصَرْفٌ</div>
    <h2 class="cz gold2" style="letter-spacing:.18em;font-size:1.15rem">BELAJAR BACA KITAB GUNDUL</h2>
    <p class="muted sm" style="margin:6px 0 10px">Nahwu & Shorof dari nol — pelan-pelan, praktis, langsung latihan.</p>
    <div class="row" style="justify-content:center">
      <span class="pill">🏅 ${tier()}</span><span class="pill">⭐ ${S.poin} poin</span><span class="pill">📘 ${done}/${TOTAL_LES} materi</span><span class="pill">✅ ${nok}/${TOTAL_Q} soal dikuasai</span>
    </div>
  </div>
  <div class="card" style="padding:10px"><div class="row">
    <button class="btn ${ns.tab === 'belajar' ? 'on' : ''}" onclick="nsTab('belajar')">📚 Belajar</button>
    <button class="btn ${ns.tab === 'latihan' ? 'on' : ''}" onclick="nsTab('latihan')">🎯 Latihan</button>
    <button class="btn ${ns.tab === 'progres' ? 'on' : ''}" onclick="nsTab('progres')">📊 Progres</button>
  </div></div>
  <div id="ns-body" class="view"></div>`;
  $('ns-body').innerHTML = ns.tab === 'belajar' ? vBelajar() : ns.tab === 'latihan' ? vLatihan() : vProgres();
}
window.nsTab = t => { ns.tab = t; ns.lvl = null; ns.les = null; if (t !== 'latihan') ns.run = null; render(); scrollTop(); };
window.nsLvl = i => { ns.lvl = i; ns.les = null; render(); scrollTop(); };
window.nsLes = (i, j) => { ns.lvl = i; ns.les = j; render(); scrollTop(); };
window.nsBack = () => { if (ns.les != null) ns.les = null; else ns.lvl = null; render(); scrollTop(); };
window.nsDone = id => { S.done[id] = !S.done[id]; save(); if (S.done[id]) say('✓ Materi ditandai selesai'); render(); };

/* ---------- Belajar ---------- */
function vBelajar() {
  if (ns.lvl == null) {
    return `<div class="grid g2">${LV.map((l, i) => {
      const d = l.les.filter(x => S.done[x.id]).length, p = Math.round(d / l.les.length * 100);
      return `<div class="card ns-lv" onclick="nsLvl(${i})">
        <div class="row between"><span class="no-b" style="width:38px;height:38px;font-size:1rem">${i + 1}</span><span style="font-size:1.6rem">${l.ikon}</span></div>
        <h3 class="cz gold2" style="font-size:.95rem;margin-top:10px;letter-spacing:.05em">LEVEL ${i + 1} — ${l.judul}</h3>
        <p class="sm muted" style="margin:6px 0 10px">${l.ket}</p>
        <div class="bar"><i style="width:${p}%"></i></div><div class="xs muted" style="margin-top:4px">${d}/${l.les.length} materi selesai</div></div>`;
    }).join('')}</div>
    <div class="ns-tip">🧭 <b>Saran urutan:</b> Level 1 → 2 → 3 → 4, lalu uji di tab <b>Latihan</b>. Satu materi cukup 5–10 menit.</div>`;
  }
  const L = LV[ns.lvl];
  if (ns.les == null) {
    return `<button class="btn" style="align-self:flex-start" onclick="nsBack()">← Semua Level</button>
    <div class="card"><div class="ttl">${L.ikon} LEVEL ${ns.lvl + 1} — ${L.judul}</div><p class="sm muted" style="margin:6px 0 0">${L.ket}</p></div>
    ${L.les.map((x, j) => `<div class="row-item" style="cursor:pointer" onclick="nsLes(${ns.lvl},${j})"><span class="no-b">${x.id}</span><div style="flex:1"><b>${x.judul}</b></div><span class="${S.done[x.id] ? 'ok' : 'muted'}" style="${S.done[x.id] ? 'color:var(--ok)' : ''}">${S.done[x.id] ? '✓ selesai' : 'Buka ›'}</span></div>`).join('')}`;
  }
  const x = L.les[ns.les], prev = L.les[ns.les - 1], next = L.les[ns.les + 1];
  return `<button class="btn" style="align-self:flex-start" onclick="nsBack()">← Level ${ns.lvl + 1}</button>
  <div class="card ns-les"><div class="xs muted">Materi ${x.id}</div><h3 class="cz gold2" style="font-size:1.1rem;margin:4px 0 12px;letter-spacing:.05em">${x.judul}</h3>${x.body()}</div>
  <div class="card row between">
    <div class="row">${prev ? `<button class="btn" onclick="nsLes(${ns.lvl},${ns.les - 1})">‹ ${prev.judul}</button>` : ''}${next ? `<button class="btn" onclick="nsLes(${ns.lvl},${ns.les + 1})">${next.judul} ›</button>` : `<button class="btn" onclick="nsTab('latihan')">🎯 Ke Latihan ›</button>`}</div>
    <button class="btn ${S.done[x.id] ? 'on' : 'gold'}" onclick="nsDone('${x.id}')">${S.done[x.id] ? '✓ Sudah selesai' : 'Tandai selesai'}</button>
  </div>`;
}

/* ---------- Latihan ---------- */
function vLatihan() {
  if (ns.run) return ns.run.fin ? vHasil() : vSoal();
  const nbad = Object.keys(S.bad).length;
  const card = (m, ikon, jd, ket, n) => `<div class="card ns-lv" onclick="nsStart('${m}')"><div style="font-size:1.6rem">${ikon}</div><h3 class="cz gold2" style="font-size:.95rem;margin:8px 0 4px;letter-spacing:.05em">${jd}</h3><p class="sm muted" style="margin:0 0 8px">${ket}</p>${n != null ? `<span class="pill">${n} soal · akurasi ${pct(S.st[m].b, S.st[m].s)}%</span>` : ''}</div>`;
  return `<div class="grid g2">
    ${card('h', '🔤', 'Tebak Harakat (Baca Gundul)', 'Teks tanpa harakat: pilih harakat huruf yang ditandai, atau “Intip Harakat”.', HK.length)}
    ${card('k', '📝', 'Terjemah Kosakata', 'Arti kata kunci dari Ushul Tsalatsah, aqidah, akhlak, dan fiqih.', VO.length)}
    ${card('u', '🧩', 'Susun Arti Kalimat', 'Susun potongan arti Indonesia sesuai urutan kalimat Arabnya.', SU.length)}
    ${card('mix', '🎲', 'Campuran', '10 soal acak dari semua mode.', null)}
  </div>
  ${nbad ? `<div class="card row between"><div><b class="gold2">🔁 Ulangi soal yang salah</b><div class="xs muted">${nbad} soal menunggu diulang</div></div><button class="btn gold" onclick="nsStart('salah')">Mulai Ulang</button></div>` : ''}
  <div class="ns-tip">ℹ️ Tiap sesi 10 soal. Jawaban benar = <b>+10 poin</b>. “Intip Harakat” tidak mengurangi poin, tapi soal itu tidak dihitung.</div>`;
}
function buildPool(m) {
  const H = HK.map(q => Object.assign({ ty: 'h' }, q));
  const K = VO.map((x, i) => {
    const opts = shuffle([x[1]].concat(shuffle(VO.filter((y, j) => j !== i && y[1] !== x[1]).map(y => y[1])).slice(0, 3)));
    return { ty: 'k', id: 'k' + i, ar: x[0], ans: x[1], opts, s: 'Kosakata kitab' };
  });
  const U = SU.map(q => Object.assign({ ty: 'u', order: [] }, q));
  U.forEach(q => { let o; const idx = q.ch.map((_, i) => i); do { o = shuffle(idx); } while (idx.length > 1 && o.join() === idx.join()); q.order = o; });
  return { h: H, k: K, u: U };
}
window.nsStart = function (m) {
  const P = buildPool(m); let qs;
  if (m === 'salah') { qs = shuffle([].concat(P.h, P.k, P.u).filter(q => S.bad[q.id])).slice(0, 15); }
  else if (m === 'mix') qs = shuffle([].concat(P.h, P.k, P.u)).slice(0, 10);
  else qs = shuffle(P[m]).slice(0, 10);
  if (!qs.length) { say('Belum ada soal salah. Mantap!'); return; }
  ns.run = { m, qs, i: 0, skor: 0, ans: null, pick: null, show: false, fin: false, nPeek: 0 };
  render(); scrollTop();
};
window.nsExit = () => { ns.run = null; render(); };
function record(q, ok) {
  S.st[q.ty][ok ? 'b' : 's']++;
  if (ok) { S.ok[q.id] = 1; delete S.bad[q.id]; S.poin += 10; ns.run.skor++; } else { S.bad[q.id] = 1; delete S.ok[q.id]; }
  save();
}
const OKM = ['Tepat sekali! 🎉', 'Mantap, benar! 👏', 'Ahsanta! Betul 🌟', 'Bagus, pertahankan! ✨'];
const BADM = ['Belum tepat — tidak apa-apa, salah itu bagian dari belajar 🌱', 'Hampir! Yuk lihat alasannya 🔍', 'Jangan menyerah, perhatikan penjelasan ini 💪'];

function vSoal() {
  const R = ns.run, q = R.qs[R.i];
  const head = `<div class="card"><div class="row between"><span class="pill">${MODE[q.ty]} · ${R.i + 1}/${R.qs.length}</span><span class="pill">Skor ${R.skor}</span><button class="btn" onclick="nsExit()">Keluar</button></div><div class="bar" style="margin-top:10px"><i style="width:${R.i / R.qs.length * 100}%"></i></div></div>`;
  return head + `<div class="card">${q.ty === 'h' ? qHarakat(q, R) : q.ty === 'k' ? qKosakata(q, R) : qSusun(q, R)}</div>`;
}
const nextBtn = R => `<button class="btn gold" onclick="nsNext()">${R.i + 1 >= R.qs.length ? 'Lihat Hasil ›' : 'Soal Berikutnya ›'}</button>`;

function qHarakat(q, R) {
  const gw = q.g.split(' '), vw = q.v.split(' ');
  const show = R.ans ? vw : gw;
  const line = show.map((w, i) => {
    if (i !== q.t) return `<span class="ns-w">${w}</span>`;
    if (R.ans) return `<span class="ns-w ns-tw">${w}</span>`;
    const p = q.p != null ? q.p : w.length - 1;
    return `<span class="ns-w ns-tw">${[...w].map((c, j) => `<span${j === p ? ' class="ns-pos"' : ''}>${c}</span>`).join('')}</span>`;
  }).join(' ');
  const opts = HAR.map(h => {
    let c = ''; if (R.ans) { if (h[0] === q.a) c = 'ok'; else if (h[0] === R.pick) c = 'bad'; }
    return `<button class="ns-opt ${c}" ${R.ans ? 'disabled' : ''} onclick="nsAns('${h[0]}')"><span class="ns-ar" style="font-size:1.8rem;display:block">${h[2]}</span>${h[1]}</button>`;
  }).join('');
  let fb = '';
  if (R.ans) {
    const cls = R.ans === 'ok' ? 'ok' : R.ans === 'bad' ? 'bad' : 'peek';
    const head = R.ans === 'ok' ? pick1(OKM) : R.ans === 'bad' ? pick1(BADM) : '👀 Ini bacaannya (soal ini tidak dihitung):';
    fb = `<div class="ns-fb ${cls}"><b>${head}</b><div class="sm" style="margin-top:6px">${q.r}</div><div class="xs muted" style="margin-top:4px">Sumber: ${q.s}</div></div><div class="row" style="margin-top:12px;justify-content:flex-end">${nextBtn(R)}</div>`;
  }
  return `<p class="sm muted" style="margin:0 0 6px">Apa harakat huruf yang <b class="gold2">berwarna</b> pada kata yang disorot?</p>
    <div class="ns-ar ns-huge ns-line">${line}</div>
    <div class="ns-opts">${opts}</div>
    ${R.ans ? '' : `<div class="row" style="margin-top:12px;justify-content:center"><button class="btn" onclick="nsPeek()">👀 Intip Harakat</button></div>`}${fb}`;
}
function qKosakata(q, R) {
  const opts = q.opts.map((o, i) => {
    let c = ''; if (R.ans) { if (o === q.ans) c = 'ok'; else if (i === R.pick) c = 'bad'; }
    return `<button class="ns-opt ${c}" ${R.ans ? 'disabled' : ''} onclick="nsAns(${i})">${o}</button>`;
  }).join('');
  let fb = '';
  if (R.ans) fb = `<div class="ns-fb ${R.ans}"><b>${R.ans === 'ok' ? pick1(OKM) : pick1(BADM)}</b><div class="sm" style="margin-top:6px">${q.ar.replace(/./g, c => c)} = <b>${q.ans}</b></div></div><div class="row" style="margin-top:12px;justify-content:flex-end">${nextBtn(R)}</div>`;
  return `<p class="sm muted" style="margin:0 0 6px">Apa arti kata ini?</p><div class="ns-ar ns-huge ns-line">${q.ar}</div><div class="ns-opts">${opts}</div>${fb}`;
}
function qSusun(q, R) {
  const picked = R.pick || [];
  const sel = picked.map(i => `<button class="ns-tile sel" ${R.ans ? 'disabled' : ''} onclick="nsUntile(${i})">${q.ch[i]}</button>`).join('');
  const pool = q.order.filter(i => !picked.includes(i)).map(i => `<button class="ns-tile" ${R.ans ? 'disabled' : ''} onclick="nsTile(${i})">${q.ch[i]}</button>`).join('');
  let fb = '';
  if (R.ans) fb = `<div class="ns-fb ${R.ans}"><b>${R.ans === 'ok' ? pick1(OKM) : pick1(BADM)}</b><div class="sm" style="margin-top:6px">Terjemah yang tepat: <b class="gold2">${q.ch.join(' ')}</b></div><div class="sm" style="margin-top:4px">${q.n}</div><div class="xs muted" style="margin-top:4px">Sumber: ${q.s}</div></div><div class="row" style="margin-top:12px;justify-content:flex-end">${nextBtn(R)}</div>`;
  return `<p class="sm muted" style="margin:0 0 6px">Susun potongan arti di bawah menjadi terjemahan yang tepat.</p>
    <div class="ns-ar ns-huge ns-line" style="font-size:1.8rem">${R.show || R.ans ? q.v : q.g}</div>
    <div class="center" style="margin:6px 0"><button class="btn" onclick="nsShow()">${R.show ? '🙈 Sembunyikan Harakat' : '👀 Intip Harakat'}</button></div>
    <div class="ns-slot">${sel || '<span class="xs muted">Ketuk potongan arti di bawah…</span>'}</div>
    <div class="ns-pool">${pool}</div>
    ${R.ans ? '' : `<div class="row" style="margin-top:12px;justify-content:center"><button class="btn" onclick="nsClear()">↺ Ulangi</button><button class="btn gold" ${picked.length === q.ch.length ? '' : 'disabled'} onclick="nsCheck()">✔ Periksa</button></div>`}${fb}`;
}
window.nsAns = function (v) {
  const R = ns.run; if (!R || R.ans) return; const q = R.qs[R.i]; R.pick = v;
  const ok = q.ty === 'h' ? v === q.a : q.opts[v] === q.ans;
  R.ans = ok ? 'ok' : 'bad'; record(q, ok); render();
};
window.nsPeek = function () { const R = ns.run; if (!R || R.ans) return; R.ans = 'peek'; R.nPeek++; S.intip++; save(); render(); };
window.nsShow = function () { const R = ns.run; if (!R || R.ans) return; R.show = !R.show; render(); };
window.nsTile = function (i) { const R = ns.run; if (!R || R.ans) return; R.pick = (R.pick || []).concat(i); render(); };
window.nsUntile = function (i) { const R = ns.run; if (!R || R.ans) return; R.pick = (R.pick || []).filter(x => x !== i); render(); };
window.nsClear = function () { const R = ns.run; if (!R || R.ans) return; R.pick = []; render(); };
window.nsCheck = function () {
  const R = ns.run; if (!R || R.ans) return; const q = R.qs[R.i], p = R.pick || [];
  const ok = p.length === q.ch.length && p.every((x, i) => x === i);
  R.ans = ok ? 'ok' : 'bad'; record(q, ok); render();
};
window.nsNext = function () {
  const R = ns.run; if (!R) return; R.i++; R.ans = null; R.pick = null; R.show = false;
  if (R.i >= R.qs.length) {
    R.fin = true; const p = Math.round(R.skor / R.qs.length * 100); if (p > S.best) S.best = p;
    S.sesi.unshift({ tgl: todayISO(), m: R.m, skor: R.skor, n: R.qs.length }); S.sesi = S.sesi.slice(0, 20); save();
  }
  render(); scrollTop();
};
function vHasil() {
  const R = ns.run, p = Math.round(R.skor / R.qs.length * 100);
  const msg = p >= 90 ? 'Masyaallah, luar biasa! 🌟' : p >= 70 ? 'Bagus sekali, terus istiqamah! 👏' : p >= 50 ? 'Sudah baik — ulangi materi yang masih ragu 📚' : 'Tidak apa-apa, ulangi materinya pelan-pelan 🌱';
  return `<div class="card hero"><h2 class="cz gold2" style="letter-spacing:.2em">HASIL LATIHAN</h2>
    <div class="stat"><b style="font-size:2.6rem">${R.skor} / ${R.qs.length}</b><span>${p}% benar · +${R.skor * 10} poin${R.nPeek ? ' · ' + R.nPeek + ' soal diintip' : ''}</span></div>
    <p class="quote" style="margin:12px 0">${msg}</p>
    <div class="row" style="justify-content:center"><button class="btn gold" onclick="nsStart('${R.m}')">🔁 Main Lagi</button><button class="btn" onclick="nsExit()">Menu Latihan</button><button class="btn" onclick="nsTab('belajar')">📚 Buka Materi</button></div></div>`;
}

/* ---------- Progres ---------- */
function vProgres() {
  const rows = ['h', 'k', 'u'].map(m => { const s = S.st[m]; return `<div><div class="row between sm"><span>${MODE[m]}</span><span class="gold2">${pct(s.b, s.s)}% <span class="muted xs">(${s.b} benar / ${s.b + s.s} jawab)</span></span></div><div class="bar" style="margin-top:4px"><i style="width:${pct(s.b, s.s)}%"></i></div></div>`; }).join('');
  const lvls = LV.map((l, i) => { const d = l.les.filter(x => S.done[x.id]).length; return `<div><div class="row between sm"><span>Level ${i + 1} — ${l.judul}</span><span class="gold2">${d}/${l.les.length}</span></div><div class="bar" style="margin-top:4px"><i style="width:${d / l.les.length * 100}%"></i></div></div>`; }).join('');
  const nok = Object.keys(S.ok).length, nbad = Object.keys(S.bad).length;
  return `<div class="grid g3">
    <div class="card stat"><b>${S.poin}</b><span>Total poin · ${tier()}</span></div>
    <div class="card stat"><b>${nok}<small style="font-size:.9rem"> / ${TOTAL_Q}</small></b><span>Soal dikuasai (terakhir dijawab benar)</span></div>
    <div class="card stat"><b>${S.best}%</b><span>Skor sesi terbaik · ${nbad} soal perlu diulang</span></div></div>
  <div class="card"><div class="ttl">🎯 AKURASI PER MODE</div><div class="view" style="margin-top:12px;gap:12px">${rows}</div><p class="xs muted" style="margin:10px 0 0">Soal yang “diintip” dihitung ${S.intip}× dan tidak memengaruhi akurasi.</p></div>
  <div class="card"><div class="ttl">📚 PROGRES MATERI</div><div class="view" style="margin-top:12px;gap:12px">${lvls}</div></div>
  <div class="card"><div class="ttl">🕘 SESI TERAKHIR</div><div class="view" style="margin-top:10px;gap:8px">${S.sesi.length ? S.sesi.slice(0, 8).map(x => `<div class="row-item"><b class="gold2">${x.tgl}</b><span class="sm" style="flex:1">${x.m === 'mix' ? 'Campuran' : x.m === 'salah' ? 'Ulangi Salah' : MODE[x.m]}</span><span class="pill">${x.skor}/${x.n}</span></div>`).join('') : '<div class="muted sm">Belum ada sesi latihan.</div>'}</div></div>
  <div class="row" style="justify-content:flex-end"><button class="btn" onclick="nsReset()">🗑 Reset Progres Arab</button></div>`;
}
window.nsReset = function () { if (!confirm('Hapus semua progres belajar Bahasa Arab di perangkat ini?')) return; S = clone(DEF); save(); ns.run = null; render(); say('Progres direset'); };

/* ===================== STYLE ===================== */
const css = `
.ns-ar{font-family:'Amiri','Scheherazade New','Noto Naskh Arabic',serif;direction:rtl;unicode-bidi:isolate}
.ns-big{font-size:1.6rem;color:var(--gold2);line-height:1.9}
.ns-huge{font-size:2.3rem;color:var(--gold2);line-height:2.2}
.ns-line{text-align:center;padding:10px 6px;background:#21170b;border:1px solid var(--line);border-radius:14px;margin:6px 0 14px}
.ns-w{display:inline-block;padding:0 6px}
.ns-tw{background:rgba(216,170,82,.16);border-radius:8px;box-shadow:0 0 0 1px var(--gold)}
.ns-pos{color:#fff;text-decoration:underline;text-decoration-color:var(--warn);text-underline-offset:6px;text-decoration-thickness:3px}
.ns-lv{cursor:pointer;transition:.2s}.ns-lv:hover{border-color:var(--gold);transform:translateY(-2px)}
.ns-les p,.ns-les li{line-height:1.75;font-size:.9rem}
.ns-les h4{margin:18px 0 8px;font-size:.9rem;letter-spacing:.08em}
.ns-ex{display:flex;gap:14px;align-items:center;justify-content:space-between;flex-direction:row-reverse;padding:8px 14px;margin:8px 0;background:var(--card2);border:1px solid var(--line);border-radius:14px;font-size:.84rem}
.ns-ex>div:last-child{text-align:left;flex:1}
.ns-tip{margin:12px 0;padding:11px 14px;border-radius:12px;background:rgba(216,170,82,.1);border-left:4px solid var(--gold);font-size:.84rem;line-height:1.65}
.ns-tip.ns-warn{background:rgba(231,168,93,.1);border-left-color:var(--warn)}
.ns-tbl{overflow-x:auto;margin:10px 0}
.ns-tbl table{width:100%;border-collapse:collapse;font-size:.82rem;min-width:300px}
.ns-tbl th{background:#21170b;color:var(--gold2);font-family:'Cinzel',serif;font-size:.7rem;letter-spacing:.06em;text-align:left;padding:8px 10px;border-bottom:1px solid var(--line)}
.ns-tbl td{padding:8px 10px;border-bottom:1px solid rgba(110,81,38,.45);vertical-align:middle;line-height:1.5}
.ns-tbl td .ns-ar{font-size:1.25rem;color:var(--gold2)}
.ns-sent{margin:12px 0}
.ns-chips{display:flex;flex-direction:row;direction:rtl;flex-wrap:wrap;gap:6px;justify-content:center;margin-bottom:10px}
.ns-chip{font-family:'Amiri','Scheherazade New',serif;font-size:1.55rem;padding:2px 12px;border:1px solid var(--line);border-radius:12px;background:#21170b;color:var(--text);cursor:pointer;transition:.2s}
.ns-chip:hover{border-color:var(--gold)}
.ns-chip.on{background:rgba(216,170,82,.22);border-color:var(--gold);color:#fff;box-shadow:0 0 10px rgba(216,170,82,.2)}
.ns-detail{background:#21170b;border:1px solid var(--line);border-radius:12px;padding:10px 12px;line-height:1.6}
.ns-opts{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin-top:6px}
.ns-opt{font:inherit;font-size:.84rem;font-weight:700;padding:12px 10px;border-radius:14px;border:1px solid var(--line);background:var(--card2);color:var(--gold2);cursor:pointer;transition:.2s;text-align:center;line-height:1.4}
.ns-opt:hover:not(:disabled){border-color:var(--gold);background:#4a351b}
.ns-opt:disabled{cursor:default}
.ns-opt.ok{background:rgba(156,199,134,.22);border-color:var(--ok);color:#fff}
.ns-opt.bad{background:rgba(231,168,93,.2);border-color:var(--warn);color:#fff}
.ns-fb{margin-top:14px;padding:12px 14px;border-radius:14px;border:1px solid var(--line);line-height:1.6}
.ns-fb.ok{background:rgba(156,199,134,.14);border-color:var(--ok)}
.ns-fb.bad{background:rgba(231,168,93,.12);border-color:var(--warn)}
.ns-fb.peek{background:rgba(216,170,82,.1);border-color:var(--gold)}
.ns-slot{min-height:56px;display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:10px;background:#21170b;border:1px dashed var(--gold);border-radius:14px;margin-bottom:10px}
.ns-pool{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
.ns-tile{font:inherit;font-size:.84rem;font-weight:700;padding:9px 13px;border-radius:12px;border:1px solid var(--line);background:var(--card2);color:var(--text);cursor:pointer;transition:.2s}
.ns-tile:hover:not(:disabled){border-color:var(--gold)}
.ns-tile.sel{background:rgba(216,170,82,.2);border-color:var(--gold);color:#fff}
@media(max-width:560px){.ns-huge{font-size:1.9rem}.ns-ex{flex-direction:column;align-items:stretch;text-align:center}.ns-ex>div:last-child{text-align:center}}
`;

/* ===================== PASANG KE PEPELING ===================== */
function install() {
  const st = document.createElement('style'); st.id = 'ns-style'; st.textContent = css; document.head.appendChild(st);
  if (!document.querySelector('link[href*="Scheherazade"]')) {
    const l = document.createElement('link'); l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@400;700&display=swap'; document.head.appendChild(l);
  }
  const main = document.querySelector('main'), tabs = $('tabs');
  if (!main || !tabs || $('v-arab')) return;
  const sec = document.createElement('section'); sec.id = 'v-arab'; sec.className = 'view hidden'; sec.innerHTML = '<div id="ns-root" class="view"></div>';
  main.appendChild(sec);
  const b = document.createElement('button'); b.className = 'tab'; b.dataset.v = 'arab'; b.textContent = 'BAHASA ARAB'; b.setAttribute('onclick', "go('arab')");
  tabs.appendChild(b);
  if (typeof VIEWS !== 'undefined' && VIEWS.indexOf('arab') < 0) VIEWS.push('arab');
  const g0 = window.go;
  if (typeof g0 === 'function') {
    window.go = function (v) { const r = g0.apply(this, arguments); if (v === 'arab') { render(); } return r; };
  }
}
install();
})();
