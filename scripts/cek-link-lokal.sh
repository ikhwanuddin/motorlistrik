#!/bin/bash
# Dijalankan launchd di Mac mini tiap Senin 08.00 (scripts/com.ikhwanuddin.motorlistrik.ceklink.plist).
# Cek link di data.js yang sedang live, lalu buka / update / tutup issue "Link sumber mati" (label link-mati).
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

gagal=false
node scripts/check-links.mjs "$tmp/data.js" > "$tmp/laporan.md" || gagal=true
if $gagal && [ ! -s "$tmp/laporan.md" ]; then echo "script error, issue tidak diubah"; exit 1; fi

n=$(gh issue list -R $R --label link-mati --state open --json number -q '.[0].number')
if $gagal; then
  if [ -n "$n" ]; then
    gh issue edit "$n" -R $R --body-file "$tmp/laporan.md"
  else
    gh issue create -R $R --title "Link sumber mati" --label link-mati --body-file "$tmp/laporan.md"
  fi
elif [ -n "$n" ]; then
  gh issue close "$n" -R $R --comment "Semua link sumber normal lagi."
fi
