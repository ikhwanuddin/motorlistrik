/* =========================================================
   UI: peta harga, daftar + filter, detail, bandingkan.
   Data ada di data.js (MOTORS, CHECKED_AT).
   ========================================================= */

"use strict";

const MAX_COMPARE = 3;
const compare = []; // indeks MOTORS yang dipilih untuk dibandingkan
let near = []; // indeks motor di sekitar titik yang di-tap di peta (kalau lebih dari satu)
let chartPts = []; // posisi piksel tiap titik peta, untuk hit-test tap

const NEAR_PX = 22; // radius tap di peta
let chartKey = null; // sumbu yang terakhir digambar, untuk tahu kapan garis paling worth it digambar ulang

/* Sumbu tegak peta, key = field di data.js. better: kalimat "lebih unggul" untuk sumbu itu */
const AXES = {
  kwh: { title: "kapasitas baterai", unit: "kWh", min: 0.5, max: 4.5, step: 0.5, better: "baterainya lebih besar" },
  range: { title: "jarak tempuh", unit: "km", min: 30, max: 180, step: 30, better: "klaim jaraknya lebih jauh" },
  speed: { title: "kecepatan maks", unit: "km/j", min: 30, max: 105, step: 15, better: "lebih kencang" },
};
let yKey = "kwh";
// sumbu harga: harga beli saja, atau harga + sewa baterai RENT_MONTHS bulan (motor baterai sewa jadi bisa dibandingkan)
const RENT_MONTHS = 36;
let xKey = "price";
let detailI = null; // motor yang sedang dibuka di panel detail

// id motor di URL, mis. "volta-401"
const slug = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const SHORT = MOTORS.map((m) => slug(`${m.brand} ${m.model.split(" (")[0]}`));
// keterangan dalam kurung dibuang supaya link tetap pendek, kecuali kalau jadi kembar (varian sewa/beli baterai)
const SLUGS = MOTORS.map((m, i) => (SHORT.indexOf(SHORT[i]) === SHORT.lastIndexOf(SHORT[i]) ? SHORT[i] : slug(`${m.brand} ${m.model}`)));

const MAX = {
  range: Math.max(...MOTORS.map((m) => m.range)),
  speed: Math.max(...MOTORS.map((m) => m.speed)),
  power: Math.max(...MOTORS.map((m) => m.power)),
};

const IDR = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const $ = (id) => document.getElementById(id);

/* Baris teks di panel detail & bandingkan */
const DETAILS = [
  ["Keterangan harga", (m) => val(m.priceNote)],
  ["Riwayat harga", (m) => historyText(m)],
  ["Baterai", (m) => val(m.battery)],
  ["Waktu charge", (m) => val(m.chargeTime)],
  ["Skema baterai", (m) => val(m.batteryScheme)],
  ["Biaya sewa / swap", (m) => (m.batteryScheme === "Beli" ? "Tidak ada, baterai dibeli" : val(m.swapCost))],
  ["Harga baterai baru", (m) => val(m.batteryPrice)],
  ["Biaya per bulan", (m) => costText(m)],
  ["STNK & plat", (m) => stnkText(m.stnk)],
  ["Garansi", (m) => val(m.warranty)],
  ["Catatan", (m) => val(m.notes)],
  ["Sumber", (m) => sourceList(m)],
  ["Data dicek", (m) => formatDate(m.checkedAt)],
];

/* Baris angka di bandingkan; better: 1 = makin besar makin baik, -1 = makin kecil */
const NUMBERS = [
  ["Harga", (m) => m.price, -1, (m) => IDR.format(m.price)],
  ["Jarak tempuh", (m) => m.range, 1, (m) => `${m.range} km`],
  ["Kecepatan maks", (m) => m.speed, 1, (m) => `${m.speed} km/j`],
  ["Daya maks", (m) => m.power, 1, (m) => `${m.power.toLocaleString("id-ID")} W`],
  ["Biaya per bulan", (m) => Math.round(monthlyCost(m).total), -1, (m) => rp(monthlyCost(m).total)],
];

/* ── INIT ─────────────────────────────────────────────────────────────── */
fillBrands();
readUrl();
renderIntro();
render();
bindEvents();
if (matchMedia("(min-width: 960px)").matches) $("filters").open = true;
openFromUrl();

function fillBrands() {
  const brands = [...new Set(MOTORS.map((m) => m.brand))].sort();
  $("brand").innerHTML += brands
    .map((b) => `<option value="${esc(b)}">${esc(b)} (${MOTORS.filter((m) => m.brand === b).length})</option>`)
    .join("");
}

function renderIntro() {
  $("nModels").textContent = MOTORS.length;
  $("checkedAt").textContent = formatDate(CHECKED_AT);

  const brands = new Set(MOTORS.map((m) => m.brand)).size;
  const legal = MOTORS.filter((m) => m.stnk === true);
  const cheapest = legal.reduce((a, b) => (b.price < a.price ? b : a));
  const farthest = MOTORS.reduce((a, b) => (b.range > a.range ? b : a));
  const lithium = MOTORS.filter(isLithium).length;

  $("facts").innerHTML = [
    fact(`${brands}`, "merek"),
    fact(jt(cheapest.price), `termurah yang bisa STNK · ${cheapest.brand} ${cheapest.model}`),
    fact(`${farthest.range} km`, `jarak terjauh · ${farthest.brand} ${farthest.model.split(" (")[0]}`),
    fact(`${lithium}/${MOTORS.length}`, "pakai baterai lithium"),
  ].join("");
}

