#!/usr/bin/env bash
 
set -euo pipefail
 
cleanup() {
  local exit_code=$?
 
  if [[ -n "${backend_pid:-}" ]] && kill -0 "$backend_pid" 2>/dev/null; then
    kill "$backend_pid" 2>/dev/null || true
  fi
 
  if [[ -n "${frontend_pid:-}" ]] && kill -0 "$frontend_pid" 2>/dev/null; then
    kill "$frontend_pid" 2>/dev/null || true
  fi
 
  wait "${backend_pid:-}" "${frontend_pid:-}" 2>/dev/null || true
  exit "$exit_code"
}
 
trap cleanup INT TERM EXIT
 
(
  cd backend
  php artisan serve
) &
backend_pid=$!
 
(
  cd frontend
  npm run dev
) &
frontend_pid=$!
 
wait -n "$backend_pid" "$frontend_pid"
 