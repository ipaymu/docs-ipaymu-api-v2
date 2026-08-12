<?php
/**
 * iPaymu Callback Handler - PHP (JSON)
 * 
 * Server berjalan di port 8001
 * Format: application/json
 * 
 * Cara menjalankan:
 *   php -S localhost:8001 callback-json.php
 */

$secretKey = getenv('SECRET_KEY') ?: '123456';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method Not Allowed']);
    exit;
}

$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid JSON']);
    exit;
}

$receivedSignature = $_SERVER['HTTP_X_SIGNATURE'] ?? $data['signature'] ?? '';

if (empty($receivedSignature)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Missing signature']);
    exit;
}

unset($data['signature']);

foreach ($data as $key => &$val) {
    if ($key === 'is_escrow') {
        $val = ($val === '1' || strtolower((string)$val) === 'true' || $val === true || $val === 1) ? 1 : 0;
    } elseif (in_array($key, ['trx_id', 'status_code', 'transaction_status_code', 'paid_off', 'sub_total', 'total', 'amount', 'fee'])) {
        $val = intval($val);
    } elseif ($key === 'additional_info') {
        if ($val === '[]' || $val === '') {
            $val = [];
        } elseif (is_string($val)) {
            $decoded = json_decode($val, true);
            $val = is_array($decoded) ? $decoded : [];
        } elseif (!is_array($val)) {
            $val = [];
        }
    }
}
unset($val);

if (!isset($data['additional_info'])) {
    $data['additional_info'] = [];
}

ksort($data);

$jsonBody = json_encode($data);

$calculatedSignature = hash_hmac('sha256', $jsonBody, $secretKey);

if (hash_equals($calculatedSignature, $receivedSignature)) {
    error_log("✅ Signature valid!");
    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'message' => 'OK'
    ]);
} else {
    error_log("❌ Invalid signature! Expected: $receivedSignature, Got: $calculatedSignature");
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
