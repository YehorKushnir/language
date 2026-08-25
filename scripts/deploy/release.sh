#!/bin/sh

set -eu

pnpm db:migrate:deploy
pnpm db:seed
pnpm publication:validate
