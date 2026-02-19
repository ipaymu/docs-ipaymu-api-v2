# iPaymu Callback - JavaScript Examples

Implementasi callback iPaymu dengan Node.js dan Express.

## Cara Menjalankan

### Install Dependencies

```bash
cd javascript
npm install
```

### URL-encoded (Port 3000)

```bash
npm run start:url
# atau
node callback-urlencoded.js
```

### JSON (Port 3001)

```bash
npm run start:json
# atau
node callback-json.js
```

### Dengan Secret Key Custom

```bash
SECRET_KEY=1179001234567890 node callback-urlencoded.js
```

### Port Custom

```bash
PORT=9000 node callback-urlencoded.js
```

## Test

```bash
# Dari folder test-runner
cd ../test-runner
npm run test
```

## Catatan Penting

- Gunakan `a.localeCompare(b)` untuk sorting key seperti PHP ksort
- `.replace(/\//g, '\\/')` untuk meng-escape karakter `/`
- `normalizeData()` wajib dipanggil sebelum generate signature untuk URL-encoded
- Pastikan selalu ada field `additional_info` dalam data
- Untuk JSON, data sudah dalam tipe yang benar (tidak perlu normalisasi)
