// Cek semua link di data.js (url resmi + sources). Cetak daftar link mati dalam markdown.
// Yang dihitung mati cuma yang pasti: 404/410 dan domain tidak ada. 403/429/timeout tidak,
// karena banyak situs (Tokopedia, Kontan, dll) memblokir IP server GitHub padahal link-nya hidup.
// Pakai: node scripts/check-links.mjs > laporan.md   (exit 1 kalau ada link mati)
import fs from "node:fs";

const src = fs.readFileSync(new URL("../assets/js/data.js", import.meta.url), "utf8");
const MOTORS = new Function(`${src}; return MOTORS;`)();

const links = [];
for (const m of MOTORS) {
  const name = `${m.brand} ${m.model}`;
  links.push({ name, label: "Situs resmi", url: m.url });
  for (const s of m.sources) links.push({ name, label: s.label, url: s.url });
}

async function check(url) {
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(30000),
      headers: { "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36" },
    });
    return res.status;
  } catch (e) {
    return e.name === "TimeoutError" ? "timeout" : e.cause?.code || e.message;
  }
}

const DEAD = [404, 410, "ENOTFOUND"];
const bad = [];
let blocked = 0;
for (const l of links) {
  let status = await check(l.url);
  if (typeof status !== "number") status = await check(l.url); // gagal koneksi: coba sekali lagi
  console.error(status, l.url);
  if (DEAD.includes(status)) bad.push({ ...l, status });
  else if (status < 200 || status >= 300 || typeof status !== "number") blocked++;
}

if (bad.length) {
  console.log(`${bad.length} dari ${links.length} link sumber mati (cek ${new Date().toISOString().slice(0, 10)}).\n`);
  console.log("| Motor | Sumber | Status |\n|---|---|---|");
  for (const b of bad) console.log(`| ${b.name} | [${b.label}](${b.url}) | ${b.status} |`);
  console.log(`\n404/410 = halaman hilang, ENOTFOUND = domain tidak ada. ${blocked} link lain tidak bisa dicek dari server (diblokir/timeout), tidak dihitung.`);
}
console.error(`${bad.length} mati, ${blocked} tidak bisa dicek, dari ${links.length} link`);
process.exit(bad.length ? 1 : 0);
