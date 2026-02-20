const crypto = require('crypto');
const secretKey = '123456';
const json1 = '{"additional_info":[],"amount":100000,"buyer_email":"budi@example.com","buyer_name":"Budi Santoso","buyer_phone":"081234567890","channel":"vabca","created_at":"2023-10-25 10:00:00","expired_at":"2023-10-26 10:00:00","fee":0,"is_escrow":false,"paid_at":"2023-10-25 10:05:00","paid_off":100000,"payment_no":"807771234567890","reference_id":"INV-202310-001","settlement_status":"unsettled","sid":"session_123","status":"berhasil","status_code":1,"sub_total":100000,"system_notes":"","total":100000,"transaction_status_code":1,"trx_id":123456,"url":"https:\\/\\/domain.com\\/webhook\\/callback","va":"807771234567890","via":"bca"}';

const json2 = '{"additional_info":[],"amount":100000,"buyer_email":"budi@example.com","buyer_name":"Budi Santoso","buyer_phone":"081234567890","channel":"vabca","created_at":"2023-10-25 10:00:00","expired_at":"2023-10-26 10:00:00","fee":0,"is_escrow":0,"paid_at":"2023-10-25 10:05:00","paid_off":100000,"payment_no":"807771234567890","reference_id":"INV-202310-001","settlement_status":"unsettled","sid":"session_123","status":"berhasil","status_code":1,"sub_total":100000,"system_notes":"","total":100000,"transaction_status_code":1,"trx_id":123456,"url":"https:\\/\\/domain.com\\/webhook\\/callback","va":"807771234567890","via":"bca"}';

console.log("JSON 1 Hash:", crypto.createHmac('sha256', secretKey).update(json1).digest('hex'));
console.log("JSON 2 Hash:", crypto.createHmac('sha256', secretKey).update(json2).digest('hex'));
