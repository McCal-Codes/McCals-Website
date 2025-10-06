#!/bin/bash
# Journalism Watcher Control Script
# Manages the background journalism manifest watcher process

LOG_DIR="logs"
PID_FILE="$LOG_DIR/journalism-watcher.pid"
LOG_FILE="$LOG_DIR/journalism-watcher.log"

# Ensure log directory exists
mkdir -p "$LOG_DIR"

case "$1" in
    start)
        if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
            echo "📰 Journalism watcher is already running (PID: $(cat "$PID_FILE"))"
            exit 1
        fi
        
        echo "📰 Starting journalism manifest watcher..."
        nohup npm run watch:journalism-manifest > "$LOG_FILE" 2>&1 & 
        echo $! > "$PID_FILE"
        
        sleep 2
        if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
            echo "✅ Journalism watcher started successfully (PID: $(cat "$PID_FILE"))"
            echo "📄 Logs: $LOG_FILE"
        else
            echo "❌ Failed to start journalism watcher"
            exit 1
        fi
        ;;
        
    stop)
        if [ ! -f "$PID_FILE" ]; then
            echo "📰 Journalism watcher is not running"
            exit 1
        fi
        
        PID=$(cat "$PID_FILE")
        if kill -0 "$PID" 2>/dev/null; then
            echo "📰 Stopping journalism watcher (PID: $PID)..."
            kill "$PID"
            rm -f "$PID_FILE"
            echo "✅ Journalism watcher stopped"
        else
            echo "📰 Journalism watcher was not running"
            rm -f "$PID_FILE"
        fi
        ;;
        
    status)
        if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
            echo "✅ Journalism watcher is running (PID: $(cat "$PID_FILE"))"
            echo "📄 Log file: $LOG_FILE"
            echo "📊 Recent activity:"
            tail -3 "$LOG_FILE" 2>/dev/null || echo "   (No recent activity)"
        else
            echo "❌ Journalism watcher is not running"
            [ -f "$PID_FILE" ] && rm -f "$PID_FILE"
        fi
        ;;
        
    restart)
        $0 stop
        sleep 1
        $0 start
        ;;
        
    logs)
        if [ -f "$LOG_FILE" ]; then
            tail -f "$LOG_FILE"
        else
            echo "❌ No log file found at $LOG_FILE"
        fi
        ;;
        
    *)
        echo "📰 Journalism Manifest Watcher Control"
        echo ""
        echo "Usage: $0 {start|stop|restart|status|logs}"
        echo ""
        echo "Commands:"
        echo "  start    - Start the journalism manifest watcher"
        echo "  stop     - Stop the journalism manifest watcher"  
        echo "  restart  - Restart the journalism manifest watcher"
        echo "  status   - Check if the watcher is running"
        echo "  logs     - Show live logs (Ctrl+C to exit)"
        echo ""
        echo "What it does:"
        echo "  • Watches src/images/Portfolios/Journalism/ for changes"
        echo "  • Auto-regenerates journalism-manifest.json when you add/change files"
        echo "  • Widget picks up changes within 15 minutes (or immediately with cache clear)"
        echo ""
        echo "Examples:"
        echo "  ./scripts/journalism-watcher-control.sh start"
        echo "  ./scripts/journalism-watcher-control.sh status" 
        echo "  ./scripts/journalism-watcher-control.sh logs"
        exit 1
        ;;
esac