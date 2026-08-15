#!/bin/bash
# J.A.R.V.I.S. Core Assistant Startup Script

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

PORT=8765

echo "=================================================="
echo "⚡ INITIALIZING J.A.R.V.I.S. LAPTOP AI ASSISTANT"
echo "=================================================="

# Check if port 8765 is occupied and kill old server if needed
PID=$(lsof -ti:$PORT)
if [ ! -z "$PID" ]; then
  echo "[!] Stopping existing process on port $PORT (PID: $PID)..."
  kill -9 $PID 2>/dev/null
fi

echo "[+] Starting JARVIS Core Python Engine on port $PORT..."
python3 jarvis_engine.py &
SERVER_PID=$!

sleep 1

echo "[+] Opening JARVIS HUD Interface in Browser..."
open "http://localhost:$PORT"

echo ""
echo "✅ J.A.R.V.I.S. is now ONLINE at http://localhost:$PORT"
echo "Press Ctrl+C to shutdown JARVIS engine."

wait $SERVER_PID
