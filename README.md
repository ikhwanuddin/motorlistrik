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

1. Buat repository baru di GitHub (contoh: `motor-listrik-entry-level`)
2. Push semua file ke branch `main`
3. Buka **Settings → Pages → Deploy from branch → main / (root)**
4. Tunggu ~1 menit, lalu akses:
   `https://username.github.io/motor-listrik-entry-level/`

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

## Data Motor yang Tersedia

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
