package main

/**
 * iPaymu Callback Handler - Go (URL-encoded)
 *
 * Server berjalan di port 8080
 * Format: application/x-www-form-urlencoded
 *
 * Cara menjalankan:
 *   go run main-urlencoded.go
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

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}

var secretKey = getEnv("SECRET_KEY", "123456")

func normalizeData(data map[string]interface{}) map[string]interface{} {
	result := make(map[string]interface{})

	for key, val := range data {
		switch key {
		case "is_escrow":
			switch v := val.(type) {
			case string:
				if v == "1" || strings.ToLower(v) == "true" {
					result[key] = 1
				} else {
					result[key] = 0
				}
			case bool:
				if v {
					result[key] = 1
				} else {
					result[key] = 0
				}
			case float64, int, int64:
				result[key] = v
			default:
				result[key] = 0
			}
		case "trx_id", "status_code", "transaction_status_code", "paid_off", "sub_total", "total", "amount", "fee":
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
			switch v := val.(type) {
			case string:
				if v == "[]" || v == "" {
					result[key] = []interface{}{}
				} else {
					var arr []interface{}
					if err := json.Unmarshal([]byte(v), &arr); err == nil {
						result[key] = arr
					} else {
						result[key] = []interface{}{}
					}
				}
			case []interface{}:
				result[key] = v
			default:
				result[key] = []interface{}{}
			}
		default:
			result[key] = fmt.Sprintf("%v", val)
		}
	}

	if _, ok := result["additional_info"]; !ok {
		result["additional_info"] = []interface{}{}
	}

	return result
}

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

func generateSignature(data map[string]interface{}) string {
	normalizedData := normalizeData(data)
	if _, ok := normalizedData["signature"]; ok {
		delete(normalizedData, "signature")
	}

	sortedData := phpKsort(normalizedData)
	jsonBytes, _ := json.Marshal(sortedData)
	jsonBody := string(jsonBytes)
	jsonBody = strings.ReplaceAll(jsonBody, "/", "\\/")

	h := hmac.New(sha256.New, []byte(secretKey))
	h.Write([]byte(jsonBody))

	return hex.EncodeToString(h.Sum(nil))
}

func callbackHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, `{"status":"error","message":"Method Not Allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	if err := r.ParseForm(); err != nil {
		http.Error(w, `{"status":"error","message":"Invalid form data"}`, http.StatusBadRequest)
		return
	}

	receivedSignature := r.Header.Get("X-Signature")
	if receivedSignature == "" {
		receivedSignature = r.FormValue("signature")
	}

	if receivedSignature == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{
			"status":  "error",
			"message": "Missing X-Signature header",
		})
		return
	}

	data := make(map[string]interface{})
	for key, values := range r.Form {
		if len(values) > 0 {
			data[key] = values[0]
		}
	}

	calculatedSignature := generateSignature(data)

	w.Header().Set("Content-Type", "application/json")
	if hmac.Equal([]byte(calculatedSignature), []byte(receivedSignature)) {
		fmt.Println("✅ Signature valid!")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{
			"status":  "OK",
			"message": "Callback processed successfully",
		})
	} else {
		fmt.Printf("❌ Invalid signature! Expected: %s, Got: %s\n", receivedSignature, calculatedSignature)
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

func main() {
	port := getEnv("PORT", "8080")

	http.HandleFunc("/callback", callbackHandler)

	fmt.Println("═══════════════════════════════════════════════════")
	fmt.Println("  iPaymu Callback Handler - URL-encoded (Go)")
	fmt.Println("═══════════════════════════════════════════════════")
	fmt.Printf("  Server running on http://localhost:%s\n", port)
	fmt.Printf("  Endpoint: POST http://localhost:%s/callback\n", port)
	fmt.Println("═══════════════════════════════════════════════════")

	if err := http.ListenAndServe(":"+port, nil); err != nil {
		fmt.Printf("Server error: %v\n", err)
	}
}
