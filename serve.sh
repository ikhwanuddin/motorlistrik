#!/bin/bash
# Local development server untuk motor listrik comparison site
# Usage: ./serve.sh [port]

PORT=${1:-8000}
cd "$(dirname "$0")"

echo "🚀 Starting local server on http://localhost:$PORT"
echo "   Press Ctrl+C to stop"
python3 -m http.server "$PORT"
