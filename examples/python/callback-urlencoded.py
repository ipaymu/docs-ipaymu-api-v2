from flask import Flask, request, jsonify
import hmac
import hashlib
import json
import os
from collections import OrderedDict

"""
iPaymu Callback Handler - Python/Flask (URL-encoded)

Server berjalan di port 5000
Format: application/x-www-form-urlencoded

Cara menjalankan:
    pip install -r requirements.txt
    python callback-urlencoded.py

Atau dengan secret key custom:
    SECRET_KEY=1179001234567890 python callback-urlencoded.py
"""

app = Flask(__name__)

# Secret Key - Ganti dengan Nomor VA Anda!
SECRET_KEY = os.getenv('SECRET_KEY', 'YOUR_VA_NUMBER_HERE')


def normalize_data(raw_data):
    """
    Normalisasi data dari form input
    Mengkonversi tipe data ke format yang benar
    """
    result = {}
    
    for key, val in raw_data.items():
        if key == 'is_escrow':
            # Boolean: "0" atau "1" atau "true" atau "false"
            result[key] = val in ('1', 'true', True, 1)
        elif key in ['trx_id', 'status_code', 'transaction_status_code', 'paid_off']:
            # Integer
            try:
                result[key] = int(val)
            except (ValueError, TypeError):
                result[key] = val
        elif key == 'additional_info':
            # Array: konversi string "[]" ke array kosong
            if val == '[]' or val == '':
                result[key] = []
            else:
                try:
                    result[key] = json.loads(val) if isinstance(val, str) else val
                except json.JSONDecodeError:
                    result[key] = []
        else:
            # String
            result[key] = str(val)
    
    # Pastikan additional_info ada (penting untuk validasi signature)
    if 'additional_info' not in result:
        result['additional_info'] = []
    
    return result


def php_ksort(data):
    """
    Sort dictionary keys seperti PHP ksort (ascending A-Z, case-sensitive)
    """
    return OrderedDict(sorted(data.items(), key=lambda x: x[0]))


def generate_signature(data):
    """
    Generate HMAC-SHA256 signature
    """
    # Normalisasi data
    normalized_data = normalize_data(data)
    
    # Hapus signature jika ada
    if 'signature' in normalized_data:
        del normalized_data['signature']
    
    # Sort keys (A-Z)
    sorted_data = php_ksort(normalized_data)
    
    # Convert ke JSON dengan escape slash
    json_body = json.dumps(sorted_data, separators=(',', ':'))
    json_body = json_body.replace('/', '\\/')
    
    # Generate HMAC-SHA256
    signature = hmac.new(
        SECRET_KEY.encode('utf-8'),
        json_body.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    return signature


@app.route('/callback', methods=['POST'])
def callback_handler():
    print('\n📥 Callback received at', request.headers.get('X-Timestamp', 'N/A'))
    print('Content-Type:', request.content_type)
    
    # Ambil signature dari header
    received_signature = request.headers.get('X-Signature', '')
    
    if not received_signature:
        print('❌ Missing X-Signature header')
        return jsonify({'status': 'error', 'message': 'Missing X-Signature header'}), 400
    
    print('Received Signature:', received_signature)
    
    # Ambil form data
    raw_data = request.form.to_dict()
    print('Raw Data:', raw_data)
    
    # Generate signature
    calculated_signature = generate_signature(raw_data)
    print('Calculated Signature:', calculated_signature)
    
    # Validasi signature dengan timing-safe comparison
    if hmac.compare_digest(calculated_signature, received_signature):
        print('✅ Signature valid!')
        
        # TODO: Update status transaksi di database
        # TODO: Pastikan idempotency - cek apakah sudah diproses sebelumnya
        
        normalized_data = normalize_data(raw_data)
        print('Transaction ID:', normalized_data.get('trx_id'))
        print('Status:', normalized_data.get('status'))
        print('Reference ID:', normalized_data.get('reference_id'))
        
        return jsonify({'status': 'OK', 'message': 'Callback processed successfully'}), 200
    else:
        print('❌ Invalid signature!')
        print('Expected:', received_signature)
        print('Got:     ', calculated_signature)
        
        # Debug: Tampilkan JSON yang digunakan
        normalized_data = normalize_data(raw_data)
        if 'signature' in normalized_data:
            del normalized_data['signature']
        sorted_data = php_ksort(normalized_data)
        json_body = json.dumps(sorted_data, separators=(',', ':'))
        json_body = json_body.replace('/', '\\/')
        print('JSON used:', json_body)
        
        return jsonify({
            'status': 'error',
            'message': 'Invalid Signature',
            'debug': {
                'received': received_signature,
                'calculated': calculated_signature
            }
        }), 400


@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'OK',
        'service': 'iPaymu Callback (URL-encoded)',
        'timestamp': json.dumps({'now': True})  # Placeholder
    })


@app.errorhandler(500)
def internal_error(error):
    return jsonify({'status': 'error', 'message': 'Internal Server Error'}), 500


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    
    print('═══════════════════════════════════════════════════')
    print('  iPaymu Callback Handler - URL-encoded (Python)')
    print('═══════════════════════════════════════════════════')
    print(f'  Server running on http://localhost:{port}')
    print(f'  Endpoint: POST http://localhost:{port}/callback')
    print(f'  Health Check: GET http://localhost:{port}/health')
    print('═══════════════════════════════════════════════════')
    print()
    print('⚠️  PENTING:')
    print('   Ganti SECRET_KEY dengan Nomor VA Anda!')
    print('   Secret Key saat ini:', '❌ BELUM DIGANTI' if SECRET_KEY == 'YOUR_VA_NUMBER_HERE' else '✅ OK')
    print()
    print('   Atau set via environment variable:')
    print(f'   SECRET_KEY=1179001234567890 python callback-urlencoded.py\n')
    
    app.run(debug=True, host='0.0.0.0', port=port)
