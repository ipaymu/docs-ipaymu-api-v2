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
const SECRET_KEY = process.env.SECRET_KEY || 'YOUR_VA_NUMBER_HERE';

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
 * Untuk JSON, data sudah dalam tipe yang benar
 */
function generateSignature(data) {
  // Copy data dan hapus signature jika ada
  const dataCopy = { ...data };
  delete dataCopy.signature;
  
  // Step 1: Sort keys (A-Z)
  const sortedData = phpKsort(dataCopy);
  
  // Step 2: Convert ke JSON dengan escape slash
  let jsonBody = JSON.stringify(sortedData);
  jsonBody = jsonBody.replace(/\//g, '\\/');
  
  // Step 3: Generate HMAC-SHA256
  return crypto
    .createHmac('sha256', SECRET_KEY)
    .update(jsonBody)
    .digest('hex');
}

// Endpoint callback
app.post('/callback', (req, res) => {
  console.log('\n📥 Callback received at', new Date().toISOString());
  console.log('Content-Type:', req.headers['content-type']);
  
  // Ambil signature dari header atau body
  const receivedSignature = req.headers['x-signature'] || req.body.signature;
  
  if (!receivedSignature) {
    console.log('❌ Missing X-Signature header or signature field');
    return res.status(400).json({ 
      status: 'error', 
      message: 'Missing signature' 
    });
  }
  
  console.log('Received Signature:', receivedSignature);
  console.log('Body:', JSON.stringify(req.body, null, 2));
  
  // Generate signature dari data yang diterima
  const calculatedSignature = generateSignature(req.body);
  console.log('Calculated Signature:', calculatedSignature);
  
  // Validasi signature
  if (calculatedSignature === receivedSignature) {
    console.log('✅ Signature valid!');
    
    // TODO: Update status transaksi di database
    // TODO: Pastikan idempotency
    
    console.log('Transaction ID:', req.body.trx_id);
    console.log('Status:', req.body.status);
    console.log('Reference ID:', req.body.reference_id);
    
    // Response sukses
    res.status(200).json({ 
      status: 'OK',
      message: 'Callback processed successfully'
    });
  } else {
    console.log('❌ Invalid signature!');
    console.log('Expected:', receivedSignature);
    console.log('Got:     ', calculatedSignature);
    
    // Debug
    const dataCopy = { ...req.body };
    delete dataCopy.signature;
    const sortedData = phpKsort(dataCopy);
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
    service: 'iPaymu Callback (JSON)',
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

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log('═══════════════════════════════════════════════════');
  console.log('  iPaymu Callback Handler - JSON');
  console.log('═══════════════════════════════════════════════════');
  console.log(`  Server running on http://localhost:${PORT}`);
  console.log(`  Endpoint: POST http://localhost:${PORT}/callback`);
  console.log(`  Health Check: GET http://localhost:${PORT}/health`);
  console.log('═══════════════════════════════════════════════════');
  console.log('\n⚠️  PENTING:');
  console.log('   Ganti SECRET_KEY dengan Nomor VA Anda!');
  console.log('   Secret Key saat ini:', SECRET_KEY === 'YOUR_VA_NUMBER_HERE' ? '❌ BELUM DIGANTI' : '✅ OK');
  console.log('\n   Atau set via environment variable:');
  console.log('   SECRET_KEY=1179001234567890 node callback-json.js\n');
});
