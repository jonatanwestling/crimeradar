#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"

docker build -t crime-radar-api .
docker run --rm -p 8000:8000 --env-file ../.env crime-radar-api
