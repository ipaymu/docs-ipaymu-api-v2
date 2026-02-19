package main

/**
 * iPaymu Callback Handler - Go (JSON)
 *
 * Server berjalan di port 8081
 * Format: application/json
 *
 * Cara menjalankan:
 *   go run main-json.go
 *
 * Atau build dahulu:
 *   go build -o callback-json main-json.go
 *   ./callback-json
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
 * Sort keys seperti PHP ksort (ascending A-Z)
 */
func phpKsort(data map[string]interface{}) map[string]interface{} {
	keys := make([]string, 0, len(data))
	for k := range data {
		keys = append(keys, k)
	}
	sort.Strings(keys)

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
	sortedData := phpKsort(data)
	jsonBytes, _ := json.Marshal(sortedData)
	jsonBody := string(jsonBytes)
	jsonBody = strings.ReplaceAll(jsonBody, "/", "\\/")

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

	// Parse JSON body
	var data map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{
			"status":  "error",
			"message": "Invalid JSON",
		})
		return
	}

	// Ambil signature dari body atau header
	receivedSignature := ""
	if sig, ok := data["signature"].(string); ok && sig != "" {
		receivedSignature = sig
	} else {
		receivedSignature = r.Header.Get("X-Signature")
	}

	if receivedSignature == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{
			"status":  "error",
			"message": "Missing signature",
		})
		return
	}

	// Hapus signature dari data
	delete(data, "signature")

	// Generate signature
	calculatedSignature := generateSignature(data)

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
		"service": "iPaymu Callback (JSON)",
	})
}

func main() {
	port := getEnv("PORT", "8081")

	http.HandleFunc("/callback", callbackHandler)
	http.HandleFunc("/health", healthHandler)

	fmt.Println("═══════════════════════════════════════════════════")
	fmt.Println("  iPaymu Callback Handler - JSON (Go)")
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
	fmt.Printf("   SECRET_KEY=1179001234567890 go run main-json.go\n\n")

	if err := http.ListenAndServe(":"+port, nil); err != nil {
		fmt.Printf("Server error: %v\n", err)
	}
}
