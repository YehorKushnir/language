#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH='' cd -- "$(dirname -- "$0")" && pwd)
PROJECT_DIR=$(CDPATH='' cd -- "$SCRIPT_DIR/../.." && pwd)
COMPOSE_FILE=${COMPOSE_FILE:-$PROJECT_DIR/compose.production.yaml}
GENERATION_COMPOSE_FILE=${GENERATION_COMPOSE_FILE:-$PROJECT_DIR/compose.audio-generation.yaml}
ENV_FILE=${ENV_FILE:-$PROJECT_DIR/.env.production}

fail() {
  printf 'Audio generation configuration error: %s\n' "$1" >&2
  exit 1
}

read_value() {
  awk -v key="$1" '
    index($0, key "=") == 1 {
      value = substr($0, length(key) + 2)
    }
    END {
      sub(/\r$/, "", value)
      print value
    }
  ' "$ENV_FILE"
}

[ -f "$ENV_FILE" ] || fail "$ENV_FILE does not exist"
[ -f "$GENERATION_COMPOSE_FILE" ] || fail "$GENERATION_COMPOSE_FILE does not exist"

credentials_file=$(read_value GOOGLE_TTS_CREDENTIALS_FILE)
case "$credentials_file" in
  "" | CHANGE_ME*) fail "set GOOGLE_TTS_CREDENTIALS_FILE in $ENV_FILE" ;;
esac
[ -f "$credentials_file" ] || fail "GOOGLE_TTS_CREDENTIALS_FILE does not exist: $credentials_file"

google_project_id=$(read_value GOOGLE_TTS_PROJECT_ID)
case "$google_project_id" in
  "" | CHANGE_ME*) google_project_id=morpho-506714 ;;
esac
export GOOGLE_TTS_PROJECT_ID=$google_project_id

google_voice=$(read_value GOOGLE_TTS_VOICE)
case "$google_voice" in
  "" | CHANGE_ME*) google_voice=fi-FI-Chirp3-HD-Aoede ;;
esac
export GOOGLE_TTS_VOICE=$google_voice

scope=${1:-all}
if [ "$#" -gt 0 ]; then shift; fi
case "$scope" in
  all) command=audio:generate ;;
  words) command=audio:generate:words ;;
  sentences) command=audio:generate:sentences ;;
  texts) command=audio:generate:texts ;;
  *) fail "scope must be all, words, sentences or texts" ;;
esac

exec docker compose \
  --env-file "$ENV_FILE" \
  -f "$COMPOSE_FILE" \
  -f "$GENERATION_COMPOSE_FILE" \
  run --rm --no-deps api pnpm --filter @language/api "$command" -- "$@"
