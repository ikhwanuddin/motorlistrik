// HTML statis untuk mesin pencari, dijalankan saat deploy (.github/workflows/static.yml), tidak di-commit:
// - tabel semua motor di index.html (antara <!-- TABEL:START --> dan <!-- TABEL:END -->)
// - satu halaman per motor di motor/<slug>/index.html, tanpa JS
// - sitemap.xml (beranda + semua halaman motor)
// Pakai: node scripts/build-static.mjs [folder situs, default root repo]
import fs from "node:fs";
import path from "node:path";

const SITE = "https://motorlistrik.ikhwanuddin.com";
const root = process.argv[2] || new URL("..", import.meta.url).pathname;
const { MOTORS, CHECKED_AT } = new Function(`${fs.readFileSync(path.join(root, "assets/js/data.js"), "utf8")}; return { MOTORS, CHECKED_AT };`)();
const ver = (process.env.GITHUB_SHA || "dev").slice(0, 7); // sama dengan ?v= di index.html saat deploy

// sama dengan SLUGS di app.js
const slug = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const SHORT = MOTORS.map((m) => slug(`${m.brand} ${m.model.split(" (")[0]}`));
const SLUGS = MOTORS.map((m, i) => (SHORT.indexOf(SHORT[i]) === SHORT.lastIndexOf(SHORT[i]) ? SHORT[i] : slug(`${m.brand} ${m.model}`)));

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const num = (n) => n.toLocaleString("id-ID", { maximumFractionDigits: 2 });
const jt = (n) => `Rp ${num(n / 1e6)} jt`;
const rp = (n) => `Rp ${n.toLocaleString("id-ID")}`;
const day = (iso) => new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
const val = (v) => (v == null ? `<span class="muted">Belum ada data</span>` : esc(v));
const STNK = { true: "Bisa", false: "Tidak", null: "Belum jelas" };
const byPrice = MOTORS.map((m, i) => i).sort((a, b) => MOTORS[a].price - MOTORS[b].price);

for (const m of MOTORS) {
  const h = m.priceHistory;
  if (h && h[h.length - 1][1] !== m.price) throw new Error(`${m.brand} ${m.model}: harga terakhir di priceHistory beda dengan price`);
}
// perubahan terakhir dari priceHistory, null kalau belum pernah berubah
function change(m) {
  const h = m.priceHistory;
  if (!h) return null;
  const diff = m.price - h[h.length - 2][1];
  return { diff, before: h[h.length - 2][1], date: h[h.length - 1][0], word: diff < 0 ? "turun" : "naik" };
}

