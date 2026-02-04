Berikut adalah dokumentasi lengkap berdasarkan hasil investigasi kita. Dokumen ini memperbaiki masalah pada dokumentasi lama (khususnya handling tipe data, `additional_info`, dan format `x-www-form-urlencoded`).

---

# Dokumentasi Integrasi Callback iPaymu (Node.js)

Parameter callback akan dikirim saat pembeli berhasil melakukan pembayaran.

## 1. Konfigurasi

Anda dapat mengatur **Tipe Konten Callback** di dashboard iPaymu. Pilih salah satu:

* `application/x-www-form-urlencoded` (Default, lebih disarankan untuk stabilitas).
* `application/json`

**Link Pengaturan:**

* **Production:** [https://my.ipaymu.com/integration/setting](https://my.ipaymu.com/integration/setting)
* **Sandbox:** [https://sandbox.ipaymu.com/integration/setting](https://sandbox.ipaymu.com/integration/setting)

## 2. Catatan Penting

* **Retry Mechanism:** Callback akan dikirim ulang secara otomatis jika server tidak merespons dengan status `200 OK`.
* **Idempotency:** Pastikan melakukan validasi (cek status transaksi di database) saat menerima callback lebih dari 1 kali untuk menghindari *double processing*.
* **Signature Validation:** Wajib dilakukan untuk memastikan request benar-benar dari iPaymu.
* **Secret Key:** Gunakan **Nomor VA Merchant** Anda sebagai kunci rahasia (`$secretKey`).

## 3. Struktur Data Callback

Berikut adalah kemungkinan data yang dikirim beserta tipe datanya. **Tipe data ini harus dipatuhi saat validasi signature agar hash cocok.**

| Field | Tipe Data JSON | Deskripsi | Catatan Validasi |
| :--- | :--- | :--- | :--- |
| `trx_id` | **Integer** | ID transaksi unik di sistem iPaymu | Wajib ubah dari String jika menerima via Form Data |
| `sid` | **String** | Session ID transaksi | - |
| `reference_id` | **String** | Reference ID merchant | - |
| `status` | **String** | Status teks: `berhasil`, `pending`, `expired` | - |
| `status_code` | **Integer** | Kode status: `1` (Sukses), `0` (Pending), `-2` (Expired) | Wajib ubah dari String `"1"` ke Integer `1` |
| `sub_total` | **String** | Jumlah bersih transaksi | Biarkan sebagai String |
| `total` | **String** | Jumlah bruto transaksi | Biarkan sebagai String |
| `amount` | **String** | Jumlah total transaksi | Biarkan sebagai String |
| `fee` | **String** | Biaya admin | Biarkan sebagai String |
| `paid_off` | **Integer** | Jumlah bersih diterima (`amount - fee`) | Wajib ubah dari String ke Integer |
| `created_at` | **String** | Waktu buat (Format: `YYYY-MM-DD HH:MM:SS`) | - |
| `expired_at` | **String** | Waktu kadaluarsa | - |
| `paid_at` | **String** | Waktu bayar | - |
| `settlement_status`| **String** | Status settlement: `settled`, `unsettle` | - |
| `transaction_status_code`| **Integer** | Kode status asli | Wajib ubah dari String ke Integer |
| `is_escrow` | **Boolean** | Indikator escrow: `true` / `false` | Ubah String `"0"` ke `false`, `"1"` ke `true` |
| `system_notes` | **String** | Catatan sistem | - |
| `via` | **String** | Metode pembayaran (contoh: `va`) | - |
| `channel` | **String** | Channel pembayaran (contoh: `bca`, `mandiri`) | - |
| `payment_no` | **String** | Nomor VA/Pembayaran | **PENTING:** Jangan ubah ke Integer agar `0` di depan tidak hilang |
| `buyer_name` | **String** | Nama pembeli | - |
| `buyer_email` | **String** | Email pembeli | - |
| `buyer_phone` | **String** | No HP pembeli | - |
| `additional_info`| **Array** | Info tambahan | **WAJIB:** Selalu masukkan `[]` jika field ini tidak dikirim (kosong) |
| `url` | **String** | URL Callback | - |
| `va` | **String** | Nomor VA | Sama seperti `payment_no`, jaga format String |

---

## 4. Mekanisme Validasi Signature

Agar hash cocok dengan server iPaymu, ikuti langkah-langkah ini secara ketat:

1. **Ambil Data:** Ambil data dari request (`req.body`).
2. **Normalisasi Tipe Data:**
    * Ubah String ke Integer untuk: `trx_id`, `status_code`, `transaction_status_code`, `paid_off`.
    * Ubah String ke Boolean untuk: `is_escrow`.
    * Ubah String `[]` ke Array `[]` untuk: `additional_info`.
    * Biarkan yang lain sebagai String.
3. **Handle Missing Field:**
    * Jika `additional_info` tidak ada di request (sering terjadi di `x-www-form-urlencoded`), tambahkan manual: `additional_info = []`.
4. **Sorting:** Urutkan data berdasarkan kunci (key) secara **Ascending (A-Z)** dengan sensitivitas huruf besar/kecil (*Case Sensitive*).
5. **Konversi ke JSON:** Ubah object yang sudah diurutkan menjadi String JSON.
6. **URL Escape (Opsional tapi disarankan):** Lakukan *escaping* garis miring pada URL (`/` menjadi `\/`) jika Anda mengikuti standar ketat `json_encode` PHP.
7. **Hashing:** Generate hash **HMAC-SHA256** menggunakan JSON string tersebut dan Secret Key (Nomor VA) Anda.
8. **Bandingkan:** Samakan hasil hash dengan header `X-Signature` (atau body `signature`).

---

## 5. Sample Code (Node.js / Express)

Kode ini dirancang untuk menangani **BAHKA** tipe data (`application/json` maupun `x-www-form-urlencoded`) sekaligus melakukan

```

Oke, paham. Anda benar, digabung jadi satu memang rawan bikin bingung mana yang JSON mana yang URL Encoded.

Mari kita pisah menjadi **2 Contoh Kode Terpisah**.

### Opsi 1: Jika Settingan Dashboard Anda `application/x-www-form-urlencoded`

Gunakan kode ini. Kode ini khusus menangani data yang formatnya `key=value&key2=value2`. Kode ini melakukan **Normalisasi Tipe Data** agar sesuai hash iPaymu.

```javascript
import crypto from 'crypto';
import express from 'express';

const app = express();

// Khusus untuk URL Encoded
app.use(express.urlencoded({ extended: true }));

// Fungsi Normalisasi (Agar tipe data sesuai tabel iPaymu)
function normalizeData(rawData) {
    const result = {};
    for (const key in rawData) {
        let val = rawData[key];
        // Ubah ke Boolean
        if (key === 'is_escrow') {
            result[key] = (val === 'true' || val === '1' || val === 1);
        }
        // Ubah ke Integer
        else if (['trx_id', 'status_code', 'transaction_status_code', 'paid_off'].includes(key)) {
            result[key] = parseInt(val, 10);
        }
        // Ubah ke Array
        else if (key === 'additional_info') {
            if (val === '[]') result[key] = [];
            else result[key] = val;
        }
        // Sisanya String
        else {
            result[key] = String(val);
        }
    }
    // WAJIB: Tambahkan additional_info jika kosong/tidak ada
    if (!result.hasOwnProperty('additional_info')) {
        result['additional_info'] = [];
    }
    return result;
}

// Fungsi Sorting (PHP Style)
function phpKsort(obj) {
    return Object.keys(obj)
        .sort((a, b) => a.localeCompare(b))
        .reduce((sortedObj, key) => {
            sortedObj[key] = obj[key];
            return sortedObj;
        }, {});
}

app.post('/callback', (req, res) => {
    const secretKey = '1179018174747171'; // Ganti Nomor VA Anda
    
    // Ambil signature dari Header (iPaymu biasanya kirim di header)
    const receivedSignature = req.headers['x-signature'];

    // 1. Ambil data mentah dan Normalisasi
    const normalizedData = normalizeData(req.body);
    if (normalizedData.signature) delete normalizedData.signature; // Hapus signature dari body jika ada

    // 2. Sorting
    const sortedData = phpKsort(normalizedData);

    // 3. Stringify & Escape Slash
    let jsonBody = JSON.stringify(sortedData);
    jsonBody = jsonBody.replace(/\//g, '\\/'); // Penting untuk URL

    // 4. Hitung Hash
    const calculatedSignature = crypto.createHmac('sha256', secretKey).update(jsonBody).digest('hex');

    // 5. Validasi
    if (calculatedSignature === receivedSignature) {
        console.log('✅ Valid (URL Encoded)');
        // Proses database...
        res.status(200).json({ status: 'OK' });
    } else {
        console.log('❌ Invalid (URL Encoded)');
        res.status(400).send('Invalid Signature');
    }
});

app.listen(3000, () => console.log('Server URL Encoded ready'));
```

---

### Opsi 2: Jika Settingan Dashboard Anda `application/json`

Gunakan kode ini. Kode ini lebih sederhana karena data JSON biasanya datang dengan tipe data yang sudah benar (tidak perlu dikonversi dari String).

```javascript
import crypto from 'crypto';
import express from 'express';

const app = express();

// Khusus untuk JSON
app.use(express.json());

// Fungsi Sorting (PHP Style)
function phpKsort(obj) {
    return Object.keys(obj)
        .sort((a, b) => a.localeCompare(b))
        .reduce((sortedObj, key) => {
            sortedObj[key] = obj[key];
            return sortedObj;
        }, {});
}

app.post('/callback', (req, res) => {
    const secretKey = '1179018174747171'; // Ganti Nomor VA Anda

    // Ambil signature dari Body atau Header
    const receivedSignature = req.body.signature || req.headers['x-signature'];

    // 1. Ambil data (Sudah object otomatis)
    let data = { ...req.body };

    // Hapus signature agar tidak ikut di-hash
    delete data.signature;

    // 2. Sorting
    const sortedData = phpKsort(data);

    // 3. Stringify & Escape Slash
    let jsonBody = JSON.stringify(sortedData);
    jsonBody = jsonBody.replace(/\//g, '\\/'); // Tetap perlu escape slash untuk URL di dalam JSON

    // 4. Hitung Hash
    const calculatedSignature = crypto.createHmac('sha256', secretKey).update(jsonBody).digest('hex');

    // 5. Validasi
    if (calculatedSignature === receivedSignature) {
        console.log('✅ Valid (JSON)');
        // Proses database...
        res.status(200).json({ status: 'OK' });
    } else {
        console.log('❌ Invalid (JSON)');
        res.status(400).send('Invalid Signature');
    }
});

app.listen(3000, () => console.log('Server JSON ready'));
```

### Pilih yang mana?

Cek di dashboard iPaymu Anda (Integration -> Setting).

* Jika pilih **x-www-form-urlencoded** -> Pakai **Opsi 1**.
* Jika pilih **application/json** -> Pakai **Opsi 2**.
