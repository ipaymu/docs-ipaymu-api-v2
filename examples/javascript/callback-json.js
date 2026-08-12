/**
 * iPaymu Callback Handler - JavaScript (JSON)
 * 
 * Server berjalan di port 3001
 * Format: application/json
 * 
 * Cara menjalankan:
 *   npm install
 *   npm run start:json
 * 
 * Atau langsung:
 *   node callback-json.js
 */

const crypto = require('crypto');
const express = require('express');

const app = express();

// Parse JSON bodies
app.use(express.json());

// Secret Key - Ganti dengan Nomor VA Anda!
const SECRET_KEY = process.env.SECRET_KEY || '123456';

/**
 * Normalisasi data dari JSON input
 * iPaymu mengirim JSON dengan tipe string, perlu dikonversi
 */
function normalizeData(rawData) {
  const result = {};

  for (const key in rawData) {
    let val = rawData[key];

    if (key === 'is_escrow') {
      // Integer: 0 atau 1
      result[key] = (val === 'true' || val === '1' || val === 1 || val === true) ? 1 : 0;
    }
    else if (['trx_id', 'status_code', 'transaction_status_code', 'paid_off', 'sub_total', 'total', 'amount', 'fee'].includes(key)) {
      // Integer
      result[key] = parseInt(val, 10);
    }
    else if (key === 'additional_info') {
      // Array: pastikan array
      if (Array.isArray(val)) {
        result[key] = val;
      } else if (val === '[]' || val === '') {
        result[key] = [];
      } else {
        try {
          result[key] = typeof val === 'string' ? JSON.parse(val) : val;
        } catch {
          result[key] = [];
        }
      }
    }
    else {
      // Tetap seperti aslinya (termasuk null)
      result[key] = val;
    }
  }

  // Pastikan additional_info ada
  if (!result.hasOwnProperty('additional_info')) {
    result['additional_info'] = [];
  }

  return result;
}

/**
 * Sort keys seperti PHP ksort (ascending A-Z, case-sensitive)
 */
function phpKsort(obj) {
  return Object.keys(obj)
    .sort((a, b) => a.localeCompare(b))
    .reduce((sortedObj, key) => {
      sortedObj[key] = obj[key];
      return sortedObj;
    }, {});
}

/**
 * Generate HMAC-SHA256 signature
 */
function generateSignature(data) {
  // Normalisasi data (iPaymu kirim string dalam JSON)
  const normalizedData = normalizeData(data);

  // Hapus signature jika ada
  delete normalizedData.signature;

  // Sort keys (A-Z)
  const sortedData = phpKsort(normalizedData);

  // Convert ke JSON dengan escape slash
  let jsonBody = JSON.stringify(sortedData);
  jsonBody = jsonBody.replace(/\//g, '\\/');

  // Generate HMAC-SHA256
  return crypto
    .createHmac('sha256', SECRET_KEY)
    .update(jsonBody)
    .digest('hex');
}

// Endpoint callback
app.post('/callback', (req, res) => {
  // Ambil signature dari header atau body
  const receivedSignature = req.headers['x-signature'] || req.body.signature;

  if (!receivedSignature) {
    return res.status(400).json({
      status: 'error',
      message: 'Missing signature'
    });
  }

  // Generate signature dari data yang diterima
  const calculatedSignature = generateSignature(req.body);

  // Validasi signature
  if (calculatedSignature === receivedSignature) {
    console.log('✅ Signature valid!');

    // TODO: Update status transaksi di database
    // TODO: Pastikan idempotency

    // Response sukses
    res.status(200).json({
      status: 'OK',
      message: 'Callback processed successfully'
    });
  } else {
    console.log(`❌ Invalid signature! Expected: ${receivedSignature}, Got: ${calculatedSignature}`);

    res.status(400).json({
      status: 'error',
      message: 'Invalid Signature'
    });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log('═══════════════════════════════════════════════════');
  console.log('  iPaymu Callback Handler - JSON');
  console.log('═══════════════════════════════════════════════════');
  console.log(`  Server running on http://localhost:${PORT}`);
  console.log(`  Endpoint: POST http://localhost:${PORT}/callback`);
  console.log('═══════════════════════════════════════════════════');
});
