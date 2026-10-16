// Cek semua link di data.js (url resmi + sources). Cetak daftar link mati dalam markdown.
// Pakai: node scripts/check-links.mjs [path data.js] > laporan.md   (exit 1 kalau ada link mati)
//
// Yang dihitung mati: 404/410 dan domain tidak ada. Situs yang memblokir bot (403/429/timeout)
// dibuka di tab baru Brave yang sedang jalan, lalu judul halamannya dicek ("404", "tidak ditemukan").
// Kalau Brave tidak jalan, link itu dihitung "tidak bisa dicek".
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const dataPath = process.argv[2] || new URL("../assets/js/data.js", import.meta.url);
const MOTORS = new Function(`${fs.readFileSync(dataPath, "utf8")}; return MOTORS;`)();

// satu url bisa dipakai beberapa motor (artikel yang sama) atau dobel di url + sources: cek sekali saja
const byUrl = new Map();
for (const m of MOTORS) {
  const name = `${m.brand} ${m.model}`;
  for (const s of [{ label: "Situs resmi", url: m.url }, ...m.sources]) {
    if (!byUrl.has(s.url)) byUrl.set(s.url, { url: s.url, label: s.label, names: [] });
    const l = byUrl.get(s.url);
    if (!l.names.includes(name)) l.names.push(name);
  }
}
const links = [...byUrl.values()].map((l) => ({ ...l, name: l.names.join(", ") }));

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

// buka url di tab baru jendela Brave terdepan, tunggu selesai, ambil judul, tutup tab, kembalikan tab aktif
const BRAVE_JS = `
on run argv
  tell application "Brave Browser"
    set w to window 1
    set prev to active tab index of w
    set t to make new tab at end of tabs of w with properties {URL:item 1 of argv}
    delay 1
    repeat 60 times
      if not (loading of t) then exit repeat
      delay 0.5
    end repeat
    repeat 15 times
      if title of t does not start with "Just a moment" then exit repeat
      delay 1
    end repeat
    set r to title of t
    close t
    set active tab index of w to prev
    return r
  end tell
end run`;

function braveTitle(url) {
  try {
    return execFileSync("osascript", ["-e", BRAVE_JS, url], { encoding: "utf8", timeout: 60000 }).trim();
  } catch {
    return null;
  }
}

let braveOn = true;
try { execFileSync("pgrep", ["-x", "Brave Browser"]); } catch { braveOn = false; }

const DEAD = [404, 410, "ENOTFOUND"];
const DEAD_TITLE = /404|not found|tidak ditemukan|halaman tidak ada/i;
const bad = [];
let blocked = 0;
for (const l of links) {
  let status = await check(l.url);
  if (typeof status !== "number") status = await check(l.url); // gagal koneksi: coba sekali lagi
  const ok = typeof status === "number" && status >= 200 && status < 300;
  if (DEAD.includes(status)) bad.push({ ...l, status });
  else if (!ok) {
    const title = braveOn ? braveTitle(l.url) : null;
    if (!title || title.startsWith("Just a moment")) blocked++;
    else if (DEAD_TITLE.test(title)) bad.push({ ...l, status: `${status}, di Brave: "${title}"` });
    console.error(`  Brave: ${title}`);
  }
  console.error(status, l.url);
}

if (bad.length) {
  console.log(`${bad.length} dari ${links.length} link sumber mati (cek ${new Date().toISOString().slice(0, 10)}).\n`);
  console.log("| Motor | Sumber | Status |\n|---|---|---|");
  for (const b of bad) console.log(`| ${b.name} | [${b.label}](${b.url}) | ${b.status} |`);
  console.log(`\n404/410 = halaman hilang, ENOTFOUND = domain tidak ada. ${blocked} link lain tidak bisa dicek, tidak dihitung.`);
}
console.error(`${bad.length} mati, ${blocked} tidak bisa dicek, dari ${links.length} link`);
process.exit(bad.length ? 1 : 0);
