#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH='' cd -- "$(dirname -- "$0")" && pwd)
PROJECT_DIR=$(CDPATH='' cd -- "$SCRIPT_DIR/../.." && pwd)
COMPOSE_FILE=${COMPOSE_FILE:-$PROJECT_DIR/compose.production.yaml}
ENV_FILE=${ENV_FILE:-$PROJECT_DIR/.env.production}
BACKUP_DIR=${BACKUP_DIR:-/var/backups/morpho-learning}
LOCK_FILE=${LOCK_FILE:-/tmp/morpho-learning-deploy.lock}

usage() {
  printf 'Usage: %s 40_CHARACTER_GIT_SHA\n' "$0" >&2
  exit 2
}

[ "$#" -eq 1 ] || usage
NEW_TAG=$1
case "$NEW_TAG" in
  "" | *[!0-9a-f]*) usage ;;
esac
[ "${#NEW_TAG}" -eq 40 ] || usage

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

write_value() {
  key=$1
  value=$2
  temporary="$ENV_FILE.tmp.$$"
  awk -v key="$key" -v value="$value" '
    BEGIN { written = 0 }
    index($0, key "=") == 1 {
      print key "=" value
      written = 1
      next
    }
    { print }
    END {
      if (!written) print key "=" value
    }
  ' "$ENV_FILE" > "$temporary"
  chmod 600 "$temporary"
  mv "$temporary" "$ENV_FILE"
}

prune_old_release_images() {
  image_repo=$(read_value IMAGE_REPO)
  for component in api web; do
    docker image ls --format '{{.Repository}} {{.Tag}}' "$image_repo/$component" |
      while read -r repository tag; do
        case "$tag" in
          "" | *[!0-9a-f]*) continue ;;
        esac
        [ "${#tag}" -eq 40 ] || continue
        [ "$tag" = "$NEW_TAG" ] && continue
        [ "$tag" = "$PREVIOUS_TAG" ] && continue

        printf 'Removing old release image %s:%s.\n' "$repository" "$tag"
        docker image rm "$repository:$tag" > /dev/null || true
      done
  done
  docker image prune --force > /dev/null
}

compose() {
  IMAGE_TAG=$ACTIVE_TAG docker compose \
    --env-file "$ENV_FILE" \
    -f "$COMPOSE_FILE" \
    "$@"
}

command -v flock > /dev/null 2>&1 || {
  printf 'flock is required for serialized deployments.\n' >&2
  exit 1
}

exec 9>"$LOCK_FILE"
flock --exclusive 9

"$SCRIPT_DIR/check-env.sh" "$ENV_FILE"
PREVIOUS_TAG=$(read_value IMAGE_TAG)
ACTIVE_TAG=$NEW_TAG
export ACTIVE_TAG

rollback() {
  trap - EXIT HUP INT TERM
  case "$PREVIOUS_TAG" in
    "" | local | latest | *[!0-9a-f]*)
      printf 'No immutable previous image tag is available for application rollback.\n' >&2
      return
      ;;
  esac
  [ "${#PREVIOUS_TAG}" -eq 40 ] || return

  printf 'Rolling the application containers back to %s.\n' "$PREVIOUS_TAG" >&2
  ACTIVE_TAG=$PREVIOUS_TAG
  export ACTIVE_TAG
  compose up --detach --no-deps api web || true
}
trap rollback EXIT HUP INT TERM

if [ -n "$(compose ps --status running --quiet postgres)" ]; then
  printf 'Creating a pre-deploy database backup.\n'
  ENV_FILE="$ENV_FILE" COMPOSE_FILE="$COMPOSE_FILE" BACKUP_DIR="$BACKUP_DIR" \
    "$SCRIPT_DIR/backup.sh"
fi

compose config --quiet
compose pull api web migrate
compose up --detach postgres
compose run --rm migrate
compose up --detach --no-deps api

attempt=1
while [ "$attempt" -le 40 ]; do
  api_container=$(compose ps --quiet api)
  status=$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}missing{{end}}' "$api_container" 2>/dev/null || printf missing)
  [ "$status" = healthy ] && break
  if [ "$status" = unhealthy ]; then
    compose logs --tail 100 api >&2
    exit 1
  fi
  sleep 3
  attempt=$((attempt + 1))
done
[ "$attempt" -le 40 ] || {
  compose logs --tail 100 api >&2
  exit 1
}

compose up --detach --no-deps web

attempt=1
while [ "$attempt" -le 30 ]; do
  web_container=$(compose ps --quiet web)
  status=$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}missing{{end}}' "$web_container" 2>/dev/null || printf missing)
  [ "$status" = healthy ] && break
  if [ "$status" = unhealthy ]; then
    compose logs --tail 100 web >&2
    exit 1
  fi
  sleep 2
  attempt=$((attempt + 1))
done
[ "$attempt" -le 30 ] || {
  compose logs --tail 100 web >&2
  exit 1
}

"$SCRIPT_DIR/reload-edge-caddy.sh"
docker exec framed-caddy-1 wget --quiet --tries=1 --spider \
  http://morpho-web/api/v1/health

write_value IMAGE_TAG "$NEW_TAG"
trap - EXIT HUP INT TERM
prune_old_release_images

printf 'Morpho Learning deployed at image tag %s.\n' "$NEW_TAG"
