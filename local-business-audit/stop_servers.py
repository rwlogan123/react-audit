#!/usr/bin/env python3

import subprocess
import time

def main():
    print("🛑 Stopping Local Business Audit Tool servers...")
    
    try:
        # Kill all npm dev processes
        subprocess.run(["pkill", "-f", "npm.*dev"], stderr=subprocess.DEVNULL)
        
        # Kill any node processes that might be running the servers
        subprocess.run(["pkill", "-f", "node.*server"], stderr=subprocess.DEVNULL)
        subprocess.run(["pkill", "-f", "vite"], stderr=subprocess.DEVNULL)
        
        # Wait a moment
        time.sleep(2)
        
        print("✅ All servers stopped!")
        print("🔗 Backend: Stopped")
        print("🌐 Frontend: Stopped")
        print("")
        print("Run start_servers.py to start them again")
        
    except Exception as e:
        print(f"❌ Error stopping servers: {e}")
    
    input("\nPress Enter to close...")

if __name__ == "__main__":
    main()
