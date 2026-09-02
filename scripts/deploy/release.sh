#!/bin/sh

set -eu

DATABASE_PACKAGE_DIR=${DATABASE_PACKAGE_DIR:-/app/packages/database}
PRISMA_CLI="$DATABASE_PACKAGE_DIR/node_modules/prisma/build/index.js"
TSX_CLI="$DATABASE_PACKAGE_DIR/node_modules/tsx/dist/cli.mjs"

[ -f "$PRISMA_CLI" ] || {
  printf 'Migration error: Prisma CLI is missing from the image.\n' >&2
  exit 1
}

[ -f "$TSX_CLI" ] || {
  printf 'Migration error: tsx CLI is missing from the image.\n' >&2
  exit 1
}

cd "$DATABASE_PACKAGE_DIR"

node "$PRISMA_CLI" migrate deploy
node "$TSX_CLI" prisma/seed.ts
node "$TSX_CLI" prisma/validate-publication.ts
