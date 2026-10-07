#!/usr/bin/env bash
set -euo pipefail
: "${CI_PROJECT_DIR:?Missing CI_PROJECT_DIR}"
: "${CI_REGISTRY_IMAGE:?Missing CI_REGISTRY_IMAGE}"
: "${CI_REGISTRY:?Missing CI_REGISTRY}"
export REGISTRY_IMAGE="$CI_REGISTRY_IMAGE"
export APP_IMAGE="${CI_REGISTRY_IMAGE}:${CI_COMMIT_SHA:?Missing CI_COMMIT_SHA}"
export APP_MEMORY_LIMIT="${APP_MEMORY_LIMIT:-512m}"
export APP_CPU_LIMIT="${APP_CPU_LIMIT:-1.0}"
case "${ENV_NAME:-}" in
  staging)
    export DEPLOY_PATH="${DEPLOY_PATH_STAGING:-/home/deploy/apps/ipaymu-docs-staging}"
    export PROJECT_NAME="${PROJECT_NAME_STAGING:-ipaymu-docs-staging}"
    export HOST_PORT="${HOST_PORT_STAGING:-3031}"
    export DOMAIN="${STAGING_DOMAIN:?Set STAGING_DOMAIN}"
    ;;
  production)
    export DEPLOY_PATH="${DEPLOY_PATH_PRODUCTION:-/home/deploy/apps/ipaymu-docs-production}"
    export PROJECT_NAME="${PROJECT_NAME_PRODUCTION:-ipaymu-docs-production}"
    export HOST_PORT="${HOST_PORT_PRODUCTION:-3030}"
    export DOMAIN="${PRODUCTION_DOMAIN:?Set PRODUCTION_DOMAIN}"
    ;;
  *) echo "Invalid ENV_NAME" >&2; exit 1 ;;
esac
bash deploy/validate-settings.sh
export DOCKER_CONFIG="$CI_PROJECT_DIR/.ci-docker-deploy"
mkdir -p "$DOCKER_CONFIG"
chmod 700 "$DOCKER_CONFIG"
trap 'docker logout "$CI_REGISTRY" >/dev/null 2>&1 || true' EXIT
printf '%s' "${CI_REGISTRY_PASSWORD:?Missing CI_REGISTRY_PASSWORD}" |
  docker login "$CI_REGISTRY" -u "${CI_REGISTRY_USER:?Missing CI_REGISTRY_USER}" --password-stdin

# Copy only deployment files. Do not rsync/delete an entire repository on the VPS.
mkdir -p "$DEPLOY_PATH/deploy"
cp docker-compose.prod.yml "$DEPLOY_PATH/"
cp deploy/remote_deploy.sh deploy/validate-settings.sh "$DEPLOY_PATH/deploy/"
(
  umask 077
  {
    printf 'PROJECT_NAME=%s\nHOST_PORT=%s\nAPP_IMAGE=%s\n' "$PROJECT_NAME" "$HOST_PORT" "$APP_IMAGE"
    printf 'REGISTRY_IMAGE=%s\nDOMAIN=%s\nMCP_ALLOWED_ORIGINS=https://%s\n' "$REGISTRY_IMAGE" "$DOMAIN" "$DOMAIN"
    printf 'APP_MEMORY_LIMIT=%s\nAPP_CPU_LIMIT=%s\n' "$APP_MEMORY_LIMIT" "$APP_CPU_LIMIT"
  } > "$DEPLOY_PATH/.deploy.env"
)
bash "$DEPLOY_PATH/deploy/remote_deploy.sh" "$DEPLOY_PATH"
curl --fail --silent --show-error --retry 5 --retry-delay 3 "https://$DOMAIN/healthz"
docker run --rm --network host -e "SMOKE_BASE_URL=https://$DOMAIN" \
  --mount "type=bind,src=$CI_PROJECT_DIR/scripts/smoke-mcp.mjs,dst=/smoke-mcp.mjs,readonly" \
  --entrypoint node "$APP_IMAGE" /smoke-mcp.mjs
