# ⚡ Motor Listrik Entry Level Indonesia

Halaman web perbandingan sepeda motor listrik di bawah **Rp 20 juta** untuk
pasar Indonesia, khususnya Pulau Jawa.

## Fitur

| Fitur | Keterangan |
|-------|------------|
| 📋 Sortable table | Klik header kolom untuk mengurutkan naik/turun |
| 🔍 Live search | Filter merek atau model secara real-time |
| 💰 Filter harga | Dropdown batas harga maksimum |
| 🛣️ Filter jarak | Minimum jarak tempuh yang diinginkan |
| ⭐ Filter subsidi | Tampilkan hanya motor eligible subsidi pemerintah |
| 🔗 Klik baris | Membuka website resmi produsen di tab baru |
| ♿ Keyboard accessible | Navigasi dengan Tab + Enter/Space |
| 📱 Responsive | Mobile, tablet, dan desktop |

**Zero dependencies** — murni HTML + CSS + vanilla JS. Tidak ada npm, tidak ada framework.

## Struktur File

```
sepeda-motor-listrik-entry-level/
├── index.html              ← halaman utama
├── assets/
│   ├── css/
│   │   └── style.css       ← semua styling (tema hijau elektrik)
│   └── js/
│       └── app.js          ← data motor + filter / sort logic
└── README.md
```

## Deploy ke GitHub Pages

**⚡ TL;DR:** Baca [docs/SETUP_GITHUB_PAGES.md](docs/SETUP_GITHUB_PAGES.md) untuk instruksi lengkap & checklist.

### Quick Setup

Repo ini sudah siap deploy dengan GitHub Actions workflow (`/.github/workflows/pages.yml`):

1. **Pastikan repo adalah PUBLIC**
   - GitHub Settings → Visibility → Public

2. **Enable GitHub Pages**
   - GitHub Settings → Pages
   - Source: **GitHub Actions**
   - Save

3. **Push code** (sudah ada, tapi bisa manual trigger)
   - Workflow otomatis jalan setiap push ke `main`
   - Cek di repo **Actions** tab

4. **Live di** → `https://ikhwanuddin.github.io/motorlistrik/`
   - (Ganti URL sesuai username/repo kamu)

### Update data setelah deploy
Setiap kali update data atau tampilan:
```bash
git add -A
git commit -m "update: deskripsi perubahan"
git push
```

Workflow otomatis jalan setiap push → site update dalam ~2 menit.

## Cara Update / Tambah Data Motor

Edit array `MOTORS` di `assets/js/app.js`. Setiap entri motor memiliki field:

| Field | Tipe | Keterangan |
|-------|------|------------|
| `brand` | string | Nama merek, contoh `'Polytron'` |
| `model` | string | Nama model, contoh `'Fox-R'` |
| `price` | number | Harga OTR Jakarta dalam Rupiah |
| `range` | number | Jarak tempuh km (klaim pabrik) |
| `speed` | number | Kecepatan maksimum km/jam |
| `power` | number | Daya motor dalam Watt |
| `battery` | string | Deskripsi baterai, contoh `'Li-ion 60V 20Ah'` |
| `warranty` | string | Garansi baterai, contoh `'3 tahun'` |
| `subsidi` | boolean | `true` jika eligible subsidi pemerintah |
| `url` | string | URL website resmi (wajib dimulai dengan `https://`) |

Contoh menambah motor baru:

```javascript
{
  brand:    'NamaMarek',
  model:    'NamaModel',
  price:    18000000,
  range:    75,
  speed:    85,
  power:    2000,
  battery:  'Li-ion 72V 20Ah',
  warranty: '3 tahun',
  subsidi:  true,
  url:      'https://www.namamarck.co.id',
},
```

## Mengganti Thumbnail Placeholder dengan Foto Produk Asli

Saat ini thumbnail dibuat otomatis dari kode JS (SVG berwarna berdasarkan tipe baterai).
Untuk mengganti dengan foto produk asli:

1. Simpan foto ke `assets/images/` (format `.jpg` atau `.webp`, ukuran ideal ~320×240 px)
2. Tambah field `thumbnail` ke objek motor di `app.js`:
```javascript
{
  brand: 'Polytron',
  model: 'Fox-200',
  // ...
  thumbnail: 'assets/images/polytron-fox200.jpg',  // ← tambahkan ini
}
```
3. Di fungsi `motorThumb(m, size)` dalam `app.js`, tambah logika prioritas:
```javascript
// Di awal fungsi motorThumb(), sebelum baris 'const palette':
if (m.thumbnail) {
  return m.thumbnail;
}
```
Hasil: motor yang punya `thumbnail` akan tampil foto asli; yang belum punya tetap pakai SVG placeholder.

| Merek | Model | Harga* |
|-------|-------|--------|
| Exotic | Thunder EV | Rp 11,5 juta |
| Greentech | City | Rp 12,5 juta |
| Polytron | Fox-R | Rp 13,5 juta |
| Smoot | Tempur | Rp 14 juta |
| United Motor | MX1200 | Rp 14,2 juta |
| Volta | Crossi | Rp 14,5 juta |
| Selis | Neuron | Rp 15 juta |
| United Motor | T1800 | Rp 15,7 juta |
| Smoot | Zuzu | Rp 16,5 juta |
| Viar | Q1 | Rp 17,3 juta |
| United Motor | TX3000 | Rp 17,8 juta |
| Charged | C Series | Rp 19 juta |

*Harga OTR Jakarta perkiraan 2024, dapat berubah sewaktu-waktu.

## Disclaimer

Data dikumpulkan dari sumber publik dan merupakan **perkiraan** pada waktu
penulisan. Harga OTR dapat berbeda per wilayah dan berubah sewaktu-waktu.
Selalu verifikasi harga, spesifikasi, dan ketersediaan subsidi ke dealer resmi
atau website produsen sebelum membeli.
