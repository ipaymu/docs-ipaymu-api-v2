# iPaymu Callback - Go Examples

Implementasi callback iPaymu dengan Go.

## Cara Menjalankan

### URL-encoded (Port 8080)

```bash
cd go
go run main-urlencoded.go
```

Atau build terlebih dahulu:

```bash
cd go
go build -o callback-urlencoded main-urlencoded.go
./callback-urlencoded
```

### JSON (Port 8081)

```bash
cd go
go run main-json.go
```

Atau:

```bash
cd go
go build -o callback-json main-json.go
./callback-json
```

### Dengan Secret Key Custom

```bash
SECRET_KEY=1179001234567890 go run main-urlencoded.go
```

### Port Custom

```bash
PORT=9000 go run main-urlencoded.go
```

## Test

```bash
# Dari folder test-runner
cd ../test-runner
npm run test
```

## Catatan Penting

- Go's `sort.Strings()` mengurutkan secara ascending A-Z (sama seperti PHP ksort)
- Gunakan `strings.ReplaceAll()` untuk meng-escape karakter `/` menjadi `\/`
- `hmac.Equal()` untuk perbandingan signature yang timing-safe
- Untuk URL-encoded, jangan lupa normalisasi tipe data (String -> Integer, dll)
- Pastikan selalu ada field `additional_info` dalam data yang di-sign
