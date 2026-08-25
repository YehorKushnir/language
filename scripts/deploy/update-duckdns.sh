#!/bin/sh

set -eu

: "${DUCKDNS_TOKEN:?DUCKDNS_TOKEN is required}"
DUCKDNS_DOMAIN=${DUCKDNS_DOMAIN:-morpho-learning}

case "$DUCKDNS_DOMAIN" in
  *[!A-Za-z0-9-]*)
    printf 'DUCKDNS_DOMAIN must be a DuckDNS subdomain without a suffix.\n' >&2
    exit 1
    ;;
esac

response=$(
  {
    printf '%s\n' 'url = "https://www.duckdns.org/update"' 'get'
    printf 'data-urlencode = "domains=%s"\n' "$DUCKDNS_DOMAIN"
    printf 'data-urlencode = "token=%s"\n' "$DUCKDNS_TOKEN"
    printf '%s\n' 'data-urlencode = "ip="'
  } | curl --config - --fail --silent --show-error --max-time 20
)

[ "$response" = OK ] || {
  printf 'DuckDNS update failed: %s\n' "$response" >&2
  exit 1
}

printf 'DuckDNS record updated for %s.duckdns.org.\n' "$DUCKDNS_DOMAIN"
