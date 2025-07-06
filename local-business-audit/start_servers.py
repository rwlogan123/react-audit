#!/usr/bin/env python3

import os
import subprocess
import time
import signal
import sys

def main():
    print("🚀 Starting Local Business Audit Tool...")
    
    # Kill any existing processes
    try:
        subprocess.run(["pkill", "-f", "npm.*dev"], stderr=subprocess.DEVNULL)
        time.sleep(2)
    except:
        pass
    
    # Navigate to project directory
    project_dir = "/workspaces/react-audit/local-business-audit"
    
    if not os.path.exists(project_dir):
        print(f"❌ Project directory not found: {project_dir}")
        input("Press Enter to exit...")
        return
    
    try:
        # Start backend
        print("📡 Starting backend...")
        backend_dir = os.path.join(project_dir, "backend")
        backend_process = subprocess.Popen(
            ["npm", "run", "dev"],
            cwd=backend_dir,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
        time.sleep(3)
        
        # Start frontend
        print("🌐 Starting frontend...")
        frontend_dir = os.path.join(project_dir, "frontend")
        frontend_process = subprocess.Popen(
            ["npm", "run", "dev"],
            cwd=frontend_dir,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
        time.sleep(3)
        
        print("✅ Servers started!")
        print("🔗 Backend: http://localhost:3001")
        print("🌐 Frontend: http://localhost:5173")
        print("")
        print("In Codespaces: Look for PORTS tab, click globe icon next to port 5173")
        print("")
        print("Press Ctrl+C or close this window to stop both servers")
        
        # Function to handle cleanup on exit
        def cleanup(signum, frame):
            print("\n🛑 Stopping servers...")
            try:
                backend_process.terminate()
                frontend_process.terminate()
                time.sleep(2)
                backend_process.kill()
                frontend_process.kill()
            except:
                pass
            print("✅ Servers stopped!")
            sys.exit(0)
        
        # Register signal handlers
        signal.signal(signal.SIGINT, cleanup)
        signal.signal(signal.SIGTERM, cleanup)
        
        # Wait for processes to finish
        try:
            backend_process.wait()
            frontend_process.wait()
        except KeyboardInterrupt:
            cleanup(None, None)
            
    except Exception as e:
        print(f"❌ Error starting servers: {e}")
        input("Press Enter to exit...")

if __name__ == "__main__":
    main()
