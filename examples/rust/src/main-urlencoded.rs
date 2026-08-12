use actix_web::{web, App, HttpResponse, HttpServer, post, HttpRequest};
use hmac::{Hmac, Mac};
use sha2::Sha256;
use serde_json::{Value, Map};
use std::collections::BTreeMap;

// Tipe untuk HMAC-SHA256
type HmacSha256 = Hmac<Sha256>;

const SECRET_KEY: &str = "123456"; // Nomor VA akun iPaymu Anda (lihat di Dashboard > Integration > API Key)

// Normalisasi data dari form parameter
// URL Encoded Forms akan mengirimkan semuanya sebagai string.
fn normalize_data(data: &Map<String, Value>) -> Map<String, Value> {
    let mut result = Map::new();
    
    for (key, val) in data.iter() {
        let normalized_val = match key.as_str() {
            "is_escrow" => {
                match val {
                    Value::String(s) => {
                        let is_true = s == "1" || s == "true";
                        Value::Number((if is_true { 1 } else { 0 }).into())
                    },
                    Value::Bool(b) => Value::Number((if *b { 1 } else { 0 }).into()),
                    Value::Number(n) => Value::Number(n.clone()),
                    _ => Value::Number(0.into()),
                }
            }
            "trx_id" | "status_code" | "transaction_status_code" | "paid_off" | "sub_total" | "total" | "amount" | "fee" => {
                match val {
                    Value::String(s) => {
                        s.parse::<i64>().map(|n| Value::Number(n.into()))
                            .unwrap_or_else(|_| val.clone())
                    }
                    Value::Number(n) => Value::Number(n.clone()),
                    _ => val.clone(),
                }
            }
            "additional_info" => {
                match val {
                    Value::String(s) if s == "[]" => Value::Array(vec![]),
                    Value::Array(a) => Value::Array(a.clone()),
                    _ => Value::Array(vec![]),
                }
            }
            _ => Value::String(val.as_str().unwrap_or("").to_string()),
        };
        
        result.insert(key.clone(), normalized_val);
    }
    
    // Pastikan additional_info ada
    if !result.contains_key("additional_info") {
        result.insert("additional_info".to_string(), Value::Array(vec![]));
    }
    
    result
}

// Urutkan key sesuai PHP ksort
fn php_ksort(data: &Map<String, Value>) -> BTreeMap<String, Value> {
    let mut sorted = BTreeMap::new();
    for (k, v) in data.iter() {
        // Abaikan signature dalam proses pembuatan signature
        if k != "signature" {
            sorted.insert(k.clone(), v.clone());
        }
    }
    sorted
}

fn generate_signature(data: &Map<String, Value>) -> String {
    // Sort key
    let sorted = php_ksort(data);
    
    // Convert to JSON
    let json_body = serde_json::to_string(&sorted).unwrap();
    
    // Escape slashes seperti PHP
    let json_body = json_body.replace("/", "\\/");
    println!("DEBUG JSON BODY: {}", json_body);
    
    // Generate HMAC-SHA256
    let mut mac = HmacSha256::new_from_slice(SECRET_KEY.as_bytes())
        .expect("HMAC can take key of any size");
    mac.update(json_body.as_bytes());
    
    hex::encode(mac.finalize().into_bytes())
}

#[post("/callback")]
async fn callback_handler(req: HttpRequest, body: web::Form<std::collections::HashMap<String, String>>) -> HttpResponse {
    // Ambil signature dari header
    let received_sig = req.headers()
        .get("X-Signature")
        .and_then(|h| h.to_str().ok())
        .unwrap_or("");
    
    // Convert HashMap<String, String> ke Map<String, Value>
    let mut data = Map::new();
    for (k, v) in body.into_inner() {
        data.insert(k, Value::String(v));
    }
    
    println!("DEBUG RAW FORM MAP: {:?}", data);
    
    // Lakukan normalisasi (string menjadi format yg benar)
    let normalized = normalize_data(&data);
    println!("DEBUG NORMALIZED MAP: {:?}", normalized);

    // Generate signature untuk divalidasi
    let calculated_sig = generate_signature(&normalized);
    println!("Received Signature: {}", received_sig);
    println!("Calculated Signature: {}", calculated_sig);
    
    // Validasi
    if calculated_sig == received_sig {
        println!("✅ Signature valid");
        // Lakukan proses bisnis terkait status transaksi
        HttpResponse::Ok().json(serde_json::json!({
            "status": "OK"
        }))
    } else {
        println!("❌ Signature tidak valid");
        HttpResponse::BadRequest().json(serde_json::json!({
            "status": "error",
            "message": "Invalid Signature"
        }))
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    println!("Server running on :8082");
    // Port 8082 untuk x-www-form-urlencoded
    HttpServer::new(|| {
        App::new().service(callback_handler)
    })
    .bind("127.0.0.1:8082")?
    .run()
    .await
}
