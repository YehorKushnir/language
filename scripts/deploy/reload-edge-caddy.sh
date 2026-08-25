#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH='' cd -- "$(dirname -- "$0")" && pwd)
PROJECT_DIR=$(CDPATH='' cd -- "$SCRIPT_DIR/../.." && pwd)
EDGE_CADDY_CONTAINER=${EDGE_CADDY_CONTAINER:-framed-caddy-1}
EDGE_SITES_DIR=${EDGE_SITES_DIR:-/home/deploy/caddy-sites}
SOURCE_FILE=$PROJECT_DIR/deploy/caddy-sites/morpho-learning.caddy
TARGET_FILE=$EDGE_SITES_DIR/morpho-learning.caddy
BACKUP_FILE=$EDGE_SITES_DIR/.morpho-learning.caddy.previous

[ -f "$SOURCE_FILE" ] || {
  printf 'Caddy site source is missing: %s\n' "$SOURCE_FILE" >&2
  exit 1
}

docker inspect "$EDGE_CADDY_CONTAINER" > /dev/null
mkdir -p "$EDGE_SITES_DIR"

had_previous=false
if [ -f "$TARGET_FILE" ]; then
  cp "$TARGET_FILE" "$BACKUP_FILE"
  had_previous=true
fi

install -m 0644 "$SOURCE_FILE" "$TARGET_FILE"

rollback() {
  if [ "$had_previous" = true ]; then
    mv "$BACKUP_FILE" "$TARGET_FILE"
  else
    rm -f "$TARGET_FILE"
  fi
}

if ! docker exec "$EDGE_CADDY_CONTAINER" \
  caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
then
  rollback
  printf 'Caddy validation failed; the previous site config was restored.\n' >&2
  exit 1
fi

if ! docker exec "$EDGE_CADDY_CONTAINER" \
  caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile
then
  rollback
  docker exec "$EDGE_CADDY_CONTAINER" \
    caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile || true
  printf 'Caddy reload failed; the previous site config was restored.\n' >&2
  exit 1
fi

rm -f "$BACKUP_FILE"
printf 'Shared Caddy reloaded with %s.\n' "$TARGET_FILE"
