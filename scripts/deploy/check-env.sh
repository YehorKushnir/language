#!/bin/sh

set -eu

ENV_FILE=${1:-.env.production}

fail() {
  printf 'Configuration error: %s\n' "$1" >&2
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

require_value() {
  key=$1
  value=$(read_value "$key")
  case "$value" in
    "" | CHANGE_ME*) fail "$key is missing or still contains a placeholder" ;;
  esac
}

[ -f "$ENV_FILE" ] || fail "$ENV_FILE does not exist"

for key in \
  APP_DOMAIN \
  IMAGE_REPO \
  IMAGE_TAG \
  EDGE_NETWORK \
  POSTGRES_PASSWORD \
  BETTER_AUTH_SECRET \
  SMTP_HOST \
  MAIL_FROM
do
  require_value "$key"
done

domain=$(read_value APP_DOMAIN)
case "$domain" in
  *://* | */* | *:* | *' '*) fail "APP_DOMAIN must be a hostname without a scheme, port or path" ;;
esac

image_repo=$(read_value IMAGE_REPO)
case "$image_repo" in
  ghcr.io/*/*) ;;
  *) fail "IMAGE_REPO must be a GHCR repository such as ghcr.io/owner/repo" ;;
esac

image_tag=$(read_value IMAGE_TAG)
case "$image_tag" in
  local | latest) ;;
  "" | *[!0-9a-f]*) fail "IMAGE_TAG must be local, latest or a 40-character Git commit SHA" ;;
  *)
    [ "${#image_tag}" -eq 40 ] || fail "IMAGE_TAG must be local, latest or a 40-character Git commit SHA"
    ;;
esac

edge_network=$(read_value EDGE_NETWORK)
case "$edge_network" in
  *[!A-Za-z0-9_.-]* | "") fail "EDGE_NETWORK contains invalid characters" ;;
esac

postgres_password=$(read_value POSTGRES_PASSWORD)
case "$postgres_password" in
  *[!A-Za-z0-9]*) fail "POSTGRES_PASSWORD must contain only URL-safe letters and digits" ;;
esac
[ "${#postgres_password}" -ge 32 ] || fail "POSTGRES_PASSWORD must be at least 32 characters"

auth_secret=$(read_value BETTER_AUTH_SECRET)
[ "${#auth_secret}" -ge 32 ] || fail "BETTER_AUTH_SECRET must be at least 32 characters"
[ "$auth_secret" != "$postgres_password" ] || fail "BETTER_AUTH_SECRET must differ from POSTGRES_PASSWORD"

smtp_secure=$(read_value SMTP_SECURE)
case "$smtp_secure" in
  true | false) ;;
  *) fail "SMTP_SECURE must be true or false" ;;
esac

smtp_user=$(read_value SMTP_USER)
smtp_password=$(read_value SMTP_PASSWORD)
if [ -n "$smtp_user" ] && [ -z "$smtp_password" ]; then
  fail "SMTP_PASSWORD is required when SMTP_USER is set"
fi
if [ -z "$smtp_user" ] && [ -n "$smtp_password" ]; then
  fail "SMTP_USER is required when SMTP_PASSWORD is set"
fi

printf 'Production environment looks valid for %s.\n' "$domain"
