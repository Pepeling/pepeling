/***** PENGATURAN *****/
const TOKEN = '';   // kosong = tanpa password. Isi bila ingin pakai password.
/**********************/

const HEAD = {
  Murojaah: ['id', 'tgl', 'dari', 'sampai', 'mutu', 'cat', 'upd'],
  Catatan:  ['id', 'tgl', 'judul', 'pemateri', 'jenis', 'isi', 'upd'],
  Hapus:    ['id']
};
const NUM = ['id', 'dari', 'sampai', 'upd'];

function sheet_(nama) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let s = ss.getSheetByName(nama);
  if (!s) {
    s = ss.insertSheet(nama);
    s.appendRow(HEAD[nama]);
    s.setFrozenRows(1);
    s.getRange(1, 1, 1, HEAD[nama].length).setFontWeight('bold');
  }
  return s;
}
function baca_(nama) {
  const v = sheet_(nama).getDataRange().getValues(), h = HEAD[nama], out = [];
  for (let i = 1; i < v.length; i++) {
    if (v[i][0] === '' || v[i][0] == null) continue;
    const o = {};
    h.forEach((k, j) => { o[k] = NUM.indexOf(k) >= 0 ? (v[i][j] === '' ? 0 : Number(v[i][j])) : String(v[i][j]); });
    out.push(o);
  }
  return out;
}
function tulis_(nama, arr) {
  const s = sheet_(nama), h = HEAD[nama], last = s.getLastRow();
  if (last > 1) s.getRange(2, 1, last - 1, h.length).clearContent();
  if (arr.length) {
    s.getRange(2, 1, arr.length, h.length).setNumberFormat('@')
      .setValues(arr.map(r => h.map(k => r[k] == null ? '' : r[k])));
  }
}
function gabung_(a, b, tomb) {
  const m = {};
  a.concat(b).forEach(r => {
    if (!r || r.id == null || tomb[r.id]) return;
    const o = m[r.id];
    if (!o || (r.upd || 0) > (o.upd || 0)) m[r.id] = r;
  });
  return Object.keys(m).map(k => m[k]);
}
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function izin_(t) { return !TOKEN || t === TOKEN; }
function semua_() {
  return { murojaah: baca_('Murojaah'), catatan: baca_('Catatan'), hapus: baca_('Hapus').map(x => x.id) };
}

function doGet(e) {
  if (!izin_(e && e.parameter && e.parameter.token)) return json_({ ok: false, error: 'token salah' });
  return json_({ ok: true, data: semua_() });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const req = JSON.parse(e.postData.contents);
    if (!izin_(req.token)) return json_({ ok: false, error: 'token salah' });
    const cur = semua_(), inc = req.data || {};
    const tomb = {};
    cur.hapus.concat(inc.hapus || []).forEach(id => tomb[id] = 1);
    const out = {
      murojaah: gabung_(cur.murojaah, inc.murojaah || [], tomb),
      catatan: gabung_(cur.catatan, inc.catatan || [], tomb),
      hapus: Object.keys(tomb).map(Number)
    };
    tulis_('Murojaah', out.murojaah);
    tulis_('Catatan', out.catatan);
    tulis_('Hapus', out.hapus.map(id => ({ id: id })));
    return json_({ ok: true, data: out });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally { lock.releaseLock(); }
}
