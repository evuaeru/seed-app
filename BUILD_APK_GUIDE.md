# Panduan Waktu, Pengaturan Streak & Build APK Android — SEED: Cosmic Dopamine Reboot

Aplikasi **SEED: Cosmic Dopamine Reboot & Streak Tracker** telah dirancang secara presisi dengan sistem waktu real-time berbasis jam perangkat (*device clock*), sinkronisasi lokal persisten (*localStorage*), serta struktur native **Capacitor Android** yang siap dibungkus (*packaged*) menjadi file `.apk`.

---

## 🕒 1. Apakah Waktu dan Tanggal Mengikuti Jam Asli Perangkat?

**YA, 100% Mengikuti Jam & Kalender Perangkat.**
- **Live Ticker:** Setiap detik, aplikasi menghitung selisih waktu (`Date.now() - state.streakStartTime`) dan langsung memecahnya ke dalam satuan **Hari**, **Jam**, **Menit**, dan **Detik**.
- **Jam Sistem Status Bar:** Indikator jam di bagian atas layar ponsel (`#ios-clock`) otomatis tersinkronisasi menampilkan jam & menit asli HP/PC kamu secara live (`HH:mm`).
- **Rollover Harian Otomatis:** Tepat pada pukul **00:00 (tengah malam)** waktu setempat, aplikasi mendeteksi pergantian hari kalender:
  - Jumlah godaan yang ditahan hari ini (*Urges Overcome Today*) di-reset ke 0 untuk hari baru (total keseluruhan tetap aman).
  - Tombol komitmen harian (*Hold 3s to Pledge Today*) otomatis terbuka kembali untuk dikunci pada hari yang baru.
  - Lingkaran 7-Hari (*7-Day Glance*) di Tab 4 (Statistics) otomatis terkalibrasi dengan hari kalender asli perangkatmu (Minggu s/d Sabtu), bergeser mulus setiap pergantian hari, dan menjaga status komitmen tetap presisi.

---

## ⚙️ 2. Cara Mengatur Tanggal & Jam Mulai Streak (Custom Start Time)

Jika kamu sudah memulai streak sejak kemarin, beberapa hari lalu, atau jam tertentu dan ingin timer mencatat waktu yang sebenarnya:

1. Buka **Tab 5 (Shield & Settings)** dengan mengetuk ikon Shield 🛡️ di navigasi bawah.
2. Gulir ke kartu **"⏱️ Atur Tanggal & Jam Mulai Streak"**.
3. Ketuk input **Tanggal & Jam Mulai** (`<input type="datetime-local">`):
   - Pilih tanggal dan jam persis kapan kamu memulai komitmen reboot.
   - Kotak **Live Streak Preview** akan langsung menampilkan kalkulasi durasi dan tahap Seed Vault yang tercapai secara instan!
4. Ketuk tombol **"💾 Simpan Waktu Mulai"**:
   - Waktu baru akan disimpan permanen ke memori lokal HP/browser (*localStorage*).
   - Timer di Tab 1 (Home) dan semua visual Seed Vault akan otomatis tersinkronisasi.
5. **Tombol Pintas Cepat:**
   - **⚡ Mulai Dari Sekarang (00:00:00):** Langsung mereset waktu awal streak ke detik ini (Day 1 Genesis).
   - **⏪ Mulai Kemarin (24 Jam Lalu):** Otomatis mengatur waktu mulai ke 24 jam yang lalu (1 Hari berjalan).

---

## 📱 3. Cara Pasang & Build APK Android

Struktur native **Capacitor Android** sudah di-generate dan disinkronkan di folder [`android/`](file:///C:/Users/Nyzan/.gemini/antigravity/scratch/seed-cosmic-reboot/android).

### Cara A: PWA Standalone di HP Android (Paling Praktis, Tanpa Perlu Build APK)
Aplikasi SEED adalah **Progressive Web App (PWA)** lengkap dengan `manifest.json` dan `sw.js` (offline service worker):
1. Jalankan server lokal:
   ```powershell
   node server.js
   ```
2. Hubungkan HP Android ke jaringan Wi-Fi yang sama dengan PC, lalu buka di Chrome Android:
   `http://<IP-LOKAL-KOMPUTER>:4173`
3. Ketuk ikon titik tiga di kanan atas Chrome ➔ pilih **"Install App"** atau **"Tambahkan ke Layar Utama"**.
4. Ikon SEED akan muncul di app drawer Android, berjalan full-screen tanpa address bar, mendukung getaran haptic, audio binaural offline, dan data tersimpan mandiri di HP.

---

### Cara B: Build File `.apk` Otomatis di Cloud via GitHub Actions (Rekomendasi untuk File APK Asli)
Jika kamu ingin file installer fisik `.apk` tanpa perlu menginstal Android Studio atau Java SDK di komputermu:
1. Buat repositori baru di GitHub (bisa private atau public).
2. Push folder `seed-cosmic-reboot` ini ke repositori tersebut:
   ```bash
   git init
   git add .
   git commit -m "feat: cosmic reboot app with custom start time & capacitor"
   git branch -M main
   git remote add origin https://github.com/USERNAME/REPO_NAME.git
   git push -u origin main
   ```
3. Buka tab **Actions** di repositori GitHub kamu.
4. Workflow **`Build Android APK (SEED Cosmic Reboot)`** akan otomatis berjalan:
   - Setup Node 20, Java JDK 21, dan Android SDK.
   - Melakukan sync web assets ke Capacitor Android.
   - Menjalankan `./gradlew assembleDebug`.
5. Setelah selesai (sekitar 2–3 menit), unduh artifact **`SEED-Cosmic-Reboot-debug-apk`** (`app-debug.apk`), kirim ke HP Android, dan pasang langsung!

---

### Cara C: Generate APK Instan via PWABuilder (Online Generator)
1. Deploy folder ini ke hosting statis gratis (Vercel, Netlify Drop, atau GitHub Pages).
2. Buka [https://www.pwabuilder.com](https://www.pwabuilder.com).
3. Masukkan URL hosting aplikasimu, lalu klik **Start**.
4. Klik **Package for Stores** ➔ pilih **Android** ➔ klik **Download APK**.

---

### Cara D: Build `.apk` Lokal dengan Android Studio / Gradle
Jika komputermu sudah memiliki **Android Studio** atau **Java JDK 17+**:
1. Pastikan aset terbaru tersinkronisasi:
   ```powershell
   cmd /c "npm run android:sync"
   ```
2. Buka proyek Android di Android Studio:
   ```powershell
   cmd /c "npx cap open android"
   ```
   Atau jalankan build terminal langsung:
   ```powershell
   cd android
   .\gradlew.bat assembleDebug
   ```
3. File APK output akan berada di:
   `android/app/build/outputs/apk/debug/app-debug.apk`
