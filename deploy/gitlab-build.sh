#!/usr/bin/env bash
set -euo pipefail
: "${CI_REGISTRY_IMAGE:?Enable the GitLab Container Registry}"
: "${CI_REGISTRY:?Missing CI_REGISTRY}"
: "${CI_PROJECT_DIR:?Missing CI_PROJECT_DIR}"
export APP_IMAGE="${CI_REGISTRY_IMAGE}:${CI_COMMIT_SHA:?Missing CI_COMMIT_SHA}"
export DOCKER_CONFIG="$CI_PROJECT_DIR/.ci-docker-build"
mkdir -p "$DOCKER_CONFIG"
chmod 700 "$DOCKER_CONFIG"
smoke_container="ipaymu-docs-smoke-${CI_JOB_ID:?Missing CI_JOB_ID}"
cleanup() {
  docker logs --tail 60 "$smoke_container" 2>/dev/null || true
  docker rm -f "$smoke_container" >/dev/null 2>&1 || true
  docker logout "$CI_REGISTRY" >/dev/null 2>&1 || true
}
trap cleanup EXIT

# MR pipelines verify without publishing. Branch/tag pipelines use job credentials.
if [[ "${CI_PIPELINE_SOURCE:-}" != "merge_request_event" ]]; then
  printf '%s' "${CI_REGISTRY_PASSWORD:?Missing CI_REGISTRY_PASSWORD}" |
    docker login "$CI_REGISTRY" -u "${CI_REGISTRY_USER:?Missing CI_REGISTRY_USER}" --password-stdin
fi
docker build -t "$APP_IMAGE" .
docker run -d --name "$smoke_container" --memory 512m "$APP_IMAGE"
# Run the probe from the same network namespace; no Node install needed on runner.
ready=false
for ((attempt=1; attempt<=30; attempt++)); do
  if [[ "$(docker inspect --format '{{.State.Health.Status}}' "$smoke_container")" == healthy ]]; then
    ready=true
    break
  fi
  sleep 2
done
"$ready"
docker run --rm --network "container:$smoke_container" \
  -e SMOKE_BASE_URL=http://127.0.0.1:3000 \
  --mount "type=bind,src=$CI_PROJECT_DIR/scripts/smoke-mcp.mjs,dst=/smoke-mcp.mjs,readonly" \
  --entrypoint node "$APP_IMAGE" /smoke-mcp.mjs
if [[ "${CI_PIPELINE_SOURCE:-}" != "merge_request_event" ]]; then
  docker push "$APP_IMAGE"
fi
