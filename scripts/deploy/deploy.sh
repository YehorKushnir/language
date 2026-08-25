#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH='' cd -- "$(dirname -- "$0")" && pwd)
PROJECT_DIR=$(CDPATH='' cd -- "$SCRIPT_DIR/../.." && pwd)
COMPOSE_FILE=${COMPOSE_FILE:-$PROJECT_DIR/compose.production.yaml}
ENV_FILE=${ENV_FILE:-${1:-$PROJECT_DIR/.env.production}}
BACKUP_DIR=${BACKUP_DIR:-$PROJECT_DIR/backups}

compose() {
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" "$@"
}

command -v docker > /dev/null 2>&1 || {
  printf 'Docker is required.\n' >&2
  exit 1
}
docker compose version > /dev/null

"$SCRIPT_DIR/check-env.sh" "$ENV_FILE"
compose config --quiet

if [ -n "$(compose ps --status running --quiet postgres)" ]; then
  printf 'Creating a pre-deploy database backup...\n'
  ENV_FILE="$ENV_FILE" COMPOSE_FILE="$COMPOSE_FILE" BACKUP_DIR="$BACKUP_DIR" \
    "$SCRIPT_DIR/backup.sh"
fi

compose build --pull
compose up --detach --remove-orphans

domain=$(awk -F= '/^APP_DOMAIN=/{value=substr($0, index($0, "=") + 1)} END{print value}' "$ENV_FILE")
health_url="https://$domain/api/v1/health"
attempt=1
while [ "$attempt" -le 40 ]; do
  if curl --fail --silent --show-error --max-time 10 "$health_url" > /dev/null 2>&1; then
    printf 'Deployment is healthy: %s\n' "$health_url"
    exit 0
  fi
  sleep 3
  attempt=$((attempt + 1))
done

printf 'Deployment did not become healthy at %s.\n' "$health_url" >&2
compose ps >&2
compose logs --tail 100 migrate api web >&2
exit 1
