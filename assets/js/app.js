/* =========================================================
   Motor Listrik Rp 6–20 Juta — app.js
   Data riset ulang Juni 2026 + filter/sort + komparasi
   =========================================================

   UPDATE DATA: tambah/edit objek di array MOTORS.
   Field wajib: brand, model, price, range, speed, power,
     battery, batteryType, warranty, chargeTime,
     batteryScheme, swapCost, dealerNetwork, notes,
     subsidi, url
   ========================================================= */

"use strict";

/* ── DATA ────────────────────────────────────────────────────────────────────
   Harga OTR Jakarta ~perkiraan pertengahan 2026.
   Range & top speed = klaim pabrik; di jalanan nyata bisa turun 20–40%.
   Sumber: situs resmi produsen, Oto.com, GoodCar.id, Blibli, Mega Syariah.
   ────────────────────────────────────────────────────────────────────────── */
const MOTORS = [
  {
    brand: "ECGO",
    model: "2",
    price: 6900000,
    range: 50,
    speed: 50,
    power: 1200,
    battery: "Li/SLA (detail tidak publik)",
    batteryType: "Li/SLA",
    warranty: "n/a",
    chargeTime: "4–5 jam",
    batteryScheme: "Beli",
    swapCost: null,
    dealerNetwork: "Terbatas",
    subsidi: false,
    notes: "Spesifikasi detail terbatas di sumber publik",
    url: "https://www.ecgo.co.id",
  },
  {
    brand: "Exotic",
    model: "Vito",
    price: 7000000,
    range: 60,
    speed: 55,
    power: 1350,
    battery: "Li-ion (detail terbatas)",
    batteryType: "Li-ion",
    warranty: "n/a",
    chargeTime: "4–5 jam",
    batteryScheme: "Beli",
    swapCost: null,
    dealerNetwork: "Terbatas",
    subsidi: false,
    notes: "Desain retro Eropa/urban; populer karena gaya",
    url: "https://www.exoticbikes.co.id",
  },
  {
    brand: "Uwinfly",
    model: "T80",
    price: 7000000,
    range: 55,
    speed: 55,
    power: 1200,
    battery: "SLA 60V 25Ah / Li 48V 24Ah",
    batteryType: "SLA/Li-ion",
    warranty: "n/a",
    chargeTime: "Fast charge support",
    batteryScheme: "Beli",
    swapCost: null,
    dealerNetwork: "Terbatas",
    subsidi: false,
    notes: "Tersedia varian NFC/smart key; banyak varian di Blibli/Shopee",
    url: "https://uwinfly.co.id",
  },
  {
    brand: "Uwinfly",
    model: "M90E",
    price: 9000000,
    range: 90,
    speed: 70,
    power: 1500,
    battery: "Li-ion 60V 24Ah",
    batteryType: "Li-ion",
    warranty: "n/a",
    chargeTime: "1,5 jam (fast charge)",
    batteryScheme: "Beli",
    swapCost: null,
    dealerNetwork: "Terbatas",
    subsidi: false,
    notes: "Fast charging; range & performa lebih baik dari T80",
    url: "https://uwinfly.co.id",
  },
  {
    brand: "Uwinfly",
    model: "M110F",
    price: 11000000,
    range: 100,
    speed: 85,
    power: 3000,
    battery: "Li-ion 74V 30Ah",
    batteryType: "Li-ion",
    warranty: "n/a",
    chargeTime: "Fast (50% dalam 1,5 jam)",
    batteryScheme: "Beli/Swap",
    swapCost: null,
    dealerNetwork: "Terbatas",
    subsidi: false,
    notes: "TriFast System: swap baterai <10 detik; mendekati kelas menengah",
    url: "https://uwinfly.co.id",
  },
  {
    brand: "Polytron",
    model: "Fox-200",
    price: 11500000,
    range: 85,
    speed: 70,
    power: 1500,
    battery: "LFP 72V 27Ah (1,94 kWh)",
    batteryType: "LFP",
    warranty: "1 tahun (dynamo & controller)",
    chargeTime: "4–5 jam (onboard 450W)",
    batteryScheme: "Beli",
    swapCost: null,
    dealerNetwork: "Luas",
    subsidi: true,
    notes:
      "Smart Key System, disc brake F&R, 2 mode berkendara; LFP tahan panas & awet",
    url: "https://2w.polytronev.id",
  },
  {
    brand: "Smoot",
    model: "Tempur Facelift",
    price: 13000000,
    range: 70,
    speed: 60,
    power: 1200,
    battery: "Li-ion (swap system)",
    batteryType: "Li-ion",
    warranty: "3 tahun",
    chargeTime: "Swap instan",
    batteryScheme: "Swap/Sewa",
    swapCost: null,
    dealerNetwork: "Sedang",
    subsidi: false,
    notes: "Battery swap praktis; harga mulai ~11 juta tergantung varian",
    url: "https://smoot.id",
  },
  {
    brand: "Selis",
    model: "Neo Scootic",
    price: 13500000,
    range: 60,
    speed: 55,
    power: 1750,
    battery: "SLA / Li-ion (pilihan varian)",
    batteryType: "SLA/Li-ion",
    warranty: "n/a",
    chargeTime: "4–6 jam",
    batteryScheme: "Beli",
    swapCost: null,
    dealerNetwork: "Sedang",
    subsidi: false,
    notes: "Scooter matic style; varian SLA lebih murah, Li-ion lebih baik",
    url: "https://www.selis.id",
  },
  {
    brand: "Selis",
    model: "E-Max SLA",
    price: 15500000,
    range: 57,
    speed: 57,
    power: 2000,
    battery: "SLA",
    batteryType: "SLA",
    warranty: "n/a",
    chargeTime: "5–7 jam",
    batteryScheme: "Beli",
    swapCost: null,
    dealerNetwork: "Sedang",
    subsidi: false,
    notes:
      "Baterai SLA: biaya awal rendah, tapi lebih berat & umur lebih pendek",
    url: "https://www.selis.id",
  },
  {
    brand: "Alva",
    model: "N3 (sewa baterai)",
    price: 15500000,
    range: 90,
    speed: 80,
    power: 2500,
    battery: "Li-ion (sewa bulanan)",
    batteryType: "Li-ion",
    warranty: "n/a",
    chargeTime: "n/a",
    batteryScheme: "Sewa",
    swapCost: "Sewa bulanan",
    dealerNetwork: "Sedang",
    subsidi: false,
    notes:
      "Rp 15,5 juta = harga motor saja (skema sewa baterai); full motor Rp 30,5 juta",
    url: "https://alva.id",
  },
  {
    brand: "United Motor",
    model: "MX-1200",
    price: 16800000,
    range: 80,
    speed: 65,
    power: 2500,
    battery: "Li-ion",
    batteryType: "Li-ion",
    warranty: "2 tahun",
    chargeTime: "4–5 jam",
    batteryScheme: "Beli",
    swapCost: null,
    dealerNetwork: "Luas",
    subsidi: false,
    notes: "Desain simpel & andal; nilai bagus di harganya",
    url: "https://www.unitedmotor.co.id",
  },
  {
    brand: "Indomobil",
    model: "Emotor QT",
    price: 17000000,
    range: 80,
    speed: 65,
    power: 2000,
    battery: "Li-ion",
    batteryType: "Li-ion",
    warranty: "n/a",
    chargeTime: "4–5 jam",
    batteryScheme: "Beli",
    swapCost: null,
    dealerNetwork: "Luas",
    subsidi: false,
    notes:
      "Dari grup otomotif besar Indomobil; kualitas rakitan lebih terjamin",
    url: "https://www.indomobil.co.id",
  },
  {
    brand: "Volta",
    model: "401 (eX / Eagle)",
    price: 17900000,
    range: 60,
    speed: 57,
    power: 1900,
    battery: "LiFePO4 64V 21Ah (2 slot, maks 120 km)",
    batteryType: "LFP",
    warranty: "n/a",
    chargeTime: "Swap instan + home charge",
    batteryScheme: "Swap",
    swapCost: "Rp 7.500 / 60 km",
    dealerNetwork: "Luas",
    subsidi: false,
    notes:
      "60 km/baterai, hingga 120 km dengan 2 baterai; 400+ titik swap nasional (SGB); payload 150 kg",
    url: "https://www.voltaindonesia.com",
  },
  {
    brand: "Volta",
    model: "Virgo",
    price: 19100000,
    range: 65,
    speed: 55,
    power: 1900,
    battery: "LiFePO4 64V 21Ah (2 slot, maks ~130 km)",
    batteryType: "LFP",
    warranty: "n/a",
    chargeTime: "Swap instan + home charge",
    batteryScheme: "Swap",
    swapCost: "Rp 7.500 / 60 km",
    dealerNetwork: "Luas",
    subsidi: false,
    notes:
      "Hingga ~130 km dengan 2 baterai; 400+ titik swap nasional; payload 150 kg",
    url: "https://www.voltaindonesia.com",
  },
  {
    brand: "BF Goodrich",
    model: "CG",
    price: 19800000,
    range: 80,
    speed: 65,
    power: 2000,
    battery: "Li-ion",
    batteryType: "Li-ion",
    warranty: "n/a",
    chargeTime: "4–5 jam",
    batteryScheme: "Beli",
    swapCost: null,
    dealerNetwork: "Sedang",
    subsidi: false,
    notes: "Spesifikasi detail belum banyak dipublikasikan",
    url: "https://www.oto.com/motor-baru/bf-goodrich",
  },
];