function fact(value, label) {
  return `<div class="fact"><strong>${esc(value)}</strong><span>${esc(label)}</span></div>`;
}

/* ── FILTER + SORT ────────────────────────────────────────────────────── */
function visible() {
  const brand = $("brand").value;
  const budget = Number($("budget").value) * 1e6;
  const minRange = Number(radio("range"));
  const minSpeed = Number(radio("speed"));
  const batt = radio("batt");
  const onlyStnk = $("onlyStnk").checked;
  const ownBattery = $("ownBattery").checked;
  const [key, dir] = $("sort").value.split(":");

  return MOTORS.map((m, i) => i)
    .filter((i) => {
      const m = MOTORS[i];
      if (brand && m.brand !== brand) return false;
      if (m.price > budget) return false;
      if (m.range < minRange) return false;
      if (m.speed < minSpeed) return false;
      if (batt === "li" && !isLithium(m)) return false;
      if (batt === "sla" && isLithium(m)) return false;
      if (onlyStnk && m.stnk !== true) return false;
      if (ownBattery && isRent(m)) return false;
      return true;
    })
    .sort((a, b) => (MOTORS[a][key] - MOTORS[b][key]) * Number(dir));
}

function activeFilterCount() {
  let n = 0;
  if ($("brand").value) n++;
  if ($("budget").value !== "30") n++;
  if (radio("range") !== "0") n++;
  if (radio("speed") !== "0") n++;
  if (radio("batt") !== "all") n++;
  if ($("onlyStnk").checked) n++;
  if ($("ownBattery").checked) n++;
  return n;
}

/* ── RENDER ───────────────────────────────────────────────────────────── */
function render() {
  const shown = visible();
  const sortKey = $("sort").value.split(":")[0];

  $("budgetOut").textContent = `≤ ${jt(Number($("budget").value) * 1e6)}`;
  const n = activeFilterCount();
  $("filterCount").textContent = n ? n : "";
  $("count").textContent =
    shown.length === MOTORS.length ? `Semua ${MOTORS.length} motor` : `${shown.length} dari ${MOTORS.length} motor`;
  $("showResults").textContent = shown.length ? `Lihat ${shown.length} motor` : "Tidak ada yang cocok";

  $("list").innerHTML = shown.length
    ? shown.map((i) => row(i, sortKey)).join("")
    : `<div class="empty"><p>Tidak ada motor yang cocok.</p><button type="button" class="btn-text" data-reset>Reset filter</button></div>`;

  near = [];
  renderChart(shown);
  renderCost(shown);
  renderTray();
  writeUrl();
}

function row(i, sortKey) {
  const m = MOTORS[i];
  const picked = compare.includes(i);
  const full = !picked && compare.length >= MAX_COMPARE;
  return `
  <article class="moto${picked ? " is-picked" : ""}" tabindex="0" data-i="${i}">
    <div class="moto-id">
      <p class="brand">${esc(m.brand)}</p>
      <h3 class="model">${esc(m.model)}</h3>
      <div class="tags">${tags(m)}</div>
    </div>
    <div class="moto-price">
      <p class="price">${IDR.format(m.price)}</p>
      <p class="price-tag">${esc(m.priceTag)}</p>
      ${changeBadge(m)}
    </div>
    <div class="moto-stats">
      ${stat("Jarak", m.range, "km", "range", sortKey)}
      ${stat("Kecepatan", m.speed, "km/j", "speed", sortKey)}
      ${stat("Daya", m.power, "W", "power", sortKey)}
    </div>
    <button type="button" class="pick" data-pick="${i}" aria-pressed="${picked}" ${full ? "disabled" : ""}>
      ${picked ? "✓ Dipilih" : "+ Bandingkan"}
    </button>
  </article>`;
}

function stat(label, v, unit, key, sortKey) {
  const pct = Math.round((v / MAX[key]) * 100);
  return `
    <div class="stat${key === sortKey ? " is-sorted" : ""}">
      <span class="stat-l">${label}</span>
      <span class="stat-v">${v.toLocaleString("id-ID")}<small> ${unit}</small></span>
      <span class="bar"><i style="width:${pct}%"></i></span>
    </div>`;
}

function tags(m) {
  const t = [];
  if (isLithium(m)) t.push(`<span class="tag tag-li">${m.batteryType === "LFP" ? "Lithium LFP" : "Lithium"}</span>`);
  else t.push(`<span class="tag tag-sla">Aki SLA</span>`);
  if (isRent(m)) t.push(`<span class="tag tag-rent">Baterai sewa</span>`);
  else if (m.batteryScheme.includes("Swap")) t.push(`<span class="tag">Bisa swap</span>`);
  if (m.stnk === false) t.push(`<span class="tag tag-bad">Tanpa STNK</span>`);
  if (m.stnk === null) t.push(`<span class="tag tag-warn">STNK belum jelas</span>`);
  return t.join("");
}

