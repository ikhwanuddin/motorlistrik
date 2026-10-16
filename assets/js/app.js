/* =========================================================
   Motor Listrik di Bawah Rp 20 Juta — app.js
   Data audit 16 Oktober 2026 + filter/sort + komparasi
   =========================================================

   UPDATE DATA: tambah/edit objek di array MOTORS.
   Field: brand, model, price, priceNote, range, speed, power,
     battery, batteryType, warranty, chargeTime, batteryScheme,
     swapCost, notes, url, sources [{label, url}], stnk, checkedAt
   stnk: true = bisa STNK/plat, false = tidak bisa, null = belum jelas
   Isi null kalau data tidak ketemu di sumber. Jangan menebak.
   ========================================================= */

"use strict";

/* ── DATA ────────────────────────────────────────────────────────────────────
   price  = harga normal (bukan promo), OTR Jakarta/Jadetabek kalau ada.
   range  = klaim pabrik; di jalanan nyata bisa turun 20–40%.
   power  = daya maksimum/puncak sesuai klaim pabrik.
   Subsidi pemerintah: per 16 Okt 2026 TIDAK ada program aktif (detail +
   sumber di kartu "Subsidi Pemerintah" di index.html). Semua harga di sini
   tanpa potongan subsidi.
   ────────────────────────────────────────────────────────────────────────── */
const CHECKED_AT = "2026-10-16";

