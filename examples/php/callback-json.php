/**
 * iPaymu Callback Handler - PHP (JSON)
 * 
 * Server berjalan di port 8001
 * Format: application/json
 * 
 * Cara menjalankan:
 *   php -S localhost:8001 callback-json.php
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

// Ambil raw JSON input
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid JSON']);
    exit;
}

// Ambil signature dari body atau header
$receivedSignature = $data['signature'] ?? $_SERVER['HTTP_X_SIGNATURE'] ?? '';

if (empty($receivedSignature)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Missing signature']);
    exit;
}

// Hapus signature dari data
unset($data['signature']);

// Sort keys secara ascending (A-Z)
ksort($data);

// Konversi ke JSON
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
    // TODO: Pastikan idempotency
    
} else {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid Signature',
        'debug' => [
            'received' => $receivedSignature,
            'calculated' => $calculatedSignature
        ]
    ]);
}
