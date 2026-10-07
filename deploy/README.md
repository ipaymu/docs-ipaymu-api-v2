# Deploy docs iPaymu ke GitLab internal dan VPS

Repository tujuan: `git@gitlab.ipaymu.com:ipaymu-ecosystem/ipaymu/docs-ipaymu-api-v2.git`.

Pola deployment mengikuti my-hallobali: GitLab shell runner → Docker image → GitLab Container Registry → Docker Compose → reverse proxy → health check. Build menggunakan **npm dan Node 22** di Dockerfile, bukan Bun. Credential registry menggunakan variable bawaan GitLab, tidak perlu GHCR atau SSH deployment key.

Docs tetap diprerender saat build. Next.js standalone menyediakan runtime `/api/mcp`, dengan tool `searchDocumentation` dan `getPage` untuk docs publik ID/EN, plugin, dan verifikasi. Close API tidak tersedia lewat MCP. Tidak diperlukan API key model AI untuk dua tool ini.

**Repository private tidak otomatis membuat website atau MCP private.** Endpoint MCP ini membaca dokumentasi publik tanpa autentikasi. Jika akses website/MCP juga harus internal, pasang pembatasan akses di reverse proxy atau jaringan dan sesuaikan client serta smoke check sebelum deployment.

## Runner dan beban VPS

Pipeline menggunakan shell runner dengan Docker Engine (BuildKit), Docker Compose plugin, Bash, dan curl. Runner deploy harus berada di VPS tujuan dan memiliki izin menulis direktori aplikasi serta menjalankan Docker. Node/npm tidak perlu dipasang di host runner karena build dan smoke check memakai container.

Default `BUILD_RUNNER_TAG` dan `DEPLOY_RUNNER_TAG` adalah `hostinger-runner`, sesuai my-hallobali. Jika memakai default, **build tetap dilakukan di VPS tersebut**. npm tidak menjamin build Next.js lebih cepat atau lebih hemat memori daripada Bun.

Agar VPS hanya menjalankan aplikasi, daftarkan shell runner Docker pada mesin build terpisah yang lebih kuat, lalu set `BUILD_RUNNER_TAG` ke tag runner tersebut. Biarkan `DEPLOY_RUNNER_TAG=hostinger-runner`. Runner wajib diaktifkan untuk project docs ini. Job akan pending jika tidak ada runner yang cocok.

Runner dengan akses Docker memiliki akses sensitif ke host. Pakai runner khusus project/namespace terpercaya; review perubahan pipeline sebelum merge. Protect branch/tag/environment production sesuai kebijakan internal. Pipeline ini tidak menjalankan MR dari project fork.

## Alur CI/CD

- Merge request internal: build image dan smoke check MCP, tanpa publish/deploy.
- Push ke `main`: build, smoke check, publish image bertag **full commit SHA**, tanpa deploy otomatis.
- Push ke `staging`: build, smoke check, publish, deploy staging.
- Tag `v*`: build, smoke check, publish; deployment production melalui tombol manual `deploy_production`.
- Build → Pipelines → **New pipeline** pada `main`: setelah build berhasil, klik job manual `deploy_production`.

Deployment diserialisasi per environment lewat `resource_group`. GitHub Actions runtime lama digantikan `.gitlab-ci.yml`. Workflow GitHub Pages/Hostinger statis tetap tersimpan sebagai arsip/preview manual jika repo pernah digunakan di GitHub, tetapi tidak dijalankan GitLab. Static export tidak menyediakan runtime MCP.

## Variables GitLab

Aktifkan Container Registry project. `CI_REGISTRY`, `CI_REGISTRY_IMAGE`, `CI_REGISTRY_USER`, dan `CI_REGISTRY_PASSWORD` disediakan GitLab; jangan hardcode hostname registry karena dapat berbeda dari hostname GitLab atau memakai port khusus.

Di Settings → CI/CD → Variables, tambahkan:

| Variable                  | Contoh                                     | Catatan                                                                |
| ------------------------- | ------------------------------------------ | ---------------------------------------------------------------------- |
| `STAGING_DOMAIN`          | `staging-docs.ipaymu.com`                  | Hostname staging tanpa `https://`                                      |
| `PRODUCTION_DOMAIN`       | `docs.ipaymu.com`                          | Hostname production tanpa `https://`                                   |
| `BUILD_RUNNER_TAG`        | `hostinger-runner`                         | Override ke runner build terpisah untuk mengurangi beban VPS           |
| `DEPLOY_RUNNER_TAG`       | `hostinger-runner`                         | Shell runner di VPS tujuan                                             |
| `DEPLOY_PATH_STAGING`     | `/home/deploy/apps/ipaymu-docs-staging`    | Default; direktori khusus aplikasi                                     |
| `DEPLOY_PATH_PRODUCTION`  | `/home/deploy/apps/ipaymu-docs-production` | Default; harus mengikuti `/home/<user>/apps/ipaymu-docs[-environment]` |
| `PROJECT_NAME_STAGING`    | `ipaymu-docs-staging`                      | Default nama Compose staging                                           |
| `PROJECT_NAME_PRODUCTION` | `ipaymu-docs-production`                   | Default nama Compose production                                        |
| `HOST_PORT_STAGING`       | `3031`                                     | Default, dibind ke localhost                                           |
| `HOST_PORT_PRODUCTION`    | `3030`                                     | Default, dibind ke localhost                                           |
| `APP_MEMORY_LIMIT`        | `512m`                                     | Batas runtime, bukan batas memori build                                |
| `APP_CPU_LIMIT`           | `1.0`                                      | Batas CPU runtime                                                      |

