const crypto = require('crypto');
const axios = require('axios');
const chalk = require('chalk');
const Table = require('cli-table3');

// Secret key untuk testing
const SECRET_KEY = process.env.SECRET_KEY || '1179001234567890';

// Server endpoints
const SERVERS = [
  { name: 'JavaScript (URL-encoded)', url: 'http://localhost:3000/callback', type: 'urlencoded' },
  { name: 'JavaScript (JSON)', url: 'http://localhost:3001/callback', type: 'json' },
  { name: 'PHP (URL-encoded)', url: 'http://localhost:8000/callback', type: 'urlencoded' },
  { name: 'PHP (JSON)', url: 'http://localhost:8001/callback', type: 'json' },
  { name: 'Go (URL-encoded)', url: 'http://localhost:8080/callback', type: 'urlencoded' },
  { name: 'Go (JSON)', url: 'http://localhost:8081/callback', type: 'json' },
  { name: 'Python (URL-encoded)', url: 'http://localhost:5000/callback', type: 'urlencoded' },
  { name: 'Python (JSON)', url: 'http://localhost:5001/callback', type: 'json' },
  { name: 'Rust (URL-encoded)', url: 'http://localhost:8082/callback', type: 'urlencoded' },
  { name: 'Rust (JSON)', url: 'http://localhost:8083/callback', type: 'json' },
];

// Sample data untuk callback
const SAMPLE_DATA = {
  buyer_email: 'customer@example.com',
  buyer_name: 'John Doe',
  buyer_phone: '081234567890',
  created_at: '2025-11-11 10:00:00',
  expired_at: '2025-11-11 11:00:00',
  fee: '1500',
  paid_at: '2025-11-11 10:10:52',
  reference_id: 'ORDER123456',
  sid: 'SESSION789',
  status: 'berhasil',
  status_code: '1',
  status_desc: 'Success',
  channel: 'bca',
  paid_off: '98500',
  product: 'Product Name',
  quantity: '1',
  merchant: '1179001234567890',
  merchant_name: 'Your Store',
  system_notes: 'Payment completed',
  trscode: 'TRX789012',
  trx_id: '12345678',
  unique_code: '0',
  via: 'va',
  payment_no: '1234567890',
  va: '1234567890',
  url: 'https://your-domain.com/callback',
  additional_info: [],
  transaction_status_code: '1',
  settlement_status: 'unsettle',
  settlement_date: null,
  expired_time: '3600',
  expired_unix: '1762842000',
  is_escrow: '0',
  is_refund: '0',
  is_sandbox: 'false',
  total: '100000',
  amount: '100000',
  sub_total: '100000',
  referenceId: 'ORDER123456'
};

// Normalisasi data untuk signature
function normalizeData(rawData) {
  const result = {};
  for (const key in rawData) {
    let val = rawData[key];
    if (key === 'is_escrow') {
      result[key] = (val === 'true' || val === '1' || val === 1);
    } else if (['trx_id', 'status_code', 'transaction_status_code', 'paid_off'].includes(key)) {
      result[key] = parseInt(val, 10);
    } else if (key === 'additional_info') {
      if (val === '[]') result[key] = [];
      else result[key] = val;
    } else {
      result[key] = String(val);
    }
  }
  if (!result.hasOwnProperty('additional_info')) {
    result['additional_info'] = [];
  }
  return result;
}

// Sort keys seperti PHP ksort
function phpKsort(obj) {
  return Object.keys(obj)
    .sort((a, b) => a.localeCompare(b))
    .reduce((sortedObj, key) => {
      sortedObj[key] = obj[key];
      return sortedObj;
    }, {});
}

// Generate signature
function generateSignature(data) {
  const normalizedData = normalizeData(data);
  delete normalizedData.signature;
  
  const sortedData = phpKsort(normalizedData);
  let jsonBody = JSON.stringify(sortedData);
  jsonBody = jsonBody.replace(/\//g, '\\/');
  
  return crypto
    .createHmac('sha256', SECRET_KEY)
    .update(jsonBody)
    .digest('hex');
}

// Convert data ke URL-encoded format
function toUrlEncoded(data) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(data)) {
    if (value !== null && value !== undefined) {
      params.append(key, String(value));
    }
  }
  return params.toString();
}