/* ── PETA HARGA vs SUMBU TEGAK (SVG) ──────────────────────────────────── */
// Titik pindah dari posisi lama ke posisi baru lewat transisi CSS (pertama kali: naik dari bawah).
// Garis paling worth it digambar ulang tiap kali sumbu berganti.
function renderChart(shown) {
  const el = $("chart");
  const W = el.clientWidth;
  const H = W < 600 ? 300 : 360;
  const pad = { l: 54, r: 12, t: 12, b: 34 };
  const ax = AXES[yKey];
  const x0 = 8e6, x1 = 30e6;
  const x = (p) => pad.l + ((p - x0) / (x1 - x0)) * (W - pad.l - pad.r);
  const y = (v) => H - pad.b - ((v - ax.min) / (ax.max - ax.min)) * (H - pad.t - pad.b);
  const intro = chartPts.length === 0;
  const newAxis = chartKey !== yKey + xKey;
  chartKey = yKey + xKey;

  let grid = "";
  // garis 20 jt lebih tebal: batas lama situs, patokan buat yang budgetnya segitu
  for (let p = x0; p <= x1; p += W < 600 ? 4e6 : 2e6) {
    grid += `<line class="grid${p === 20e6 ? " grid-20" : ""}" x1="${x(p)}" x2="${x(p)}" y1="${pad.t}" y2="${H - pad.b}"/>`;
    grid += `<text class="axis" x="${x(p)}" y="${H - 12}" text-anchor="middle">${p / 1e6} jt</text>`;
  }
  for (let v = ax.min; v <= ax.max; v += ax.step) {
    grid += `<line class="grid" x1="${pad.l}" x2="${W - pad.r}" y1="${y(v)}" y2="${y(v)}"/>`;
    grid += `<text class="axis" x="${pad.l - 8}" y="${y(v) + 4}" text-anchor="end">${v.toLocaleString("id-ID")} ${ax.unit}</text>`;
  }

  // garis paling worth it bertangga: naik dari sumbu bawah, tiap motor paling worth it jadi anak tangga, lalu datar sampai kanan
  const fr = frontier(yKey).map((i) => MOTORS[i]);
  let d = `M${x(cost(fr[0]))} ${H - pad.b}`;
  for (const m of fr) d += `H${x(cost(m))}V${y(m[yKey])}`;
  d += `H${W - pad.r}`;
  const line = `<path class="front${newAxis ? " is-draw" : ""}" style="animation-delay:${intro ? 0.8 : 0.4}s" d="${d}"/>`;

  // motor yang dipilih / di sekitar tap digambar terakhir supaya di atas titik lain
  const prev = new Map(chartPts.map((p) => [p.i, p]));
  const front = (i) => compare.includes(i) || near.includes(i);
  const order = MOTORS.map((m, i) => i).sort((a, b) => front(a) - front(b));
  chartPts = order.map((i) => ({ i, x: x(cost(MOTORS[i])), y: y(MOTORS[i][yKey]) }));
  const points = chartPts.map(({ i, x: px, y: py }) => {
    const m = MOTORS[i];
    const right = px > W - 150;
    const from = prev.get(i) || { x: px, y: H - pad.b };
    const delay = intro ? Math.round(((px - pad.l) / W) * 500) : 0;
    const cls = [
      "pt",
      isLithium(m) ? "pt-li" : "pt-sla",
      isRent(m) ? "pt-rent" : "",
      shown.includes(i) ? "" : "is-out",
      compare.includes(i) ? "is-picked" : "",
      near.includes(i) ? "is-near" : "",
    ].join(" ");
    return `
      <g class="${cls}" data-i="${i}" tabindex="0" aria-label="${esc(m.brand)} ${esc(m.model)}: ${IDR.format(cost(m))}, ${dec(m.kwh)} kWh, ${m.range} km, ${m.speed} km/j" style="transform:translate(${from.x.toFixed(1)}px,${from.y.toFixed(1)}px);transition-delay:${delay}ms">
        <circle class="hit" r="14"/>
        <circle class="dot" r="${dotR(m.speed).toFixed(1)}"/>
        <text x="${right ? -14 : 14}" y="4" text-anchor="${right ? "end" : "start"}">${esc(m.brand)} ${esc(m.model.split(" (")[0])}</text>
      </g>`;
  }).join("");

  el.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Grafik harga terhadap ${ax.title}">${grid}${line}${points}</svg><div id="chartTip" class="chart-tip" hidden></div>`;
  // baca layout dulu supaya posisi awal terpasang, baru pindah ke posisi baru (transisi CSS)
  el.getBoundingClientRect();
  for (const p of chartPts) el.querySelector(`.pt[data-i="${p.i}"]`).style.transform = `translate(${p.x.toFixed(1)}px,${p.y.toFixed(1)}px)`;
  renderChartPick();
}

/** Harga di sumbu peta: harga beli, atau ditambah sewa baterai RENT_MONTHS bulan */
function cost(m) {
  return m.price + (xKey === "tco" ? (m.batteryRent || 0) * RENT_MONTHS : 0);
}

/** Baterai sewa tidak ikut garis paling worth it kalau sumbunya harga beli, karena harganya belum termasuk baterai */
function outOfFront(m) {
  return xKey === "price" && isRent(m);
}

