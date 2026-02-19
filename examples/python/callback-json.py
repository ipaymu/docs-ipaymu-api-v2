from flask import Flask, request, jsonify
import hmac
import hashlib
import json
import os
from collections import OrderedDict

"""
iPaymu Callback Handler - Python/Flask (JSON)

Server berjalan di port 5001
Format: application/json

Cara menjalankan:
    pip install -r requirements.txt
    python callback-json.py

Atau dengan secret key custom:
    SECRET_KEY=1179001234567890 python callback-json.py
"""

app = Flask(__name__)

# Secret Key - Ganti dengan Nomor VA Anda!
SECRET_KEY = os.getenv('SECRET_KEY', 'YOUR_VA_NUMBER_HERE')


def php_ksort(data):
    """
    Sort dictionary keys seperti PHP ksort (ascending A-Z, case-sensitive)
    """
    return OrderedDict(sorted(data.items(), key=lambda x: x[0]))


def generate_signature(data):
    """
    Generate HMAC-SHA256 signature
    Untuk JSON, data sudah dalam tipe yang benar
    """
    # Copy data dan hapus signature
    data_copy = data.copy()
    data_copy.pop('signature', None)
    
    # Sort keys (A-Z)
    sorted_data = php_ksort(data_copy)
    
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
    
    # Parse JSON body
    data = request.get_json()
    
    if not data:
        print('❌ Invalid JSON')
        return jsonify({'status': 'error', 'message': 'Invalid JSON'}), 400
    
    # Ambil signature dari header atau body
    received_signature = request.headers.get('X-Signature', '') or data.get('signature', '')
    
    if not received_signature:
        print('❌ Missing signature')
        return jsonify({'status': 'error', 'message': 'Missing signature'}), 400
    
    print('Received Signature:', received_signature)
    print('Body:', json.dumps(data, indent=2))
    
    # Generate signature
    calculated_signature = generate_signature(data)
    print('Calculated Signature:', calculated_signature)
    
    # Validasi signature dengan timing-safe comparison
    if hmac.compare_digest(calculated_signature, received_signature):
        print('✅ Signature valid!')
        
        # TODO: Update status transaksi di database
        # TODO: Pastikan idempotency
        
        print('Transaction ID:', data.get('trx_id'))
        print('Status:', data.get('status'))
        print('Reference ID:', data.get('reference_id'))
        
        return jsonify({'status': 'OK', 'message': 'Callback processed successfully'}), 200
    else:
        print('❌ Invalid signature!')
        print('Expected:', received_signature)
        print('Got:     ', calculated_signature)
        
        # Debug
        data_copy = data.copy()
        data_copy.pop('signature', None)
        sorted_data = php_ksort(data_copy)
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
        'service': 'iPaymu Callback (JSON)',
        'timestamp': json.dumps({'now': True})  # Placeholder
    })


@app.errorhandler(500)
def internal_error(error):
    return jsonify({'status': 'error', 'message': 'Internal Server Error'}), 500


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    
    print('═══════════════════════════════════════════════════')
    print('  iPaymu Callback Handler - JSON (Python)')
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
    print(f'   SECRET_KEY=1179001234567890 python callback-json.py\n')
    
    app.run(debug=True, host='0.0.0.0', port=port)
