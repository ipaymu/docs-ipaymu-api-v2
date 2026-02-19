use actix_web::{web, App, HttpResponse, HttpServer, post, HttpRequest};
use hmac::{Hmac, Mac};
use sha2::Sha256;
use serde_json::{Value, Map};
use std::collections::BTreeMap;
use std::env;

/**
 * iPaymu Callback Handler - Rust/Actix-web (URL-encoded)
 *
 * Server berjalan di port 8082
 * Format: application/x-www-form-urlencoded
 *
 * Cara menjalankan:
 *     cargo run --bin callback-urlencoded
 *
 * Atau build dahulu:
 *     cargo build --release --bin callback-urlencoded
 *     ./target/release/callback-urlencoded
 */

// Type untuk HMAC-SHA256
type HmacSha256 = Hmac<Sha256>;

fn get_secret_key() -> String {
    env::var("SECRET_KEY").unwrap_or_else(|_| "YOUR_VA_NUMBER_HERE".to_string())
}

/**
 * Normalisasi data dari form input
 * Mengkonversi tipe data ke format yang benar
 */
fn normalize_data(data: &Map<String, Value>) -> Map<String, Value> {
    let mut result = Map::new();
    
    for (key, val) in data.iter() {
        let normalized_val = match key.as_str() {
            "is_escrow" => {
                match val {
                    Value::String(s) => Value::Bool(s == "1" || s == "true"),
                    Value::Bool(b) => Value::Bool(*b),
                    _ => Value::Bool(false),
                }
            }
            "trx_id" | "status_code" | "transaction_status_code" | "paid_off" => {
                match val {
                    Value::String(s) => {
                        s.parse::<i64>().map(Value::Number)
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

/**
 * Sort keys seperti PHP ksort (ascending A-Z)
 * Menggunakan BTreeMap yang otomatis sorted
 */
fn php_ksort(data: &Map<String, Value>) -> BTreeMap<String, Value> {
    let mut sorted = BTreeMap::new();
    for (k, v) in data.iter() {
        sorted.insert(k.clone(), v.clone());
    }
    sorted
}

/**
 * Generate HMAC-SHA256 signature
 */
fn generate_signature(data: &Map<String, Value>) -> String {
    let secret_key = get_secret_key();
    
    // Sort keys
    let sorted = php_ksort(data);
    
    // Convert ke JSON
    let json_body = serde_json::to_string(&sorted).unwrap();
    
    // Escape slashes seperti PHP
    let json_body = json_body.replace("/", "\\/");
    
    // Generate HMAC-SHA256
    let mut mac = HmacSha256::new_from_slice(secret_key.as_bytes())
        .expect("HMAC can take key of any size");
    mac.update(json_body.as_bytes());
    
    hex::encode(mac.finalize().into_bytes())
}

#[post("/callback")]
async fn callback_handler(req: HttpRequest, body: web::Form<serde_json::Value>) -> HttpResponse {
    println!("\n📥 Callback received");
    
    // Ambil signature dari header
    let received_sig = req.headers()
        .get("X-Signature")
        .and_then(|h| h.to_str().ok())
        .unwrap_or("");
    
    if received_sig.is_empty() {
        println!("❌ Missing X-Signature header");
        return HttpResponse::BadRequest().json(serde_json::json!({
            "status": "error",
            "message": "Missing X-Signature header"
        }));
    }
    
    println!("Received Signature: {}", received_sig);
    
    // Convert form data ke Map
    let mut data = Map::new();
    if let Value::Object(map) = body.into_inner() {
        for (k, v) in map {
            if k != "signature" {
                data.insert(k, v);
            }
        }
    }
    
    // Normalisasi data
    let normalized = normalize_data(&data);
    
    // Generate signature
    let calculated_sig = generate_signature(&normalized);
    println!("Calculated Signature: {}", calculated_sig);
    
    // Validasi
    if calculated_sig == received_sig {
        println!("✅ Signature valid!");
        
        // TODO: Update status transaksi di database
        // TODO: Pastikan idempotency
        
        HttpResponse::Ok().json(serde_json::json!({
            "status": "OK",
            "message": "Callback processed successfully"
        }))
    } else {
        println!("❌ Invalid signature!");
        HttpResponse::BadRequest().json(serde_json::json!({
            "status": "error",
            "message": "Invalid Signature",
            "debug": {
                "received": received_sig,
                "calculated": calculated_sig
            }
        }))
    }
}

#[actix_web::get("/health")]
async fn health_check() -> HttpResponse {
    HttpResponse::Ok().json(serde_json::json!({
        "status": "OK",
        "service": "iPaymu Callback (URL-encoded)"
    }))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let port = env::var("PORT").unwrap_or_else(|_| "8082".to_string());
    let secret_key = get_secret_key();
    
    println!("═══════════════════════════════════════════════════");
    println!("  iPaymu Callback Handler - URL-encoded (Rust)");
    println!("═══════════════════════════════════════════════════");
    println!("  Server running on http://localhost:{}", port);
    println!("  Endpoint: POST http://localhost:{}/callback", port);
    println!("  Health Check: GET http://localhost:{}/health", port);
    println!("═══════════════════════════════════════════════════");
    println!();
    println!("⚠️  PENTING:");
    println!("   Ganti SECRET_KEY dengan Nomor VA Anda!");
    if secret_key == "YOUR_VA_NUMBER_HERE" {
        println!("   Secret Key saat ini: ❌ BELUM DIGANTI");
    } else {
        println!("   Secret Key saat ini: ✅ OK");
    }
    println!();
    println!("   Atau set via environment variable:");
    println!("   SECRET_KEY=1179001234567890 cargo run --bin callback-urlencoded\n");
    
    HttpServer::new(|| {
        App::new()
            .service(callback_handler)
            .service(health_check)
    })
    .bind(format!("127.0.0.1:{}", port))?
    .run()
    .await
}
