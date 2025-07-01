#!/usr/bin/env python3
"""
Simple web server for the Historical Universe Models application.
This script starts a local HTTP server to serve the 3D visualization app.
"""

import http.server
import socketserver
import webbrowser
import os
import sys
from pathlib import Path

def main():
    """Start the web server and open the application in a browser."""
    
    # Configuration
    PORT = 8000
    HOST = 'localhost'
    
    # Ensure we're in the correct directory
    script_dir = Path(__file__).parent
    os.chdir(script_dir)
    
    # Check if required files exist
    required_files = ['index.html', 'js/app.js']
    missing_files = []
    
    for file_path in required_files:
        if not Path(file_path).exists():
            missing_files.append(file_path)
    
    if missing_files:
        print("❌ Error: Missing required files:")
        for file_path in missing_files:
            print(f"   - {file_path}")
        print("\nPlease ensure all application files are present.")
        sys.exit(1)
    
    # Create server
    try:
        handler = http.server.SimpleHTTPRequestHandler
        httpd = socketserver.TCPServer((HOST, PORT), handler)
        
        print(f"🌌 Historical Universe Models - 3D Explorer")
        print(f"{'='*50}")
        print(f"🚀 Server starting on http://{HOST}:{PORT}")
        print(f"📂 Serving from: {script_dir}")
        print(f"{'='*50}")
        print(f"")
        print(f"🎯 Main Application: http://{HOST}:{PORT}/")
        print(f"📋 Demo Page: http://{HOST}:{PORT}/demo.html")
        print(f"")
        print(f"💡 The application will open automatically in your browser.")
        print(f"   If it doesn't, copy and paste the URL above.")
        print(f"")
        print(f"⏹️  Press Ctrl+C to stop the server")
        print(f"{'='*50}")
        
        # Try to open the application in the default browser
        try:
            webbrowser.open(f"http://{HOST}:{PORT}/demo.html")
        except Exception as e:
            print(f"⚠️  Could not auto-open browser: {e}")
            print(f"   Please manually open http://{HOST}:{PORT}/ in your browser")
        
        # Start the server
        httpd.serve_forever()
        
    except KeyboardInterrupt:
        print(f"\n🛑 Server stopped by user")
        httpd.shutdown()
        sys.exit(0)
        
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ Error: Port {PORT} is already in use.")
            print(f"   Try using a different port or stop the other server.")
        else:
            print(f"❌ Error starting server: {e}")
        sys.exit(1)
        
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()