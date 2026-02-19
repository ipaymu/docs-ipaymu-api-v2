# iPaymu Callback - Rust Examples

Implementasi callback iPaymu dengan Rust dan Actix-web.

## Cara Menjalankan

### URL-encoded (Port 8082)

```bash
cd rust
cargo run --bin callback-urlencoded
```

### JSON (Port 8083)

```bash
cd rust
cargo run --bin callback-json
```

### Build Release

```bash
# URL-encoded
cargo build --release --bin callback-urlencoded
./target/release/callback-urlencoded

# JSON
cargo build --release --bin callback-json
./target/release/callback-json
```

### Dengan Secret Key Custom

```bash
SECRET_KEY=1179001234567890 cargo run --bin callback-urlencoded
```

### Port Custom

```bash
PORT=9000 cargo run --bin callback-urlencoded
```

## Test

```bash
# Dari folder test-runner
cd ../test-runner
npm run test
```

## Dependencies

```toml
[dependencies]
actix-web = "4"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
hmac = "0.12"
sha2 = "0.10"
hex = "0.4"
```

## Catatan Penting

- Gunakan `BTreeMap` untuk sorting key (otomatis ascending A-Z)
- `.replace("/", "\\/")` untuk meng-escape karakter `/`
- `HmacSha256::new_from_slice()` untuk membuat HMAC instance
- Untuk URL-encoded, jangan lupa normalisasi tipe data
- Pastikan selalu ada field `additional_info`
- Format signature adalah hex string lowercase
