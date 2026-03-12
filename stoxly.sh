#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
#  stoxly.sh  –  Stoxly Dev Stack Manager
#
#  Usage:
#    ./stoxly.sh start       – start all services
#    ./stoxly.sh stop        – stop all services (graceful)
#    ./stoxly.sh force-stop  – SIGKILL all processes + clean lock/cache files
#    ./stoxly.sh restart     – restart all services
#    ./stoxly.sh status      – show running status
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
  # Returns the first PID listening on $1, or empty string.
  # lsof works on Linux/macOS; falls back to netstat -ano on Windows/Git Bash.
  local p
  p=$(lsof -ti tcp:"$1" 2>/dev/null | head -1 || true)
  if [[ -z "$p" ]]; then
    p=$(netstat -ano 2>/dev/null \
          | grep -i "LISTENING" \
          | grep -E ":$1[[:space:]]" \
          | awk '{print $NF}' \
          | grep -E '^[0-9]+$' \
          | head -1 || true)
  fi
  echo "$p"
}

kill_tree() {
  local pid="$1"
  # Kill the process group so child processes (e.g. dotnet child) also die
  kill -- -"$(ps -o pgid= -p "$pid" 2>/dev/null | tr -d ' ')" 2>/dev/null || \
  kill -9 "$pid" 2>/dev/null || true
}

# kill_port_pid <pid>
# Kills a PID that was obtained from netstat (a Windows PID on Git Bash).
# taskkill /F /PID works on Windows; kill -9 is the Unix fallback.
kill_port_pid() {
  local pid="$1"
  [[ -z "$pid" ]] && return
  if command -v taskkill &>/dev/null; then
    taskkill //F //PID "$pid" 2>/dev/null || true
  else
    kill -9 "$pid" 2>/dev/null || true
  fi
}