/* ── TABEL DI index.html ───────────────────────────────────────────────── */
const rows = byPrice
  .map((i) => {
    const m = MOTORS[i];
    const c = change(m);
    const rent = m.batteryRent ? `<br><small>+ sewa ${rp(m.batteryRent)}/bln</small>` : "";
    const moved = c ? `<br><small>${c.word} ${jt(Math.abs(c.diff))} sejak ${day(c.date)}</small>` : "";
    return `          <tr>
            <th scope="row"><a href="motor/${SLUGS[i]}/">${esc(m.brand)} ${esc(m.model)}</a></th>
            <td>${jt(m.price)}<br><small>${esc(m.priceTag)}</small>${rent}${moved}</td>
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
          <caption>${MOTORS.length} motor listrik di bawah Rp 30 juta, urut harga. Data per ${day(CHECKED_AT)}.</caption>
          <thead><tr><th scope="col">Motor</th><th scope="col">Harga</th><th scope="col">Baterai</th><th scope="col">Jarak klaim</th><th scope="col">Kecepatan</th><th scope="col">STNK</th></tr></thead>
          <tbody>
${rows}
          </tbody>
        </table>
      </div>
      <!-- TABEL:END -->`;

const indexPath = path.join(root, "index.html");
const html = fs.readFileSync(indexPath, "utf8");
const marks = /<!-- TABEL:START -->[\s\S]*<!-- TABEL:END -->/;
if (!marks.test(html)) throw new Error("penanda TABEL tidak ketemu di index.html");
fs.writeFileSync(indexPath, html.replace(marks, table));

/* ── HALAMAN PER MOTOR ─────────────────────────────────────────────────── */
function tags(m) {
  const t = [];
  t.push(m.batteryType === "SLA" ? `<span class="tag tag-sla">Aki SLA</span>` : `<span class="tag tag-li">${m.batteryType === "LFP" ? "Lithium LFP" : "Lithium"}</span>`);
  if (m.batteryScheme.startsWith("Sewa")) t.push(`<span class="tag tag-rent">Baterai sewa</span>`);
  else if (m.batteryScheme.includes("Swap")) t.push(`<span class="tag">Bisa swap</span>`);
  if (m.stnk === false) t.push(`<span class="tag tag-bad">Tanpa STNK</span>`);
  if (m.stnk === null) t.push(`<span class="tag tag-warn">STNK belum jelas</span>`);
  return t.join("");
}

function history(m) {
  if (m.priceHistory) return m.priceHistory.map(([d, p]) => `${day(d)}: ${rp(p)}`).join("<br>");
  return m.priceUrl ? "Belum berubah sejak mulai dipantau (dicek tiap minggu)" : "Tidak dipantau otomatis, harga hanya ada di gambar atau media";
}

// motor lain dengan harga terdekat, untuk link antarhalaman
function nearby(i) {
  return byPrice
    .filter((j) => j !== i)
    .sort((a, b) => Math.abs(MOTORS[a].price - MOTORS[i].price) - Math.abs(MOTORS[b].price - MOTORS[i].price))
    .slice(0, 6)
    .sort((a, b) => MOTORS[a].price - MOTORS[b].price);
}

function page(m, i) {
  const name = `${m.brand} ${m.model}`;
  const url = `${SITE}/motor/${SLUGS[i]}/`;
  const c = change(m);
  const title = `${name}: harga ${jt(m.price)}, ${m.range} km, ${num(m.kwh)} kWh | motorlistrik`;
  const desc = `Harga normal ${rp(m.price)} (${m.priceTag}), jarak klaim ${m.range} km, kecepatan ${m.speed} km/j, baterai ${num(m.kwh)} kWh ${m.batteryType}, STNK: ${STNK[m.stnk].toLowerCase()}. Dari sumber resmi, dicek ${day(m.checkedAt)}.`;
  const specs = [
    ["Keterangan harga", val(m.priceNote)],
    ["Riwayat harga", history(m)],
    ["Baterai", val(m.battery)],
    ["Kapasitas", `${num(m.kwh)} kWh`],
    ["Waktu charge", val(m.chargeTime)],
    ["Skema baterai", val(m.batteryScheme)],
    ["Sewa baterai", m.batteryRent ? `${rp(m.batteryRent)}/bulan${m.rentKmCap ? `, sampai ${num(m.rentKmCap)} km/bulan` : ""}` : "Tidak ada, baterai dibeli"],
    ["Biaya sewa / swap", m.batteryScheme === "Beli" ? "Tidak ada, baterai dibeli" : val(m.swapCost)],
    ["Harga baterai baru", val(m.batteryPrice)],
    ["STNK & plat", m.stnk === true ? "Bisa" : m.stnk === false ? `<span class="text-bad">Tidak bisa, dijual tanpa surat</span>` : `<span class="text-warn">Belum jelas</span>`],
    ["Garansi", val(m.warranty)],
    ["Catatan", val(m.notes)],
    ["Sumber", `<ul class="sources">${m.sources.map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)}</a></li>`).join("")}</ul>`],
    ["Data dicek", day(m.checkedAt)],
  ];
  const others = nearby(i)
    .map((j) => `<li><a href="../${SLUGS[j]}/">${esc(MOTORS[j].brand)} ${esc(MOTORS[j].model)}</a> <span class="muted">${jt(MOTORS[j].price)}</span></li>`)
    .join("");
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#f4f3ee" media="(prefers-color-scheme: light)" />
  <meta name="theme-color" content="#0e0f12" media="(prefers-color-scheme: dark)" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}" />
  <link rel="canonical" href="${url}" />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="id_ID" />
  <meta property="og:site_name" content="motorlistrik" />
  <meta property="og:title" content="${esc(`${name}: harga ${jt(m.price)}, ${m.range} km, ${num(m.kwh)} kWh`)}" />
  <meta property="og:description" content="${esc(desc)}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${SITE}/assets/img/og.jpg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚡</text></svg>" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'self'; font-src 'self'; img-src 'self' data:; base-uri 'none'; form-action 'none'" />
  <meta name="referrer" content="strict-origin-when-cross-origin" />
  <link rel="stylesheet" href="/assets/css/style.css?v=${ver}" />
</head>
<body>
  <header class="hero page-hero">
    <div class="wrap">
      <nav class="topbar">
        <a href="/" class="logo">⚡ motorlistrik</a>
        <div class="topbar-links">
          <a href="/#daftar">Daftar</a>
          <a href="/#biaya">Biaya</a>
          <a href="/#sebelum-beli">Sebelum beli</a>
        </div>
      </nav>
    </div>
  </header>

  <main class="wrap motor-page">
    <p class="crumbs"><a href="/">Semua motor listrik di bawah Rp 30 juta</a> › ${esc(m.brand)}</p>
    <article class="motor-card">
      <p class="brand">${esc(m.brand)}</p>
      <h1 class="model">${esc(m.model)}</h1>
      <div class="detail-price">
        <p class="price">${rp(m.price)}</p>
        <p class="price-tag">${esc(m.priceTag)}</p>
        ${c ? `<p class="price-change ${c.diff < 0 ? "down" : "up"}">${c.word === "turun" ? "Turun" : "Naik"} ${jt(Math.abs(c.diff))} pada ${day(c.date)}, sebelumnya ${jt(c.before)}</p>` : ""}
        <div class="tags">${tags(m)}</div>
      </div>
      <div class="tiles">
        <div class="tile"><span>Jarak tempuh</span><strong>${m.range}<small> km</small></strong></div>
        <div class="tile"><span>Kecepatan maks</span><strong>${m.speed}<small> km/j</small></strong></div>
        <div class="tile"><span>Daya maks</span><strong>${m.power.toLocaleString("id-ID")}<small> W</small></strong></div>
      </div>
      <dl class="specs">${specs.map(([l, v]) => `<dt>${l}</dt><dd>${v}</dd>`).join("")}</dl>
      <div class="page-actions">
        <a class="btn-primary" href="/?motor=${SLUGS[i]}">Lihat di peta &amp; bandingkan</a>
        <a class="btn-secondary" href="${esc(m.url)}" target="_blank" rel="noopener noreferrer">Situs resmi ↗</a>
      </div>
    </article>

    <section class="nearby">
      <h2>Motor lain di kisaran harga ini</h2>
      <ul>${others}</ul>
    </section>
  </main>

  <footer class="footer">
    <div class="wrap">
      <p>Harga normal tanpa promo &amp; tanpa subsidi. Jarak tempuh klaim pabrik, di jalan bisa turun 20–40%. Selalu cek ke dealer resmi sebelum membeli.</p>
      <p>Data salah atau sudah berubah? <a href="https://github.com/ikhwanuddin/motorlistrik/issues/new?template=data-motor.yml&amp;title=${encodeURIComponent(`[data] ${name}`)}&amp;motor=${encodeURIComponent(name)}" target="_blank" rel="noopener noreferrer">Laporkan</a></p>
    </div>
  </footer>
</body>
</html>
`;
}

fs.rmSync(path.join(root, "motor"), { recursive: true, force: true });
MOTORS.forEach((m, i) => {
  const dir = path.join(root, "motor", SLUGS[i]);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), page(m, i));
});

/* ── SITEMAP ───────────────────────────────────────────────────────────── */
const urls = [`${SITE}/`, ...SLUGS.map((s) => `${SITE}/motor/${s}/`)];
fs.writeFileSync(
  path.join(root, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${u}</loc><lastmod>${CHECKED_AT}</lastmod></url>`).join("\n")}\n</urlset>\n`,
);
console.error(`tabel + ${MOTORS.length} halaman motor + sitemap (${urls.length} url) ditulis ke ${root}`);
