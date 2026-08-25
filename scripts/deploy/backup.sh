#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH='' cd -- "$(dirname -- "$0")" && pwd)
PROJECT_DIR=$(CDPATH='' cd -- "$SCRIPT_DIR/../.." && pwd)
COMPOSE_FILE=${COMPOSE_FILE:-$PROJECT_DIR/compose.production.yaml}
ENV_FILE=${ENV_FILE:-$PROJECT_DIR/.env.production}
BACKUP_DIR=${BACKUP_DIR:-$PROJECT_DIR/backups}
BACKUP_RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-14}

case "$BACKUP_DIR" in
  "" | / | /home | /var | "$PROJECT_DIR")
    printf 'Refusing unsafe BACKUP_DIR: %s\n' "$BACKUP_DIR" >&2
    exit 1
    ;;
esac

case "$BACKUP_RETENTION_DAYS" in
  "" | *[!0-9]*)
    printf 'BACKUP_RETENTION_DAYS must be a non-negative integer.\n' >&2
    exit 1
    ;;
esac

compose() {
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" "$@"
}

mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"
umask 077

if [ -z "$(compose ps --status running --quiet postgres)" ]; then
  printf 'PostgreSQL is not running; no backup was created.\n' >&2
  exit 1
fi

timestamp=$(date -u +%Y%m%dT%H%M%SZ)
filename="language-$timestamp.dump"
target="$BACKUP_DIR/$filename"
temporary="$target.partial"
metadata="$target.meta"

cleanup() {
  rm -f "$temporary"
}
trap cleanup EXIT HUP INT TERM

compose exec -T postgres pg_dump \
  --username language \
  --dbname language \
  --format custom \
  --compress 9 \
  --no-owner \
  --no-acl > "$temporary"

compose exec -T postgres pg_restore --list < "$temporary" > /dev/null
mv "$temporary" "$target"

revision=unknown
if command -v git > /dev/null 2>&1; then
  revision=$(git -C "$PROJECT_DIR" rev-parse --verify HEAD 2>/dev/null || printf unknown)
fi

postgres_version=$(compose exec -T postgres postgres --version)
printf 'created_at=%s\ngit_revision=%s\npostgres_version=%s\n' \
  "$timestamp" "$revision" "$postgres_version" > "$metadata"

(
  cd "$BACKUP_DIR"
  sha256sum "$filename" > "$filename.sha256"
)

find "$BACKUP_DIR" -maxdepth 1 -type f \
  \( -name 'language-*.dump' -o -name 'language-*.dump.sha256' -o -name 'language-*.dump.meta' \) \
  -mtime "+$BACKUP_RETENTION_DAYS" -delete

printf 'Backup created: %s\n' "$target"
