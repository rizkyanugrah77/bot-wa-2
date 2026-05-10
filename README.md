# Bot WA Baju

Bot WhatsApp sederhana untuk menerima pesanan baju, mengarahkan user melalui alur chat bertahap, lalu menyimpan data pesanan ke Google Spreadsheet.

Project ini menggunakan `whatsapp-web.js` untuk koneksi WhatsApp Web dan `googleapis` untuk menyimpan data order ke spreadsheet.

## Fitur

- Menu layanan melalui chat WhatsApp.
- Alur input pesanan bertahap.
- Pilihan jenis baju, bahan, warna, ukuran, dan konfirmasi.
- Ringkasan pesanan sebelum disimpan.
- Penyimpanan data order ke Google Spreadsheet.
- QR login WhatsApp langsung tampil di terminal.
- Invoice pembayaran otomatis setelah order dikonfirmasi.

## Alur Bot

User memulai chat dengan mengetik `halo` atau `menu`, lalu bot akan memandu proses berikut:

1. Pilih layanan.
2. Isi nama.
3. Isi nama produk.
4. Pilih jenis baju.
5. Pilih bahan.
6. Pilih warna.
7. Pilih ukuran.
8. Isi deskripsi pesanan.
9. Isi catatan tambahan.
10. Konfirmasi pesanan.
11. Data disimpan ke Google Spreadsheet.

## Library Yang Digunakan

Library yang tercantum di `package.json`:

- `whatsapp-web.js` untuk bot WhatsApp.
- `qrcode-terminal` untuk menampilkan QR login di terminal.
- `googleapis` untuk akses Google Spreadsheet.
- `axios` terpasang di project, tetapi saat ini belum dipakai langsung di `index.js`.
- `dotenv` terpasang di project, tetapi saat ini belum dipakai langsung di `index.js`.
- `express` terpasang di project, tetapi saat ini belum dipakai langsung di `index.js`.

## Persiapan

Sebelum menjalankan project, siapkan:

- `Node.js` versi 18 atau lebih baru.
- `npm`.
- Akun WhatsApp untuk scan QR login.
- Google Spreadsheet tujuan.
- File `credentials.json` dari Google Service Account.

## Cara Clone Project

```bash
git clone https://github.com/rizkyanugrah77/bot-wa-baju.git
cd bot-wa-baju
```

## Cara Install Library

Install semua dependency yang dibutuhkan:

```bash
npm install
```

Kalau ingin install manual satu per satu, library yang dipakai adalah:

```bash
npm install whatsapp-web.js qrcode-terminal googleapis axios dotenv express
```

## Konfigurasi Google Spreadsheet

### 1. Siapkan Google Cloud Service Account

1. Buka Google Cloud Console.
2. Buat project baru atau gunakan project yang sudah ada.
3. Aktifkan Google Sheets API.
4. Buat Service Account.
5. Generate key dalam format JSON.
6. Simpan file JSON tersebut sebagai `credentials.json` di root project.

Project ini sudah membaca file berikut:

```js
keyFile: "credentials.json"
```

### 2. Share Spreadsheet Ke Service Account

Setelah file JSON didapat, buka Google Spreadsheet Anda lalu share spreadsheet tersebut ke email service account yang ada di field `client_email` pada `credentials.json`.

Minimal beri akses `Editor`.

### 3. Isi ID Spreadsheet

Buka file [`index.js`](./index.js) lalu sesuaikan nilai:

```js
const SPREADSHEET_ID = "ID_SPREADSHEET_ANDA";
```

### 4. Pastikan Nama Sheet Sesuai

Saat ini bot menulis ke range:

```js
range: "Sheet1!A:O"
```


## Cara Menjalankan Program

Jalankan bot dengan perintah:

```bash
node index.js
```

Saat program berjalan:

- QR code akan tampil di terminal.
- Scan QR dengan WhatsApp dari HP Anda.
- Setelah login berhasil, bot akan siap menerima chat.

## Cara Menggunakan Bot

1. Kirim pesan `halo` atau `menu` ke nomor WhatsApp yang terhubung.
2. Ikuti pilihan yang diberikan bot.
3. Setelah semua data terisi, bot akan menampilkan ringkasan.
4. Balas `YA` atau `1` untuk menyimpan pesanan.
5. Bot akan mengirim invoice dan menyimpan data ke spreadsheet.

## File Penting

- [`index.js`](./index.js): logika utama bot.
- [`package.json`](./package.json): daftar dependency project.
- [`credentials.json`](./credentials.json): kredensial Google Service Account.
- [`.gitignore`](./.gitignore): file yang diabaikan Git.





## Lisensi

Project ini mengikuti lisensi `ISC` sesuai `package.json`.
