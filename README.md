# ⚡ Motor Listrik Entry Level Indonesia

Perbandingan motor listrik di bawah **Rp 20 juta** (harga normal, tanpa promo &
subsidi) untuk pasar Indonesia, khususnya Pulau Jawa.

Live: http://motorlistrik.ikhwanuddin.com/

## Fitur

- Tabel bisa diurutkan (klik header; di HP lewat pilihan **Urutkan**)
- Cari merek/model, filter harga maksimum, jarak tempuh minimum, baterai lithium saja
- Klik baris → panel detail: keterangan harga lengkap, garansi, catatan, sumber, link resmi
- Centang 2–3 motor → modal perbandingan berdampingan
- Di HP (≤ 640px) tabel tampil sebagai kartu

Murni HTML + CSS + vanilla JS, tanpa dependency.

## Struktur

```
index.html              halaman utama
assets/css/style.css    styling
assets/js/app.js        data MOTORS + filter/sort/render
serve.sh                server lokal (python3)
```

## Jalankan lokal

```bash
./serve.sh        # http://localhost:8000
./serve.sh 9000   # port lain
```

## Update data

Edit array `MOTORS` di `assets/js/app.js`. Tanggal cek ada di `CHECKED_AT`.

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
| `notes` | Catatan |
| `url`, `sources` | Link resmi; daftar `{label, url}` sumber data |
| `stnk` | `true` bisa STNK, `false` tidak bisa, `null` belum jelas |
| `checkedAt` | Pakai `CHECKED_AT` |

Isi `null` kalau data tidak ketemu di sumber. Jangan menebak.

Cek sintaks setelah edit:

```bash
node --check assets/js/app.js
```

## Deploy

Push ke `main` → GitHub Actions deploy ke GitHub Pages (~1–2 menit).

## Disclaimer

Data dari sumber publik dan bisa berubah. Selalu cek harga & spesifikasi ke
dealer resmi atau situs produsen sebelum membeli.