`STAGING_DOMAIN` diperlukan untuk deploy staging; `PRODUCTION_DOMAIN` untuk production. Sesuaikan environment scope dan protected variables dengan branch/tag yang digunakan. Credential registry per-job hanya berlaku selama job berjalan; rollback manual di luar CI perlu login memakai deploy token `read_registry`, bukan menyimpan token job.

## Persiapan VPS sekali saja

VPS memerlukan Docker, Compose, curl, reverse proxy, serta TLS valid. User runner harus dapat menulis `DEPLOY_PATH`. CI tidak memasang paket OS atau mengganti web server yang sudah ada.

Arahkan DNS domain ke VPS. Untuk Nginx, gunakan `deploy/nginx.conf.template`, mengganti **hanya** placeholder `DOMAIN` dan `HOST_PORT`:

```bash
export DOMAIN=docs.ipaymu.com HOST_PORT=3030
envsubst '${DOMAIN} ${HOST_PORT}' < deploy/nginx.conf.template
```

Pasang hasilnya ke server block khusus docs, aktifkan site, jalankan `nginx -t`, lalu reload. Jika menggunakan Caddy/FrankenPHP, arahkan reverse proxy domain docs ke `127.0.0.1:3030`; jangan menjalankan Nginx kedua pada port 80/443 yang sama.

Untuk Nginx yang sudah terpasang dan site HTTP sudah aktif, administrator dapat mengaktifkan TLS:

```bash
sudo certbot --nginx -d docs.ipaymu.com --redirect --email EMAIL_ADMIN --agree-tos
```

Lokasi `/api/mcp` tidak boleh dicache dan buffering SSE harus dimatikan, seperti pada template. Ini juga mendukung client lama yang menerima respons SSE.

## Pemeriksaan dan rollback

```bash
curl -f https://docs.ipaymu.com/healthz
SMOKE_BASE_URL=https://docs.ipaymu.com node scripts/smoke-mcp.mjs
```

Daftarkan `https://docs.ipaymu.com/api/mcp` pada aplikasi AI yang mendukung MCP HTTP. GET langsung menghasilkan `405`, normal karena MCP memakai POST. Origin browser dibatasi ke domain deployment. Client tanpa Origin tetap dapat membaca docs publik.

Di VPS:

```bash
cd /home/deploy/apps/ipaymu-docs-production
set -a
source .deploy.env
set +a
export COMPOSE_PROJECT_NAME="$PROJECT_NAME"
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs --tail 100 app
```

Jika startup/health check lokal gagal, script mengembalikan image terakhir yang sehat dan job tetap gagal. Deployment pertama tidak memiliki image untuk rollback. Jika pemeriksaan HTTPS/MCP gagal sementara app lokal sehat, periksa DNS/TLS/reverse proxy; rollback otomatis hanya mencakup startup/health lokal. Pergantian satu container dapat menimbulkan jeda singkat, bukan zero-downtime.

Rollback manual: login registry dengan deploy token `read_registry`, ganti `APP_IMAGE` di `.deploy.env` ke image commit sebelumnya yang sudah lolos CI (dari project registry yang sama), lalu jalankan `bash deploy/remote_deploy.sh "$PWD"`. Jangan gunakan `latest`. Script CI hanya menyalin file deployment yang diperlukan, tanpa `rsync --delete` seluruh repository.

## Lokal

```bash
npm ci
npm run dev
npm run build
PORT=3030 npm start
# Terminal lain:
node scripts/smoke-mcp.mjs
# Export statis terpisah:
npm run build:export
```

Jangan menjalankan build standalone dan export bersamaan pada checkout yang sama karena keduanya memakai `.next`. Dokumen Close API untuk ipaymu-core tetap dibuat lewat `npm run build:close-api-content`, yang menggunakan static export.

## Push pertama ke GitLab

Tidak perlu `git init` ulang, menghapus history, mengubah config global, atau force push. Jika origin masih GitHub:

```bash
git remote rename origin old-origin
git remote add origin git@gitlab.ipaymu.com:ipaymu-ecosystem/ipaymu/docs-ipaymu-api-v2.git
git status
# Review perubahan sebelum staging/commit.
git add .
git commit -m "Configure npm runtime MCP and GitLab CI deployment"
git push -u origin main
```

Jika origin sudah GitLab, lewati dua perintah remote. Push hanya branch/tag yang memang diperlukan, bukan `--all`/`--tags` tanpa review. Untuk produksi bertag, setelah konfigurasi siap buat tag rilis yang disepakati, push tag tersebut, lalu klik `deploy_production`.
