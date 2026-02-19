# Test Runner iPaymu Callback

Test runner untuk memverifikasi implementasi callback iPaymu di berbagai bahasa pemrograman.

## Struktur Folder

```
examples/
├── test-runner/          # Test runner utama (Node.js)
│   ├── test-all.js       # Jalankan semua test
│   ├── lib/
│   │   ├── test-url-encoded.js
│   │   └── test-json.js
│   └── README.md
├── javascript/           # Implementasi Node.js
├── php/                  # Implementasi PHP
├── go/                   # Implementasi Go
├── python/               # Implementasi Python
└── rust/                 # Implementasi Rust
```

## Cara Penggunaan

### 1. Jalankan Server Callback

Setiap bahasa memiliki port default:

```bash
# JavaScript (port 3000)
cd javascript
npm install
node callback-urlencoded.js    # atau callback-json.js

# PHP (port 8000)
cd php
php -S localhost:8000 callback-urlencoded.php

# Go (port 8080)
cd go
go run main-urlencoded.go      # atau main-json.go

# Python (port 5000)
cd python
pip install -r requirements.txt
python callback-urlencoded.py  # atau callback-json.py

# Rust (port 8081)
cd rust
cargo run --bin callback-urlencoded
```

### 2. Jalankan Test

```bash
cd test-runner
npm install

# Test semua server
npm test

# Test URL-encoded only
node lib/test-url-encoded.js

# Test JSON only  
node lib/test-json.js

# Test server tertentu dengan secret key custom
SECRET_KEY=1179001234567890 node lib/test-all.js
```

## Environment Variables

| Variable | Default | Deskripsi |
|:---------|:--------|:----------|
| `SECRET_KEY` | `1179001234567890` | Nomor VA untuk generate signature |
| `BASE_URL` | `http://localhost` | Base URL server |
| `TIMEOUT` | `5000` | Timeout request dalam ms |

## Hasil Test

Test akan menampilkan:
- ✅ Signature valid - harus return 200 OK
- ❌ Signature invalid - harus return 400 Bad Request
- ⏱️ Response time
- 📊 Summary hasil
