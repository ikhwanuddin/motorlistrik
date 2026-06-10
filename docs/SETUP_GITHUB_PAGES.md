# Setup GitHub Pages - Step by Step

Repo ini sudah siap untuk deploy ke GitHub Pages. Ikuti langkah di bawah untuk mengaktifkan:

## 1️⃣ Pastikan Repo Public

GitHub Pages gratis hanya untuk repo **public**.

### Via GitHub Web UI:
1. Buka https://github.com/ikhwanuddin/motorlistrik
2. Klik **Settings** (atau gear icon)
3. Cari **Visibility** section
4. Klik tombol **Change visibility**
5. Pilih **Public** → confirm

Atau via GitHub CLI (jika sudah auth):
```bash
gh repo edit ikhwanuddin/motorlistrik --visibility public
```

## 2️⃣ Enable GitHub Pages

### Via GitHub Web UI:
1. Di repo Settings, cari **Pages** (di sidebar kiri)
2. Di bawah "Build and deployment":
   - **Source**: pilih **GitHub Actions**
   - Ini akan auto-trigger workflow kita di `.github/workflows/pages.yml`
3. Save

### Atau via CLI:
```bash
gh repo edit ikhwanuddin/motorlistrik --enable-pages
```

## 3️⃣ Deploy Workflow Otomatis

Kami sudah membuat `.github/workflows/pages.yml` yang akan:
- Trigger saat ada `push` ke branch `main`
- Upload static files ke Pages
- Auto-deploy

Tidak perlu setup tambahan — workflow sudah included di repo.

## 4️⃣ Verifikasi Deploy

Setelah enable Pages:

### Status di GitHub:
1. Buka repo → **Actions** tab
2. Lihat workflow `Deploy to GitHub Pages` running
3. Tunggu selesai (biasanya ~1-2 menit)
4. Cek status: ✅ = sukses, ❌ = ada error

### Akses live site:
Setelah deploy sukses, site akan live di:
```
https://ikhwanuddin.github.io/motorlistrik/
```

Atau cek di repo **Settings → Pages** untuk melihat URL final.

## 📋 Checklist

- [ ] Repo set ke **Public**
- [ ] GitHub Pages **enabled** (Source: GitHub Actions)
- [ ] Push ke main (atau trigger workflow manual di Actions tab)
- [ ] Workflow `pages.yml` running di **Actions**
- [ ] Deploy selesai (status ✅)
- [ ] Site accessible di `https://ikhwanuddin.github.io/motorlistrik/`

## 🐛 Troubleshooting

### Workflow Error?
1. Cek **Actions** tab → workflow run
2. Lihat error log
3. Umumnya error = repo masih private atau Pages belum diaktifkan

### Site Not Loading?
- Tunggu ~5 menit setelah deploy
- Cek URL benar: `https://ikhwanuddin.github.io/motorlistrik/`
- Clear browser cache (`Cmd+Shift+R` di Mac)

### Semua sukses tapi halaman blank?
- Buka Developer Console (`Cmd+Option+I`)
- Cek error di **Console** tab
- Pastikan browser bisa akses `index.html`, `assets/css/style.css`, `assets/js/app.js`

---

## 📝 Next Steps (Opsional)

Setelah Pages live, kamu bisa:

1. **Ganti SVG placeholder thumbnail dengan foto nyata:**
   - Taruh gambar di `assets/images/`
   - Update `assets/js/app.js` → tambahkan `thumbnail: 'assets/images/name.jpg'` ke motor data
   - Push, auto-deploy akan update site

2. **Update Data Motor:**
   - Edit `assets/js/app.js` → `const motorsData = [...]`
   - Verifikasi harga, range, link URL
   - Push untuk auto-update

3. **Custom Domain (Opsional):**
   - Di Settings → Pages → Custom domain
   - Masukkan domain kamu (e.g., `motorlistrik.ikhwanuddin.com`)
   - Update DNS settings di registrar domain

4. **Monitor Traffic:**
   - Google Analytics atau Vercel Analytics bisa ditambahkan
   - Edit `index.html` untuk inject GA snippet

---

**Questions?** Refer to:
- [GitHub Pages Docs](https://docs.github.com/en/pages)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
