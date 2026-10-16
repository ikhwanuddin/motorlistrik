# ⚡ Motor Listrik Entry Level Indonesia

Perbandingan motor listrik di bawah **Rp 20 juta** (harga normal, tanpa promo &
subsidi) untuk pasar Indonesia, khususnya Pulau Jawa.

Live: https://motorlistrik.ikhwanuddin.com/

## Fitur

- Peta harga vs kapasitas baterai / jarak klaim / kecepatan (SVG, pilih sumbu tegak, default kWh, `?sumbu=`): titik di kiri-atas = murah & unggul, besar titik = kecepatan, klik titik untuk detail (kalau kena beberapa titik berdempetan, muncul daftar pilihan)
- Garis depan (Pareto): motor yang tidak punya lawan dengan harga sama/lebih murah sekaligus nilai lebih tinggi. Motor baterai sewa tidak ikut karena harganya tanpa baterai. Panel detail menyebut motor yang lebih murah sekaligus lebih unggul. Ganti sumbu = titik bergeser dan garis digambar ulang (mati kalau prefers-reduced-motion)
- Filter: merek (dropdown), budget (slider), jarak tempuh minimal, kecepatan maks minimal, tipe baterai, pasti bisa STNK, harga sudah termasuk baterai
- Urutkan harga / jarak / kecepatan / daya
- Klik motor → panel detail: keterangan harga, baterai, garansi, catatan, sumber, link resmi, link **Laporkan** (form issue dengan nama motor terisi)
- Pilih 2–3 motor → panel bandingkan, nilai terbaik ditandai
- Biaya per bulan: listrik cas di rumah (jarak ÷ jarak tempuh klaim × kWh × tarif) + sewa baterai, dibandingkan motor bensin. Input jarak harian, hari pakai, tarif listrik rumah (dropdown per golongan VA), batas cas (0–100 / 20–100 / 20–80%, mengubah jarak per cas & jumlah cas, bukan biaya per km), harga & konsumsi bensin; ikut filter. Muncul juga di detail & bandingkan
- Link bisa dibagikan: filter, motor yang dipilih untuk dibandingkan, dan detail yang dibuka tersimpan di URL (`?merek=Volta`, `?bandingkan=volta-401,uwinfly-m90e`, `?motor=volta-401`, jarak harian `?km=50`); tombol **Bagikan** di detail & bandingkan. Preview WA/medsos pakai `assets/img/og.jpg`
- Responsif (HP: kartu ringkas, filter nempel saat scroll, bottom sheet dengan tombol aksi tetap di bawah) dan dark mode otomatis

Murni HTML + CSS + vanilla JS, tanpa build. Font Plus Jakarta Sans di-host sendiri (tanpa request ke Google).
Tanpa analytics, cookie, atau localStorage. CSP ketat di `index.html` (hanya aset sendiri).

## Struktur

```
index.html              halaman utama
assets/css/style.css    styling
assets/js/data.js       data MOTORS + CHECKED_AT
assets/js/app.js        UI: peta, filter/sort, detail, bandingkan
assets/fonts/           Plus Jakarta Sans (latin, variable) + OFL.txt
assets/img/og.jpg       gambar preview link (1200×630)
assets/img/motor.svg    ilustrasi hero (kanan atas di layar ≥1100px, di atas judul di layar sempit), warna dark mode diatur di dalam svg
serve.sh                server lokal (python3)
scripts/check-links.mjs  cek semua link sumber di data.js (fetch, lalu Brave untuk yang diblokir)
scripts/check-prices.mjs cek harga tiap motor masih tertulis di priceUrl (fetch, lalu Brave)
scripts/brave.mjs        buka url di tab baru Brave, ambil judul/teks, tutup lagi
scripts/cek-link-lokal.sh + .plist  jadwal cek link & harga tiap Senin di Mac mini (launchd)
.github/workflows/      static.yml (deploy)
.github/ISSUE_TEMPLATE/ form issue "Data motor"
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
| `priceUrl` | Halaman yang memuat angka `price` sebagai teks, dicek tiap minggu. `null` kalau harga cuma ada di gambar (situs resmi Uwinfly) |
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

Link sumber dicek otomatis tiap Senin 08.00 (jam Mac mini) lewat launchd, bukan
GitHub Actions: banyak situs (Tokopedia, Kontan, situs merek) memblokir IP server
GitHub. Link yang tetap diblokir dari koneksi rumah dibuka sebentar di tab baru
Brave, lalu judul halamannya dicek. Kalau ada yang mati (404/410/domain hilang),
muncul issue **Link sumber mati** (label `link-mati`) berisi daftar link dan
statusnya; issue itu diperbarui tiap minggu dan tertutup sendiri kalau semua normal lagi.
Kalau script-nya sendiri gagal (internet mati, node hilang), muncul issue **Cek link gagal**.

Di jadwal yang sama, harga tiap motor dicek: angka `price` harus masih tertulis di
halaman `priceUrl` (HTML mentah dulu, kalau tidak ketemu teks halaman di Brave). Yang
tidak ketemu masuk issue **Harga berubah?** (label `harga`) bersama angka Rp yang ada
di halaman. Data tidak diubah otomatis: bisa saja itu promo atau halaman berubah, jadi
dicek manual dulu. Baca teks halaman di Brave butuh View → Developer → Allow
JavaScript from Apple Events.

```bash
node scripts/check-links.mjs   # cek manual (tiap url unik sekali), exit 1 kalau ada link mati
node scripts/check-prices.mjs  # cek harga manual, exit 1 kalau ada yang beda
./scripts/cek-link-lokal.sh    # sama seperti jadwal: link + harga dari data.js live, update issue