// Test satu server
async function testServer(server) {
  const results = {
    name: server.name,
    url: server.url,
    validSignature: null,
    invalidSignature: null,
    error: null
  };

  try {
    // Test 1: Valid signature
    const validSignature = generateSignature(SAMPLE_DATA);
    
    if (server.type === 'urlencoded') {
      const response = await axios.post(server.url, toUrlEncoded(SAMPLE_DATA), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Signature': validSignature
        },
        timeout: 5000,
        validateStatus: () => true
      });
      results.validSignature = response.status === 200;
    } else {
      const response = await axios.post(server.url, SAMPLE_DATA, {
        headers: {
          'Content-Type': 'application/json',
          'X-Signature': validSignature
        },
        timeout: 5000,
        validateStatus: () => true
      });
      results.validSignature = response.status === 200;
    }

    // Test 2: Invalid signature
    const invalidSignature = 'invalid_signature_12345';
    
    if (server.type === 'urlencoded') {
      const response = await axios.post(server.url, toUrlEncoded(SAMPLE_DATA), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Signature': invalidSignature
        },
        timeout: 5000,
        validateStatus: () => true
      });
      results.invalidSignature = response.status === 400;
    } else {
      const response = await axios.post(server.url, SAMPLE_DATA, {
        headers: {
          'Content-Type': 'application/json',
          'X-Signature': invalidSignature
        },
        timeout: 5000,
        validateStatus: () => true
      });
      results.invalidSignature = response.status === 400;
    }

  } catch (err) {
    results.error = err.message;
  }

  return results;
}

// Main test runner
async function runTests() {
  console.log(chalk.bold.blue('\n🧪 iPaymu Callback Test Runner\n'));
  console.log(chalk.gray(`Secret Key: ${SECRET_KEY}`));
  console.log(chalk.gray(`Testing ${SERVERS.length} endpoints...\n`));

  const results = [];
  
  for (const server of SERVERS) {
    process.stdout.write(chalk.gray(`Testing ${server.name}... `));
    const result = await testServer(server);
    results.push(result);
    
    if (result.error) {
      console.log(chalk.red('❌ Error'));
    } else if (result.validSignature && result.invalidSignature) {
      console.log(chalk.green('✅ Pass'));
    } else {
      console.log(chalk.yellow('⚠️  Partial'));
    }
  }

  // Tampilkan hasil dalam tabel
  console.log('\n');
  const table = new Table({
    head: [chalk.bold('Server'), chalk.bold('Valid Sig'), chalk.bold('Invalid Sig'), chalk.bold('Status')],
    colWidths: [30, 13, 14, 12]
  });

  results.forEach(r => {
    const validStatus = r.validSignature === null ? chalk.gray('N/A') : 
                       r.validSignature ? chalk.green('✅ 200 OK') : chalk.red('❌ Fail');
    const invalidStatus = r.invalidSignature === null ? chalk.gray('N/A') :
                         r.invalidSignature ? chalk.green('✅ 400 Bad') : chalk.red('❌ Fail');
    const overall = r.error ? chalk.red('Error') :
                   r.validSignature && r.invalidSignature ? chalk.green('✅ Pass') :
                   chalk.yellow('⚠️ Partial');
    
    table.push([r.name, validStatus, invalidStatus, overall]);
  });

  console.log(table.toString());

  // Summary
  const passed = results.filter(r => r.validSignature && r.invalidSignature).length;
  const failed = results.filter(r => r.error || (!r.validSignature || !r.invalidSignature)).length;
  const total = results.length;

  console.log(chalk.bold('\n📊 Summary:'));
  console.log(chalk.green(`  ✅ Passed: ${passed}/${total}`));
  console.log(chalk.red(`  ❌ Failed: ${failed}/${total}`));
  
  if (failed > 0) {
    console.log(chalk.yellow('\n⚠️  Catatan:'));
    console.log(chalk.gray('  - Pastikan semua server sudah berjalan di port yang benar'));
    console.log(chalk.gray('  - Pastikan SECRET_KEY di server sama dengan test runner'));
    console.log(chalk.gray('  - Periksa log server untuk detail error'));
  }

  console.log('');
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error(chalk.red('Fatal error:'), err.message);
  process.exit(1);
});