# wait_for_service <label> <url> <pid> <timeout_seconds>
# Spins until the URL returns HTTP 2xx/3xx, the process dies, or timeout.
wait_for_service() {
  local label="$1"
  local url="$2"
  local pid="$3"
  local timeout="${4:-120}"
  local spinner=('⠋' '⠙' '⠹' '⠸' '⠼' '⠴' '⠦' '⠧' '⠇' '⠏')
  local i=0
  local elapsed=0

  # Print the waiting line (no newline so spinner overwrites in place)
  printf "  [%s]  Waiting for %s" "$label" "$url"

  while true; do
    # Check if background process is still alive
    if ! kill -0 "$pid" 2>/dev/null; then
      printf "\r  [%s]  ${RED}Process exited unexpectedly. Check logs: %s${NC}\n" "$label" "$LOG_DIR/${label,,}.log"
      return 1
    fi

    # Attempt HTTP request — any HTTP response (even 4xx) means the server is up
    local http_code
    http_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 3 "$url" 2>/dev/null || true)
    if [[ "$http_code" =~ ^[0-9]+$ ]] && (( http_code > 0 )); then
      printf "\r  [%s]  ${GREEN}Ready${NC} %$(( ${#url} + 20 ))s\n" "$label" ""
      return 0
    fi

    # Timeout check
    if (( elapsed >= timeout )); then
      printf "\r  [%s]  ${YELLOW}Timed out after %ds — service may still be starting${NC}\n" "$label" "$timeout"
      return 0  # non-fatal, user can still try the URL
    fi

    # Animate spinner
    printf "\r  [%s]  Waiting  %s  %ds" "$label" "${spinner[$i]}" "$elapsed"
    i=$(( (i + 1) % ${#spinner[@]} ))
    sleep 1
    elapsed=$(( elapsed + 1 ))
  done
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

  # ── Pre-flight: wait for required ports to be free ────────────────────────
  # On Windows, the OS can hold a port for a moment after a SIGKILL — poll
  # up to 8 seconds before giving up so a rapid force-stop → start works.
  for port_entry in "API:5000" "WEB:3000"; do
    chk_label="${port_entry%%:*}"
    chk_port="${port_entry##*:}"
    chk_pid=""
    for attempt in 1 2 3 4 5 6 7 8; do
      chk_pid="$(port_pid "$chk_port")"
      [[ -z "$chk_pid" ]] && break
      printf "  [%s]  Port %s still held by PID %s — waiting... (%ds)\n" \
        "$chk_label" "$chk_port" "$chk_pid" "$attempt"
      sleep 1
    done
    if [[ -n "$chk_pid" ]]; then
      # One last attempt: force-kill the stubborn PID via taskkill (Windows)
      echo -e "${YELLOW}  [$chk_label]  Port $chk_port still held — force-killing PID $chk_pid...${NC}"
      kill_port_pid "$chk_pid"
      sleep 1
      chk_pid="$(port_pid "$chk_port")"
      if [[ -n "$chk_pid" ]]; then
        echo -e "${RED}  [$chk_label]  Port $chk_port is still in use by PID $chk_pid. Cannot start.${NC}"
        echo -e "${GRAY}         Try closing the terminal that owns PID $chk_pid and run  ./stoxly.sh start  again.${NC}"
        echo ""
        exit 1
      fi
    fi
  done

  # ── API ────────────────────────────────────────────────────────────────────
  echo -e "  [API]  Launching ASP.NET Core..."
  (cd "$API_DIR" && dotnet run) >"$LOG_DIR/api.log" 2>&1 &
  API_PID=$!

  # ── Web ────────────────────────────────────────────────────────────────────
  # Pass --port 3000 explicitly so Next.js never silently drifts to another port
  echo -e "  [WEB]  Launching Next.js on port 3000..."
  (cd "$WEB_DIR" && npm run dev -- --port 3000) >"$LOG_DIR/web.log" 2>&1 &
  WEB_PID=$!

  # Persist PIDs immediately so stop works even if we are interrupted
  printf "API_PID=%d\nWEB_PID=%d\n" "$API_PID" "$WEB_PID" > "$PID_FILE"

  echo ""

  # ── Wait for both services to be actually ready ────────────────────────────
  # ASP.NET Core: health endpoint (falls back to root if /health 404s, curl -sf
  # treats 4xx as failure so we use --fail-with-body and accept any HTTP reply)
  wait_for_service "API" "http://localhost:5000/health" "$API_PID" 120 || true
  wait_for_service "WEB" "http://localhost:3000" "$WEB_PID" 180 || true

  echo ""
  echo -e "${CYAN}  ┌──────────────────────────────────────────────┐${NC}"
  echo -e "${GREEN}  │  ✓ API      →  http://localhost:5000         │${NC}"
  echo -e "${GREEN}  │  ✓ Swagger  →  http://localhost:5000/swagger │${NC}"
  echo -e "${GREEN}  │  ✓ Web      →  http://localhost:3000         │${NC}"
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

  # Kill using saved PIDs only — never blindly kill by port (could hit unrelated apps)
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
      else
        echo -e "${GRAY}  [$label]  Process PID $pid not running (already stopped).${NC}"
      fi
    done

    rm -f "$PID_FILE"
    # Clean Next.js dev lock so a fresh start works immediately
    rm -f "$WEB_DIR/.next/dev/lock"
  else
    echo -e "${YELLOW}  [!] No PID file found. Stack may not have been started via this script.${NC}"
    echo -e "${GRAY}      Use  ./stoxly.sh force-stop  to kill by port scan instead.${NC}"
  fi

  echo ""
  if $any_stopped; then
    echo -e "${GREEN}  Stack stopped successfully.${NC}"
  else
    echo -e "${GRAY}  No running stack processes found.${NC}"
  fi
  echo ""
}

# ─── Force Kill ───────────────────────────────────────────────────────────────

force_kill_stack() {
  echo ""
  echo -e "${RED}  ⚡ Force-killing Stoxly Stack...${NC}"
  echo ""

  # 1. Kill via saved PIDs (SIGKILL, no grace period)
  if [[ -f "$PID_FILE" ]]; then
    # shellcheck source=/dev/null
    source "$PID_FILE"
    for entry in "API:${API_PID:-}" "WEB:${WEB_PID:-}"; do
      label="${entry%%:*}"
      pid="${entry##*:}"
      if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
        echo -e "${RED}  [$label]  SIGKILL → PID $pid${NC}"
        kill -9 "$pid" 2>/dev/null || true
      fi
    done
  fi

  # 2. Kill anything still on the service ports (Windows/Git Bash safe)
  for entry in "API:5000" "WEB:3000"; do
    label="${entry%%:*}"
    port="${entry##*:}"
    # Try lsof first, fall back to netstat -ano on Windows/Git Bash
    pids=$(lsof -ti tcp:"$port" 2>/dev/null || true)
    if [[ -z "$pids" ]]; then
      pids=$(netstat -ano 2>/dev/null \
               | grep -i "LISTENING" \
               | grep -E ":${port}[[:space:]]" \
               | awk '{print $NF}' \
               | grep -E '^[0-9]+$' \
               | sort -u || true)
    fi
    if [[ -n "$pids" ]]; then
      echo -e "${RED}  [$label]  SIGKILL → port $port (PIDs: $(echo "$pids" | tr '\n' ' '))${NC}"
      while IFS= read -r p; do
        [[ -z "$p" ]] && continue
        kill_port_pid "$p"
      done <<< "$pids"
    fi
  done

  # 3. Wipe PID file
  rm -f "$PID_FILE"
  echo -e "${GRAY}  Removed PID file.${NC}"

  # 4. Remove Next.js dev lock so the server can restart cleanly
  local next_lock="$WEB_DIR/.next/dev/lock"
  if [[ -f "$next_lock" ]]; then
    rm -f "$next_lock"
    echo -e "${GRAY}  Removed Next.js dev lock: $next_lock${NC}"
  fi

  # 5. Optionally clear stale .next/server leftovers that can cause ISR errors
  local next_server_dir="$WEB_DIR/.next/server"
  if [[ -d "$next_server_dir" ]]; then
    rm -rf "$next_server_dir"
    echo -e "${GRAY}  Cleared .next/server cache.${NC}"
  fi

  echo ""
  echo -e "${GREEN}  Stack forcefully terminated and cleaned.${NC}"
  echo -e "${GRAY}  Run  ./stoxly.sh start  to bring it back up.${NC}"
  echo ""
}

# ─── Restart ──────────────────────────────────────────────────────────────────
# Uses force_kill_stack for the takedown so stale ports, PID files, and the
# Next.js dev lock are always cleared before the fresh start.

restart_stack() {
  force_kill_stack
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
  start)      start_stack      ;;
  stop)       stop_stack       ;;
  force-stop) force_kill_stack ;;
  restart)    restart_stack    ;;
  status)     show_status      ;;
  *)
    echo ""
    echo -e "  Usage: ./stoxly.sh {start|stop|force-stop|restart|status}"
    echo ""
    exit 1
    ;;
esac
