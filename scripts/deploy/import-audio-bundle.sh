#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH='' cd -- "$(dirname -- "$0")" && pwd)
PROJECT_DIR=$(CDPATH='' cd -- "$SCRIPT_DIR/../.." && pwd)
COMPOSE_FILE=${COMPOSE_FILE:-$PROJECT_DIR/compose.production.yaml}
ENV_FILE=${ENV_FILE:-$PROJECT_DIR/.env.production}
BACKUP_DIR=${BACKUP_DIR:-/var/backups/morpho-learning}

fail() {
  printf 'Audio bundle import error: %s\n' "$1" >&2
  exit 1
}

[ "$#" -eq 1 ] || fail "usage: $0 AUDIO_BUNDLE.tar.gz"
bundle=$1
case "$bundle" in
  /*) ;;
  *) fail "bundle path must be absolute" ;;
esac
[ -f "$bundle" ] || fail "bundle does not exist: $bundle"
[ -f "$bundle.sha256" ] || fail "bundle checksum does not exist: $bundle.sha256"
[ -f "$ENV_FILE" ] || fail "$ENV_FILE does not exist"

bundle_directory=$(CDPATH='' cd -- "$(dirname -- "$bundle")" && pwd)
bundle_name=$(basename -- "$bundle")
(
  cd "$bundle_directory"
  sha256sum --check "$bundle_name.sha256"
)

tar -tzf "$bundle" | while IFS= read -r entry; do
  case "$entry" in
    audio | audio/ | audio/* | audio-manifest.json) ;;
    *) fail "unexpected archive entry: $entry" ;;
  esac
  case "$entry" in
    /* | ../* | */../* | */..) fail "unsafe archive entry: $entry" ;;
  esac
done

staging_directory=$(mktemp -d "$PROJECT_DIR/.audio-import.XXXXXX")
case "$staging_directory" in
  "$PROJECT_DIR"/.audio-import.*) ;;
  *) fail "mktemp returned an unsafe directory: $staging_directory" ;;
esac
cleanup() {
  case "$staging_directory" in
    "$PROJECT_DIR"/.audio-import.*) rm -rf -- "$staging_directory" ;;
  esac
}
trap cleanup EXIT HUP INT TERM

tar -xzf "$bundle" -C "$staging_directory"
[ -f "$staging_directory/audio-manifest.json" ] || fail "manifest is missing from bundle"
chmod 0755 "$staging_directory"
chmod 0644 "$staging_directory/audio-manifest.json"
find "$staging_directory/audio" -type d -exec chmod 0755 {} +
find "$staging_directory/audio" -type f -exec chmod 0644 {} +

compose() {
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" "$@"
}

[ -n "$(compose ps --status running --quiet postgres)" ] || fail "PostgreSQL is not running"
[ -n "$(compose ps --status running --quiet api)" ] || fail "API is not running"

printf 'Creating a pre-import database backup...\n'
ENV_FILE="$ENV_FILE" COMPOSE_FILE="$COMPOSE_FILE" BACKUP_DIR="$BACKUP_DIR" \
  "$SCRIPT_DIR/backup.sh"

compose run --rm --no-deps \
  --volume "$staging_directory:/import:ro" \
  api \
  node apps/api/dist/audio/import-audio-bundle.js \
    --manifest=/import/audio-manifest.json \
    --source-directory=/import \
    --audio-directory=/app/.data

compose exec -T api node -e \
  "fetch('http://127.0.0.1:3000/api/v1/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

printf 'Audio bundle imported and API health verified.\n'
