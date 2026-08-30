#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH='' cd -- "$(dirname -- "$0")" && pwd)
PROJECT_DIR=$(CDPATH='' cd -- "$SCRIPT_DIR/../.." && pwd)
DOTENV_FILE=${AUDIO_SYNC_ENV_FILE:-$PROJECT_DIR/.env}

fail() {
  printf 'Audio sync error: %s\n' "$1" >&2
  exit 1
}

read_dotenv() {
  key=$1
  [ -f "$DOTENV_FILE" ] || return 0
  awk -v key="$key" '
    index($0, key "=") == 1 {
      value = substr($0, length(key) + 2)
    }
    END {
      sub(/\r$/, "", value)
      print value
    }
  ' "$DOTENV_FILE"
}

ssh_target=${AUDIO_SYNC_SSH_TARGET:-$(read_dotenv AUDIO_SYNC_SSH_TARGET)}
ssh_target=${ssh_target:-deploy@95.169.192.201}
ssh_port=${AUDIO_SYNC_SSH_PORT:-$(read_dotenv AUDIO_SYNC_SSH_PORT)}
ssh_port=${ssh_port:-22}
ssh_key=${AUDIO_SYNC_SSH_KEY:-$(read_dotenv AUDIO_SYNC_SSH_KEY)}
remote_directory=${AUDIO_SYNC_REMOTE_DIRECTORY:-$(read_dotenv AUDIO_SYNC_REMOTE_DIRECTORY)}
remote_directory=${remote_directory:-/home/deploy/morpho-learning}
audio_directory=${AUDIO_SYNC_LOCAL_DIRECTORY:-$(read_dotenv AUDIO_LOCAL_DIRECTORY)}
audio_directory=${audio_directory:-.data}

case "$audio_directory" in
  /*) ;;
  *) audio_directory=$PROJECT_DIR/apps/api/$audio_directory ;;
esac
case "$ssh_key" in
  "~/"*) ssh_key=$HOME/${ssh_key#\~/} ;;
esac
case "$ssh_target" in
  "" | *[!A-Za-z0-9._@:-]*) fail "AUDIO_SYNC_SSH_TARGET contains unsafe characters" ;;
esac
case "$ssh_port" in
  "" | *[!0-9]*) fail "AUDIO_SYNC_SSH_PORT must be an integer" ;;
esac
case "$remote_directory" in
  /*) ;;
  *) fail "AUDIO_SYNC_REMOTE_DIRECTORY must be an absolute path" ;;
esac
case "$remote_directory" in
  *[!A-Za-z0-9_./-]*) fail "AUDIO_SYNC_REMOTE_DIRECTORY contains unsafe characters" ;;
esac
[ -d "$audio_directory/audio" ] || fail "audio directory does not exist: $audio_directory/audio"
if [ -n "$ssh_key" ]; then
  [ -f "$ssh_key" ] || fail "SSH key does not exist: $ssh_key"
fi

known_hosts=$PROJECT_DIR/deploy/known_hosts
[ -f "$known_hosts" ] || fail "known_hosts does not exist: $known_hosts"
for command in pnpm tar sha256sum ssh scp; do
  command -v "$command" > /dev/null 2>&1 || fail "$command is required"
done

ssh_remote() {
  if [ -n "$ssh_key" ]; then
    ssh -i "$ssh_key" -p "$ssh_port" \
      -o BatchMode=yes \
      -o StrictHostKeyChecking=yes \
      -o UserKnownHostsFile="$known_hosts" \
      "$ssh_target" "$@"
  else
    ssh -p "$ssh_port" \
      -o BatchMode=yes \
      -o StrictHostKeyChecking=yes \
      -o UserKnownHostsFile="$known_hosts" \
      "$ssh_target" "$@"
  fi
}

copy_remote() {
  if [ -n "$ssh_key" ]; then
    scp -i "$ssh_key" -P "$ssh_port" \
      -o BatchMode=yes \
      -o StrictHostKeyChecking=yes \
      -o UserKnownHostsFile="$known_hosts" \
      "$@"
  else
    scp -P "$ssh_port" \
      -o BatchMode=yes \
      -o StrictHostKeyChecking=yes \
      -o UserKnownHostsFile="$known_hosts" \
      "$@"
  fi
}

work_directory=$(mktemp -d)
case "$work_directory" in
  /tmp/* | "${TMPDIR:-/tmp}"/*) ;;
  *) fail "mktemp returned an unsafe directory: $work_directory" ;;
esac
cleanup() {
  case "$work_directory" in
    /tmp/* | "${TMPDIR:-/tmp}"/*) rm -rf -- "$work_directory" ;;
  esac
}
trap cleanup EXIT HUP INT TERM

manifest=$work_directory/audio-manifest.json
timestamp=$(date -u +%Y%m%dT%H%M%SZ)
archive_name=audio-bundle-$timestamp.tar.gz
archive=$work_directory/$archive_name

printf 'Validating local audio and exporting metadata...\n'
pnpm --filter @language/api audio:bundle:export -- \
  --output="$manifest" \
  --audio-directory="$audio_directory"

printf 'Packing audio bundle...\n'
tar -czf "$archive" \
  -C "$audio_directory" audio \
  -C "$work_directory" audio-manifest.json
(
  cd "$work_directory"
  sha256sum "$archive_name" > "$archive_name.sha256"
)

remote_import_directory=$remote_directory/audio-imports
remote_archive=$remote_import_directory/$archive_name
remote_checksum=$remote_archive.sha256
remote_import_script=$remote_directory/scripts/deploy/import-audio-bundle.sh

printf 'Uploading %s to %s...\n' "$archive_name" "$ssh_target"
ssh_remote "install -d -m 0700 '$remote_import_directory'"
copy_remote \
  "$archive" \
  "$archive.sha256" \
  "$ssh_target:$remote_import_directory/"

printf 'Importing audio on VPS...\n'
ssh_remote "'$remote_import_script' '$remote_archive'"
ssh_remote "rm -f -- '$remote_archive' '$remote_checksum'"

printf 'Audio sync completed successfully.\n'
