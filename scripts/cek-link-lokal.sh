#!/bin/bash
# Dijalankan launchd di Mac mini tiap Senin 08.00 (scripts/com.ikhwanuddin.motorlistrik.ceklink.plist).
# Cek link dan harga di data.js yang sedang live, lalu buka / update / tutup issue
# "Link sumber mati" (label link-mati) dan "Harga berubah?" (label harga).
# Jalan dari koneksi rumah + Brave, bukan GitHub Actions, karena banyak situs memblokir IP server.
set -e
# node versi terbaru yang terpasang di nvm, biar tidak rusak saat node di-upgrade
node_bin=$(ls -d "$HOME"/.nvm/versions/node/v*/bin | sort -V | tail -1)
export PATH="/opt/homebrew/bin:$node_bin:/usr/bin:/bin"
cd "$(dirname "$0")/.."
R=ikhwanuddin/motorlistrik
tmp=$(mktemp -d)
# kalau script berhenti karena error (internet mati, node hilang, dll), buka issue supaya ketahuan
trap 'code=$?; rm -rf "$tmp"; [ $code = 0 ] || gh issue create -R $R --title "Cek link gagal" --body "cek-link-lokal.sh berhenti dengan exit $code ($(date)). Lihat log di Mac mini: ~/Library/Logs/motorlistrik-cek-link.log"' EXIT
echo "== $(date)"
curl -fsS https://motorlistrik.ikhwanuddin.com/assets/js/data.js -o "$tmp/data.js"

# lapor <laporan.md> <label> <judul> <komentar tutup>: buka/update issue kalau laporan berisi, tutup kalau kosong
lapor() {
  n=$(gh issue list -R $R --label "$2" --state open --json number -q '.[0].number')
  if [ -s "$1" ]; then
    if [ -n "$n" ]; then gh issue edit "$n" -R $R --body-file "$1"; else gh issue create -R $R --title "$3" --label "$2" --body-file "$1"; fi
  elif [ -n "$n" ]; then
    gh issue close "$n" -R $R --comment "$4"
  fi
}

# exit 1 dengan laporan = ada temuan; exit 1 tanpa laporan = script error (berhenti, trap buka issue)
node scripts/check-links.mjs "$tmp/data.js" > "$tmp/link.md" || [ -s "$tmp/link.md" ]
lapor "$tmp/link.md" link-mati "Link sumber mati" "Semua link sumber normal lagi."
node scripts/check-prices.mjs "$tmp/data.js" > "$tmp/harga.md" || [ -s "$tmp/harga.md" ]
lapor "$tmp/harga.md" harga "Harga berubah?" "Semua harga cocok lagi dengan sumbernya."
