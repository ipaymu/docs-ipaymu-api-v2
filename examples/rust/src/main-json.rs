use actix_web::{web, App, HttpResponse, HttpServer, post, HttpRequest};
use hmac::{Hmac, Mac};
use sha2::Sha256;
use serde_json::{Value, Map};
use std::collections::BTreeMap;

// Tipe untuk HMAC-SHA256
type HmacSha256 = Hmac<Sha256>;

const SECRET_KEY: &str = "123456"; // Nomor VA akun iPaymu Anda (lihat di Dashboard > Integration > API Key)

fn php_ksort(data: &Map<String, Value>) -> BTreeMap<String, Value> {
    // BTreeMap otomatis sorted berdasarkan key
    let mut sorted = BTreeMap::new();
    for (k, v) in data.iter() {
        sorted.insert(k.clone(), v.clone());
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
    
    // Generate HMAC-SHA256
    let mut mac = HmacSha256::new_from_slice(SECRET_KEY.as_bytes())
        .expect("HMAC can take key of any size");
    mac.update(json_body.as_bytes());
    
    hex::encode(mac.finalize().into_bytes())
}

#[post("/callback")]
async fn callback_handler(req: HttpRequest, body: web::Json<serde_json::Value>) -> HttpResponse {
    // Ambil signature dari header
    let received_sig = req.headers()
        .get("X-Signature")
        .and_then(|h| h.to_str().ok())
        .unwrap_or("");
    
    // Convert JSON data ke Map
    let mut data = Map::new();
    if let Value::Object(map) = body.into_inner() {
        for (k, v) in map {
            if k != "signature" {
                data.insert(k, v);
            }
        }
    }
    
    // Generate signature
    let calculated_sig = generate_signature(&data);
    
    // Validasi
    if calculated_sig == received_sig {
        println!("✅ Signature valid");
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
    println!("Server running on :8080");
    HttpServer::new(|| {
        App::new().service(callback_handler)
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}