const MOTORS = [
  {
    brand: "Uwinfly",
    model: "T80D",
    price: 9699000,
    priceNote: "Situs resmi (Okt 2026), off-the-road (+ biaya STNK)",
    range: 60,
    speed: 52,
    power: 1000,
    battery: "Lithium 48V 24Ah (1,15 kWh), lepas-pasang",
    batteryType: "Li-ion",
    warranty: "Baterai 2 thn; rangka & dinamo 10 thn; charger, controller, rem, velg 1 thn",
    chargeTime: "2–3 jam (50% dalam 1,5 jam)",
    batteryScheme: "Beli",
    swapCost: null,
    notes: "Pengganti T80 lama (SLA). T80C kembarannya, beda desain, Rp 9,5 jt. Keyless, kamera, alarm. Listrik rumah min. 1300 VA",
    url: "https://www.uwinflyofficial.id/t80d",
    sources: [
      { label: "Situs resmi Uwinfly, semua produk (Okt 2026)", url: "https://www.uwinflyofficial.id/semua-produk" },
      { label: "Toko resmi Uwinfly di Tokopedia (Okt 2026)", url: "https://www.tokopedia.com/uwinfly/uwinfly-t90-motor-listrik-promo-1732698391608067262-1737569041759765694" },
      { label: "Toko resmi Uwinfly di Shopee (Okt 2026)", url: "https://shopee.co.id/uwinfly" },
      { label: "Situs resmi", url: "https://www.uwinflyofficial.id/t80d" },
    ],
    stnk: true,
    checkedAt: CHECKED_AT,
  },
  {
    brand: "Uwinfly",
    model: "T85",
    price: 11490000,
    priceNote: "Off-the-road (+ biaya STNK), toko resmi Okt 2026. Promo Rp 10,35 jt",
    range: 100,
    speed: 50,
    power: 1500,
    battery: "Lithium 60V 24Ah (1,44 kWh)",
    batteryType: "Li-ion",
    warranty: "Baterai 2 thn; rangka & dinamo 10 thn; charger, controller, rem, velg 1 thn",
    chargeTime: null,
    batteryScheme: "Beli",
    swapCost: null,
    notes:
      "Tidak tercantum di situs resmi per Okt 2026, masih dijual di toko resmi Tokopedia/Shopee. Kunci NFC; cakram depan, tromol belakang; ban tubeless",
    url: "https://www.tokopedia.com/uwinfly/u-winfly-t85-motor-listrik-motor-power-1500-watt-1732790084835116222",
    sources: [
      { label: "Situs resmi Uwinfly, semua produk (Okt 2026)", url: "https://www.uwinflyofficial.id/semua-produk" },
      { label: "Toko resmi Uwinfly di Tokopedia (Okt 2026)", url: "https://www.tokopedia.com/uwinfly/u-winfly-t85-motor-listrik-motor-power-1500-watt-1732790084835116222" },
      { label: "Toko resmi Uwinfly di Shopee (Okt 2026)", url: "https://shopee.co.id/uwinfly" },
    ],
    stnk: true,
    checkedAt: CHECKED_AT,
  },
  {
    brand: "Uwinfly",
    model: "M90E",
    price: 12590000,
    priceNote: "Situs resmi (Okt 2026), off-the-road (+ biaya STNK)",
    range: 80,
    speed: 70,
    power: 1500,
    battery: "Lithium 60V 24Ah (1,44 kWh), lepas-pasang",
    batteryType: "Li-ion",
    warranty: "Motor & baterai 1 thn (pabrik)",
    chargeTime: "±1,5 jam (fast charging)",
    batteryScheme: "Beli",
    swapCost: null,
    notes: "M-Series rakitan lokal, rilis Jan 2026; keyless + NFC, aplikasi, bagasi 19 L",
    url: "https://www.uwinflyofficial.id/m90e",
    sources: [
      { label: "Situs resmi Uwinfly, semua produk (Okt 2026)", url: "https://www.uwinflyofficial.id/semua-produk" },
      { label: "Toko resmi Uwinfly di Tokopedia (Okt 2026)", url: "https://www.tokopedia.com/uwinfly/u-winfly-m90e-motor-listrik-terbaru-1500w-70-km-jam-baterai-60v-24ah-fast-charging-1-5-jam-smart-lock-led-premium-1733913501617456318" },
      { label: "Toko resmi Uwinfly di Shopee (Okt 2026)", url: "https://shopee.co.id/uwinfly" },
      { label: "Situs resmi + brosur", url: "https://www.uwinflyofficial.id/m90e" },
      { label: "Radar Tulungagung, Apr 2026", url: "https://radartulungagung.jawapos.com/otomotif/2604010039/uwinfly-m90e-cuma-rp10-jutaan-motor-listrik-terbaik-uwinfly-untuk-anak-muda-ini-punya-keyless-fast-charging-dan-baterai-lepas-pasang" },
    ],
    stnk: true,
    checkedAt: CHECKED_AT,
  },
  {
    brand: "Uwinfly",
    model: "M90G",
    price: 12990000,
    priceNote: "Situs resmi (Okt 2026), off-the-road (+ biaya STNK)",
    range: 80,
    speed: 70,
    power: 1500,
    battery: "Lithium 60V 24Ah (1,44 kWh), bisa swap",
    batteryType: "Li-ion",
    warranty: null,
    chargeTime: null,
    batteryScheme: "Beli/Swap",
    swapCost: null,
    notes: "Mirip M90E plus layar LCD 7 inci, 3 mode kecepatan, mode mundur, Smart U-Connect",
    url: "https://www.uwinflyofficial.id/m90g",
    sources: [
      { label: "Situs resmi Uwinfly, semua produk (Okt 2026)", url: "https://www.uwinflyofficial.id/semua-produk" },
      { label: "Toko resmi Uwinfly di Tokopedia (Okt 2026)", url: "https://www.tokopedia.com/uwinfly/u-winfly-m90g-promo-launching-motor-listrik-quick-charge-3-mode-kecepatan-smart-u-connect-system-1734362336183878846" },
      { label: "Toko resmi Uwinfly di Shopee (Okt 2026)", url: "https://shopee.co.id/uwinfly" },
    ],
    stnk: true,
    checkedAt: CHECKED_AT,
  },
  {
    brand: "Exotic",
    model: "Vito",
    price: 11500000,
    priceNote: "Harga 'mulai' di dealer Otobot (2026); daftar 2025 Rp 12,79 jt",
    range: 60,
    speed: 55,
    power: 1000,
    battery: "72V 20,5Ah (1,48 kWh); sumber beda soal SLA vs Li-ion",
    batteryType: "SLA",
    warranty: "Baterai 6 bln, motor 2 thn, rangka 5 thn (data 2023)",
    chargeTime: null,
    batteryScheme: "Beli",
    swapCost: null,
    notes: "Dapat STNK/BPKB. Tidak ada situs resmi produk; link ke dealer",
    url: "https://otobotindonesia.com/produk/motor-listrik-exotic-vito",
    sources: [
      { label: "Dealer Otobot, 2026", url: "https://otobotindonesia.com/produk/motor-listrik-exotic-vito" },
      { label: "VIVA, Jun 2025", url: "https://www.viva.co.id/otomotif/motor/1828658-pilihan-motor-listrik-tanpa-subsidi-tetap-ramah-kantong-harga-di-bawah-rp20-jutaan" },
      { label: "CNBC Indonesia, Jul 2024 (STNK)", url: "https://www.cnbcindonesia.com/news/20240714161054-7-554450/ini-dia-motor-listrik-rp-5-jutaan-di-transmart-dapat-stnk-bpkb-nopol" },
    ],
    stnk: true,
    checkedAt: CHECKED_AT,
  },
  {
    brand: "Selis",
    model: "Neo Scootic",
    price: 8975000,
    priceNote:
      "Toko resmi Selis di Tokopedia (Okt 2026), tanpa surat. Situs resmi masih tulis Rp 13,5 jt (2024)",
    range: 40,
    speed: 40,
    power: 1500,
    battery: "SLA 60V 20Ah (1,2 kWh)",
    batteryType: "SLA",
    warranty: "Baterai 6 bln, dinamo 1 thn, rangka 5 thn",
    chargeTime: "Maks. 7 jam",
    batteryScheme: "Beli",
    swapCost: null,
    notes:
      "TIDAK bisa STNK/BPKB: menurut toko resmi hanya untuk kota mandiri/kompleks perumahan. Berat 91 kg, tinggi jok 750 mm",
    url: "https://www.selis.co.id/e-motor/selis-neo-scootic/",
    sources: [
      { label: "Toko resmi Selis (Tokopedia)", url: "https://www.tokopedia.com/selis/selis-sepeda-motor-listrik-tipe-neo-scootic-baterai-sla-off-the-road-1734949878142829696-1734950002110334080" },
      { label: "Situs resmi Selis", url: "https://www.selis.co.id/e-motor/selis-neo-scootic/" },
    ],
    stnk: false,
    checkedAt: CHECKED_AT,
  },
  {
    brand: "Indomobil eMotor",
    model: "QT",
    price: 15000000,
    priceNote: "OTR Jadetabek; Surabaya Rp 16,9 jt",
    range: 70,
    speed: 60,
    power: 2000,
    battery: "Lithium LMO+LMFP 60V 24Ah (1,44 kWh)",
    batteryType: "Li-ion",
    warranty: "Baterai s.d. 3 thn",
    chargeTime: "±4 jam (klaim media, belum resmi)",
    batteryScheme: "Beli",
    swapCost: null,
    notes: "Rilis IIMS Feb 2026. IP67, berat 82,5 kg, bagasi 27 L. Daya nominal 1,5 kW",
    url: "https://indomobilemotor.co.id/vehicle/qt--qt-pro",
    sources: [
      { label: "Situs resmi Indomobil eMotor", url: "https://indomobilemotor.co.id/vehicle/qt--qt-pro" },
      { label: "Kompas Otomotif, Feb 2026", url: "https://otomotif.kompas.com/read/2026/02/06/123100815/iims-2026--indomobil-emotor-perkenalkan-qt-dan-qt-pro" },
    ],
    stnk: true,
    checkedAt: CHECKED_AT,
  },
  {
    brand: "Selis",
    model: "E-Max SLA",
    price: 15500000,
    priceNote:
      "Harga situs resmi. Toko resmi Tokopedia: off-the-road Rp 10,48 jt, OTR sesuai domisili KTP. Varian lithium Rp 22 jt",
    range: 40,
    speed: 50,
    power: 1500,
    battery: "SLA 60V 20Ah (1,2 kWh)",
    batteryType: "SLA",
    warranty: "Baterai 6 bln, dinamo 1 thn, rangka 5 thn",
    chargeTime: "Maks. 7 jam",
    batteryScheme: "Beli",
    swapCost: null,
    notes: "Berat 95 kg, tinggi jok 830 mm, beban maks 200 kg",
    url: "https://www.selis.co.id/e-motor/selis-e-max/",
    sources: [
      { label: "Situs resmi Selis", url: "https://www.selis.co.id/e-motor/selis-e-max/" },
      { label: "Toko resmi Selis (Tokopedia)", url: "https://www.tokopedia.com/selis/selis-motor-listrik-e-max-battery-sla-off-the-road-emotor-1736209726871733376" },
    ],
    stnk: true,
    checkedAt: CHECKED_AT,
  },
  {
    brand: "United E-Motor",
    model: "MT1500Li",
    price: 16000000,
    priceNote: "OTR Jakarta (situs resmi, Okt 2026)",
    range: 75,
    speed: 70,
    power: 2700,
    battery: "Lithium 72V 26Ah (1,87 kWh)",
    batteryType: "Li-ion",
    warranty: "Baterai 1 thn/10.000 km; dinamo, controller, charger 1 thn; rangka 5 thn",
    chargeTime: "0–80% 2,5 jam (butuh listrik rumah min. 2200 VA)",
    batteryScheme: "Beli",
    swapCost: null,
    notes: "Model baru Okt 2026. Berat 84,4 kg, bagasi 28 L, beban maks 150 kg",
    url: "https://unitedmotor.co.id/product/mt-1500li/",
    sources: [
      { label: "Situs resmi United", url: "https://unitedmotor.co.id/product/mt-1500li/" },
      { label: "Blog resmi United, garansi (Agu 2026)", url: "https://unitedmotor.co.id/ini-dia-detail-garansi-united-e-motor-yang-wajib-kamu-tahu/" },
    ],
    stnk: true,
    checkedAt: CHECKED_AT,
  },
  {
    brand: "United E-Motor",
    model: "MX-1200",
    price: 16800000,
    priceNote: "OTR Jakarta (situs resmi)",
    range: 60,
    speed: 65,
    power: 2200,
    battery: "72V 20Ah (1,44 kWh), bukan lithium (graphene/SLA)",
    batteryType: "SLA",
    warranty: "Baterai 1 thn/10.000 km; dinamo, controller, charger 1 thn; rangka 5 thn",
    chargeTime: "0–80% 5–6,5 jam",
    batteryScheme: "Beli",
    swapCost: null,
    notes: "Varian lithium dijual terpisah Rp 25 jt. Berat 97 kg",
    url: "https://unitedmotor.co.id/product/mx-1200/",
    sources: [
      { label: "Situs resmi United", url: "https://unitedmotor.co.id/product/mx-1200/" },
      { label: "detikOto, Feb 2023", url: "https://oto.detik.com/motor/d-6577067/murah-banget-harga-motor-listrik-united-rp-7-jutaan" },
      { label: "Blog resmi United, garansi (Agu 2026)", url: "https://unitedmotor.co.id/ini-dia-detail-garansi-united-e-motor-yang-wajib-kamu-tahu/" },
    ],
    stnk: true,
    checkedAt: CHECKED_AT,
  },
  {
    brand: "Volta",
    model: "eX",
    price: 17850000,
    priceNote: "Situs resmi Volta (Okt 2026); OTR Jakarta (Kontan, Agu 2026)",
    range: 65,
    speed: 55,
    power: 1800,
    battery: "LiFePO4 64V 21Ah (1,34 kWh/baterai), 2 slot",
    batteryType: "LFP",
    warranty: "Baterai 2 thn/800 siklus; seumur hidup dgn membership",
    chargeTime: "Swap di SGB + cas di rumah",
    batteryScheme: "Beli/Swap",
    swapCost: "Rp 1.000–5.000 per swap (sesuai % isi)",
    notes:
      "65 km per baterai, hingga 130 km dengan baterai kedua. Toko resmi tidak tulis isi paket eX, tapi 401 dari toko yang sama sudah termasuk 1 baterai + charger. 300+ titik swap. Beban maks 180 kg",
    url: "https://www.voltaindonesia.com",
    sources: [
      { label: "Toko resmi Volta di Shopee (Okt 2026)", url: "https://shopee.co.id/VOLTA-EX-OTR-JABODETABEK-i.834348333.22486776697" },
      { label: "Kontan, Agu 2026", url: "https://nasional.kontan.co.id/news/insentif-motor-listrik-paling-cepat-mulai-september-2026-cek-harga-sebelum-subsidi" },
      { label: "Volta SGB (tarif swap)", url: "https://www.voltaindonesia.com/sgb" },
      { label: "Volta garansi baterai", url: "https://www.voltaindonesia.com/battery-volta" },
    ],
    stnk: true,
    checkedAt: CHECKED_AT,
  },
  {
    brand: "Indomobil eMotor",
    model: "QT Pro",
    price: 18800000,
    priceNote: "OTR Jadetabek; Surabaya Rp 20,7 jt",
    range: 135,
    speed: 70,
    power: 2000,
    battery: "Lithium LMO+LMFP 2× 60V 24Ah (2,88 kWh)",
    batteryType: "Li-ion",
    warranty: "Baterai s.d. 3 thn",
    chargeTime: null,
    batteryScheme: "Beli",
    swapCost: null,
    notes: "IP67, regen braking, hill start assist. Berat 95,7 kg",
    url: "https://indomobilemotor.co.id/vehicle/qt--qt-pro",
    sources: [
      { label: "Situs resmi Indomobil eMotor", url: "https://indomobilemotor.co.id/vehicle/qt--qt-pro" },
    ],
    stnk: true,
    checkedAt: CHECKED_AT,
  },
  {
    brand: "Volta",
    model: "401",
    price: 18250000,
    priceNote: "Situs resmi Volta (Okt 2026); OTR Jakarta (Kontan, Agu 2026); Jatim Rp 19,5 jt",
    range: 60,
    speed: 60,
    power: 1900,
    battery: "LiFePO4 64V 21Ah (1,34 kWh/baterai), 2 slot",
    batteryType: "LFP",
    warranty: "Baterai 2 thn/800 siklus; seumur hidup dgn membership",
    chargeTime: "Swap di SGB + cas di rumah",
    batteryScheme: "Beli/Swap",
    swapCost: "Rp 1.000–5.000 per swap (sesuai % isi)",
    notes:
      "Harga termasuk 1 baterai + charger (toko resmi). 60 km per baterai, hingga 120 km kalau beli baterai kedua. Beban maks 150 kg",
    url: "https://www.voltaindonesia.com/volta-reguler/volta-reguler-401",
    sources: [
      { label: "Toko resmi Volta di Shopee (Okt 2026)", url: "https://shopee.co.id/VOLTA-REGULER-401-OTR-JABODETABEK-i.834348333.28112251575" },
      { label: "Situs resmi Volta", url: "https://www.voltaindonesia.com/volta-reguler/volta-reguler-401" },
      { label: "Kontan, Agu 2026", url: "https://nasional.kontan.co.id/news/insentif-motor-listrik-paling-cepat-mulai-september-2026-cek-harga-sebelum-subsidi" },
      { label: "Volta SGB (tarif swap)", url: "https://www.voltaindonesia.com/sgb" },
    ],
    stnk: true,
    checkedAt: CHECKED_AT,
  },
  {
    brand: "Volta",
    model: "Eagle",
    price: 18850000,
    priceNote: "Situs resmi Volta (Okt 2026)",
    range: 60,
    speed: 60,
    power: 1900,
    battery: "LiFePO4 64V 21Ah (1,34 kWh/baterai), 2 slot",
    batteryType: "LFP",
    warranty: "Baterai 2 thn/800 siklus; seumur hidup dgn membership",
    chargeTime: "Swap di SGB + cas di rumah",
    batteryScheme: "Beli/Swap",
    swapCost: "Rp 1.000–5.000 per swap (sesuai % isi)",
    notes:
      "60 km per baterai, hingga 120 km dengan baterai kedua. Isi paket belum tertulis; 401 dari toko resmi yang sama termasuk 1 baterai + charger. Drive mode, USB port. Beban maks 150 kg",
    url: "https://www.voltaindonesia.com/volta-reguler/volta-reguler-eagle",
    sources: [
      { label: "Situs resmi Volta", url: "https://www.voltaindonesia.com/volta-reguler/volta-reguler-eagle" },
      { label: "Volta garansi baterai", url: "https://www.voltaindonesia.com/battery-volta" },
      { label: "Volta SGB (tarif swap)", url: "https://www.voltaindonesia.com/sgb" },
    ],
    stnk: true,
    checkedAt: CHECKED_AT,
  },
  {
    brand: "Volta",
    model: "Mandala",
    price: 19950000,
    priceNote: "Situs resmi Volta (Okt 2026)",
    range: 65,
    speed: 55,
    power: 1800,
    battery: "LiFePO4 64V 21Ah (1,34 kWh/baterai), 2 slot",
    batteryType: "LFP",
    warranty: "Baterai 2 thn/800 siklus; seumur hidup dgn membership",
    chargeTime: "Swap di SGB + cas di rumah",
    batteryScheme: "Beli/Swap",
    swapCost: "Rp 1.000–5.000 per swap (sesuai % isi)",
    notes:
      "65 km per baterai, hingga 130 km dengan baterai kedua. Isi paket belum tertulis; 401 dari toko resmi yang sama termasuk 1 baterai + charger. Beban maks 150 kg",
    url: "https://www.voltaindonesia.com/volta-reguler/volta-reguler-mandala",
    sources: [
      { label: "Situs resmi Volta", url: "https://www.voltaindonesia.com/volta-reguler/volta-reguler-mandala" },
      { label: "Volta garansi baterai", url: "https://www.voltaindonesia.com/battery-volta" },
      { label: "Volta SGB (tarif swap)", url: "https://www.voltaindonesia.com/sgb" },
    ],
    stnk: true,
    checkedAt: CHECKED_AT,
  },
  {
    brand: "Polytron",
    model: "Fox 200",
    price: 18500000,
    priceNote:
      "OTR Jadetabek, baterai sewa Rp 125 rb/bln. Beli putus Rp 20,5 jt. Promo merek sempat Rp 11,5 jt",
    range: 85,
    speed: 70,
    power: 1500,
    battery: "LFP 72V 27Ah (1,94 kWh)",
    batteryType: "LFP",
    warranty: "Baterai: seumur langganan (sewa) / 3 thn (beli). Dinamo & ECU 1 thn",
    chargeTime: "4–5 jam (onboard 450 W)",
    batteryScheme: "Sewa/Beli",
    swapCost: "Sewa baterai Rp 125.000/bln",
    notes:
      "Range 85 km pada kecepatan 40 km/jam. Potongan Rp 7 jt itu promo Polytron, bukan subsidi pemerintah",
    url: "https://2w.polytronev.id/fox200",
    sources: [
      { label: "Situs resmi Polytron", url: "https://2w.polytronev.id/fox200" },
      { label: "Liputan6, Jan 2026", url: "https://otosia.liputan6.com/otosia/read/6254315/harga-motor-listrik-polytron-2026-lengkap-dengan-spesifikasi-semua-model" },
      { label: "Kumparan, Agu 2026 (sewa baterai)", url: "https://kumparan.com/kumparanoto/rincian-harga-sewa-baterai-motor-listrik-polytron-mulai-rp-125-ribu-27vty9HlGLI" },
    ],
    stnk: true,
    checkedAt: CHECKED_AT,
  },
  {
    brand: "Alva",
    model: "N3 Next Gen (BEBAS PAS)",
    price: 18500000,
    priceNote:
      "Harga motor saja, baterai disewa (resmi, Sep 2026). Dengan baterai Rp 37,5 jt",
    range: 140,
    speed: 80,
    power: 4500,
    battery: "LFP 3,3 kWh (milik Alva, disewa)",
    batteryType: "LFP",
    warranty: "Baterai: tanpa batas selama sewa. Motor 2 thn/20.000 km",
    chargeTime: "4 jam (0–100%); boost 10–50% < 25 mnt",
    batteryScheme: "Sewa",
    swapCost: "Rp 125.000/bln + Rp 75–225 rb kalau > 700 km/bln",
    notes:
      "Telat bayar sewa: baterai dibatasi lalu dinonaktifkan. Daya 4,5 kW = puncak. Promo merek s.d. Rp 7 jt sering ada",
    url: "https://www.alvaauto.com/id/product/n3",
    sources: [
      { label: "Blog resmi Alva, Sep 2026", url: "https://www.alvaauto.com/blog/harga-motor-listrik-alva/" },
      { label: "Kontrak BEBAS PAS", url: "https://support.alvaauto.com/hc/id/articles/15097189624207" },
      { label: "detikOto, Feb 2026", url: "https://oto.detik.com/motor-listrik/d-8344441/alva-n3-next-gen-meluncur-harga-mulai-rp-15-jutaan" },
    ],
    stnk: true,
    checkedAt: CHECKED_AT,
  },
  {
    brand: "Uwinfly",
    model: "M110G",
    price: 17590000,
    priceNote: "Situs resmi (Okt 2026), off-the-road (+ biaya STNK)",
    range: 100,
    speed: 85,
    power: 3000,
    battery: "Lithium 72V 45Ah (3,24 kWh)",
    batteryType: "Li-ion",
    warranty: null,
    chargeTime: null,
    batteryScheme: "Beli",
    swapCost: null,
    notes: "Saudara M110F dengan baterai lebih besar (45Ah vs 30Ah) tapi jarak klaim sama",
    url: "https://www.uwinflyofficial.id/m110g",
    sources: [
      { label: "Situs resmi Uwinfly, semua produk (Okt 2026)", url: "https://www.uwinflyofficial.id/semua-produk" },
    ],
    stnk: true,
    checkedAt: CHECKED_AT,
  },
  {
    brand: "Uwinfly",
    model: "M110F",
    price: 17890000,
    priceNote: "Situs resmi (Okt 2026), off-the-road (+ biaya STNK)",
    range: 100,
    speed: 85,
    power: 3000,
    battery: "Lithium 74V 30Ah (2,22 kWh), swap TriFast",
    batteryType: "Li-ion",
    warranty: "Baterai 2 thn; rangka & dinamo 10 thn; charger, controller, rem, velg 1 thn",
    chargeTime: "50% dalam 1,5 jam; swap < 10 detik",
    batteryScheme: "Beli/Swap",
    swapCost: null,
    notes:
      "Ada di situs resmi, tapi per Okt 2026 tidak tampil di toko resmi Shopee/Tokopedia. Penjualan resmi off-the-road: STNK & BPKB diurus terpisah. Sebagian unit di marketplace lain dijual 'tanpa surat'",
    url: "https://www.uwinflyofficial.id/m110f",
    sources: [
      { label: "Situs resmi Uwinfly, semua produk (Okt 2026)", url: "https://www.uwinflyofficial.id/semua-produk" },
      { label: "Situs resmi + brosur", url: "https://www.uwinflyofficial.id/m110f" },
      { label: "InfoEV", url: "https://www.infoev.id/uwinfly-m110f" },
      { label: "Toko resmi Uwinfly di Shopee (Okt 2026)", url: "https://shopee.co.id/uwinfly" },
      { label: "Medcom, Apr 2026", url: "https://www.medcom.id/otomotif/motor/MkM5Gevk-cek-daftar-harga-motor-listrik-uwinfly-april-2026" },
    ],
    stnk: true,
    checkedAt: CHECKED_AT,
  },
  {
    brand: "Volta",
    model: "Virgo",
    price: 19100000,
    priceNote: "Situs resmi Volta (Okt 2026); OTR Jakarta (Kontan, Agu 2026); Jatim Rp 20,35 jt",
    range: 65,
    speed: 55,
    power: 1800,
    battery: "LiFePO4 64V 21Ah (1,34 kWh/baterai), 2 slot",
    batteryType: "LFP",
    warranty: "Baterai 2 thn/800 siklus; seumur hidup dgn membership",
    chargeTime: "Swap di SGB + cas di rumah",
    batteryScheme: "Beli/Swap",
    swapCost: "Rp 1.000–5.000 per swap (sesuai % isi)",
    notes:
      "Toko resmi: 65 km (1 baterai) / 130 km (2 baterai); 401 dari toko yang sama sudah termasuk 1 baterai + charger. Beban maks 150 kg",
    url: "https://www.voltaindonesia.com/volta-reguler/volta-reguler-virgo",
    sources: [
      { label: "Toko resmi Volta di Shopee (Okt 2026)", url: "https://shopee.co.id/VOLTA-VIRGO-OTR-JABODETABEK-i.834348333.29962210983" },
      { label: "Situs resmi Volta", url: "https://www.voltaindonesia.com/volta-reguler/volta-reguler-virgo" },
      { label: "Kontan, Agu 2026", url: "https://nasional.kontan.co.id/news/insentif-motor-listrik-paling-cepat-mulai-september-2026-cek-harga-sebelum-subsidi" },
    ],
    stnk: true,
    checkedAt: CHECKED_AT,
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
      <span class="stat-val">${formatDate(CHECKED_AT)}</span>
      <span class="stat-lbl">Data dicek</span>
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
  document.getElementById("chkLithium").addEventListener("change", render);

  /* reset */
  document.getElementById("btnReset").addEventListener("click", () => {
    document.getElementById("searchInput").value = "";
    document.getElementById("selPrice").value = "20000000";
    document.getElementById("selRange").value = "0";
    document.getElementById("chkLithium").checked = false;
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
  const lithiumOnly = document.getElementById("chkLithium").checked;

  /* filter */
  let data = MOTORS.map((m, idx) => ({ ...m, _idx: idx })).filter((m) => {
    if (q && !`${m.brand} ${m.model}`.toLowerCase().includes(q)) return false;
    if (m.price > pMax) return false;
    if (m.range < rMin) return false;
    if (lithiumOnly && m.batteryType === "SLA") return false;
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
        <td colspan="9">
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
        <td class="td-model">
          ${esc(m.model)}
          ${m.stnk === true ? "" : stnkBadge(m.stnk)}
        </td>
        <td class="td-price ${pCls}">
          ${IDR.format(m.price)}
          ${m.priceNote ? `<small class="price-note">${esc(m.priceNote)}</small>` : ""}
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
    label: "Harga*",
    render: (m) =>
      `<span class="${priceTierClass(m.price)} fw-bold">${IDR.format(m.price)}</span>`,
    bestKey: "price",
    best: "min",
  },
  {
    label: "Keterangan Harga",
    render: (m) => `<small class="text-muted">${esc(m.priceNote)}</small>`,
    best: null,
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
    label: "Daya Maks",
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
    label: "Biaya Swap / Sewa",
    render: (m) => esc(m.swapCost),
    best: null,
  },
  {
    label: "Bisa STNK/Plat",
    render: (m) => stnkBadge(m.stnk),
    best: null,
  },
  {
    label: "Garansi",
    render: (m) => esc(m.warranty),
    best: null,
  },
  {
    label: "Catatan",
    render: (m) => `<small class="text-muted">${esc(m.notes)}</small>`,
    best: null,
  },
  {
    label: "Sumber",
    render: (m) =>
      `<ul class="cmp-sources">${m.sources
        .map(
          (s) =>
            `<li><a href="${safeUrl(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)}</a></li>`,
        )
        .join("")}</ul>`,
    best: null,
  },
  {
    label: "Data Dicek",
    render: (m) => formatDate(m.checkedAt),
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
         class="btn-website">Buka →</a>
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
            <th class="cmp-spec-th">Halaman Produk</th>
            ${urlCells}
          </tr>
        </tbody>
      </table>
    </div>
    <p class="cmp-note">
      * Harga normal tanpa promo &amp; tanpa subsidi, lihat Keterangan Harga. Range = klaim pabrik (di jalanan bisa turun 20–40%).
      Daya = daya maksimum klaim pabrik.
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

function stnkBadge(stnk) {
  if (stnk === true) return '<span class="stnk-badge stnk-yes">Ya</span>';
  if (stnk === false) return '<span class="stnk-badge stnk-no">Tanpa STNK</span>';
  return '<span class="stnk-badge stnk-unknown">STNK belum jelas</span>';
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

/** "2026-10-16" → "16 Okt 2026" */
function formatDate(iso) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
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
