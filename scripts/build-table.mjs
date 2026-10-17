// Tulis tabel ringkas semua motor sebagai HTML biasa di index.html (antara <!-- TABEL:START --> dan <!-- TABEL:END -->),
// supaya isi situs terbaca mesin pencari tanpa menjalankan JS. Dijalankan saat deploy (.github/workflows/static.yml).
// Pakai: node scripts/build-table.mjs [path index.html]
import fs from "node:fs";

const htmlPath = process.argv[2] || new URL("../index.html", import.meta.url);
const { MOTORS, CHECKED_AT } = new Function(`${fs.readFileSync(new URL("../assets/js/data.js", import.meta.url), "utf8")}; return { MOTORS, CHECKED_AT };`)();
const checked = new Date(CHECKED_AT).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

// sama dengan SLUGS di app.js
const slug = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const SHORT = MOTORS.map((m) => slug(`${m.brand} ${m.model.split(" (")[0]}`));
const SLUGS = MOTORS.map((m, i) => (SHORT.indexOf(SHORT[i]) === SHORT.lastIndexOf(SHORT[i]) ? SHORT[i] : slug(`${m.brand} ${m.model}`)));

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const num = (n) => n.toLocaleString("id-ID", { maximumFractionDigits: 2 });
const STNK = { true: "Bisa", false: "Tidak", null: "Belum jelas" };

const rows = MOTORS.map((m, i) => i)
  .sort((a, b) => MOTORS[a].price - MOTORS[b].price)
  .map((i) => {
    const m = MOTORS[i];
    const rent = m.batteryRent ? `<br><small>+ sewa Rp ${num(m.batteryRent)}/bln</small>` : "";
    return `          <tr>
            <th scope="row"><a href="?motor=${SLUGS[i]}">${esc(m.brand)} ${esc(m.model)}</a></th>
            <td>Rp ${num(m.price / 1e6)} jt<br><small>${esc(m.priceTag)}</small>${rent}</td>
            <td>${num(m.kwh)} kWh<br><small>${esc(m.batteryType)}, ${esc(m.batteryScheme)}</small></td>
            <td>${m.range} km</td>
            <td>${m.speed} km/j</td>
            <td>${STNK[m.stnk]}</td>
          </tr>`;
  })
  .join("\n");

const table = `<!-- TABEL:START -->
      <div class="table-scroll">
        <table>
          <caption>${MOTORS.length} motor listrik di bawah Rp 30 juta, urut harga. Data per ${checked}.</caption>
          <thead><tr><th scope="col">Motor</th><th scope="col">Harga</th><th scope="col">Baterai</th><th scope="col">Jarak klaim</th><th scope="col">Kecepatan</th><th scope="col">STNK</th></tr></thead>
          <tbody>
${rows}
          </tbody>
        </table>
      </div>
      <!-- TABEL:END -->`;

const html = fs.readFileSync(htmlPath, "utf8");
const marks = /<!-- TABEL:START -->[\s\S]*<!-- TABEL:END -->/;
if (!marks.test(html)) throw new Error("penanda TABEL tidak ketemu di index.html");
fs.writeFileSync(htmlPath, html.replace(marks, table));
console.error(`tabel ${MOTORS.length} motor ditulis ke ${htmlPath}`);
