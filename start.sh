#!/bin/bash
# DSU KnotSpot One-Click Application Launcher (Persistent Daemon Mode)

echo "=================================================="
echo "🚀 STARTING DSU KNOTSPOT PLATFORM"
echo "=================================================="

# Find script directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

# Stop any existing servers on port 5000 and 3000
lsof -ti:5000 | xargs kill -9 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null
sleep 0.5

# Initialize SQLite database migrations if needed
python3 server/database.py > /dev/null 2>&1

# Start Backend API Server in persistent background mode
nohup python3 server/server.py > /tmp/knotspot_backend.log 2>&1 &
BACKEND_PID=$!
disown $BACKEND_PID 2>/dev/null
echo "[+] Backend REST API running on http://localhost:5000 (PID: $BACKEND_PID)"

# Start Frontend Web Server in persistent background mode
nohup python3 -m http.server 3000 > /tmp/knotspot_frontend.log 2>&1 &
FRONTEND_PID=$!
disown $FRONTEND_PID 2>/dev/null
echo "[+] Frontend Web App running on http://localhost:3000 (PID: $FRONTEND_PID)"

# Save PIDs
echo "$BACKEND_PID" > .knotspot_pids
echo "$FRONTEND_PID" >> .knotspot_pids

# Detect Local Wi-Fi / LAN IP for mobile student access
LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || ifconfig | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | head -n 1)

echo ""
echo "=================================================="
echo "✅ DSU KNOTSPOT IS LIVE & RUNNING PERMANENTLY!"
echo "=================================================="
echo "💻 Web App: http://localhost:3000"
if [ ! -z "$LOCAL_IP" ]; then
echo "📱 Mobile / College Wi-Fi: http://$LOCAL_IP:3000"
fi
echo "⚙️  Backend REST API: http://localhost:5000"
echo "🛑 To stop later: run 'bash stop.sh'"
echo "=================================================="
