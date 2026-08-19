#!/bin/bash
# DSU KnotSpot One-Click Application Launcher

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

# Start Backend API Server
python3 server/server.py &
BACKEND_PID=$!
echo "[+] Backend REST API running on http://localhost:5000 (PID: $BACKEND_PID)"

# Start Frontend Web Server
python3 -m http.server 3000 &
FRONTEND_PID=$!
echo "[+] Frontend Web App running on http://localhost:3000 (PID: $FRONTEND_PID)"

# Detect Local Wi-Fi / LAN IP for mobile student access
LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || ifconfig | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | head -n 1)

echo ""
echo "=================================================="
echo "✅ DSU KNOTSPOT IS LIVE & READY FOR STUDENTS!"
echo "=================================================="
echo "💻 On this computer: http://localhost:3000"
if [ ! -z "$LOCAL_IP" ]; then
echo "📱 On Mobile / College Wi-Fi: http://$LOCAL_IP:3000"
fi
echo "⚙️  Backend REST API: http://localhost:5000"
echo "=================================================="
echo "Press Ctrl+C to stop servers."
echo ""

# Keep running
wait
