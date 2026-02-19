use actix_web::{web, App, HttpResponse, HttpServer, post, HttpRequest};
use hmac::{Hmac, Mac};
use sha2::Sha256;
use serde_json::{Value, Map};
use std::collections::BTreeMap;
use std::env;

/**
 * iPaymu Callback Handler - Rust/Actix-web (JSON)
 *
 * Server berjalan di port 8083
 * Format: application/json
 *
 * Cara menjalankan:
 *     cargo run --bin callback-json
 *
 * Atau build dahulu:
 *     cargo build --release --bin callback-json
 *     ./target/release/callback-json
 */

// Type untuk HMAC-SHA256
type HmacSha256 = Hmac<Sha256>;

fn get_secret_key() -> String {
    env::var("SECRET_KEY").unwrap_or_else(|_| "YOUR_VA_NUMBER_HERE".to_string())
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
    
    let sorted = php_ksort(data);
    let json_body = serde_json::to_string(&sorted).unwrap();
    let json_body = json_body.replace("/", "\\/");
    
    let mut mac = HmacSha256::new_from_slice(secret_key.as_bytes())
        .expect("HMAC can take key of any size");
    mac.update(json_body.as_bytes());
    
    hex::encode(mac.finalize().into_bytes())
}

#[post("/callback")]
async fn callback_handler(
    req: HttpRequest, 
    body: web::Json<Value>
) -> HttpResponse {
    println!("\n📥 Callback received");
    
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
    
    let mut data = Map::new();
    if let Value::Object(map) = body.into_inner() {
        for (k, v) in map {
            if k != "signature" {
                data.insert(k, v);
            }
        }
    }
    
    let calculated_sig = generate_signature(&data);
    println!("Calculated Signature: {}", calculated_sig);
    
    if calculated_sig == received_sig {
        println!("✅ Signature valid!");
        
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
        "service": "iPaymu Callback (JSON)"
    }))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let port = env::var("PORT").unwrap_or_else(|_| "8083".to_string());
    let secret_key = get_secret_key();
    
    println!("═══════════════════════════════════════════════════");
    println!("  iPaymu Callback Handler - JSON (Rust)");
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
    println!("   SECRET_KEY=1179001234567890 cargo run --bin callback-json\n");
    
    HttpServer::new(|| {
        App::new()
            .service(callback_handler)
            .service(health_check)
    })
    .bind(format!("127.0.0.1:{}", port))?
    .run()
    .await
}
