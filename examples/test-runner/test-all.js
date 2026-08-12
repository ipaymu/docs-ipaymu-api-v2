const crypto = require('crypto');

// 1. Secret Key (VA Merchant atau apiKey)
const secretKey = '123456';

// 2. Sample Data Payload yang diterima dari webhook
const dataBody = {
  trx_id: 123456,
  sid: 'session_123',
  reference_id: 'INV-202310-001',
  status: 'berhasil',
  status_code: 1,
  sub_total: 100000,
  total: 100000,
  amount: 100000,
  fee: 0,
  paid_off: 100000,
  created_at: '2023-10-25 10:00:00',
  expired_at: '2023-10-26 10:00:00',
  paid_at: '2023-10-25 10:05:00',
  settlement_status: 'unsettled',
  transaction_status_code: 1,
  is_escrow: 0,
  system_notes: '',
  via: 'bca',
  channel: 'vabca',
  payment_no: '807771234567890',
  buyer_name: 'Budi Santoso',
  buyer_email: 'budi@example.com',
  buyer_phone: '081234567890',
  // Simulasi jika additional_info berbentuk array kosong
  additional_info: [],
  url: 'https://domain.com/webhook/callback',
  va: '807771234567890'
};

/* ==========================================================
 * CARA MENG-GENERATE SIGNATURE MERK MERCHANT
 * ==========================================================
 */

const sortedKeys = Object.keys(dataBody).sort();
const sortedData = {};
sortedKeys.forEach(key => {
  sortedData[key] = dataBody[key];
});

let jsonString = JSON.stringify(sortedData);
// Hack: Replikasi sifat json_encode di PHP yang meng-escape slash
jsonString = jsonString.replace(/\//g, '\\/');

const signature = crypto.createHmac('sha256', secretKey)
  .update(jsonString)
  .digest('hex');

console.log('=== HASIL SIGNATURE PADA SISI MERCHANT ===\n');
console.log('JSON String setelah di Sort+Escape:\n' + jsonString);
console.log('\nSignature HMAC-SHA256 yang diharapkan:\n' + signature + '\n');


/* ==========================================================
 * RUN RUNNER UNTUK SEMUA BAHASA
 * ==========================================================
 */

const targets = [
  { name: 'PHP (URL-encoded)', port: 8000, type: 'urlencoded' },
  { name: 'PHP (JSON)', port: 8001, type: 'json' },
  { name: 'Go (URL-encoded)', port: 8080, type: 'urlencoded' },
  { name: 'Go (JSON)', port: 8081, type: 'json' },
  { name: 'JavaScript (URL-encoded)', port: 3000, type: 'urlencoded' },
  { name: 'JavaScript (JSON)', port: 3001, type: 'json' },
  { name: 'Python (URL-encoded)', port: 5000, type: 'urlencoded' },
  { name: 'Python (JSON)', port: 5001, type: 'json' },
  { name: 'Rust (URL-encoded)', port: 8082, type: 'urlencoded' },
  { name: 'Rust (JSON)', port: 8083, type: 'json' }
];

async function runTests() {
  console.log('🚀 MENGIRIM REQUEST KE SEMUA ENDPOINT...\n');
  let successCount = 0;
  let failCount = 0;

  for (const target of targets) {
    process.stdout.write(`⏳ Testing ${target.name} [Port ${target.port}]... `);
    try {
      let body, contentType;

      if (target.type === 'json') {
        body = JSON.stringify(dataBody);
        contentType = 'application/json';
      } else {
        // Konversi property kosong array menjadi literal string `[]` untuk x-www-form-urlencoded
        body = new URLSearchParams(
          Object.entries(dataBody).map(([k, v]) => [
            k,
            Array.isArray(v) && v.length === 0 ? '[]' : v
          ])
        ).toString();
        contentType = 'application/x-www-form-urlencoded';
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const res = await fetch(`http://127.0.0.1:${target.port}/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': contentType,
          'X-Signature': signature
        },
        body,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const responseData = await res.json().catch(() => ({}));

      if (res.ok) {
        console.log(`✅ BERHASIL (${res.status} OK)`);
        successCount++;
      } else {
        console.log(`❌ GAGAL (${res.status})`);
        console.log(`   Response:`, responseData);
        failCount++;
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log(`⚠️ TIMEOUT (Server tidak merespon / Mati)`);
      } else {
        console.log(`⚠️ SERVER ERROR/OFFLINE (${err.message})`);
      }
      failCount++;
    }
  }

  console.log('\n===================================================');
  console.log(`📊 HASIL AKHIR: ${successCount} Berhasil | ${failCount} Gagal/Mati`);
  console.log('===================================================\n');
}

runTests();