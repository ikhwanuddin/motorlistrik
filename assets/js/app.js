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
let detailI = null; // motor yang sedang dibuka di panel detail

// id motor di URL, mis. "volta-401"
const SLUGS = MOTORS.map((m) => `${m.brand} ${m.model.split(" (")[0]}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));

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
  ["Baterai", (m) => val(m.battery)],
  ["Waktu charge", (m) => val(m.chargeTime)],
  ["Skema baterai", (m) => val(m.batteryScheme)],
  ["Biaya sewa / swap", (m) => (m.batteryScheme === "Beli" ? "Tidak ada, baterai dibeli" : val(m.swapCost))],
  ["Harga baterai baru", (m) => val(m.batteryPrice)],
  ["STNK & plat", (m) => stnkText(m.stnk)],
  ["Garansi", (m) => val(m.warranty)],
  ["Catatan", (m) => val(m.notes)],
  ["Sumber", (m) => sourceList(m)],
  ["Data dicek", (m) => formatDate(m.checkedAt)],
];

/* Baris angka di bandingkan; better: 1 = makin besar makin baik, -1 = makin kecil */
const NUMBERS = [
  ["Harga", "price", -1, (m) => IDR.format(m.price)],
  ["Jarak tempuh", "range", 1, (m) => `${m.range} km`],
  ["Kecepatan maks", "speed", 1, (m) => `${m.speed} km/j`],
  ["Daya maks", "power", 1, (m) => `${m.power.toLocaleString("id-ID")} W`],
];

/* ── INIT ─────────────────────────────────────────────────────────────── */
readUrl();
renderIntro();
render();
bindEvents();
if (matchMedia("(min-width: 960px)").matches) $("filters").open = true;
openFromUrl();

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
  const q = $("q").value.trim().toLowerCase();
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
      if (q && !`${m.brand} ${m.model}`.toLowerCase().includes(q)) return false;
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
  if ($("q").value.trim()) n++;
  if ($("budget").value !== "20") n++;
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

/* ── PETA HARGA vs JARAK (SVG) ────────────────────────────────────────── */
function renderChart(shown) {
  const el = $("chart");
  const W = el.clientWidth;
  const H = W < 600 ? 300 : 360;
  const pad = { l: 46, r: 12, t: 12, b: 34 };
  const x0 = 8e6, x1 = 20e6, y0 = 30, y1 = 150;
  const x = (p) => pad.l + ((p - x0) / (x1 - x0)) * (W - pad.l - pad.r);
  const y = (r) => H - pad.b - ((r - y0) / (y1 - y0)) * (H - pad.t - pad.b);

  let grid = "";
  for (let p = x0; p <= x1; p += 2e6) {
    grid += `<line class="grid" x1="${x(p)}" x2="${x(p)}" y1="${pad.t}" y2="${H - pad.b}"/>`;
    grid += `<text class="axis" x="${x(p)}" y="${H - 12}" text-anchor="middle">${p / 1e6} jt</text>`;
  }
  for (let r = y0; r <= y1; r += 30) {
    grid += `<line class="grid" x1="${pad.l}" x2="${W - pad.r}" y1="${y(r)}" y2="${y(r)}"/>`;
    grid += `<text class="axis" x="${pad.l - 8}" y="${y(r) + 4}" text-anchor="end">${r} km</text>`;
  }

  // motor yang dipilih / di sekitar tap digambar terakhir supaya di atas titik lain
  const front = (i) => compare.includes(i) || near.includes(i);
  const order = MOTORS.map((m, i) => i).sort((a, b) => front(a) - front(b));
  chartPts = order.map((i) => ({ i, x: x(MOTORS[i].price), y: y(MOTORS[i].range) }));
  const points = chartPts.map(({ i, x: px, y: py }) => {
    const m = MOTORS[i];
    const right = px > W - 150;
    const cls = [
      "pt",
      isLithium(m) ? "pt-li" : "pt-sla",
      isRent(m) ? "pt-rent" : "",
      shown.includes(i) ? "" : "is-out",
      compare.includes(i) ? "is-picked" : "",
      near.includes(i) ? "is-near" : "",
    ].join(" ");
    return `
      <g class="${cls}" data-i="${i}" tabindex="0" transform="translate(${px.toFixed(1)} ${py.toFixed(1)})">
        <title>${esc(m.brand)} ${esc(m.model)}: ${IDR.format(m.price)}, ${m.range} km, ${m.speed} km/j</title>
        <circle class="hit" r="14"/>
        <circle class="dot" r="${dotR(m.speed).toFixed(1)}"/>
        <text x="${right ? -14 : 14}" y="4" text-anchor="${right ? "end" : "start"}">${esc(m.brand)} ${esc(m.model.split(" (")[0])}</text>
      </g>`;
  }).join("");

  el.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Grafik harga terhadap jarak tempuh">${grid}${points}</svg>`;
  renderChartPick();
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
          return `<button type="button" data-i="${i}"><b>${esc(m.brand)} ${esc(m.model.split(" (")[0])}</b><span>${jt(m.price)} · ${m.range} km · ${m.speed} km/j</span></button>`;
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
  return 3.5 + ((speed - 40) / 45) * 6.5;
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

  const numRows = NUMBERS.map(([label, key, better, fmt]) => {
    const vals = ms.map((m) => m[key]);
    const best = better > 0 ? Math.max(...vals) : Math.min(...vals);
    const allSame = vals.every((v) => v === vals[0]);
    const cells = ms
      .map((m) => `<div class="${!allSame && m[key] === best ? "best" : ""}">${fmt(m)}</div>`)
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
      <div class="tags">${tags(m)}</div>
    </div>
    <div class="tiles">
      ${tile("Jarak tempuh", m.range, "km")}
      ${tile("Kecepatan maks", m.speed, "km/j")}
      ${tile("Daya maks", m.power.toLocaleString("id-ID"), "W")}
    </div>
    <dl class="specs">${DETAILS.map(([label, fn]) => `<dt>${label}</dt><dd>${fn(m)}</dd>`).join("")}</dl>
    <div class="sheet-actions">
      <a class="btn-primary" href="${safeUrl(m.url)}" target="_blank" rel="noopener noreferrer">Situs resmi ↗</a>
      <button type="button" class="btn-secondary" data-pick="${i}" ${full ? "disabled" : ""}>
        ${picked ? "✓ Dipilih untuk dibandingkan" : full ? "Maks. 3 motor dibandingkan" : "+ Bandingkan"}
      </button>
    </div>`;
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
  $("q").value = "";
  $("budget").value = "20";
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
  $("q").value = p.get("cari") || "";
  $("budget").value = p.get("budget") || "20";
  setRadio("range", p.get("jarak"));
  setRadio("speed", p.get("kecepatan"));
  setRadio("batt", p.get("baterai"));
  $("onlyStnk").checked = p.get("stnk") === "1";
  $("ownBattery").checked = p.get("baterai-dibeli") === "1";
  if ([...$("sort").options].some((o) => o.value === p.get("urut"))) $("sort").value = p.get("urut");
  for (const s of (p.get("bandingkan") || "").split(",")) {
    const i = SLUGS.indexOf(s);
    if (i >= 0 && !compare.includes(i) && compare.length < MAX_COMPARE) compare.push(i);
  }
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
  if ($("q").value.trim()) p.set("cari", $("q").value.trim());
  if ($("budget").value !== "20") p.set("budget", $("budget").value);
  if (radio("range") !== "0") p.set("jarak", radio("range"));
  if (radio("speed") !== "0") p.set("kecepatan", radio("speed"));
  if (radio("batt") !== "all") p.set("baterai", radio("batt"));
  if ($("onlyStnk").checked) p.set("stnk", "1");
  if ($("ownBattery").checked) p.set("baterai-dibeli", "1");
  if ($("sort").value !== "price:1") p.set("urut", $("sort").value);
  if (compare.length) p.set("bandingkan", compare.map((i) => SLUGS[i]).join(","));
  if (detailI !== null) p.set("motor", SLUGS[detailI]);
  const q = p.toString().replace(/%2C/g, ",").replace(/%3A/g, ":");
  history.replaceState(null, "", (q ? `?${q}` : location.pathname) + location.hash);
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

/** 9699000 → "Rp 9,7 jt" */
function jt(n) {
  return `Rp ${(n / 1e6).toLocaleString("id-ID", { maximumFractionDigits: 1 })} jt`;
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