# pasang jadwal (sekali saja), log di ~/Library/Logs/motorlistrik-cek-link.log
cp scripts/com.ikhwanuddin.motorlistrik.ceklink.plist ~/Library/LaunchAgents/
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.ikhwanuddin.motorlistrik.ceklink.plist
```

Cek sintaks setelah edit:

```bash
node --check assets/js/data.js
```

## Sumbang data

Ada harga berubah, data salah, atau motor baru di bawah Rp 20 juta? Ada dua cara:

1. **Issue** (paling gampang, tanpa coding): buka
   [issue baru → Data motor](https://github.com/ikhwanuddin/motorlistrik/issues/new?template=data-motor.yml),
   isi motor, data, link sumber, dan tanggal cek.
2. **Pull request**: edit `assets/js/data.js` (lihat tabel field di atas), jalankan
   `node --check assets/js/data.js`, lalu buka PR. Satu motor per PR, link sumber
   masuk ke `sources`.

Aturannya:

- **Sumber harus bisa dicek orang lain**: situs resmi produsen, toko resmi
  (official store) di marketplace, atau dealer resmi. Unggahan medsos, forum, atau
  chat dealer tidak dipakai.
- **Harga normal**, bukan harga promo, flash sale, voucher, atau setelah subsidi.
  Sebutkan wilayah OTR kalau ada.
- **Spesifikasi pakai klaim resmi pabrik.** Hasil tes sendiri boleh ditulis di
  catatan issue, tapi tidak menggantikan angka resmi.
- **Tidak ketemu di sumber = kosong (`null`).** Jangan menebak.

Setiap usulan dicek ulang ke sumbernya sebelum masuk. Kalau sumber tidak bisa
dibuka atau angkanya beda, usulan ditahan sampai jelas. Dengan mengirim data, kamu
setuju data itu dirilis dengan lisensi CC BY 4.0 (lihat Lisensi).

## Deploy

Push ke `main` → GitHub Actions deploy ke GitHub Pages (~1–2 menit).
Saat deploy, `?v=dev` di `index.html` diganti hash commit, jadi pengunjung
langsung dapat CSS/JS terbaru tanpa hard reload.

## Lisensi

- **Kode** (HTML, CSS, JS): [MIT](LICENSE).
- **Data** (`assets/js/data.js`), **ilustrasi** (`assets/img/`), dan teks:
  [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.id). Bebas dipakai
  ulang, termasuk untuk komersial, asal mencantumkan
  "motorlistrik.ikhwanuddin.com" sebagai sumber.
- **Font** Plus Jakarta Sans: [SIL Open Font License 1.1](assets/fonts/OFL.txt),
  milik The Plus Jakarta Sans Project Authors.
- Nama merek dan model adalah milik pemiliknya masing-masing. Situs ini tidak
  terafiliasi dengan produsen mana pun.

## Disclaimer

Data dari sumber publik dan bisa berubah. Selalu cek harga & spesifikasi ke
dealer resmi atau situs produsen sebelum membeli.
