#!/usr/bin/env bash
set -e

# NutriVision AI — Master Backend Launcher (macOS / Linux)
# Color formatting
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo -e "${CYAN}=====================================================================${NC}"
echo -e "${GREEN}   🥗 NUTRIVISION AI — STARTING ALL BACKEND SUBSYSTEMS (macOS)${NC}"
echo -e "${CYAN}=====================================================================${NC}"
echo ""

# 1. Check MySQL
echo -e "${YELLOW}[1/3] Memeriksa Database MySQL di Port 3306...${NC}"
if nc -z 127.0.0.1 3306 2>/dev/null || lsof -Pi :3306 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${GREEN}[OK] MySQL Service aktif di port 3306.${NC}"
else
    echo -e "${YELLOW}[*] MySQL belum aktif di port 3306.${NC}"
    if [ -x "/usr/local/mysql/support-files/mysql.server" ]; then
        echo -e "${CYAN}[*] Mencoba menjalankan MySQL via mysql.server...${NC}"
        sudo /usr/local/mysql/support-files/mysql.server start || true
    fi
fi

# Determine python command (prefer server/venv)
if [ -f "$SCRIPT_DIR/server/venv/bin/python" ]; then
    PY_CMD="$SCRIPT_DIR/server/venv/bin/python"
else
    PY_CMD="python3"
fi

# Track child PIDs for cleanup on exit
AI_PID=""
NODE_PID=""

cleanup() {
    echo ""
    echo -e "${YELLOW}Menutup layanan backend...${NC}"
    if [ -n "$AI_PID" ] && kill -0 "$AI_PID" 2>/dev/null; then
        kill "$AI_PID" 2>/dev/null || true
    fi
    if [ -n "$NODE_PID" ] && kill -0 "$NODE_PID" 2>/dev/null; then
        kill "$NODE_PID" 2>/dev/null || true
    fi
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# 2. Start Python AI Inference Service
echo ""
echo -e "${YELLOW}[2/3] Mengaktifkan Python AI Inference Engine (.safetensors)...${NC}"
if lsof -Pi :5050 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${GREEN}[OK] Python AI Service sudah aktif di port 5050.${NC}"
else
    $PY_CMD server/ai_service.py 5050 &
    AI_PID=$!
    sleep 2
    if kill -0 "$AI_PID" 2>/dev/null; then
        echo -e "${GREEN}[OK] Python AI Service berhasil berjalan (PID: $AI_PID, Port: 5050).${NC}"
    else
        echo -e "${RED}[!] Gagal memulai Python AI Service. Periksa dependensi python.${NC}"
    fi
fi

# Read PORT from server/.env if available
NODE_PORT="5000"
if [ -f "$SCRIPT_DIR/server/.env" ]; then
    ENV_PORT=$(grep -E "^PORT=" "$SCRIPT_DIR/server/.env" | cut -d '=' -f2 | tr -d ' \r\n')
    if [ -n "$ENV_PORT" ]; then
        NODE_PORT="$ENV_PORT"
    fi
fi

# 3. Start Node.js Express REST API Server
echo ""
echo -e "${YELLOW}[3/3] Mengaktifkan Node.js Express REST API Server (Port $NODE_PORT)...${NC}"
if lsof -Pi :$NODE_PORT -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${GREEN}[OK] Port $NODE_PORT sudah aktif (atau port dipakai).${NC}"
else
    PORT=$NODE_PORT node server/server.js &
    NODE_PID=$!
    sleep 2
    if kill -0 "$NODE_PID" 2>/dev/null; then
        echo -e "${GREEN}[OK] Node.js REST API berhasil berjalan (PID: $NODE_PID, Port: $NODE_PORT).${NC}"
    else
        echo -e "${RED}[!] Gagal memulai Node.js Server.${NC}"
    fi
fi

echo ""
echo -e "${CYAN}=====================================================================${NC}"
echo -e "${YELLOW} 🩺 MENJALANKAN AUDIT DAN DIAGNOSTIK OTOMATIS SISTEM...${NC}"
echo -e "${CYAN}=====================================================================${NC}"
echo ""
node server/verify_system.js || true

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN} ✨ NutriVision AI siap digunakan!${NC}"
echo -e "${CYAN} 🌐 Buka aplikasi di browser: http://localhost:$NODE_PORT${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "Tekan ${RED}Ctrl + C${NC} untuk menghentikan server."

# Keep running in foreground to stream logs or wait
wait
