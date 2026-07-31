#!/bin/bash
# DSU KnotSpot One-Click Application Launcher

echo "🚀 Starting DSU KnotSpot Servers..."

# Find script directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

# Stop any existing python servers on port 5000 and 3000
lsof -ti:5000 | xargs kill -9 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null

# Start Backend API Server
python3 server/server.py &
BACKEND_PID=$!
echo "⚙️  Backend REST API running on http://localhost:5000 (PID: $BACKEND_PID)"

# Start Frontend Web Server
python3 -m http.server 3000 &
FRONTEND_PID=$!
echo "🌐 Frontend Web App running on http://localhost:3000 (PID: $FRONTEND_PID)"

echo ""
echo "✅ DSU KnotSpot is LIVE!"
echo "👉 Open in your browser: http://localhost:3000"
echo ""

# Keep running
wait
