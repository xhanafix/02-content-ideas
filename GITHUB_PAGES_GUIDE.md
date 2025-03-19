# Panduan Hosting di GitHub Pages

Dokumen ini menyediakan panduan tentang cara untuk meng-host aplikasi Penjana Kandungan Pasaran Sasaran di GitHub Pages dan menguruskan sejarah carian anda.

## Langkah 1: Sediakan Repositori GitHub

1. Daftar untuk akaun GitHub jika anda belum mempunyai akaun.
2. Cipta repositori baharu dengan mengklik butang "+ New" pada halaman utama GitHub anda.
3. Namakan repositori anda (contoh: `penjana-kandungan`).
4. Pilih "Public" jika anda mahu laman web anda boleh diakses oleh sesiapa sahaja.
5. Klik "Create repository".

## Langkah 2: Muat Naik Kod Sumber

### Menggunakan GitHub Desktop

1. Muat turun dan pasang [GitHub Desktop](https://desktop.github.com/).
2. Sambungkan GitHub Desktop ke akaun GitHub anda.
3. Klon repositori baharu anda ke komputer anda.
4. Salin semua fail aplikasi (`index.html`, `styles.css`, `script.js`, dll.) ke dalam folder repositori tempatan.
5. Commit perubahan dengan mesej seperti "Initial commit".
6. Tekan butang "Push" untuk muat naik fail ke GitHub.

### Menggunakan Git Command Line

```bash
# Klon repositori
git clone https://github.com/username/penjana-kandungan.git
cd penjana-kandungan

# Salin fail-fail ke folder ini

# Tambah, commit dan push
git add .
git commit -m "Initial commit"
git push origin main
```

## Langkah 3: Aktifkan GitHub Pages

1. Pergi ke halaman repositori anda di GitHub.
2. Klik pada tab "Settings".
3. Tatal ke bawah ke bahagian "GitHub Pages".
4. Di bawah "Source", pilih branch `main` (atau `master`).
5. Pilih folder "/ (root)" jika semua fail berada di direktori utama.
6. Klik "Save".
7. Anda akan diberi URL di mana laman web anda dihosting (contoh: `https://username.github.io/penjana-kandungan/`).

## Langkah 4: Mengurus Sejarah Carian

Kerana GitHub Pages adalah platform hosting statik, aplikasi tidak boleh menyimpan data di pelayan. Sejarah carian disimpan di pelayar pengguna, tetapi anda boleh mengeksport dan mengimport data menggunakan ciri baharu.

### Eksport Sejarah Carian

1. Lawati aplikasi anda di URL GitHub Pages.
2. Klik butang "Tunjuk Sejarah".
3. Klik butang "Eksport Sejarah (JSON)".
4. Fail `sejarah_carian_[tarikh].json` akan dimuat turun ke komputer anda.
5. Simpan fail ini di lokasi yang selamat.

### Import Sejarah Carian

1. Lawati aplikasi anda di URL GitHub Pages.
2. Klik butang "Tunjuk Sejarah".
3. Tatal ke bahagian "Import Sejarah".
4. Klik pada butang "Pilih Fail Sejarah JSON" dan pilih fail JSON yang telah dieksport sebelum ini.
5. Pilih sama ada untuk menggabungkan sejarah atau menggantikan sepenuhnya.

## Langkah 5: Berkongsi Sejarah dengan Pengguna Lain

Anda boleh berkongsi sejarah carian dengan pengguna lain melalui langkah-langkah berikut:

1. Eksport sejarah carian anda ke fail JSON seperti yang dijelaskan di atas.
2. Kongsi fail JSON ini dengan pengguna lain (melalui e-mel, perkhidmatan perkongsian fail, dll.).
3. Pengguna lain boleh mengimport fail JSON ke dalam aplikasi mereka sendiri.

## Langkah 6: Kemaskini Aplikasi

Jika anda membuat perubahan pada aplikasi, anda perlu mengemaskini repositori GitHub anda:

### Menggunakan GitHub Desktop

1. Buat perubahan pada fail-fail tempatan.
2. GitHub Desktop akan menunjukkan perubahan yang belum di-commit.
3. Buat commit dan tekan "Push" untuk mengemaskini repositori.

### Menggunakan Git Command Line

```bash
git add .
git commit -m "Update aplikasi"
git push origin main
```

Perubahan anda akan tersedia di laman GitHub Pages dalam masa beberapa minit. 