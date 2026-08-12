import os
import json
import hmac
import hashlib
from collections import OrderedDict
from flask import Flask, request, jsonify

"""
iPaymu Callback Handler - Python/Flask (JSON)

Server berjalan di port 5001
Format: application/json

Cara menjalankan:
    pip install -r requirements.txt
    python callback-json.py
"""

app = Flask(__name__)

SECRET_KEY = os.getenv('SECRET_KEY', '123456')

def normalize_data(raw_data):
    result = {}
    for key, val in raw_data.items():
        if key == 'is_escrow':
            if str(val).lower() == 'true' or str(val) == '1' or val is True or val == 1:
                result[key] = 1
            else:
                result[key] = 0
        elif key in ['trx_id', 'status_code', 'transaction_status_code', 'paid_off', 'sub_total', 'total', 'amount', 'fee']:
            try:
                result[key] = int(val)
            except (ValueError, TypeError):
                result[key] = val
        elif key == 'additional_info':
            if val == '[]' or val == '':
                result[key] = []
            elif isinstance(val, str):
                try:
                    parsed = json.loads(val)
                    result[key] = parsed if isinstance(parsed, list) else []
                except json.JSONDecodeError:
                    result[key] = []
            elif isinstance(val, list):
                result[key] = val
            else:
                result[key] = []
        else:
            result[key] = val
            
    if 'additional_info' not in result:
        result['additional_info'] = []
        
    return result

def php_ksort(data):
    return OrderedDict(sorted(data.items(), key=lambda x: x[0]))

def generate_signature(data):
    normalized_data = normalize_data(data)
    normalized_data.pop('signature', None)
    sorted_data = php_ksort(normalized_data)
    
    json_body = json.dumps(sorted_data, separators=(',', ':'))
    json_body = json_body.replace('/', '\\/')
    
    signature = hmac.new(
        SECRET_KEY.encode('utf-8'),
        json_body.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    return signature

@app.route('/callback', methods=['POST'])
def callback_handler():
    data = request.get_json()
    if not data:
        return jsonify({'status': 'error', 'message': 'Invalid JSON'}), 400
        
    received_signature = request.headers.get('X-Signature') or data.get('signature', '')
    
    if not received_signature:
        return jsonify({'status': 'error', 'message': 'Missing signature'}), 400
        
    calculated_signature = generate_signature(data)
    
    if hmac.compare_digest(calculated_signature, received_signature):
        print('✅ Signature valid!')
        return jsonify({'status': 'OK', 'message': 'Callback processed successfully'}), 200
    else:
        print(f'❌ Invalid signature! Expected: {received_signature}, Got: {calculated_signature}')
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
        'service': 'iPaymu Callback (JSON)'
    })

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    print('═══════════════════════════════════════════════════')
    print('  iPaymu Callback Handler - JSON (Python)')
    print('═══════════════════════════════════════════════════')
    print(f'  Server running on http://localhost:{port}')
    print(f'  Endpoint: POST http://localhost:{port}/callback')
    print('═══════════════════════════════════════════════════')
    app.run(debug=True, host='0.0.0.0', port=port)
