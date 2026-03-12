#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
#  stoxly.sh  –  Stoxly Dev Stack Manager
#
#  Usage:
#    ./stoxly.sh start    – start all services
#    ./stoxly.sh stop     – stop all services
#    ./stoxly.sh restart  – restart all services
#    ./stoxly.sh status   – show running status
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_DIR="$ROOT_DIR/apps/api/src/Stoxly.Api"
WEB_DIR="$ROOT_DIR/apps/web"
PID_FILE="$ROOT_DIR/.stack.pids"
LOG_DIR="$ROOT_DIR/.stack-logs"

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
GRAY='\033[0;90m'
NC='\033[0m' # no color

# ─── Helpers ──────────────────────────────────────────────────────────────────

banner() {
  echo ""
  echo -e "${CYAN}  ╔══════════════════════════════════╗${NC}"
  echo -e "${CYAN}  ║        STOXLY  DEV  STACK        ║${NC}"
  echo -e "${CYAN}  ╚══════════════════════════════════╝${NC}"
  echo ""
}

port_pid() {
  # Returns the PID listening on $1, or empty string
  lsof -ti tcp:"$1" 2>/dev/null || true
}

kill_tree() {
  local pid="$1"
  # Kill the process group so child processes (e.g. dotnet child) also die
  kill -- -"$(ps -o pgid= -p "$pid" 2>/dev/null | tr -d ' ')" 2>/dev/null || \
  kill -9 "$pid" 2>/dev/null || true
}

# ─── Start ────────────────────────────────────────────────────────────────────

start_stack() {
  banner

  if [[ -f "$PID_FILE" ]]; then
    echo -e "${YELLOW}  [!] A PID file already exists. The stack may still be running.${NC}"
    echo -e "${GRAY}      Run  ./stoxly.sh stop  first, or  ./stoxly.sh restart${NC}"
    echo ""
    return
  fi

  # Warn if PostgreSQL isn't up
  if ! port_pid 5432 > /dev/null 2>&1; then
    echo -e "${YELLOW}  [!] PostgreSQL doesn't appear to be on port 5432.${NC}"
    echo -e "${GRAY}      Make sure PostgreSQL is running before the API connects.${NC}"
    echo ""
  fi

  mkdir -p "$LOG_DIR"

  # ── API ────────────────────────────────────────────────────────────────────
  echo -e "${GREEN}  [API]  Starting ASP.NET Core  →  http://localhost:5000${NC}"
  (cd "$API_DIR" && dotnet run) >"$LOG_DIR/api.log" 2>&1 &
  API_PID=$!

  sleep 1

  # ── Web ────────────────────────────────────────────────────────────────────
  echo -e "${GREEN}  [WEB]  Starting Next.js        →  http://localhost:3000${NC}"
  (cd "$WEB_DIR" && npm run dev) >"$LOG_DIR/web.log" 2>&1 &
  WEB_PID=$!

  # Persist PIDs
  printf "API_PID=%d\nWEB_PID=%d\n" "$API_PID" "$WEB_PID" > "$PID_FILE"

  echo ""
  echo -e "${CYAN}  ┌──────────────────────────────────────────────┐${NC}"
  echo -e "  │  API      →  http://localhost:5000           │"
  echo -e "  │  Swagger  →  http://localhost:5000/swagger   │"
  echo -e "  │  Web      →  http://localhost:3000           │"
  echo -e "${CYAN}  └──────────────────────────────────────────────┘${NC}"
  echo ""
  echo -e "${GRAY}  Logs  →  $LOG_DIR/${NC}"
  echo -e "${GRAY}  Run  ./stoxly.sh stop  to shut everything down.${NC}"
  echo ""
}

# ─── Stop ─────────────────────────────────────────────────────────────────────

stop_stack() {
  echo ""
  echo -e "${YELLOW}  Stopping Stoxly Stack...${NC}"
  echo ""

  any_stopped=false

  # Primary: use saved PIDs
  if [[ -f "$PID_FILE" ]]; then
    # shellcheck source=/dev/null
    source "$PID_FILE"

    for entry in "API:${API_PID:-}" "WEB:${WEB_PID:-}"; do
      label="${entry%%:*}"
      pid="${entry##*:}"
      if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
        echo -e "${YELLOW}  [$label]  Stopping PID $pid...${NC}"
        kill_tree "$pid"
        any_stopped=true
      fi
    done

    rm -f "$PID_FILE"
  fi

  # Fallback: kill anything still on the service ports
  for entry in "API:5000" "WEB:3000"; do
    label="${entry%%:*}"
    port="${entry##*:}"
    pid="$(port_pid "$port")"
    if [[ -n "$pid" ]]; then
      echo -e "${YELLOW}  [$label]  Killing leftover process on port $port (PID $pid)...${NC}"
      kill_tree "$pid"
      any_stopped=true
    fi
  done

  echo ""
  if $any_stopped; then
    echo -e "${GREEN}  Stack stopped successfully.${NC}"
  else
    echo -e "${GRAY}  No running stack processes found.${NC}"
  fi
  echo ""
}

# ─── Restart ──────────────────────────────────────────────────────────────────

restart_stack() {
  stop_stack
  echo -e "${GRAY}  Waiting for ports to free up...${NC}"
  sleep 3
  start_stack
}

# ─── Status ───────────────────────────────────────────────────────────────────

show_status() {
  echo ""
  echo -e "${CYAN}  Stoxly Stack Status${NC}"
  echo -e "${GRAY}  ────────────────────────────────────────${NC}"

  declare -A services
  services=(
    ["API (ASP.NET)"]="5000"
    ["Web (Next.js)"]="3000"
    ["PostgreSQL"]="5432"
  )

  for label in "API (ASP.NET)" "Web (Next.js)" "PostgreSQL"; do
    port="${services[$label]}"
    pid="$(port_pid "$port")"
    padded_label="$(printf '%-16s' "$label")"
    if [[ -n "$pid" ]]; then
      echo -e "${GREEN}  $padded_label  [RUNNING]  port $port  PID $pid${NC}"
    else
      echo -e "${RED}  $padded_label  [STOPPED]  port $port${NC}"
    fi
  done

  echo ""

  if [[ -f "$PID_FILE" ]]; then
    echo -e "${GRAY}  Saved PIDs  →  $(cat "$PID_FILE" | tr '\n' '  ')${NC}"
  fi

  echo ""
}

# ─── Dispatch ─────────────────────────────────────────────────────────────────

case "${1:-}" in
  start)   start_stack   ;;
  stop)    stop_stack    ;;
  restart) restart_stack ;;
  status)  show_status   ;;
  *)
    echo ""
    echo -e "  Usage: ./stoxly.sh {start|stop|restart|status}"
    echo ""
    exit 1
    ;;
esac
