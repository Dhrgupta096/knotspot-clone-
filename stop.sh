#!/bin/bash
# DSU KnotSpot Stop Script
echo "Stopping DSU KnotSpot servers..."
lsof -ti:5000 | xargs kill -9 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null
echo "✅ KnotSpot servers stopped."
