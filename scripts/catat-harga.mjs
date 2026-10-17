// Catat harga baru satu motor di data.js: ganti `price` dan tambah entri ke `priceHistory`.
// Pakai: node scripts/catat-harga.mjs "<Brand Model>" <harga baru> [tanggal YYYY-MM-DD, default hari ini]
// Nama persis seperti di laporan "Harga berubah?", mis. "VinFast Evo (sewa baterai)".
// Hanya untuk harga yang memang berubah di sumbernya. Koreksi data (salah ketik, sumber lebih baik) edit langsung, jangan dicatat.
// Kalau motor belum punya riwayat, harga lama diberi tanggal commit yang terakhir mengubah baris price-nya (git blame).
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const [name, newPrice, date = new Date().toISOString().slice(0, 10)] = process.argv.slice(2);
const price = Number(newPrice);
if (!name || !Number.isInteger(price) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('pakai: node scripts/catat-harga.mjs "<Brand Model>" <harga baru> [YYYY-MM-DD]');

const dataPath = new URL("../assets/js/data.js", import.meta.url).pathname;
const src = fs.readFileSync(dataPath, "utf8");
const MOTORS = new Function(`${src}; return MOTORS;`)();
const m = MOTORS.find((x) => `${x.brand} ${x.model}` === name);
if (!m) throw new Error(`motor "${name}" tidak ada di data.js`);
if (m.price === price) throw new Error(`harga ${name} sudah ${price}`);

// blok motor ini di teks data.js, dari baris brand sampai checkedAt
const start = src.indexOf(`brand: ${JSON.stringify(m.brand)},\n    model: ${JSON.stringify(m.model)},`);
const end = src.indexOf("checkedAt:", start);
const block = src.slice(start, end);

let history = m.priceHistory;
if (!history) {
  const line = src.slice(0, start + block.indexOf(`price: ${m.price},`)).split("\n").length;
  const blame = execFileSync("git", ["blame", "--porcelain", "-L", `${line},${line}`, dataPath], { encoding: "utf8" });
  const since = new Date(Number(blame.match(/^author-time (\d+)/m)[1]) * 1000).toISOString().slice(0, 10);
  history = [[since, m.price]];
}
history = [...history, [date, price]];

const histLine = `    priceHistory: ${JSON.stringify(history).replace(/,/g, ", ")},\n`;
const newBlock = block
  .replace(/    priceHistory: .*\n/, "")
  .replace(`price: ${m.price},\n`, `price: ${price},\n${histLine}`);
fs.writeFileSync(dataPath, src.slice(0, start) + newBlock + src.slice(end));
console.error(`${name}: Rp ${m.price.toLocaleString("de-DE")} → Rp ${price.toLocaleString("de-DE")} (${date})`);
console.error("Cek juga priceNote/priceTag kalau menyebut angka atau bulan harga.");