/** Indeks motor paling worth it untuk sumbu `key`, urut harga: tidak ada motor lain yang harganya sama atau lebih murah
 *  sekaligus nilainya lebih tinggi. */
function frontier(key) {
  const own = MOTORS.map((m, i) => i).filter((i) => !outOfFront(MOTORS[i]));
  own.sort((a, b) => cost(MOTORS[a]) - cost(MOTORS[b]) || MOTORS[b][key] - MOTORS[a][key]);
  const out = [];
  let best = -Infinity;
  for (const i of own) {
    if (MOTORS[i][key] > best) {
      out.push(i);
      best = MOTORS[i][key];
    }
  }
  return out;
}

/** Motor (yang ikut garis paling worth it) yang harganya sama atau lebih murah dan nilainya lebih tinggi, termurah dulu */
function betterCheaper(i, key) {
  const m = MOTORS[i];
  return MOTORS.map((o, j) => j)
    .filter((j) => {
      const o = MOTORS[j];
      return j !== i && !outOfFront(o) && cost(o) <= cost(m) && o[key] >= m[key] && (cost(o) < cost(m) || o[key] > m[key]);
    })
    .sort((a, b) => cost(MOTORS[a]) - cost(MOTORS[b]));
}

/** Kalimat paling worth it di panel detail, ikut sumbu peta yang sedang dipilih */
function frontText(i) {
  const m = MOTORS[i];
  const ax = AXES[yKey];
  if (outOfFront(m)) return `Harga belum termasuk baterai (sewa), jadi tidak ikut garis paling worth it di peta. Pilih "+ Sewa baterai 3 thn" di peta untuk membandingkan dengan sewanya.`;
  const rent = xKey === "tco" && isRent(m) ? `Harga + sewa baterai ${RENT_MONTHS} bulan: ${jt(m.price)} + ${IDR.format(m.batteryRent)}/bln = ${jt(cost(m))}. ` : "";
  const b = betterCheaper(i, yKey);
  if (!b.length) return `${rent}<b>Paling worth it</b> untuk ${ax.title}: tidak ada motor lain yang harganya sama atau lebih murah sekaligus ${ax.better}.`;
  const names = b.slice(0, 3).map((j) => `<b>${esc(MOTORS[j].brand)} ${esc(MOTORS[j].model)}</b> (${jt(cost(MOTORS[j]))}, ${axisVal(MOTORS[j])})`);
  return `${rent}${cap(ax.title)} motor ini ${axisVal(m)}. Ada yang harganya sama atau lebih murah dan ${ax.better}: ${names.join(", ")}${b.length > 3 ? `, dan ${b.length - 3} lagi` : ""}.`;
}

function axisVal(m) {
  return `${dec(m[yKey])} ${AXES[yKey].unit}`;
}

/** Label motor di atas titik saat hover (mouse) atau fokus (keyboard). Kotak HTML di atas SVG supaya tidak ketutup titik lain. */
function showTip(g) {
  const i = Number(g.dataset.i);
  const m = MOTORS[i];
  const p = chartPts.find((q) => q.i === i);
  const tip = $("chartTip");
  tip.innerHTML = `<b>${esc(m.brand)} ${esc(m.model)}</b><span>${jt(cost(m))} · ${axisVal(m)}</span>`;
  tip.hidden = false;
  // di tepi kiri/kanan kotak digeser supaya tidak keluar peta
  const half = tip.offsetWidth / 2;
  tip.style.left = `${Math.min(Math.max(p.x, half), $("chart").clientWidth - half)}px`;
  tip.style.top = `${p.y - dotR(m.speed) - 8}px`;
}

function hideTip() {
  if ($("chartTip")) $("chartTip").hidden = true;
}

/** Daftar pilihan saat tap kena beberapa titik yang berdempetan */
function renderChartPick() {
  $("chartPick").hidden = near.length === 0;
  $("chartPick").innerHTML = `
    <div class="chart-pick-head">
      <span>${near.length} motor di sini</span>
      <button type="button" class="close" data-close-pick aria-label="Tutup">✕</button>
    </div>
    <div class="chart-pick-list">
      ${near
        .map((i) => {
          const m = MOTORS[i];
          return `<button type="button" data-i="${i}"><b>${esc(m.brand)} ${esc(m.model)}</b><span>${jt(cost(m))} · ${dec(m.kwh)} kWh · ${m.range} km · ${m.speed} km/j</span></button>`;
        })
        .join("")}
    </div>`;
}

/** Motor dalam radius NEAR_PX dari titik tap, terdekat dulu. Titik yang tersaring diabaikan kalau ada yang aktif. */
function pointsNear(px, py) {
  const shown = visible();
  const hits = chartPts
    .map((p) => ({ i: p.i, d: Math.hypot(p.x - px, p.y - py) }))
    .filter((p) => p.d <= NEAR_PX)
    .sort((a, b) => a.d - b.d);
  const active = hits.filter((p) => shown.includes(p.i));
  return (active.length ? active : hits).map((p) => p.i);
}

/** Jari-jari titik peta dari kecepatan: 40 km/j → 3,5 px, 85 km/j → 10 px */
function dotR(speed) {
  return 3.5 + ((speed - 40) / 65) * 6.5;
}

