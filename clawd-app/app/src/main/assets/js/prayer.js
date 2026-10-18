/* Prayer times computed on the phone (standard astronomical formulas, no internet), plus a list of cities. */
(function () {
'use strict';
const CL = window.CL, M = Math;
const rad = (d) => d * M.PI / 180, deg = (r) => r * 180 / M.PI;
const fix = (a, b) => { a = a - b * M.floor(a / b); return a < 0 ? a + b : a; };

// fajr / isha twilight angles; isha may be minutes after maghrib instead
const METHODS = {
  mwl: { name: 'رابطة العالم الإسلامي', fajr: 18, isha: 17 },
  makkah: { name: 'أم القرى (السعودية)', fajr: 18.5, ishaMin: 90 },
  egypt: { name: 'الهيئة المصرية', fajr: 19.5, isha: 17.5 },
  karachi: { name: 'جامعة كراتشي', fajr: 18, isha: 18 },
  isna: { name: 'أمريكا الشمالية', fajr: 15, isha: 15 },
  gulf: { name: 'الخليج (دبي)', fajr: 18.2, isha: 18.2 },
  kuwait: { name: 'الكويت', fajr: 18, isha: 17.5 },
  qatar: { name: 'قطر', fajr: 18, ishaMin: 90 },
  turkey: { name: 'تركيا (ديانت)', fajr: 18, isha: 17 },
  sea: { name: 'جنوب شرق آسيا', fajr: 20, isha: 18 }
};

function sun(jd) { // declination (deg) and equation of time (hours)
  const D = jd - 2451545.0;
  const g = fix(357.529 + 0.98560028 * D, 360), q = fix(280.459 + 0.98564736 * D, 360);
  const L = fix(q + 1.915 * M.sin(rad(g)) + 0.020 * M.sin(rad(2 * g)), 360);
  const e = 23.439 - 0.00000036 * D;
  const RA = deg(M.atan2(M.cos(rad(e)) * M.sin(rad(L)), M.cos(rad(L)))) / 15;
  return { decl: deg(M.asin(M.sin(rad(e)) * M.sin(rad(L)))), eqt: q / 15 - fix(RA, 24) };
}
function julian(y, m, d) { if (m <= 2) { y -= 1; m += 12; } const A = M.floor(y / 100), B = 2 - A + M.floor(A / 4); return M.floor(365.25 * (y + 4716)) + M.floor(30.6001 * (m + 1)) + d + B - 1524.5; }

/* Times for a date at (lat, lng) as Date objects in the phone's local time. asr: 1 = Shafi'i/Maliki/Hanbali, 2 = Hanafi. */
function times(date, lat, lng, methodKey, asr) {
  const m = METHODS[methodKey] || METHODS.mwl, f = asr === 2 ? 2 : 1;
  const y = date.getFullYear(), mo = date.getMonth() + 1, d = date.getDate();
  const tz = -new Date(y, mo - 1, d, 12).getTimezoneOffset() / 60;
  const jd = julian(y, mo, d) - lng / (15 * 24);
  const at = (h) => sun(jd + h / 24);
  const noon = (h) => fix(12 - at(h).eqt, 24);
  const T = (angle, h) => { const s = at(h), v = (-M.sin(rad(angle)) - M.sin(rad(s.decl)) * M.sin(rad(lat))) / (M.cos(rad(s.decl)) * M.cos(rad(lat)));
    return v < -1 || v > 1 ? NaN : deg(M.acos(v)) / 15; };
  const A = (h) => { const s = at(h), a = -deg(M.atan(1 / (f + M.tan(rad(M.abs(lat - s.decl)))))); return T(a, h); };
  // two passes: each time is computed with the sun's position at roughly that time
  let fa = 5, sr = 6, dh = 12, as = 13, mg = 18, is = 18;
  for (let i = 0; i < 2; i++) {
    const zn = noon(dh); dh = zn;
    fa = zn - T(m.fajr, fa); sr = zn - T(0.833, sr); as = zn + A(as); mg = zn + T(0.833, mg);
    is = m.ishaMin ? mg + m.ishaMin / 60 : zn + T(m.isha, is);
  }
  const shift = tz - lng / 15;
  const toDate = (h) => { if (isNaN(h)) return null; const t = h + shift, dt = new Date(y, mo - 1, d, 0, 0, 0); dt.setTime(dt.getTime() + t * 3600 * 1000); return dt; };
  return { fajr: toDate(fa), sunrise: toDate(sr), dhuhr: toDate(dh + 1 / 60), asr: toDate(as), maghrib: toDate(mg), isha: toDate(is) };
}

const NAMES = { fajr: 'الفجر', dhuhr: 'الظهر', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء' };
// [name, lat, lng, method]
const CITIES = [
  ['تايبيه', 25.033, 121.565, 'mwl'], ['نيو تايبيه', 25.012, 121.466, 'mwl'], ['مكة المكرمة', 21.389, 39.858, 'makkah'], ['المدينة المنورة', 24.467, 39.611, 'makkah'],
  ['الرياض', 24.713, 46.675, 'makkah'], ['جدة', 21.543, 39.173, 'makkah'], ['الدمام', 26.392, 49.977, 'makkah'], ['دبي', 25.205, 55.271, 'gulf'], ['أبوظبي', 24.454, 54.377, 'gulf'],
  ['الدوحة', 25.286, 51.534, 'qatar'], ['الكويت', 29.376, 47.977, 'kuwait'], ['مسقط', 23.588, 58.383, 'mwl'], ['المنامة', 26.228, 50.586, 'mwl'],
  ['صنعاء', 15.369, 44.191, 'mwl'], ['عدن', 12.786, 45.018, 'mwl'], ['تعز', 13.580, 44.021, 'mwl'], ['المكلا', 14.542, 49.124, 'mwl'], ['الحديدة', 14.798, 42.954, 'mwl'],
  ['القاهرة', 30.044, 31.236, 'egypt'], ['الإسكندرية', 31.200, 29.918, 'egypt'], ['عمّان', 31.954, 35.911, 'mwl'], ['دمشق', 33.513, 36.292, 'mwl'], ['حلب', 36.202, 37.134, 'mwl'],
  ['بيروت', 33.894, 35.502, 'mwl'], ['القدس', 31.768, 35.214, 'mwl'], ['غزة', 31.502, 34.467, 'mwl'], ['بغداد', 33.315, 44.366, 'mwl'], ['إسطنبول', 41.008, 28.978, 'turkey'],
  ['أنقرة', 39.934, 32.860, 'turkey'], ['الجزائر', 36.754, 3.059, 'mwl'], ['الرباط', 34.020, -6.841, 'mwl'], ['الدار البيضاء', 33.573, -7.590, 'mwl'], ['تونس', 36.806, 10.181, 'mwl'],
  ['طرابلس', 32.887, 13.191, 'mwl'], ['الخرطوم', 15.500, 32.560, 'egypt'], ['كراتشي', 24.861, 67.010, 'karachi'], ['لاهور', 31.520, 74.359, 'karachi'], ['إسلام آباد', 33.684, 73.048, 'karachi'],
  ['كابل', 34.555, 69.207, 'karachi'], ['جاكرتا', -6.209, 106.846, 'sea'], ['كوالالمبور', 3.139, 101.687, 'sea'], ['لندن', 51.507, -0.128, 'mwl'], ['باريس', 48.857, 2.352, 'mwl'],
  ['برلين', 52.520, 13.405, 'mwl'], ['نيويورك', 40.713, -74.006, 'isna'], ['تورنتو', 43.653, -79.383, 'isna']
];

const ZONES = { 'Asia/Taipei': 'تايبيه', 'Asia/Riyadh': 'الرياض', 'Asia/Dubai': 'دبي', 'Asia/Qatar': 'الدوحة', 'Asia/Kuwait': 'الكويت', 'Asia/Muscat': 'مسقط',
  'Asia/Bahrain': 'المنامة', 'Asia/Aden': 'صنعاء', 'Africa/Cairo': 'القاهرة', 'Asia/Amman': 'عمّان', 'Asia/Damascus': 'دمشق', 'Asia/Beirut': 'بيروت', 'Asia/Jerusalem': 'القدس',
  'Asia/Gaza': 'غزة', 'Asia/Hebron': 'القدس', 'Asia/Baghdad': 'بغداد', 'Europe/Istanbul': 'إسطنبول', 'Africa/Algiers': 'الجزائر', 'Africa/Casablanca': 'الدار البيضاء',
  'Africa/Tunis': 'تونس', 'Africa/Tripoli': 'طرابلس', 'Africa/Khartoum': 'الخرطوم', 'Asia/Karachi': 'كراتشي', 'Asia/Kabul': 'كابل', 'Asia/Jakarta': 'جاكرتا',
  'Asia/Kuala_Lumpur': 'كوالالمبور', 'Europe/London': 'لندن', 'Europe/Paris': 'باريس', 'Europe/Berlin': 'برلين', 'America/New_York': 'نيويورك', 'America/Toronto': 'تورنتو' };
CL.PRAY = { METHODS, CITIES, NAMES, times,
  /* first run: a city from the phone's time zone, so reminders work before the place is chosen */
  guess(s) {
    if (!s || (s.lat !== '' && s.lat != null)) return false;
    let z = ''; try { z = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) {}
    const c = CITIES.find((x) => x[0] === ZONES[z]); if (!c) return false;
    Object.assign(s, { city: c[0], lat: c[1], lng: c[2], prayMethod: c[3] }); return true;
  },
  /* today's five prayers from the settings, or null when no place is set */
  today(s, date) {
    s = s || CL.settings; if (s.lat == null || s.lng == null || s.lat === '' || s.lng === '') return null;
    const t = times(date || new Date(), +s.lat, +s.lng, s.prayMethod || 'mwl', +s.asr || 1);
    return ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].map((k) => ({ k: k, name: NAMES[k], at: t[k] })).filter((p) => p.at);
  },
  fmt(d) { if (!d) return '—'; const h = d.getHours(), m = d.getMinutes(); return (h % 12 || 12) + ':' + (m < 10 ? '0' : '') + m + (h < 12 ? ' ص' : ' م'); }
};
})();
