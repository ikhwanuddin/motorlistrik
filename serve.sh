#!/bin/bash
# Local development server untuk motor listrik comparison site
# Usage: ./serve.sh

PORT=${1:-8000}

echo "🚀 Starting local server on http://localhost:$PORT"
echo "   Press Ctrl+C to stop"
echo ""

# Check if we're in the right directory
if [ ! -f "index.html" ]; then
  echo "❌ Error: index.html not found. Are you in the project root?"
  exit 1
fi

# Try Python 3 first (most common)
if command -v python3 &> /dev/null; then
  cd "$(dirname "$0")"
  python3 -m http.server $PORT
# Fallback to Python 2
elif command -v python &> /dev/null; then
  cd "$(dirname "$0")"
  python -m SimpleHTTPServer $PORT
# Fallback to Node http-server if available
elif command -v http-server &> /dev/null; then
  http-server -p $PORT
else
  echo "❌ No suitable server found!"
  echo "   Install one of:"
  echo "   - Python (usually pre-installed)"
  echo "   - Node.js + npm install -g http-server"
  exit 1
fi
