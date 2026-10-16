# ⚡ Motor Listrik Entry Level Indonesia

Perbandingan motor listrik di bawah **Rp 20 juta** (harga normal, tanpa promo &
subsidi) untuk pasar Indonesia, khususnya Pulau Jawa.

Live: https://motorlistrik.ikhwanuddin.com/

## Fitur

- Peta harga vs jarak tempuh (SVG): titik di kiri-atas = murah & jauh, besar titik = kecepatan, klik titik untuk detail
- Filter: cari, budget (slider), jarak tempuh minimal, kecepatan maks minimal, tipe baterai, pasti bisa STNK, harga sudah termasuk baterai
- Urutkan harga / jarak / kecepatan / daya
- Klik motor → panel detail: keterangan harga, baterai, garansi, catatan, sumber, link resmi
- Pilih 2–3 motor → panel bandingkan, nilai terbaik ditandai
- Responsif (HP: kartu & bottom sheet) dan dark mode otomatis

Murni HTML + CSS + vanilla JS, tanpa build. Font Plus Jakarta Sans di-host sendiri (tanpa request ke Google).
Tanpa analytics, cookie, atau localStorage. CSP ketat di `index.html` (hanya aset sendiri).

## Struktur

```
index.html              halaman utama
assets/css/style.css    styling
assets/js/data.js       data MOTORS + CHECKED_AT
assets/js/app.js        UI: peta, filter/sort, detail, bandingkan
assets/fonts/           Plus Jakarta Sans (latin, variable)
serve.sh                server lokal (python3)
```

## Jalankan lokal

```bash
./serve.sh        # http://localhost:8000
./serve.sh 9000   # port lain
```

## Update data

Edit array `MOTORS` di `assets/js/data.js`. Tanggal cek ada di `CHECKED_AT`.

| Field | Isi |
|-------|-----|
| `brand`, `model` | Nama merek & model |
| `price` | Harga normal (Rp), OTR Jakarta/Jadetabek kalau ada |
| `priceNote` | Keterangan harga lengkap (sumber, wilayah, promo) — tampil di detail |
| `priceTag` | Label pendek di bawah harga, mis. `"OTR Jakarta"`, `"Off-the-road"` |
| `range`, `speed`, `power` | Jarak tempuh (km), kecepatan maks (km/j), daya maks (W) |
| `battery`, `batteryType` | Deskripsi baterai; tipe `LFP` / `Li-ion` / `SLA` |
| `warranty`, `chargeTime` | Garansi & waktu charge |
| `batteryScheme`, `swapCost` | `Beli` / `Sewa` / `Beli/Swap` / `Sewa/Beli`; biaya swap/sewa |
| `batteryPrice` | Harga beli baterai baru (pengganti) |
| `notes` | Catatan |
| `url`, `sources` | Link resmi; daftar `{label, url}` sumber data |
| `stnk` | `true` bisa STNK, `false` tidak bisa, `null` belum jelas |
| `checkedAt` | Pakai `CHECKED_AT` |

Isi `null` kalau data tidak ketemu di sumber. Jangan menebak.

Cek sintaks setelah edit:

```bash
node --check assets/js/data.js
```

## Deploy

Push ke `main` → GitHub Actions deploy ke GitHub Pages (~1–2 menit).
Saat deploy, `?v=dev` di `index.html` diganti hash commit, jadi pengunjung
langsung dapat CSS/JS terbaru tanpa hard reload.

## Disclaimer

Data dari sumber publik dan bisa berubah. Selalu cek harga & spesifikasi ke
dealer resmi atau situs produsen sebelum membeli.
