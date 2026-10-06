import type { EndpointEntry } from "@/components/environment";

const ENDPOINTS: Record<string, EndpointEntry[]> = {
  "payment/payment-channels": [{ method: "GET", path: "/api/v2/payment-channels" }],
  "payment/redirect-payment": [{ method: "POST", path: "/api/v2/payment" }],
  "payment/direct-payment": [{ method: "POST", path: "/api/v2/payment/direct" }],
  "transaction/check-transaction": [{ method: "POST", path: "/api/v2/transaction" }],
  "transaction/history-transaction": [{ method: "POST", path: "/api/v2/history" }],
  "balance/check-balance": [{ method: "POST", path: "/api/v2/balance" }],
  cod: [
    { method: "POST", path: "/api/v2/payment/direct", label: "COD" },
    { method: "POST", path: "/api/v2/payment/area", label: "Get Area" },
    { method: "POST", path: "/api/v2/payment/shipping", label: "Calculate Shipping" },
    { method: "POST", path: "/api/v2/payment/label", label: "Download Label" },
    { method: "POST", path: "/api/v2/payment/tracking", label: "Tracking" },
    { method: "POST", path: "/api/v2/payment/pickup", label: "Request Pickup" },
  ],
  "area-api": [
    { method: "GET", path: "/api/areas/province", label: "Provinces" },
    { method: "GET", path: "/api/areas/city/{province}", label: "Cities" },
    { method: "GET", path: "/api/areas/district/{city}", label: "Districts" },
    { method: "GET", path: "/api/areas/village/{district}", label: "Villages" },
  ],
  callback: [],
};

export function getDocsEndpoints(slug?: string[]): EndpointEntry[] {
  return ENDPOINTS[slug?.join("/") ?? ""] ?? [{ path: "/api/v2" }];
}
