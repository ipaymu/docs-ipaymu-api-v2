/**
 * iPaymu Callback Handler - PHP (URL-encoded)
 * 
 * Server berjalan di port 8000
 * Format: application/x-www-form-urlencoded
 * 
 * Cara menjalankan:
 *   php -S localhost:8000 callback-urlencoded.php
 */

// Secret Key - Ganti dengan Nomor VA Anda!
$secretKey = getenv('SECRET_KEY') ?: 'YOUR_VA_NUMBER_HERE';

// Content-Type
header('Content-Type: application/json');

// Hanya terima POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method Not Allowed']);
    exit;
}

// Ambil semua data dari POST
$data = $_POST;

// Ambil signature dari header atau body
$receivedSignature = $_SERVER['HTTP_X_SIGNATURE'] ?? $data['signature'] ?? '';

if (empty($receivedSignature)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Missing X-Signature header']);
    exit;
}

// Hapus signature dari data jika ada di body
unset($data['signature']);

// Normalisasi tipe data
foreach ($data as $key => &$val) {
    if ($key === 'is_escrow') {
        // Boolean: "0" -> false, "1" -> true
        $val = ($val === '1' || $val === 'true' || $val === true);
    } elseif (in_array($key, ['trx_id', 'status_code', 'transaction_status_code', 'paid_off'])) {
        // Integer
        $val = intval($val);
    } elseif ($key === 'additional_info') {
        // Array: konversi string "[]" menjadi array kosong
        if ($val === '[]') {
            $val = [];
        } elseif (is_string($val)) {
            $decoded = json_decode($val, true);
            $val = is_array($decoded) ? $decoded : [];
        }
    } else {
        // String
        $val = strval($val);
    }
}
unset($val);

// Pastikan additional_info ada (penting untuk validasi signature)
if (!isset($data['additional_info'])) {
    $data['additional_info'] = [];
}

// Sort keys secara ascending (A-Z) - sama seperti PHP ksort
ksort($data);

// Konversi ke JSON (PHP json_encode otomatis escape slash)
$jsonBody = json_encode($data);

// Generate HMAC-SHA256
$calculatedSignature = hash_hmac('sha256', $jsonBody, $secretKey);

// Validasi signature
if (hash_equals($calculatedSignature, $receivedSignature)) {
    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'message' => 'OK'
    ]);
    
    // TODO: Update status transaksi di database
    // TODO: Pastikan idempotency - cek apakah sudah diproses sebelumnya
    
} else {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid Signature',
        'debug' => [
            'received' => $receivedSignature,
            'calculated' => $calculatedSignature,
            'json' => $jsonBody
        ]
    ]);
}
