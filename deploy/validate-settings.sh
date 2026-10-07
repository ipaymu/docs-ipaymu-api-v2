#!/usr/bin/env bash
set -euo pipefail

# Restrict values before writing deployment configuration or inserting in Nginx.
[[ "${DEPLOY_PATH:-}" =~ ^/home/[a-zA-Z0-9_-]+/apps/ipaymu-docs[a-zA-Z0-9_-]*$ ]] || { echo "DEPLOY_PATH must be /home/<user>/apps/ipaymu-docs[-environment]" >&2; exit 1; }
[[ "${PROJECT_NAME:-}" =~ ^ipaymu-docs[a-zA-Z0-9_-]*$ ]] || { echo "Invalid PROJECT_NAME" >&2; exit 1; }
[[ "${DOMAIN:-}" =~ ^[a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}$ ]] || { echo "Invalid DOMAIN" >&2; exit 1; }
[[ "${HOST_PORT:-}" =~ ^[0-9]{4,5}$ ]] && ((10#$HOST_PORT >= 1024 && 10#$HOST_PORT <= 65535)) || { echo "Invalid HOST_PORT" >&2; exit 1; }
[[ "${REGISTRY_IMAGE:-}" =~ ^[a-z0-9][a-z0-9.-]*(:[0-9]{1,5})?/[a-z0-9._-]+(/[a-z0-9._-]+)*$ ]] || { echo "Invalid REGISTRY_IMAGE" >&2; exit 1; }
[[ "${APP_IMAGE:-}" == "$REGISTRY_IMAGE:${APP_IMAGE##*:}" && "${APP_IMAGE##*:}" =~ ^[a-f0-9]{40}$ ]] || { echo "APP_IMAGE must use this project's registry and a full commit SHA tag" >&2; exit 1; }
[[ "${APP_MEMORY_LIMIT:-}" =~ ^[0-9]+[mg]$ ]] || { echo "Invalid APP_MEMORY_LIMIT" >&2; exit 1; }
[[ "${APP_CPU_LIMIT:-}" =~ ^[0-9]+(\.[0-9]+)?$ ]] || { echo "Invalid APP_CPU_LIMIT" >&2; exit 1; }
