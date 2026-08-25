#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH='' cd -- "$(dirname -- "$0")" && pwd)
PROJECT_DIR=$(CDPATH='' cd -- "$SCRIPT_DIR/../.." && pwd)
COMPOSE_FILE=${COMPOSE_FILE:-$PROJECT_DIR/compose.production.yaml}
ENV_FILE=${ENV_FILE:-$PROJECT_DIR/.env.production}
BACKUP_DIR=${BACKUP_DIR:-$PROJECT_DIR/backups}

usage() {
  printf 'Usage: %s DUMP_FILE --confirm-replace-database\n' "$0" >&2
  exit 2
}

[ "$#" -eq 2 ] || usage
DUMP_FILE=$1
[ "$2" = "--confirm-replace-database" ] || usage
[ -f "$DUMP_FILE" ] || {
  printf 'Dump file does not exist: %s\n' "$DUMP_FILE" >&2
  exit 1
}

compose() {
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" "$@"
}

"$SCRIPT_DIR/check-env.sh" "$ENV_FILE"

dump_dir=$(CDPATH='' cd -- "$(dirname -- "$DUMP_FILE")" && pwd)
dump_name=$(basename -- "$DUMP_FILE")
if [ -f "$DUMP_FILE.sha256" ]; then
  (
    cd "$dump_dir"
    sha256sum --check "$dump_name.sha256"
  )
fi

compose build api
compose up --detach postgres

attempt=1
while [ "$attempt" -le 30 ]; do
  if compose exec -T postgres pg_isready --username language --dbname language > /dev/null 2>&1; then
    break
  fi
  sleep 2
  attempt=$((attempt + 1))
done
[ "$attempt" -le 30 ] || {
  printf 'PostgreSQL did not become ready.\n' >&2
  exit 1
}

compose stop web api > /dev/null 2>&1 || true

printf 'Creating a pre-restore backup...\n'
ENV_FILE="$ENV_FILE" COMPOSE_FILE="$COMPOSE_FILE" BACKUP_DIR="$BACKUP_DIR" \
  "$SCRIPT_DIR/backup.sh"

compose exec -T postgres dropdb \
  --username language \
  --if-exists \
  --force \
  language
compose exec -T postgres createdb \
  --username language \
  --encoding UTF8 \
  --template template0 \
  language
compose exec -T postgres pg_restore \
  --username language \
  --dbname language \
  --exit-on-error \
  --no-owner \
  --no-acl < "$DUMP_FILE"

compose run --rm --no-deps migrate
compose up --detach api web

printf 'Database restored from %s. Verify the public health endpoint before switching DNS.\n' "$DUMP_FILE"
