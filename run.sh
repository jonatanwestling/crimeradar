#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

ENV_FLAG=()
if [ -f .env ]; then
  ENV_FLAG=(--env-file .env)
fi

case "${1:-}" in
  deploy)
    echo "🐳 1/2 Starting/Updating backend and frontend in Docker..."
    ./run.sh prod

    echo "🔄 2/2 Ensuring host Nginx reverse proxy is active..."
    cd nginx
    ./update_nginx.sh
    cd "$ROOT_DIR"
    echo "✅ Deployed and live!"
    ;;

  prod)
    echo "Starting backend in Docker (Port 8000)..."
    docker compose "${ENV_FLAG[@]}" -f backend/docker-compose.yml up --build -d
    echo "Starting frontend in Docker (Port 3000)..."
    docker compose -f frontend/docker-compose.yml up --build -d
    ;;

  prod-down)
    docker compose "${ENV_FLAG[@]}" -f backend/docker-compose.yml down
    docker compose -f frontend/docker-compose.yml down
    ;;

  prod-logs)
    docker compose "${ENV_FLAG[@]}" -f backend/docker-compose.yml logs -f &
    docker compose -f frontend/docker-compose.yml logs -f &
    wait
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
    echo "Usage: ./run.sh deploy|prod|prod-down|prod-logs|dev|dev-api|dev-frontend|collector-once"
    exit 1
    ;;
esac
