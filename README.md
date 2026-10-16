# ⚡ Motor Listrik Entry Level Indonesia

Perbandingan motor listrik di bawah **Rp 20 juta** (harga normal, tanpa promo &
subsidi) untuk pasar Indonesia, khususnya Pulau Jawa.

Live: https://motorlistrik.ikhwanuddin.com/

## Fitur

- Peta harga vs jarak tempuh (SVG): titik di kiri-atas = murah & jauh, besar titik = kecepatan, klik titik untuk detail (kalau kena beberapa titik berdempetan, muncul daftar pilihan)
- Filter: cari, budget (slider), jarak tempuh minimal, kecepatan maks minimal, tipe baterai, pasti bisa STNK, harga sudah termasuk baterai
- Urutkan harga / jarak / kecepatan / daya
- Klik motor → panel detail: keterangan harga, baterai, garansi, catatan, sumber, link resmi
- Pilih 2–3 motor → panel bandingkan, nilai terbaik ditandai
- Biaya per bulan: listrik cas di rumah (jarak ÷ jarak tempuh klaim × kWh × tarif) + sewa baterai, dibandingkan motor bensin. Input jarak harian, hari pakai, tarif listrik rumah (dropdown per golongan VA), batas cas (0–100 / 20–100 / 20–80%, mengubah jarak per cas & jumlah cas, bukan biaya per km), harga & konsumsi bensin; ikut filter. Muncul juga di detail & bandingkan
- Link bisa dibagikan: filter, motor yang dipilih untuk dibandingkan, dan detail yang dibuka tersimpan di URL (`?bandingkan=volta-401,uwinfly-m90e`, `?motor=volta-401`, jarak harian `?km=50`); tombol **Bagikan** di detail & bandingkan. Preview WA/medsos pakai `assets/img/og.jpg`
- Responsif (HP: kartu ringkas, filter nempel saat scroll, bottom sheet dengan tombol aksi tetap di bawah) dan dark mode otomatis

Murni HTML + CSS + vanilla JS, tanpa build. Font Plus Jakarta Sans di-host sendiri (tanpa request ke Google).
Tanpa analytics, cookie, atau localStorage. CSP ketat di `index.html` (hanya aset sendiri).

## Struktur

```
index.html              halaman utama
assets/css/style.css    styling
assets/js/data.js       data MOTORS + CHECKED_AT
assets/js/app.js        UI: peta, filter/sort, detail, bandingkan
assets/fonts/           Plus Jakarta Sans (latin, variable)
assets/img/og.jpg       gambar preview link (1200×630)
assets/img/motor.svg    ilustrasi hero (kanan atas di layar ≥1100px, di atas judul di layar sempit), warna dark mode diatur di dalam svg
serve.sh                server lokal (python3)
```

## Jalankan lokal

```bash
./serve.sh        # http://localhost:8000
./serve.sh 9000   # port lain
```

## Update data

Edit array `MOTORS` di `assets/js/data.js`. Tanggal cek ada di `CHECKED_AT`.
Tarif listrik & default kalkulator (harga Pertalite, konsumsi BeAT) ada di input `#biaya` di `index.html`, sumbernya di fineprint bawahnya.

| Field | Isi |
|-------|-----|
| `brand`, `model` | Nama merek & model. Id di URL dibuat dari keduanya (`Volta` + `401` → `volta-401`), jadi ganti nama = link lama ke motor itu tidak jalan lagi |
| `price` | Harga normal (Rp), OTR Jakarta/Jadetabek kalau ada |
| `priceNote` | Keterangan harga lengkap (sumber, wilayah, promo) — tampil di detail |
| `priceTag` | Label pendek di bawah harga, mis. `"OTR Jakarta"`, `"Off-the-road"` |
| `range`, `speed`, `power` | Jarak tempuh (km), kecepatan maks (km/j), daya maks (W) |
| `battery`, `batteryType` | Deskripsi baterai; tipe `LFP` / `Li-ion` / `SLA` |
| `kwh` | Kapasitas baterai (kWh) untuk jarak `range`, angka. Dipakai kalkulator biaya listrik |
| `warranty`, `chargeTime` | Garansi & waktu charge |
| `batteryScheme`, `swapCost` | `Beli` / `Sewa` / `Beli/Swap` / `Sewa/Beli`; biaya swap/sewa (teks) |
| `batteryRent`, `rentKmCap` | Sewa baterai Rp/bulan (angka, `null` kalau beli); batas km/bulan sebelum kena biaya tambahan (opsional) |
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
