#!/bin/bash
cd "$(dirname "$0")"
echo "=========================================================================="
echo " Starting DSU KnotSpot Server on http://localhost:8086"
echo "=========================================================================="
python3 -m http.server 8086
