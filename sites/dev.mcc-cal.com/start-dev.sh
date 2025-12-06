#!/bin/bash
# Start dev.mcc-cal.com development environment
# This script starts both the Next.js server and Cloudflare tunnel

set -e

echo "🚀 Starting dev.mcc-cal.com development environment..."
echo ""

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down dev environment..."
    kill $NEXTJS_PID $TUNNEL_PID 2>/dev/null || true
    exit 0
}

trap cleanup INT TERM EXIT

# Start Next.js server
echo "📦 Starting Next.js server on port 3000..."
cd "$SCRIPT_DIR"
npm run dev > /tmp/nextjs-dev.log 2>&1 &
NEXTJS_PID=$!
echo "   Next.js PID: $NEXTJS_PID"

# Wait for Next.js to be ready
echo "⏳ Waiting for Next.js to start..."
sleep 3

# Check if Next.js is running
if ! kill -0 $NEXTJS_PID 2>/dev/null; then
    echo "❌ Next.js failed to start. Check /tmp/nextjs-dev.log"
    exit 1
fi

# Start Cloudflare tunnel
echo "🌐 Starting Cloudflare tunnel..."
cloudflared tunnel run mccal-dev > /tmp/cloudflared-dev.log 2>&1 &
TUNNEL_PID=$!
echo "   Tunnel PID: $TUNNEL_PID"

# Wait for tunnel to connect
echo "⏳ Waiting for tunnel to connect..."
sleep 5

# Check if tunnel is running
if ! kill -0 $TUNNEL_PID 2>/dev/null; then
    echo "❌ Cloudflare tunnel failed to start. Check /tmp/cloudflared-dev.log"
    kill $NEXTJS_PID 2>/dev/null || true
    exit 1
fi

echo ""
echo "✅ Dev environment is running!"
echo ""
echo "🌍 Access your site at:"
echo "   • Local:  http://localhost:3000"
echo "   • Public: https://dev.mcc-cal.com"
echo ""
echo "📋 Logs:"
echo "   • Next.js: tail -f /tmp/nextjs-dev.log"
echo "   • Tunnel:  tail -f /tmp/cloudflared-dev.log"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Keep script running
wait