/* ── BIAYA PER BULAN ────────────────────────────────────────────────────── */
function costInputs() {
  const km = num("kmDay") * num("days");
  return { km, tariff: num("tariff"), soc: num("soc"), fuel: (km / Math.max(num("fuelKm"), 1)) * num("fuelPrice") };
}

/** Listrik cas di rumah (pakai jarak tempuh klaim) + sewa baterai */
function monthlyCost(m, c = costInputs()) {
  const power = (c.km / m.range) * m.kwh * c.tariff;
  const rent = m.batteryRent || 0;
  return { power, rent, total: power + rent };
}

function costText(m) {
  const c = costInputs();
  const { power, rent, total } = monthlyCost(m, c);
  return `${rp(total)} untuk ${c.km.toLocaleString("id-ID")} km (listrik ${rp(power)}${rent ? ` + sewa baterai ${rp(rent)}` : ""}). Motor bensin: ${rp(c.fuel)}. Atur di bagian Biaya per bulan.`;
}

function renderCost(shown) {
  const c = costInputs();
  $("costRef").innerHTML = `${c.km.toLocaleString("id-ID")} km/bulan. Motor bensin: <strong>${rp(c.fuel)}</strong>/bulan (garis hitam di tiap bar). Termurah dulu.`;
  const rows = shown.map((i) => ({ i, ...monthlyCost(MOTORS[i], c) })).sort((a, b) => a.total - b.total);
  const max = Math.max(c.fuel, ...rows.map((r) => r.total)) || 1;
  $("costList").innerHTML = rows.length
    ? rows.map((r) => costRow(r, c, max)).join("")
    : `<div class="empty"><p>Tidak ada motor yang cocok dengan filter.</p></div>`;
}

function costRow({ i, power, rent, total }, c, max) {
  const m = MOTORS[i];
  const diff = c.fuel - total;
  const perCharge = Math.floor(m.range * c.soc); // km per sekali cas dalam batas cas
  const warn = [];
  if (num("kmDay") > perCharge) warn.push(`Jarak harian lebih dari ${perCharge} km sekali cas`);
  if (m.rentKmCap && c.km > m.rentKmCap) warn.push(`Lewat ${m.rentKmCap} km/bulan ada biaya sewa tambahan`);
  return `
  <article class="cost-row" tabindex="0" data-i="${i}">
    <div class="cost-name">
      <p class="brand">${esc(m.brand)}</p>
      <h3 class="model">${esc(m.model.split(" (")[0])}</h3>
      ${warn.map((w) => `<p class="cost-warn">${w}</p>`).join("")}
    </div>
    <div class="cost-parts">
      ${rent ? `<span>Listrik ${rp(power)}</span><span>Sewa baterai ${rp(rent)}</span>` : `<span>Listrik saja, baterai dibeli</span>`}
      <span>±${perCharge} km/cas · cas ${Math.ceil(c.km / perCharge)}×/bulan</span>
    </div>
    <div class="cost-total">
      <strong>${rp(total)}</strong>
      <span class="${diff >= 0 ? "text-good" : "text-bad"}">${diff >= 0 ? "Hemat" : "Lebih mahal"} ${rp(Math.abs(diff))}</span>
    </div>
    <span class="cost-bar"><i style="width:${(total / max) * 100}%"></i><b style="left:${(c.fuel / max) * 100}%" title="Motor bensin"></b></span>
  </article>`;
}

/* ── BANDINGKAN ───────────────────────────────────────────────────────── */
function togglePick(i) {
  const k = compare.indexOf(i);
  if (k >= 0) compare.splice(k, 1);
  else if (compare.length < MAX_COMPARE) compare.push(i);
  render();
}

function renderTray() {
  $("tray").hidden = compare.length === 0;
  document.body.classList.toggle("has-tray", compare.length > 0);
  $("trayItems").innerHTML = compare
    .map((i) => {
      const m = MOTORS[i];
      return `<span class="chip">${esc(m.brand)} <b>${esc(m.model)}</b><button type="button" data-unpick="${i}" aria-label="Hapus ${esc(m.model)}">✕</button></span>`;
    })
    .join("");
  $("trayGo").disabled = compare.length < 2;
  $("trayGo").textContent = compare.length < 2 ? "Pilih 1 lagi" : `Bandingkan ${compare.length} motor`;
}

