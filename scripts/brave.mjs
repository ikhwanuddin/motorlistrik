// Buka url di tab baru jendela Brave terdepan (Brave yang sedang dipakai, bukan profil terpisah),
// tunggu selesai, ambil judul atau teks halaman, tutup tab, kembalikan tab aktif.
// Untuk teks bisa klik dulu elemen berlabel tertentu (urut), mis. opsi di konfigurator harga.
// Teks halaman butuh Brave: View > Developer > Allow JavaScript from Apple Events.
import { execFileSync } from "node:child_process";

const SCRIPT = `
on run argv
  tell application "Brave Browser"
    set w to window 1
    set prev to active tab index of w
    set t to make new tab at end of tabs of w with properties {URL:item 1 of argv}
    delay 1
    repeat 60 times
      if not (loading of t) then exit repeat
      delay 0.5
    end repeat
    repeat 15 times
      if title of t does not start with "Just a moment" then exit repeat
      delay 1
    end repeat
    if item 2 of argv is "text" then
      if item 3 of argv is not "" then delay 6
      repeat with lab in paragraphs of item 3 of argv
        if lab as text is not "" then
          execute t javascript "[...document.querySelectorAll('*')].filter(e => e.children.length === 0 && e.textContent.trim() === '" & lab & "').forEach(e => e.click())"
          delay 3
        end if
      end repeat
      execute t javascript "window.scrollTo(0, document.body.scrollHeight)"
      delay 8
      set r to execute t javascript "document.body.innerText"
    else
      set r to title of t
    end if
    close t
    set active tab index of w to prev
    return r
  end tell
end run`;

let on = true;
try { execFileSync("pgrep", ["-x", "Brave Browser"]); } catch { on = false; }
export const braveOn = on;

// null kalau gagal
function run(url, mode, clicks = []) {
  try {
    return execFileSync("osascript", ["-e", SCRIPT, url, mode, clicks.join("\n")], { encoding: "utf8", timeout: 120000 }).trim();
  } catch {
    return null;
  }
}

export const braveTitle = (url) => run(url, "title");
export const braveText = (url, clicks) => run(url, "text", clicks);
