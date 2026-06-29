# Area API (Indonesian Regions)

Read-only lookup endpoints for Indonesian administrative regions: **Province → City → District → Village**. Typically used to populate cascading dropdowns (e.g. address forms, verification, shipping).

The list is hierarchical: pick a province to get its cities, pick a city to get its districts, and so on. Each endpoint returns the region `code` used as the parameter for the next level down.

---

## Base URL

| Environment | Base URL |
|-------------|----------|
| Production  | `https://my.ipaymu.com/api` |
| Sandbox     | `https://sandbox.ipaymu.com/api` |

> Adjust to your deployment. Locally this maps to `{APP_URL}/api`.

All Area endpoints are under the `/areas` prefix.

---

## Authentication

Every request must be signed. The signature middleware (`signaturecheck`) requires these **HTTP headers**:

| Header      | Required | Description |
|-------------|----------|-------------|
| `va`        | ✅ Yes   | Your iPaymu Virtual Account number (the account's `baccount`). |
| `signature` | ✅ Yes   | HMAC-SHA256 signature of the request (see below). |
| `timestamp` | Recommended | Request timestamp, format `YYYYMMDDHHmmss`. |
| `Content-Type` | ✅ Yes | `application/json` |

The account tied to the `va` must be **active** and have an **API key**.

### Signature generation

```
requestBody  = lowercase( sha256( <raw request body> ) )
stringToSign = <HTTP_METHOD> + ":" + <VA> + ":" + requestBody + ":" + <API_KEY>
signature    = hmac_sha256( stringToSign, <API_KEY> )
```

Notes:
- `<HTTP_METHOD>` must be **upper-case** (`GET`).
- For requests **without a body** (all Area GET endpoints), use the empty JSON object `{}` as the body when hashing — i.e. `requestBody = sha256("{}")`.
- `<API_KEY>` is used **both** as part of `stringToSign` and as the HMAC secret key.

#### Example — PHP

```php
$va     = '0000001234567890';
$apiKey = 'YOUR_API_KEY';
$method = 'GET';

$body        = '{}'; // no request body for Area endpoints
$requestBody = strtolower(hash('sha256', $body));
$stringToSign = $method . ':' . $va . ':' . $requestBody . ':' . $apiKey;
$signature   = hash_hmac('sha256', $stringToSign, $apiKey);
$timestamp   = date('YmdHis');
```

#### Example — Node.js

```js
const crypto = require('crypto');

const va = '0000001234567890';
const apiKey = 'YOUR_API_KEY';
const method = 'GET';

const body = '{}';
const requestBody = crypto.createHash('sha256').update(body).digest('hex').toLowerCase();
const stringToSign = `${method}:${va}:${requestBody}:${apiKey}`;
const signature = crypto.createHmac('sha256', apiKey).update(stringToSign).digest('hex');
const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
```

---

## Response envelope

All responses share the same wrapper:

```json
{
  "Status": 200,
  "Success": true,
  "Message": "Success",
  "Data": []
}
```

| Field     | Type    | Description |
|-----------|---------|-------------|
| `Status`  | integer | HTTP status code, mirrored in the body. |
| `Success` | boolean | `true` on success, `false` on error. |
| `Message` | string  | Human-readable message. |
| `Data`    | array \| null | Result payload (an array of region objects). |

---

## Endpoints

### 1. Get Provinces

Returns all provinces, ordered by name (A→Z).

```
GET /areas/province
```

**Parameters:** none

**Example request**

```bash
curl --location 'https://my.ipaymu.com/api/areas/province' \
  --header 'Content-Type: application/json' \
  --header 'va: 0000001234567890' \
  --header 'signature: <generated-signature>' \
  --header 'timestamp: 20260629103000'
```

**Example response** `200 OK`

```json
{
  "Status": 200,
  "Success": true,
  "Message": "Success",
  "Data": [
    { "code": "11", "name": "ACEH" },
    { "code": "51", "name": "BALI" },
    { "code": "36", "name": "BANTEN" }
  ]
}
```

---

### 2. Get Cities by Province

Returns the cities/regencies belonging to a province.

```
GET /areas/city/{province}
```

**Path parameters**

| Param      | Type   | Description |
|------------|--------|-------------|
| `province` | string | Province `code` (from the Provinces endpoint). |

**Example request**

```bash
curl --location 'https://my.ipaymu.com/api/areas/city/51' \
  --header 'Content-Type: application/json' \
  --header 'va: 0000001234567890' \
  --header 'signature: <generated-signature>' \
  --header 'timestamp: 20260629103000'
```

**Example response** `200 OK`

```json
{
  "Status": 200,
  "Success": true,
  "Message": "Success",
  "Data": [
    { "code": "5171", "name": "KOTA DENPASAR" },
    { "code": "5103", "name": "KABUPATEN BADUNG" }
  ]
}
```

---

### 3. Get Districts by City

Returns the districts (kecamatan) belonging to a city.

```
GET /areas/district/{city}
```

**Path parameters**

| Param  | Type   | Description |
|--------|--------|-------------|
| `city` | string | City `code` (from the Cities endpoint). |

**Example request**

```bash
curl --location 'https://my.ipaymu.com/api/areas/district/5171' \
  --header 'Content-Type: application/json' \
  --header 'va: 0000001234567890' \
  --header 'signature: <generated-signature>' \
  --header 'timestamp: 20260629103000'
```

**Example response** `200 OK`

```json
{
  "Status": 200,
  "Success": true,
  "Message": "Success",
  "Data": [
    { "code": "517101", "name": "DENPASAR SELATAN" },
    { "code": "517102", "name": "DENPASAR TIMUR" }
  ]
}
```

---

### 4. Get Villages by District

Returns the villages (kelurahan/desa) belonging to a district. Village objects also include a **postal code**.

```
GET /areas/village/{district}
```

**Path parameters**

| Param      | Type   | Description |
|------------|--------|-------------|
| `district` | string | District `code` (from the Districts endpoint). |

**Example request**

```bash
curl --location 'https://my.ipaymu.com/api/areas/village/517101' \
  --header 'Content-Type: application/json' \
  --header 'va: 0000001234567890' \
  --header 'signature: <generated-signature>' \
  --header 'timestamp: 20260629103000'
```

**Example response** `200 OK`

```json
{
  "Status": 200,
  "Success": true,
  "Message": "Success",
  "Data": [
    { "code": "5171011001", "name": "SANUR", "postal_code": "80227" },
    { "code": "5171011002", "name": "RENON", "postal_code": "80226" }
  ]
}
```

---

## Field reference

**Province / City / District**

| Field  | Type   | Description |
|--------|--------|-------------|
| `code` | string | Region code. Use it as the path parameter for the next level. |
| `name` | string | Region name. |

**Village** (same as above, plus)

| Field         | Type           | Description |
|---------------|----------------|-------------|
| `postal_code` | string \| null | Postal code (`null` if unavailable). |

---

## Error responses

On authentication failure the request is rejected before reaching the controller:

| Status | Message | Cause |
|--------|---------|-------|
| `401`  | `invalid header param - va is required` | Missing `va` header. |
| `401`  | `invalid header param - signature is required` | Missing `signature` header. |
| `401`  | `unauthorized credential` | `va` not found, inactive account, or no API key. |
| `401`  | `unauthorized signature` | Signature does not match. |

**Example error**

```json
{
  "Status": 401,
  "Success": false,
  "Message": "unauthorized signature",
  "Data": null
}
```

> A valid request for a code that has no children (or an unknown code) returns `200` with an empty `Data` array (`[]`).

---

## Notes

- **Method:** Documented as `GET`. The routes accept any HTTP method, but use `GET` consistently so it matches the method used in your signature.
- **Caching:** Region data is static; cache responses on the client to reduce calls.
- **Ordering:** Provinces are returned A→Z by name. Cities, districts, and villages are returned in the database's natural order.
