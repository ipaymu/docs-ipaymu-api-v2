package main

/**
 * iPaymu Callback Handler - Go (URL-encoded)
 *
 * Server berjalan di port 8080
 * Format: application/x-www-form-urlencoded
 *
 * Cara menjalankan:
 *   go run main-urlencoded.go
 *
 * Atau build dahulu:
 *   go build -o callback-urlencoded main-urlencoded.go
 *   ./callback-urlencoded
 */

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"sort"
	"strconv"
	"strings"
)

// Secret Key - Ganti dengan Nomor VA Anda!
var secretKey = getEnv("SECRET_KEY", "YOUR_VA_NUMBER_HERE")

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

/**
 * Normalisasi data dari form input
 * Mengkonversi tipe data ke format yang benar
 */
func normalizeData(data map[string]interface{}) map[string]interface{} {
	result := make(map[string]interface{})

	for key, val := range data {
		switch key {
		case "is_escrow":
			// Boolean
			switch v := val.(type) {
			case string:
				result[key] = v == "1" || v == "true"
			case bool:
				result[key] = v
			default:
				result[key] = false
			}

		case "trx_id", "status_code", "transaction_status_code", "paid_off":
			// Integer
			switch v := val.(type) {
			case string:
				if i, err := strconv.Atoi(v); err == nil {
					result[key] = i
				} else {
					result[key] = val
				}
			case float64:
				result[key] = int(v)
			default:
				result[key] = val
			}

		case "additional_info":
			// Array
			switch v := val.(type) {
			case string:
				if v == "[]" || v == "" {
					result[key] = []interface{}{}
				}
			case []interface{}:
				result[key] = v
			default:
				result[key] = []interface{}{}
			}

		default:
			// String
			result[key] = fmt.Sprintf("%v", val)
		}
	}

	// Pastikan additional_info ada
	if _, ok := result["additional_info"]; !ok {
		result["additional_info"] = []interface{}{}
	}

	return result
}

/**
 * Sort keys seperti PHP ksort (ascending A-Z)
 */
func phpKsort(data map[string]interface{}) map[string]interface{} {
	// Ambil semua key dan sort
	keys := make([]string, 0, len(data))
	for k := range data {
		keys = append(keys, k)
	}
	sort.Strings(keys) // Ascending A-Z

	// Buat map baru dengan urutan sorted
	sorted := make(map[string]interface{})
	for _, k := range keys {
		sorted[k] = data[k]
	}

	return sorted
}

/**
 * Generate HMAC-SHA256 signature
 */
func generateSignature(data map[string]interface{}) string {
	// Sort key
	sortedData := phpKsort(data)

	// Convert to JSON
	jsonBytes, _ := json.Marshal(sortedData)
	jsonBody := string(jsonBytes)

	// Escape slashes seperti PHP
	jsonBody = strings.ReplaceAll(jsonBody, "/", "\\/")

	// Generate HMAC-SHA256
	h := hmac.New(sha256.New, []byte(secretKey))
	h.Write([]byte(jsonBody))

	return hex.EncodeToString(h.Sum(nil))
}

// Handler untuk endpoint callback
func callbackHandler(w http.ResponseWriter, r *http.Request) {
	// Hanya terima POST
	if r.Method != http.MethodPost {
		http.Error(w, `{"status":"error","message":"Method Not Allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	// Parse form data
	if err := r.ParseForm(); err != nil {
		http.Error(w, `{"status":"error","message":"Invalid form data"}`, http.StatusBadRequest)
		return
	}

	// Ambil signature dari header
	receivedSignature := r.Header.Get("X-Signature")
	if receivedSignature == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{
			"status":  "error",
			"message": "Missing X-Signature header",
		})
		return
	}

	// Convert form data ke map
	data := make(map[string]interface{})
	for key, values := range r.Form {
		if len(values) > 0 {
			data[key] = values[0]
		}
	}

	// Hapus signature dari data
	delete(data, "signature")

	// Normalisasi data
	normalizedData := normalizeData(data)

	// Generate signature
	calculatedSignature := generateSignature(normalizedData)

	// Validasi signature
	w.Header().Set("Content-Type", "application/json")

	if hmac.Equal([]byte(calculatedSignature), []byte(receivedSignature)) {
		// TODO: Update status transaksi di database
		// TODO: Pastikan idempotency

		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{
			"status":  "OK",
			"message": "Callback processed successfully",
		})
	} else {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status":  "error",
			"message": "Invalid Signature",
			"debug": map[string]string{
				"received":   receivedSignature,
				"calculated": calculatedSignature,
			},
		})
	}
}

// Health check handler
func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status":  "OK",
		"service": "iPaymu Callback (URL-encoded)",
	})
}

func main() {
	port := getEnv("PORT", "8080")

	http.HandleFunc("/callback", callbackHandler)
	http.HandleFunc("/health", healthHandler)

	fmt.Println("═══════════════════════════════════════════════════")
	fmt.Println("  iPaymu Callback Handler - URL-encoded (Go)")
	fmt.Println("═══════════════════════════════════════════════════")
	fmt.Printf("  Server running on http://localhost:%s\n", port)
	fmt.Printf("  Endpoint: POST http://localhost:%s/callback\n", port)
	fmt.Printf("  Health Check: GET http://localhost:%s/health\n", port)
	fmt.Println("═══════════════════════════════════════════════════")
	fmt.Println()
	fmt.Println("⚠️  PENTING:")
	fmt.Println("   Ganti SECRET_KEY dengan Nomor VA Anda!")
	if secretKey == "YOUR_VA_NUMBER_HERE" {
		fmt.Println("   Secret Key saat ini: ❌ BELUM DIGANTI")
	} else {
		fmt.Println("   Secret Key saat ini: ✅ OK")
	}
	fmt.Println()
	fmt.Println("   Atau set via environment variable:")
	fmt.Printf("   SECRET_KEY=1179001234567890 go run main-urlencoded.go\n\n")

	if err := http.ListenAndServe(":"+port, nil); err != nil {
		fmt.Printf("Server error: %v\n", err)
	}
}