function openCompare() {
  const ms = compare.map((i) => MOTORS[i]);

  const names = ms
    .map((m) => `<div><p class="brand">${esc(m.brand)}</p><p class="model">${esc(m.model)}</p></div>`)
    .join("");

  const numRows = NUMBERS.map(([label, get, better, fmt]) => {
    const vals = ms.map(get);
    const best = better > 0 ? Math.max(...vals) : Math.min(...vals);
    const allSame = vals.every((v) => v === vals[0]);
    const cells = ms
      .map((m, k) => `<div class="${!allSame && vals[k] === best ? "best" : ""}">${fmt(m)}</div>`)
      .join("");
    return cmpRow(label, cells);
  }).join("");

  const textRows = [["Tipe baterai", (m) => `<div class="tags">${tags(m)}</div>`], ...DETAILS]
    .map(([label, fn]) => cmpRow(label, ms.map((m) => `<div>${fn(m)}</div>`).join("")))
    .join("");

  const links = ms
    .map((m) => `<div><a class="btn-secondary" href="${safeUrl(m.url)}" target="_blank" rel="noopener noreferrer">Situs resmi ↗</a></div>`)
    .join("");

  $("compareBody").innerHTML = `
    <header class="sheet-head">
      <h2>Bandingkan</h2>
      <div class="sheet-head-actions">${shareBtn()}<button type="button" class="close" data-close aria-label="Tutup">✕</button></div>
    </header>
    <div class="cmp" style="--n:${ms.length}">
      <div class="cmp-names">${names}</div>
      ${numRows}
      ${textRows}
      ${cmpRow("Halaman produk", links)}
    </div>
    <p class="fineprint">Yang ditandai = terbaik di antara motor yang dibandingkan. Jarak tempuh klaim pabrik.</p>`;
  $("compare").showModal();
}

function cmpRow(label, cells) {
  return `<section class="cmp-row"><h3>${label}</h3><div class="cmp-vals">${cells}</div></section>`;
}

/* ── DETAIL ───────────────────────────────────────────────────────────── */
function fillDetail(i) {
  const m = MOTORS[i];
  const picked = compare.includes(i);
  const full = !picked && compare.length >= MAX_COMPARE;
  $("detailBody").innerHTML = `
    <header class="sheet-head">
      <div>
        <p class="brand">${esc(m.brand)}</p>
        <h2 id="detailTitle" class="model">${esc(m.model)}</h2>
      </div>
      <div class="sheet-head-actions">${shareBtn()}<button type="button" class="close" data-close aria-label="Tutup">✕</button></div>
    </header>
    <div class="detail-price">
      <p class="price">${IDR.format(m.price)}</p>
      <p class="price-tag">${esc(m.priceTag)}</p>
      ${changeText(m)}
      <div class="tags">${tags(m)}</div>
    </div>
    <div class="tiles">
      ${tile("Jarak tempuh", m.range, "km")}
      ${tile("Kecepatan maks", m.speed, "km/j")}
      ${tile("Daya maks", m.power.toLocaleString("id-ID"), "W")}
    </div>
    <p class="front-note">${frontText(i)}</p>
    <dl class="specs">${DETAILS.map(([label, fn]) => `<dt>${label}</dt><dd>${fn(m)}</dd>`).join("")}</dl>
    <p class="report">Data salah atau sudah berubah? <a href="${reportUrl(m)}" target="_blank" rel="noopener noreferrer">Laporkan ↗</a></p>
    <div class="sheet-actions">
      <a class="btn-primary" href="${safeUrl(m.url)}" target="_blank" rel="noopener noreferrer">Situs resmi ↗</a>
      <button type="button" class="btn-secondary" data-pick="${i}" ${full ? "disabled" : ""}>
        ${picked ? "✓ Dipilih untuk dibandingkan" : full ? "Maks. 3 motor dibandingkan" : "+ Bandingkan"}
      </button>
    </div>`;
}

// form issue "Data motor" di GitHub, nama motor sudah terisi
function reportUrl(m) {
  const name = `${m.brand} ${m.model}`;
  const q = new URLSearchParams({ template: "data-motor.yml", title: `[data] ${name}`, motor: name });
  return `https://github.com/ikhwanuddin/motorlistrik/issues/new?${q}`;
}

function tile(label, v, unit) {
  return `<div class="tile"><span>${label}</span><strong>${v}<small> ${unit}</small></strong></div>`;
}

function openDetail(i) {
  detailI = i;
  fillDetail(i);
  $("detail").showModal();
  writeUrl();
}

