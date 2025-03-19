# Penjana Kandungan Pasaran Sasaran

Alat yang membantu peniaga dan pemasar untuk menjana idea kandungan berdasarkan produk/perkhidmatan dan pasaran sasaran mereka. Aplikasi ini menggunakan AI untuk mengenal pasti titik kesakitan pasaran dan menjana idea kandungan yang relevan.

## Ciri-ciri

- **Jana Kandungan Pasaran Sasaran**: Dapatkan analisis mendalam tentang masalah pasaran sasaran dan idea kandungan berdasarkan produk/perkhidmatan anda.
- **Carian Tersuai**: Pilih jumlah isu (5-20) yang ingin dipaparkan.
- **Penapisan & Penyusunan**: Tapis hasil berdasarkan kata kunci dan susun mengikut isu atau kesesuaian.
- **Eksport ke CSV**: Simpan hasil untuk rujukan masa hadapan dalam format CSV.
- **Eksport ke Fail Teks**: Simpan hasil carian individu atau semua sejarah carian sebagai fail teks terperinci.
- **Eksport & Import Sejarah**: Simpan semua sejarah carian sebagai fail JSON dan import semula pada bila-bila masa.
- **Sejarah Carian**: Simpan dan muat semula hasil carian sebelumnya tanpa perlu melakukan carian yang sama berulang kali.
- **Penyimpanan Tempatan**: Kunci API dan sejarah carian disimpan di peranti anda secara tempatan.
- **Bahasa Malaysia**: Aplikasi dan kandungan yang dijana sepenuhnya dalam Bahasa Malaysia.

## Cara Guna

1. Masukkan produk atau perkhidmatan anda.
2. Nyatakan pasaran sasaran anda.
3. Pilih jumlah isu yang ingin dipaparkan.
4. Klik "Jana Kandungan" untuk dapatkan hasil.
5. Anda boleh menapis, menyusun, atau mengeksport hasil.
6. Lihat sejarah carian dengan mengklik "Tunjuk Sejarah" untuk muat semula hasil carian yang lepas.

## Pengurusan Kunci API

- Aplikasi ini menggunakan API OpenRouter. Anda perlu mempunyai kunci API untuk menggunakannya.
- Kunci API disimpan di peranti anda dan tidak dihantar ke mana-mana selain daripada OpenRouter.
- Anda boleh menukar atau memadamkan kunci API pada bila-bila masa.

## Ciri Sejarah Carian

Fungsi baharu:

- **Simpan Carian**: Semua hasil carian secara automatik disimpan untuk rujukan masa hadapan.
- **Muat Semula**: Klik butang "Muat" untuk mengisi semula hasil tanpa perlu melakukan carian semula.
- **Eksport Individu**: Klik butang "Eksport" pada mana-mana item sejarah untuk menyimpan keputusan tersebut sebagai fail teks.
- **Eksport Semua**: Klik butang "Eksport Semua Sejarah" untuk menyimpan semua sejarah carian dalam satu fail teks.
- **Eksport JSON**: Simpan semua sejarah carian sebagai fail JSON yang boleh diimport semula.
- **Import Sejarah**: Muat naik fail JSON sejarah carian yang dieksport sebelum ini.
- **Padam Sejarah**: Anda boleh memadamkan semua sejarah carian menggunakan butang "Padam Semua Sejarah".
- **Penyimpanan Tempatan**: Sejarah carian disimpan di pelayar anda (localStorage) dan tidak dihantar ke mana-mana pelayan.
- **Had Maksimum**: Hanya 20 carian terkini akan disimpan untuk mengelakkan penggunaan storan yang berlebihan.

## Format Fail Teks

Fail teks eksport mengandungi maklumat terperinci seperti:
- Tarikh dan masa carian
- Produk/perkhidmatan dan pasaran sasaran
- Ringkasan keseluruhan
- Senarai isu dengan cadangan kandungan untuk setiap isu

## Menggunakan Aplikasi pada GitHub Pages

Aplikasi ini boleh dihosting pada GitHub Pages, yang merupakan platform hosting statik. Kerana sejarah carian disimpan secara tempatan dalam pelayar anda (localStorage), sejarah ini hanya tersedia pada peranti dan pelayar yang sama. Untuk mengekalkan sejarah carian merentasi peranti atau pelayar berbeza, anda boleh:

1. **Eksport Sejarah Carian**: Klik pada butang "Eksport Sejarah (JSON)" untuk menyimpan fail sejarah carian.
2. **Simpan Fail JSON**: Simpan fail ini di lokasi yang selamat di komputer anda atau perkhidmatan penyimpanan cloud.
3. **Import Sejarah Carian**: Apabila anda menggunakan aplikasi pada peranti atau pelayar baharu, klik "Tunjuk Sejarah" dan kemudian guna bahagian "Import Sejarah" untuk memuat naik fail JSON anda.
4. **Gabung atau Ganti**: Semasa import, anda boleh memilih untuk menggabungkan sejarah baharu dengan sejarah sedia ada atau menggantikan sejarah sedia ada.

Pendekatan ini membenarkan anda:
- Mengekalkan sejarah carian merentasi berbilang peranti
- Menyimpan rekod semua carian walaupun selepas membersihkan data pelayar
- Memulihkan sejarah carian jika localStorage dibersihkan
- Berkongsi sejarah carian dengan orang lain yang menggunakan aplikasi ini

## Lesen

Projek ini dilesenkan di bawah Lesen MIT - lihat fail LICENSE untuk butiran lanjut. 