/* ── STATE ───────────────────────────────────────────────────────────────── */
let sortCol = "price";
let sortDir = "asc";

const MAX_COMPARE = 3;
const compareSet = new Set(); // stores MOTORS[] indices

/* ── FORMATTING ──────────────────────────────────────────────────────────── */
const IDR = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

/* ── INIT ─────────────────────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  renderHeroStats();
  render();
  bindEvents();
});

/* ── HERO STATS ──────────────────────────────────────────────────────────── */
function renderHeroStats() {
  const brands = new Set(MOTORS.map((m) => m.brand)).size;
  const withSub = MOTORS.filter((m) => m.subsidi).length;
  const minPrice = Math.min(...MOTORS.map((m) => m.price));

  document.getElementById("heroStats").innerHTML = `
    <div class="stat-chip">
      <span class="stat-val">${MOTORS.length}</span>
      <span class="stat-lbl">Model</span>
    </div>
    <div class="stat-chip">
      <span class="stat-val">${brands}</span>
      <span class="stat-lbl">Merek</span>
    </div>
    <div class="stat-chip">
      <span class="stat-val">${withSub}</span>
      <span class="stat-lbl">Eligible Subsidi</span>
    </div>
    <div class="stat-chip">
      <span class="stat-val">${IDR.format(minPrice)}</span>
      <span class="stat-lbl">Mulai dari</span>
    </div>
  `;
}

