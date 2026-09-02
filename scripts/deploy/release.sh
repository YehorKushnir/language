#!/bin/sh

set -eu

DATABASE_PACKAGE_DIR=${DATABASE_PACKAGE_DIR:-/app/packages/database}

pnpm --dir "$DATABASE_PACKAGE_DIR" db:migrate:deploy
pnpm --dir "$DATABASE_PACKAGE_DIR" db:seed
pnpm --dir "$DATABASE_PACKAGE_DIR" publication:validate
