# Struktur Project & Development Guide

## 📁 Struktur File

```
sepeda-motor-listrik-entry-level/
├── index.html                           ← Halaman utama (entry point)
├── assets/
│   ├── css/
│   │   └── style.css                   ← Semua styling (1000+ lines)
│   ├── js/
│   │   └── app.js                      ← Data motor + logic (800+ lines)
│   └── images/                         ← Tempat taruh foto motor (opsional)
├── .github/workflows/
│   └── pages.yml                       ← GitHub Actions auto-deploy config
├── docs/
│   └── SETUP_GITHUB_PAGES.md          ← Step-by-step Pages setup
├── serve.sh                            ← Local dev server
├── README.md                           ← Dokumentasi user
└── .gitignore                          ← Git ignore rules
```

## 🏃 Quick Start Development

### Local Testing
```bash
# Buka folder project
cd sepeda-motor-listrik-entry-level

# Jalankan local server (port 8000)
./serve.sh

# Atau specify port custom
./serve.sh 3000
```

Kemudian buka browser: `http://localhost:8000`

### Edit & Test

1. **Ubah data motor** → Edit `assets/js/app.js`, cari `const motorsData = [...]`
2. **Update styling** → Edit `assets/css/style.css`
3. **Update markup** → Edit `index.html`
4. **Browser auto-reload?** → Manual refresh (`Cmd+R` Mac / `Ctrl+R` Windows)

### Commit & Push

```bash
# Stage changes
git add -A

# Commit dengan deskripsi jelas
git commit -m "feat: tambah motor baru XXX" 

# Push ke GitHub
git push origin main
```

→ GitHub Actions workflow otomatis trigger
→ Deploy selesai ~1-2 menit
→ Live di `https://ikhwanuddin.github.io/motorlistrik/`

---

## 📝 Common Tasks

### Menambah Motor Baru

Di `assets/js/app.js`, cari section:
```javascript
const motorsData = [
  // ... existing motors
  {
    brand: 'NewBrand',
    model: 'NewModel',
    price: 15000000,
    range: 80,
    speed: 90,
    power: 2500,
    battery: 'Li-ion 72V 25Ah',
    batteryType: 'Li-ion',
    warranty: '3 tahun',
    chargeTime: '6 jam',
    batteryScheme: 'Built-in',
    swapCost: 'N/A',
    dealerNetwork: 'Sedang',
    notes: 'Catatan tambahan',
    subsidi: true,
    url: 'https://brand.co.id',
    // thumbnail: 'assets/images/brand-model.jpg',  // Opsional: ganti SVG placeholder
  },
];
```

**Field yang wajib:**
- `brand` (string)
- `model` (string)  
- `price` (number, Rupiah)
- `range` (number, km)
- `speed` (number, km/jam)
- `power` (number, Watt)
- `battery` (string, e.g., "Li-ion 72V 25Ah")
- `batteryType` (string: 'Li-ion', 'LFP', 'SLA', 'mixed')
- `warranty` (string)
- `subsidi` (boolean)
- `url` (string, HARUS https://)

**Field opsional:**
- `chargeTime`, `batteryScheme`, `swapCost`, `dealerNetwork`, `notes`
- `thumbnail` (path ke image file, override SVG placeholder)

### Ganti Thumbnail SVG dengan Foto Asli

1. **Siapkan foto** (ideal: 320×240px, format JPG/WebP)
2. **Taruh di** `assets/images/brand-model.jpg`
3. **Update motor data** di `assets/js/app.js`:
```javascript
{
  // ...
  thumbnail: 'assets/images/polytron-fox200.jpg',
}
```

→ Tekan save → Refresh browser → Motor ini tampil foto asli

### Update Harga / Spesifikasi

1. Buka `assets/js/app.js`
2. Cari motor di `motorsData[]`
3. Edit field (e.g., `price`, `range`, `warranty`)
4. Save → Test lokal → Push

### Menambah Filter / Feature Baru

1. **UI/HTML** → Edit `index.html` (tambah tombol, dropdown, dsb)
2. **Styling** → Edit `assets/css/style.css`
3. **Logic** → Edit `assets/js/app.js` (tambah event listener, filter function)
4. **Test lokal** → `./serve.sh` → Refresh browser
5. **Push** → GitHub Pages auto-update

---

## 🎨 Styling Conventions

File: `assets/css/style.css`

### Color Palette
- **Primary (Hijau Elektrik)** — `#00c853` (theme color)
- **Dark BG** — `#1a1a1a` (background)
- **Light text** — `#e0e0e0` (default text)
- **Accent** — `#ffb300` (highlights)

### Battery Type Colors (di SVG thumbnail)
- `Li-ion` → Blue `#2196F3`
- `LFP` → Green `#4CAF50`
- `SLA` → Gray `#9E9E9E`
- `mixed` → Purple `#9C27B0`

### Class Naming
- `.table-container` — wrapper tabel
- `.filter-bar` — filter section
- `.compare-bar` — fixed bottom comparison bar
- `.modal-overlay` — modal background
- `.compare-grid` — comparison side-by-side layout
- `.badge` — small label tags

---

## 🐛 Debugging

### Browser Console
```bash
# Buka DevTools → Console tab

# Check if motorsData loaded?
console.log(motorsData);

# Check current filters?
console.log(window.state || 'No state');

# Test filter function
filterMotors();
```

### Common Issues

| Masalah | Solusi |
|---------|--------|
| Halaman blank | Cek Console (Cmd+Opt+I → Console) — ada error JS? |
| Filter tidak jalan | Pastikan `motorcycles.js` loaded; check network tab |
| Thumbnail tidak tampil | Path `assets/images/...` benar? Cek DevTools → Network |
| Deploy gagal | Cek GitHub **Actions** tab — workflow error log |

---

## 📊 Analytics / Monitoring (Opsional)

Untuk menambah Google Analytics:

1. **Buat GA account** → https://analytics.google.com
2. **Copy GA tag** (format: `G-XXXXXXXXXX`)
3. **Edit `index.html`** → paste sebelum `</head>`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```
4. **Push** → Deploy otomatis

---

## 📚 References

- [GitHub Pages Docs](https://docs.github.com/en/pages)
- [GitHub Actions](https://docs.github.com/en/actions)
- [MDN Web Docs](https://developer.mozilla.org/)
- [Can I Use?](https://caniuse.com/) — browser compatibility checker

---

**Questions?** Check [SETUP_GITHUB_PAGES.md](SETUP_GITHUB_PAGES.md) atau README.md