/* ── EVENT BINDING ───────────────────────────────────────────────────────── */
function bindEvents() {
  /* filters */
  document.getElementById("searchInput").addEventListener("input", render);
  document.getElementById("selPrice").addEventListener("change", render);
  document.getElementById("selRange").addEventListener("change", render);
  document.getElementById("chkSubsidi").addEventListener("change", render);

  /* reset */
  document.getElementById("btnReset").addEventListener("click", () => {
    document.getElementById("searchInput").value = "";
    document.getElementById("selPrice").value = "20000000";
    document.getElementById("selRange").value = "0";
    document.getElementById("chkSubsidi").checked = false;
    render();
  });

  /* sortable columns */
  document.querySelectorAll("th.col-sort").forEach((th) => {
    th.addEventListener("click", () => {
      const col = th.dataset.col;
      sortDir = sortCol === col && sortDir === "asc" ? "desc" : "asc";
      sortCol = col;
      render();
    });
  });

  /* row click → open website (skip if clicking the checkbox) */
  document.getElementById("tableBody").addEventListener("click", (e) => {
    if (e.target.closest(".compare-check")) return;
    const tr = e.target.closest("tr[data-url]");
    if (tr)
      window.open(safeUrl(tr.dataset.url), "_blank", "noopener,noreferrer");
  });

  /* row keyboard: Enter/Space opens website */
  document.getElementById("tableBody").addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    if (e.target.classList.contains("compare-check")) return;
    const tr = e.target.closest("tr[data-url]");
    if (tr) {
      e.preventDefault();
      window.open(safeUrl(tr.dataset.url), "_blank", "noopener,noreferrer");
    }
  });

  /* compare checkboxes (event delegation on tbody) */
  document.getElementById("tableBody").addEventListener("change", (e) => {
    const cb = e.target.closest(".compare-check");
    if (!cb) return;
    const idx = parseInt(cb.dataset.idx, 10);

    if (cb.checked) {
      if (compareSet.size >= MAX_COMPARE) {
        cb.checked = false;
        shakeCompareBar();
        return;
      }
      compareSet.add(idx);
    } else {
      compareSet.delete(idx);
    }
    refreshRowHighlight(idx, cb.checked);
    updateCompareBar();
    refreshCheckboxDisabledState();
  });

  /* compare bar buttons */
  document
    .getElementById("btnCompare")
    .addEventListener("click", openCompareModal);
  document
    .getElementById("btnClearCompare")
    .addEventListener("click", clearCompare);

  /* modal close */
  document
    .getElementById("btnCloseCompare")
    .addEventListener("click", closeCompareModal);
  document.getElementById("compareOverlay").addEventListener("click", (e) => {
    if (e.target === document.getElementById("compareOverlay"))
      closeCompareModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeCompareModal();
  });
}

