#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

case "${1:-}" in
  prod)
    docker compose --env-file backend/.env -f backend/docker-compose.yml up --build -d
    ;;

  prod-down)
    docker compose --env-file backend/.env -f backend/docker-compose.yml down
    ;;

  prod-logs)
    docker compose --env-file backend/.env -f backend/docker-compose.yml logs -f
    ;;

  dev)
    trap 'kill 0' EXIT
    ./run.sh dev-api &
    ./run.sh dev-frontend &
    wait
    ;;

  dev-api)
    cd backend/api
    uvicorn main:app --host 127.0.0.1 --port 8000 --reload
    ;;

  dev-frontend)
    cd frontend
    npm run dev -- --host 127.0.0.1
    ;;

  collector-once)
    cd backend/collector
    python polisen/collector.py
    ;;

  *)
    echo "Usage: ./run.sh prod|prod-down|prod-logs|dev|dev-api|dev-frontend|collector-once"
    exit 1
    ;;
esac
