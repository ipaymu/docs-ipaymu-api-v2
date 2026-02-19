/**
 * iPaymu Callback Handler - JavaScript (URL-encoded)
 * 
 * Server berjalan di port 3000
 * Format: application/x-www-form-urlencoded
 * 
 * Cara menjalankan:
 *   npm install
 *   npm run start:url
 * 
 * Atau langsung:
 *   node callback-urlencoded.js
 */

const crypto = require('crypto');
const express = require('express');

const app = express();

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Secret Key - Ganti dengan Nomor VA Anda!
const SECRET_KEY = process.env.SECRET_KEY || 'YOUR_VA_NUMBER_HERE';

/**
 * Normalisasi data dari form input
 * Mengkonversi tipe data ke format yang benar
 */
function normalizeData(rawData) {
  const result = {};
  
  for (const key in rawData) {
    let val = rawData[key];
    
    if (key === 'is_escrow') {
      // Boolean: "0" atau "1" atau "true" atau "false"
      result[key] = (val === 'true' || val === '1' || val === 1);
    }
    else if (['trx_id', 'status_code', 'transaction_status_code', 'paid_off'].includes(key)) {
      // Integer
      result[key] = parseInt(val, 10);
    }
    else if (key === 'additional_info') {
      // Array: konversi string "[]" ke array kosong
      if (val === '[]') {
        result[key] = [];
      } else {
        try {
          result[key] = JSON.parse(val);
        } catch {
          result[key] = [];
        }
      }
    }
    else {
      // String
      result[key] = String(val);
    }
  }
  
  // Pastikan additional_info ada (penting untuk validasi signature)
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
  // Step 1: Normalisasi tipe data
  const normalizedData = normalizeData(data);
  
  // Step 2: Hapus signature jika ada
  if (normalizedData.signature) {
    delete normalizedData.signature;
  }
  
  // Step 3: Sort keys (A-Z)
  const sortedData = phpKsort(normalizedData);
  
  // Step 4: Convert ke JSON dengan escape slash
  let jsonBody = JSON.stringify(sortedData);
  jsonBody = jsonBody.replace(/\//g, '\\/');
  
  // Step 5: Generate HMAC-SHA256
  return crypto
    .createHmac('sha256', SECRET_KEY)
    .update(jsonBody)
    .digest('hex');
}

// Endpoint callback
app.post('/callback', (req, res) => {
  console.log('\n📥 Callback received at', new Date().toISOString());
  console.log('Content-Type:', req.headers['content-type']);
  
  // Ambil signature dari header
  const receivedSignature = req.headers['x-signature'];
  
  if (!receivedSignature) {
    console.log('❌ Missing X-Signature header');
    return res.status(400).json({ 
      status: 'error', 
      message: 'Missing X-Signature header' 
    });
  }
  
  console.log('Received Signature:', receivedSignature);
  console.log('Raw Body:', req.body);
  
  // Generate signature dari data yang diterima
  const calculatedSignature = generateSignature(req.body);
  console.log('Calculated Signature:', calculatedSignature);
  
  // Validasi signature
  if (calculatedSignature === receivedSignature) {
    console.log('✅ Signature valid!');
    
    // TODO: Update status transaksi di database
    // TODO: Pastikan idempotency - cek apakah trx_id sudah diproses
    
    const normalizedData = normalizeData(req.body);
    console.log('Transaction ID:', normalizedData.trx_id);
    console.log('Status:', normalizedData.status);
    console.log('Reference ID:', normalizedData.reference_id);
    
    // Response sukses
    res.status(200).json({ 
      status: 'OK',
      message: 'Callback processed successfully'
    });
  } else {
    console.log('❌ Invalid signature!');
    console.log('Expected:', receivedSignature);
    console.log('Got:     ', calculatedSignature);
    
    // Debug: Tampilkan JSON yang digunakan
    const normalizedData = normalizeData(req.body);
    delete normalizedData.signature;
    const sortedData = phpKsort(normalizedData);
    let jsonBody = JSON.stringify(sortedData);
    jsonBody = jsonBody.replace(/\//g, '\\/');
    console.log('JSON used:', jsonBody);
    
    res.status(400).json({ 
      status: 'error', 
      message: 'Invalid Signature' 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'iPaymu Callback (URL-encoded)',
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    status: 'error', 
    message: 'Internal Server Error' 
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('═══════════════════════════════════════════════════');
  console.log('  iPaymu Callback Handler - URL-encoded');
  console.log('═══════════════════════════════════════════════════');
  console.log(`  Server running on http://localhost:${PORT}`);
  console.log(`  Endpoint: POST http://localhost:${PORT}/callback`);
  console.log(`  Health Check: GET http://localhost:${PORT}/health`);
  console.log('═══════════════════════════════════════════════════');
  console.log('\n⚠️  PENTING:');
  console.log('   Ganti SECRET_KEY dengan Nomor VA Anda!');
  console.log('   Secret Key saat ini:', SECRET_KEY === 'YOUR_VA_NUMBER_HERE' ? '❌ BELUM DIGANTI' : '✅ OK');
  console.log('\n   Atau set via environment variable:');
  console.log('   SECRET_KEY=1179001234567890 node callback-urlencoded.js\n');
});
