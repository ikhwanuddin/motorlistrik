// Cek apakah angka `price` tiap motor masih tertulis di halaman `priceUrl`-nya.
// Pakai: node scripts/check-prices.mjs [path data.js] > laporan.md   (exit 1 kalau ada yang beda)
//
// Halaman diambil pakai fetch dulu (HTML mentah). Kalau angkanya tidak ketemu, halaman dibuka di
// tab baru Brave (banyak situs merender harga pakai JS) lalu teksnya dicek; untuk host di CLICKS
// opsinya diklik dulu. Yang tidak ketemu di keduanya masuk laporan, bersama angka Rp yang ada di
// halaman, untuk dicek manual. Data tidak diubah.
import fs from "node:fs";
import { braveOn, braveText } from "./brave.mjs";

const dataPath = process.argv[2] || new URL("../assets/js/data.js", import.meta.url);
const MOTORS = new Function(`${fs.readFileSync(dataPath, "utf8")}; return MOTORS;`)();

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";
async function html(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(30000), headers: { "user-agent": UA } });
    return await res.text();
  } catch {
    return "";
  }
}

// 17850000 ditulis "17.850.000", "17,850,000", "17850000", "17,85 juta", "17,85jt"
function hasPrice(text, price) {
  const dots = price.toLocaleString("de-DE");
  const jt = String(price / 1e6).replace(".", ",");
  const t = text.toLowerCase();
  return t.includes(dots) || t.includes(dots.replace(/\./g, ",")) || t.includes(String(price)) || new RegExp(`${jt} ?(juta|jt)`).test(t);
}

// angka yang kelihatan seperti harga motor: "Rp 17.850.000", "Rp18,5 juta"
const rpOnPage = (text) =>
  [...new Set(text.match(/Rp\.? ?\d{1,2}[.,]\d{3}[.,]\d{3}|Rp\.? ?\d{1,2}(,\d+)? ?(juta|jt)/gi) || [])].slice(0, 8);

// harga yang baru muncul setelah opsi diklik (konfigurator): label yang diklik berurutan, per host
const CLICKS = { "shop.vinfastauto.id": ["2-Battery", "Battery Included"] };

const htmlCache = new Map();
const braveCache = new Map();
const bad = [];
let unchecked = 0;
const list = MOTORS.filter((m) => m.priceUrl);
for (const m of list) {
  const name = `${m.brand} ${m.model}`;
  if (!htmlCache.has(m.priceUrl)) htmlCache.set(m.priceUrl, await html(m.priceUrl));
  if (hasPrice(htmlCache.get(m.priceUrl), m.price)) {
    console.error("ok (fetch)", name);
    continue;
  }
  if (!braveOn) {
    unchecked++;
    console.error("tidak bisa dicek (Brave tidak jalan)", name);
    continue;
  }
  if (!braveCache.has(m.priceUrl)) braveCache.set(m.priceUrl, braveText(m.priceUrl, CLICKS[new URL(m.priceUrl).host]));
  const text = braveCache.get(m.priceUrl);
  if (!text) {
    unchecked++;
    console.error("tidak bisa dicek (Brave gagal)", name);
  } else if (hasPrice(text, m.price)) {
    console.error("ok (Brave)", name);
  } else {
    bad.push({ name, price: m.price, url: m.priceUrl, found: rpOnPage(text) });
    console.error("BEDA", name, rpOnPage(text).join(" | "));
  }
}

const rp = (n) => `Rp ${n.toLocaleString("de-DE")}`;
if (bad.length) {
  console.log(`${bad.length} dari ${list.length} motor: harga di data tidak ketemu lagi di halaman sumbernya (cek ${new Date().toISOString().slice(0, 10)}).\n`);
  console.log("| Motor | Harga di data | Angka di halaman |\n|---|---|---|");
  for (const b of bad) console.log(`| ${b.name} | ${rp(b.price)} | [${b.found.join(", ") || "tidak ada angka Rp"}](${b.url}) |`);
  console.log(`\nBelum tentu harga naik/turun: bisa juga promo atau halaman berubah. Cek manual dulu sebelum mengubah data.js.`);
  console.log('Kalau memang berubah, catat: `node scripts/catat-harga.mjs "<Motor>" <harga baru>` (lihat README, Update data).');
  if (unchecked) console.log(`${unchecked} motor tidak bisa dicek, tidak dihitung.`);
}
console.error(`${bad.length} beda, ${unchecked} tidak bisa dicek, dari ${list.length} motor (${MOTORS.length - list.length} tanpa priceUrl)`);
process.exit(bad.length ? 1 : 0);