/* ── EVENTS ───────────────────────────────────────────────────────────── */
function bindEvents() {
  $("filters").addEventListener("input", render);
  $("reset").addEventListener("click", resetFilters);
  $("showResults").addEventListener("click", () => {
    $("filters").open = false;
    $("count").scrollIntoView({ behavior: "smooth" });
  });

  $("list").addEventListener("click", (e) => {
    if (e.target.closest("[data-reset]")) return resetFilters();
    const pick = e.target.closest("[data-pick]");
    if (pick) {
      const i = Number(pick.dataset.pick);
      togglePick(i);
      document.querySelector(`#list [data-pick="${i}"]`).focus();
      return;
    }
    const card = e.target.closest(".moto");
    if (card) openDetail(Number(card.dataset.i));
  });

  $("list").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.classList.contains("moto")) openDetail(Number(e.target.dataset.i));
  });

  $("chart").addEventListener("click", (e) => {
    const box = $("chart").querySelector("svg").getBoundingClientRect();
    const hits = pointsNear(e.clientX - box.left, e.clientY - box.top);
    near = hits.length > 1 ? hits : [];
    renderChart(visible());
    if (hits.length === 1) openDetail(hits[0]);
  });
  $("chart").addEventListener("pointerover", (e) => {
    if (e.pointerType !== "mouse") return;
    const g = e.target.closest(".pt");
    if (g) showTip(g);
    else hideTip();
  });
  $("chart").addEventListener("pointerleave", hideTip);
  $("chart").addEventListener("focusin", (e) => {
    const g = e.target.closest(".pt");
    if (g) showTip(g);
  });
  $("chart").addEventListener("focusout", hideTip);
  $("yAxis").addEventListener("change", (e) => {
    yKey = e.target.value;
    near = [];
    $("chartTitle").textContent = AXES[yKey].title;
    renderChart(visible());
    writeUrl();
  });
  $("xAxis").addEventListener("change", (e) => {
    xKey = e.target.value;
    near = [];
    setXTitles();
    renderChart(visible());
    writeUrl();
  });
  $("chartPick").addEventListener("click", (e) => {
    if (e.target.closest("[data-close-pick]")) {
      near = [];
      return renderChart(visible());
    }
    const b = e.target.closest("[data-i]");
    if (b) openDetail(Number(b.dataset.i));
  });
  $("chart").addEventListener("keydown", (e) => {
    const pt = e.target.closest(".pt");
    if (pt && e.key === "Enter") openDetail(Number(pt.dataset.i));
  });

  $("costInputs").addEventListener("input", () => {
    renderCost(visible());
    writeUrl();
  });
  $("costList").addEventListener("click", (e) => {
    const row = e.target.closest(".cost-row");
    if (row) openDetail(Number(row.dataset.i));
  });
  $("costList").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.classList.contains("cost-row")) openDetail(Number(e.target.dataset.i));
  });

  $("trayItems").addEventListener("click", (e) => {
    const b = e.target.closest("[data-unpick]");
    if (b) togglePick(Number(b.dataset.unpick));
  });
  $("trayClear").addEventListener("click", () => {
    compare.length = 0;
    render();
  });
  $("trayGo").addEventListener("click", openCompare);

  for (const dlg of [$("detail"), $("compare")]) {
    dlg.addEventListener("click", (e) => {
      if (e.target === dlg || e.target.closest("[data-close]")) dlg.close();
      const share = e.target.closest("[data-share]");
      if (share) shareLink(share);
    });
  }
  $("detail").addEventListener("close", () => {
    detailI = null;
    writeUrl();
  });
  $("detail").addEventListener("click", (e) => {
    const pick = e.target.closest("[data-pick]");
    if (!pick) return;
    const i = Number(pick.dataset.pick);
    togglePick(i);
    fillDetail(i);
  });

  // di HP, scroll yang menyembunyikan address bar juga memicu resize: gambar ulang hanya kalau lebar berubah
  let chartW = $("chart").clientWidth;
  addEventListener("resize", () => {
    if ($("chart").clientWidth === chartW) return;
    chartW = $("chart").clientWidth;
    renderChart(visible());
  });
}

function resetFilters() {
  $("brand").value = "";
  $("budget").value = "30";
  document.querySelector('input[name="range"][value="0"]').checked = true;
  document.querySelector('input[name="speed"][value="0"]').checked = true;
  document.querySelector('input[name="batt"][value="all"]').checked = true;
  $("onlyStnk").checked = false;
  $("ownBattery").checked = false;
  $("sort").value = "price:1";
  render();
}

/* ── URL: filter, pilihan bandingkan & motor yang dibuka disimpan di query string supaya link bisa dibagikan ── */
function readUrl() {
  const p = new URLSearchParams(location.search);
  if ([...$("brand").options].some((o) => o.value === p.get("merek"))) $("brand").value = p.get("merek");
  $("budget").value = p.get("budget") || "30";
  setRadio("range", p.get("jarak"));
  setRadio("speed", p.get("kecepatan"));
  setRadio("batt", p.get("baterai"));
  $("onlyStnk").checked = p.get("stnk") === "1";
  $("ownBattery").checked = p.get("baterai-dibeli") === "1";
  if ([...$("sort").options].some((o) => o.value === p.get("urut"))) $("sort").value = p.get("urut");
  if (Number(p.get("km")) > 0) $("kmDay").value = p.get("km");
  for (const s of (p.get("bandingkan") || "").split(",")) {
    const i = SLUGS.indexOf(s);
    if (i >= 0 && !compare.includes(i) && compare.length < MAX_COMPARE) compare.push(i);
  }
  if (AXES[p.get("sumbu")]) yKey = p.get("sumbu");
  setRadio("yaxis", yKey);
  $("chartTitle").textContent = AXES[yKey].title;
  if (p.get("harga") === "sewa-3-thn") xKey = "tco";
  setRadio("xaxis", xKey);
  setXTitles();
  const d = SLUGS.indexOf(p.get("motor"));
  if (d >= 0) detailI = d;
}

/** Link dengan ?motor= membuka detail, link dengan 2–3 motor di ?bandingkan= langsung membuka perbandingan */
function openFromUrl() {
  if (detailI !== null) openDetail(detailI);
  else if (compare.length >= 2) openCompare();
}