/* ── FILTER + SORT + RENDER TABLE ────────────────────────────────────────── */
function render() {
  const q = document.getElementById("searchInput").value.trim().toLowerCase();
  const pMax = Number(document.getElementById("selPrice").value);
  const rMin = Number(document.getElementById("selRange").value);
  const subOnly = document.getElementById("chkSubsidi").checked;

  /* filter */
  let data = MOTORS.map((m, idx) => ({ ...m, _idx: idx })).filter((m) => {
    if (q && !`${m.brand} ${m.model}`.toLowerCase().includes(q)) return false;
    if (m.price > pMax) return false;
    if (m.range < rMin) return false;
    if (subOnly && !m.subsidi) return false;
    return true;
  });

  /* sort */
  data.sort((a, b) => {
    let va = a[sortCol],
      vb = b[sortCol];
    if (typeof va === "string") {
      va = va.toLowerCase();
      vb = vb.toLowerCase();
    }
    if (va < vb) return sortDir === "asc" ? -1 : 1;
    if (va > vb) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  /* update sort indicators */
  document.querySelectorAll("th.col-sort").forEach((th) => {
    th.classList.remove("sort-asc", "sort-desc");
    if (th.dataset.col === sortCol)
      th.classList.add(sortDir === "asc" ? "sort-asc" : "sort-desc");
  });

  /* count */
  document.getElementById("countLabel").textContent =
    `${data.length} dari ${MOTORS.length} motor ditampilkan`;

  /* rows */
  const maxRange = Math.max(...MOTORS.map((m) => m.range));
  const tbody = document.getElementById("tableBody");

  if (data.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10">
          <div class="no-results">
            <div class="no-results-icon">🔍</div>
            <p>Tidak ada motor yang cocok.<br>Coba perluas kriteria pencarian.</p>
          </div>
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = data
    .map((m) => {
      const pCls = priceTierClass(m.price);
      const rangePct = Math.round((m.range / maxRange) * 100);
      const isChecked = compareSet.has(m._idx);
      const isDisabled = !isChecked && compareSet.size >= MAX_COMPARE;

      return `
      <tr tabindex="0" data-url="${esc(m.url)}" data-idx="${m._idx}"
          class="${isChecked ? "row-selected" : ""}"
          title="Klik untuk buka website resmi ${esc(m.brand)} ${esc(m.model)}">
        <td class="td-check">
          <input type="checkbox"
                 class="compare-check"
                 data-idx="${m._idx}"
                 aria-label="Pilih ${esc(m.brand)} ${esc(m.model)} untuk dibandingkan"
                 ${isChecked ? "checked" : ""}
                 ${isDisabled ? "disabled" : ""} />
        </td>
        <td class="td-brand">
          <div class="brand-thumb-cell">
            <img src="${motorThumb(m, "sm")}" class="motor-thumb-sm"
                 alt="${esc(m.brand)} ${esc(m.model)}" loading="lazy" />
            <span class="brand-name-text">${esc(m.brand)}</span>
          </div>
        </td>
        <td class="td-model">${esc(m.model)}</td>
        <td class="td-price ${pCls}">${IDR.format(m.price)}</td>
        <td class="td-ctr">
          ${
            m.subsidi
              ? '<span class="badge-yes">&#11088;&nbsp;Subsidi</span>'
              : '<span class="badge-no">&#8212;</span>'
          }
        </td>
        <td class="td-num">
          <div class="range-wrap">
            <span>${m.range}&thinsp;km</span>
            <div class="range-track" title="${m.range} km klaim pabrik">
              <div class="range-fill" style="width:${rangePct}%"></div>
            </div>
          </div>
        </td>
        <td class="td-num">${m.speed}&thinsp;km/j</td>
        <td class="td-num">${m.power.toLocaleString("id-ID")}&thinsp;W</td>
        <td>${battTypeBadge(m.batteryType)}</td>
        <td>${esc(m.warranty)}</td>
      </tr>`;
    })
    .join("");
}

/* ── COMPARISON: state helpers ───────────────────────────────────────────── */
function refreshRowHighlight(idx, selected) {
  const tr = document.querySelector(`tr[data-idx="${idx}"]`);
  if (tr) tr.classList.toggle("row-selected", selected);
}

function refreshCheckboxDisabledState() {
  const maxReached = compareSet.size >= MAX_COMPARE;
  document.querySelectorAll(".compare-check").forEach((cb) => {
    const idx = parseInt(cb.dataset.idx, 10);
    cb.disabled = maxReached && !compareSet.has(idx);
  });
}

function clearCompare() {
  const prev = [...compareSet];
  compareSet.clear();
  prev.forEach((idx) => refreshRowHighlight(idx, false));
  document.querySelectorAll(".compare-check").forEach((cb) => {
    cb.checked = false;
    cb.disabled = false;
  });
  updateCompareBar();
  closeCompareModal();
}

function shakeCompareBar() {
  const bar = document.getElementById("compareBar");
  bar.classList.remove("shake");
  void bar.offsetWidth; // reflow to restart animation
  bar.classList.add("shake");
}

/* ── COMPARISON: bar ─────────────────────────────────────────────────────── */
function updateCompareBar() {
  const bar = document.getElementById("compareBar");

  if (compareSet.size === 0) {
    bar.hidden = true;
    document.body.classList.remove("compare-active");
    return;
  }

  bar.hidden = false;
  document.body.classList.add("compare-active");

  document.getElementById("compareChips").innerHTML = [...compareSet]
    .map((idx) => {
      const m = MOTORS[idx];
      return `<span class="compare-chip">${esc(m.brand)} <em>${esc(m.model)}</em></span>`;
    })
    .join("");

  document.getElementById("btnCompare").disabled = compareSet.size < 2;
}

/* ── COMPARISON: modal ───────────────────────────────────────────────────── */

/* Specs to display in comparison (in order) */
const COMPARE_SPECS = [
  {
    label: "Harga OTR*",
    render: (m) =>
      `<span class="${priceTierClass(m.price)} fw-bold">${IDR.format(m.price)}</span>`,
    bestKey: "price",
    best: "min",
  },
  {
    label: "Jarak Tempuh",
    render: (m) => `<strong>${m.range}</strong> km`,
    bestKey: "range",
    best: "max",
  },
  {
    label: "Kecepatan Maks",
    render: (m) => `${m.speed} km/j`,
    bestKey: "speed",
    best: "max",
  },
  {
    label: "Daya Motor",
    render: (m) => `${m.power.toLocaleString("id-ID")} W`,
    bestKey: "power",
    best: "max",
  },
  {
    label: "Tipe Baterai",
    render: (m) => battTypeBadge(m.batteryType),
    best: null,
  },
  {
    label: "Kapasitas Baterai",
    render: (m) => esc(m.battery),
    best: null,
  },
  {
    label: "Waktu Charge",
    render: (m) => esc(m.chargeTime),
    best: null,
  },
  {
    label: "Skema Baterai",
    render: (m) => esc(m.batteryScheme),
    best: null,
  },
  {
    label: "Biaya Swap",
    render: (m) => (m.swapCost ? esc(m.swapCost) : "—"),
    best: null,
  },
  {
    label: "Subsidi Pemerintah",
    render: (m) =>
      m.subsidi
        ? '<span class="badge-yes">&#11088;&nbsp;Ya</span>'
        : '<span class="badge-no">&#8212;</span>',
    best: null,
  },
  {
    label: "Garansi",
    render: (m) => esc(m.warranty),
    best: null,
  },
  {
    label: "Jaringan Dealer",
    render: (m) => dealerBadge(m.dealerNetwork),
    best: null,
  },
  {
    label: "Catatan",
    render: (m) => `<small class="text-muted">${esc(m.notes)}</small>`,
    best: null,
  },
];

function openCompareModal() {
  renderCompareModal();
  const overlay = document.getElementById("compareOverlay");
  overlay.hidden = false;
  document.body.classList.add("modal-open");
  document.getElementById("btnCloseCompare").focus();
}

function closeCompareModal() {
  document.getElementById("compareOverlay").hidden = true;
  document.body.classList.remove("modal-open");
}

function renderCompareModal() {
  const selected = [...compareSet].map((idx) => MOTORS[idx]);

  /* Motor column headers */
  const motorHeaders = selected
    .map(
      (m) => `
    <th class="cmp-motor-th">
      <img src="${motorThumb(m, "lg")}" class="motor-thumb-lg"
           alt="${esc(m.brand)} ${esc(m.model)}" />
      <div class="cmp-brand">${esc(m.brand)}</div>
      <div class="cmp-model">${esc(m.model)}</div>
    </th>`,
    )
    .join("");

  /* Spec rows with best-value highlighting */
  const specRows = COMPARE_SPECS.map((spec) => {
    /* determine which column has the best value */
    let bestColIdx = -1;
    if (spec.best && spec.bestKey && selected.length > 1) {
      const nums = selected.map((m) => {
        const v = m[spec.bestKey];
        return typeof v === "number" ? v : null;
      });
      const valid = nums.filter((v) => v !== null);
      if (valid.length > 0) {
        const target =
          spec.best === "min" ? Math.min(...valid) : Math.max(...valid);
        bestColIdx = nums.indexOf(target);
      }
    }

    const cells = selected
      .map(
        (m, i) => `
      <td class="${i === bestColIdx ? "cmp-best" : ""}">${spec.render(m)}</td>`,
      )
      .join("");

    return `<tr><th class="cmp-spec-th">${spec.label}</th>${cells}</tr>`;
  }).join("");

  /* Website links row */
  const urlCells = selected
    .map(
      (m) => `
    <td>
      <a href="${safeUrl(m.url)}" target="_blank" rel="noopener noreferrer"
         class="btn-website">Website Resmi →</a>
    </td>`,
    )
    .join("");

  document.getElementById("compareBody").innerHTML = `
    <div class="cmp-table-wrap">
      <table class="cmp-table">
        <thead>
          <tr>
            <th class="cmp-spec-th"></th>
            ${motorHeaders}
          </tr>
        </thead>
        <tbody>
          ${specRows}
          <tr>
            <th class="cmp-spec-th">Website Resmi</th>
            ${urlCells}
          </tr>
        </tbody>
      </table>
    </div>
    <p class="cmp-note">
      * Harga OTR Jakarta ~perkiraan 2026. Range = klaim pabrik (di jalanan bisa turun 20–40%).
      <span class="cmp-best-legend">★</span> = terbaik dalam perbandingan ini.
    </p>
  `;
}

/* ── HELPERS ─────────────────────────────────────────────────────────────── */

function priceTierClass(price) {
  if (price < 12e6) return "p-low";
  if (price < 17e6) return "p-mid";
  return "p-high";
}

function battTypeBadge(type) {
  const map = {
    LFP: ["batt-lfp", "LFP / LiFePO4"],
    "Li-ion": ["batt-li", "Li-ion"],
    Li: ["batt-li", "Li-ion"],
    SLA: ["batt-sla", "SLA (Aki)"],
    "SLA/Li-ion": ["batt-mixed", "SLA / Li-ion"],
    "Li/SLA": ["batt-mixed", "Li / SLA"],
  };
  const [cls, label] = map[type] || ["batt-li", esc(type)];
  return `<span class="batt-badge ${cls}">${label}</span>`;
}

function dealerBadge(level) {
  const map = {
    Luas: ["dealer-luas", "Luas ✓"],
    Sedang: ["dealer-sedang", "Sedang"],
    Terbatas: ["dealer-terbatas", "Terbatas"],
  };
  const [cls, label] = map[level] || ["dealer-terbatas", esc(level)];
  return `<span class="dealer-badge ${cls}">${label}</span>`;
}

/** Generate a color-coded SVG thumbnail data URI for a motor.
 *  sm = 52×39 px (table row)  |  lg = 120×85 px (comparison modal)
 *  Color scheme matches battery type badges.
 *  Swap with real product image URLs in MOTORS[].thumbnail once available.
 */
function motorThumb(m, size) {
  const palette = {
    LFP: { bg: "#f0fdf4", border: "#16a34a", fg: "#14532d" },
    "Li-ion": { bg: "#eff6ff", border: "#2563eb", fg: "#1e3a8a" },
    Li: { bg: "#eff6ff", border: "#2563eb", fg: "#1e3a8a" },
    SLA: { bg: "#fefce8", border: "#ca8a04", fg: "#713f12" },
    "SLA/Li-ion": { bg: "#fffbeb", border: "#d97706", fg: "#78350f" },
    "Li/SLA": { bg: "#fffbeb", border: "#d97706", fg: "#78350f" },
  };
  const c = palette[m.batteryType] || {
    bg: "#f9fafb",
    border: "#9ca3af",
    fg: "#374151",
  };
  const w = size === "lg" ? 120 : 52;
  const h = size === "lg" ? 85 : 39;
  const init = m.brand
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const iFs = size === "lg" ? 36 : 15;
  const lFs = size === "lg" ? 8.5 : 5;
  const batt = (m.batteryType || "").replace(/[<>&"']/g, "");
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
    `<rect width="${w}" height="${h}" rx="6" fill="${c.bg}"/>` +
    `<rect width="${w}" height="${h}" rx="6" fill="none" stroke="${c.border}" stroke-width="1.5" stroke-opacity=".45"/>` +
    `<text x="${w / 2}" y="${h * 0.44}" text-anchor="middle" dominant-baseline="middle"` +
    ` font-family="system-ui,-apple-system,sans-serif" font-size="${iFs}" font-weight="900" fill="${c.border}">${init}</text>` +
    `<text x="${w / 2}" y="${h * 0.8}" text-anchor="middle" dominant-baseline="middle"` +
    ` font-family="system-ui,-apple-system,sans-serif" font-size="${lFs}" fill="${c.fg}" opacity=".8">${batt}</text>` +
    `</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/** Escape HTML special chars */
function esc(str) {
  return String(str ?? "—")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/** Only allow http/https URLs */
function safeUrl(str) {
  const s = String(str || "").trim();
  return /^https?:\/\//.test(s) ? s : "#";
}
