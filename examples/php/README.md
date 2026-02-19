# iPaymu Callback - PHP Examples

Implementasi callback iPaymu dengan PHP.

## Cara Menjalankan

### URL-encoded (Port 8000)

```bash
php -S localhost:8000 callback-urlencoded.php
```

### JSON (Port 8001)

```bash
php -S localhost:8001 callback-json.php
```

### Dengan Secret Key Custom

```bash
SECRET_KEY=1179001234567890 php -S localhost:8000 callback-urlencoded.php
```

## Test

```bash
# Dari folder test-runner
cd ../test-runner
npm run test
```

## Catatan Penting

- `json_encode()` di PHP secara otomatis meng-escape karakter `/` menjadi `\/` 
- Gunakan `hash_equals()` untuk perbandingan signature (timing-safe)
- `ksort()` di PHP mengurutkan key dengan case-sensitive (A-Z)
- Untuk URL-encoded, selalu pastikan `additional_info` ada (tambahkan array kosong jika tidak ada)