function writeUrl() {
  const p = new URLSearchParams();
  if ($("brand").value) p.set("merek", $("brand").value);
  if ($("budget").value !== "30") p.set("budget", $("budget").value);
  if (radio("range") !== "0") p.set("jarak", radio("range"));
  if (radio("speed") !== "0") p.set("kecepatan", radio("speed"));
  if (radio("batt") !== "all") p.set("baterai", radio("batt"));
  if ($("onlyStnk").checked) p.set("stnk", "1");
  if ($("ownBattery").checked) p.set("baterai-dibeli", "1");
  if ($("sort").value !== "price:1") p.set("urut", $("sort").value);
  if ($("kmDay").value !== "30") p.set("km", $("kmDay").value);
  if (yKey !== "kwh") p.set("sumbu", yKey);
  if (xKey === "tco") p.set("harga", "sewa-3-thn");
  if (compare.length) p.set("bandingkan", compare.map((i) => SLUGS[i]).join(","));
  if (detailI !== null) p.set("motor", SLUGS[detailI]);
  const q = p.toString().replace(/%2C/g, ",").replace(/%3A/g, ":");
  history.replaceState(null, "", (q ? `?${q}` : location.pathname) + location.hash);
}

function setXTitles() {
  $("chartXTitle").textContent = xKey === "tco" ? "harga + sewa baterai 3 thn" : "harga";
  $("rentLegend").textContent =
    xKey === "tco"
      ? `Baterai sewa: harga + sewa ${RENT_MONTHS} bulan (belum biaya swap), ikut garis paling worth it`
      : "Harga tanpa baterai (sewa), tidak ikut garis paling worth it";
}

function setRadio(name, v) {
  const el = [...document.querySelectorAll(`input[name="${name}"]`)].find((r) => r.value === v);
  if (el) el.checked = true;
}

function shareBtn() {
  return `<button type="button" class="btn-share" data-share>Bagikan</button>`;
}

/** HP: menu share bawaan (WA dll). Desktop: salin link. */
async function shareLink(btn) {
  if (navigator.share) return navigator.share({ title: document.title, url: location.href }).catch(() => {});
  await navigator.clipboard.writeText(location.href);
  btn.textContent = "✓ Link disalin";
  setTimeout(() => (btn.textContent = "Bagikan"), 2000);
}

/* ── HELPERS ──────────────────────────────────────────────────────────── */
function isLithium(m) {
  return m.batteryType !== "SLA";
}

function isRent(m) {
  return m.batteryScheme.startsWith("Sewa");
}

function radio(name) {
  return document.querySelector(`input[name="${name}"]:checked`).value;
}

function num(id) {
  return Number($(id).value) || 0;
}

/** dibulatkan ke ribuan: 20312 → "Rp 20.000" */
function rp(n) {
  return IDR.format(Math.round(n / 1000) * 1000);
}

/** 9699000 → "Rp 9,7 jt", 19950000 → "Rp 19,95 jt" */
/* ── RIWAYAT HARGA (priceHistory di data.js) ─────────────────────────────── */
// perubahan terakhir: selisih harga sekarang dengan harga sebelumnya, null kalau belum pernah berubah
function lastChange(m) {
  const h = m.priceHistory;
  if (!h) return null;
  const [date, now] = h[h.length - 1];
  const before = h[h.length - 2][1];
  return { date, before, diff: now - before };
}

function changeBadge(m) {
  const c = lastChange(m);
  if (!c) return "";
  const word = c.diff < 0 ? "Turun" : "Naik";
  return `<p class="price-change ${c.diff < 0 ? "down" : "up"}" title="${word} sejak ${formatDate(c.date)}, sebelumnya ${jt(c.before)}">${c.diff < 0 ? "↓" : "↑"} ${jt(Math.abs(c.diff))}</p>`;
}

function changeText(m) {
  const c = lastChange(m);
  if (!c) return "";
  return `<p class="price-change ${c.diff < 0 ? "down" : "up"}">${c.diff < 0 ? "Turun" : "Naik"} ${jt(Math.abs(c.diff))} pada ${formatDate(c.date)}, sebelumnya ${jt(c.before)}</p>`;
}

function historyText(m) {
  if (m.priceHistory) return m.priceHistory.map(([date, price]) => `${formatDate(date)}: ${IDR.format(price)}`).join("<br>");
  return m.priceUrl ? "Belum berubah sejak mulai dipantau (dicek tiap minggu)" : "Tidak dipantau otomatis, harga hanya ada di gambar atau media";
}

function jt(n) {
  return `Rp ${(n / 1e6).toLocaleString("id-ID", { maximumFractionDigits: 2 })} jt`;
}

function cap(t) {
  return t[0].toUpperCase() + t.slice(1);
}

/** 1.15 → "1,15" */
function dec(n) {
  return n.toLocaleString("id-ID", { maximumFractionDigits: 2 });
}

function val(v) {
  return v == null ? `<span class="muted">Belum ada data</span>` : esc(v);
}

function stnkText(stnk) {
  if (stnk === true) return "Bisa";
  if (stnk === false) return `<span class="text-bad">Tidak bisa, dijual tanpa surat</span>`;
  return `<span class="text-warn">Belum jelas</span>`;
}

function sourceList(m) {
  return `<ul class="sources">${m.sources
    .map((s) => `<li><a href="${safeUrl(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)}</a></li>`)
    .join("")}</ul>`;
}

/** "2026-10-16" → "16 Okt 2026" */
function formatDate(iso) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function esc(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/** Hanya izinkan URL http/https */
function safeUrl(str) {
  const s = String(str || "").trim();
  return /^https?:\/\//.test(s) ? esc(s) : "#";
}
