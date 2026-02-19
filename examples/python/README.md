# iPaymu Callback - Python Examples

Implementasi callback iPaymu dengan Python dan Flask.

## Cara Menjalankan

### Install Dependencies

```bash
cd python
pip install -r requirements.txt
```

### URL-encoded (Port 5000)

```bash
python callback-urlencoded.py
```

### JSON (Port 5001)

```bash
python callback-json.py
```

### Dengan Secret Key Custom

```bash
SECRET_KEY=1179001234567890 python callback-urlencoded.py
```

### Port Custom

```bash
PORT=9000 python callback-urlencoded.py
```

## Test

```bash
# Dari folder test-runner
cd ../test-runner
npm run test
```

## Catatan Penting

- Gunakan `OrderedDict` untuk sorting key seperti PHP ksort
- `json.dumps()` dengan `separators=(',', ':')` untuk compact JSON
- `.replace('/', '\\/')` untuk meng-escape karakter `/`
- `hmac.compare_digest()` untuk timing-safe signature comparison
- `os.getenv()` untuk membaca environment variable
- Untuk URL-encoded, jangan lupa normalisasi tipe data
- Pastikan selalu ada field `additional_info`
