# iPaymu Callback Examples

Kumpulan contoh implementasi callback iPaymu dalam berbagai bahasa pemrograman.

## 📁 Struktur Folder

```
examples/
├── test-runner/          # Test runner untuk verifikasi semua implementasi
├── javascript/           # Node.js + Express
├── php/                  # PHP native
├── go/                   # Go (Golang)
├── python/               # Python + Flask
└── rust/                 # Rust + Actix-web
```

## 🚀 Cara Menggunakan

### 1. Jalankan Server Callback

Pilih salah satu bahasa dan jalankan server:

```bash
# JavaScript (Port 3000 & 3001)
cd javascript
npm install
npm run start:url     # URL-encoded di port 3000
npm run start:json    # JSON di port 3001

# PHP (Port 8000 & 8001)
cd php
php -S localhost:8000 callback-urlencoded.php
php -S localhost:8001 callback-json.php

# Go (Port 8080 & 8081)
cd go
go run main-urlencoded.go   # Port 8080
go run main-json.go         # Port 8081

# Python (Port 5000 & 5001)
cd python
pip install -r requirements.txt
python callback-urlencoded.py  # Port 5000
python callback-json.py        # Port 5001

# Rust (Port 8082 & 8083)
cd rust
cargo run --bin callback-urlencoded  # Port 8082
cargo run --bin callback-json        # Port 8083
```

### 2. Jalankan Test

Setelah server berjalan, jalankan test runner:

```bash
cd test-runner
npm install
npm test                 # Test semua server
npm run test:url         # Test URL-encoded only
npm run test:json        # Test JSON only
```

## ⚙️ Konfigurasi

### Secret Key

Semua contoh menggunakan placeholder `YOUR_VA_NUMBER_HERE`. Ganti dengan Nomor VA Anda:

**Opsi 1:** Edit langsung di file
```javascript
const SECRET_KEY = 'YOUR_VA_NUMBER_HERE';
// Ganti menjadi:
const SECRET_KEY = '1179001234567890';
```

**Opsi 2:** Gunakan Environment Variable
```bash
# Linux/Mac
export SECRET_KEY=1179001234567890

# Windows (Command Prompt)
set SECRET_KEY=1179001234567890

# Windows (PowerShell)
$env:SECRET_KEY="1179001234567890"
```

### Port

Default port untuk setiap bahasa:

| Bahasa | URL-encoded | JSON |
|:-------|:------------|:-----|
| JavaScript | 3000 | 3001 |
| PHP | 8000 | 8001 |
| Go | 8080 | 8081 |
| Python | 5000 | 5001 |
| Rust | 8082 | 8083 |

Ubah port dengan environment variable:
```bash
PORT=9000 node callback-urlencoded.js
```

## 📋 Checklist Implementasi

Sebelum go-live, pastikan:

- [ ] Secret Key sudah diganti dengan Nomor VA yang benar
- [ ] Server dapat menerima request POST di endpoint `/callback`
- [ ] Signature validation berfungsi dengan benar
- [ ] Response HTTP 200 untuk signature valid
- [ ] Response HTTP 400 untuk signature invalid
- [ ] Implementasi idempotency (cek duplikat transaksi)
- [ ] Logging untuk debugging
- [ ] Error handling yang proper

## 🧪 Testing Manual

Jika ingin test manual tanpa test runner:

```bash
# Test dengan curl (URL-encoded)
curl -X POST http://localhost:3000/callback \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "X-Signature: SIGNATURE_ANDA" \
  -d "trx_id=12345678&status_code=1&status=berhasil"

# Test dengan curl (JSON)
curl -X POST http://localhost:3001/callback \
  -H "Content-Type: application/json" \
  -H "X-Signature: SIGNATURE_ANDA" \
  -d '{"trx_id":"12345678","status_code":"1","status":"berhasil"}'
```

## 📚 Dokumentasi

Setiap folder bahasa memiliki README.md dengan detail implementasi spesifik.

## 🐛 Troubleshooting

### Signature selalu invalid?

1. Pastikan Secret Key sama dengan Nomor VA di dashboard iPaymu
2. Periksa normalisasi tipe data (String -> Integer untuk field tertentu)
3. Pastikan key sorting ascending A-Z
4. Pastikan ada escape karakter `/` menjadi `\/`
5. Pastikan field `additional_info` selalu ada (array kosong)

### Server tidak bisa dijalankan?

1. Pastikan port yang dipilih tidak digunakan aplikasi lain
2. Pastikan dependencies sudah diinstall
3. Periksa environment variables yang diperlukan

### Test runner tidak bisa connect?

1. Pastikan server sudah berjalan di port yang benar
2. Periksa firewall tidak memblok port
3. Coba akses health check endpoint:
   ```bash
   curl http://localhost:3000/health
   ```
