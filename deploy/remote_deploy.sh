#!/usr/bin/env bash
set -euo pipefail

DEPLOY_PATH="${1:?Usage: remote_deploy.sh /home/<user>/apps/ipaymu-docs[-environment]}"
[[ "$DEPLOY_PATH" =~ ^/home/[a-zA-Z0-9_-]+/apps/ipaymu-docs[a-zA-Z0-9_-]*$ ]] || exit 1
cd "$DEPLOY_PATH"
set -a
source .deploy.env
set +a
bash deploy/validate-settings.sh
command -v docker >/dev/null
docker compose version >/dev/null
command -v curl >/dev/null
export COMPOSE_PROJECT_NAME="$PROJECT_NAME"

# Persist the last healthy image, not a mutable latest tag.
previous_image=""
if [[ -f .current-image ]]; then previous_image="$(<.current-image)"; fi
docker compose -f docker-compose.prod.yml config --quiet
docker compose -f docker-compose.prod.yml pull app

healthy() {
  for ((attempt=1; attempt<=30; attempt++)); do
    if curl --fail --silent --max-time 3 "http://127.0.0.1:$HOST_PORT/healthz" >/dev/null; then
      return 0
    fi
    sleep 2
  done
  return 1
}

if ! docker compose -f docker-compose.prod.yml up -d app || ! healthy; then
  docker compose -f docker-compose.prod.yml logs --tail 60 app >&2 || true
  if [[ "$previous_image" == "$REGISTRY_IMAGE:${previous_image##*:}" && "${previous_image##*:}" =~ ^[a-f0-9]{40}$ ]]; then
    echo "Restoring previous healthy image: $previous_image" >&2
    APP_IMAGE="$previous_image" docker compose -f docker-compose.prod.yml up -d app
    healthy || echo "Previous image also failed health check; inspect container logs" >&2
  fi
  exit 1
fi

printf '%s\n' "$APP_IMAGE" > .current-image
echo "App healthy on 127.0.0.1:$HOST_PORT ($APP_IMAGE)"
echo "Reverse proxy must already point $DOMAIN to this port; see deploy/README.md."
