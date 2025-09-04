#!/usr/bin/env python3
"""
Zuba Connection Diagnostic Script
This script helps diagnose connection issues between frontend and backend
"""

import socket
import subprocess
import platform
import sys
import urllib.request
import json

def print_header(title):
    print("\n" + "="*80)
    print(f"🔍 {title}")
    print("="*80)

def check_port_listening(port):
    """Check if a port is listening"""
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(1)
            result = s.connect_ex(('127.0.0.1', port))
            return result == 0
    except:
        return False

def test_api_endpoint(url):
    """Test an API endpoint"""
    try:
        with urllib.request.urlopen(url, timeout=5) as response:
            status_code = response.getcode()
            print(f"✅ {url}: Status {status_code}")
            if status_code == 200:
                try:
                    data = response.read().decode('utf-8')
                    json_data = json.loads(data)
                    print(f"   📊 Response: {json_data}")
                except:
                    print(f"   📄 Response: {data[:100]}...")
        return True
    except urllib.error.URLError:
        print(f"❌ {url}: Connection refused")
        return False
    except Exception as e:
        print(f"❌ {url}: {e}")
        return False

def check_running_processes():
    """Check for running backend processes"""
    print_header("RUNNING PROCESSES")
    try:
        if platform.system() == "Windows":
            # Check for Python processes that might be the backend
            result = subprocess.run(['tasklist', '/FI', 'IMAGENAME eq python.exe'], 
                                  capture_output=True, text=True)
            print("Python processes:")
            print(result.stdout)
            
            # Check for ports
            result = subprocess.run(['netstat', '-an'], capture_output=True, text=True)
            lines = result.stdout.split('\n')
            print("\nListening ports (8000, 5173):")
            for line in lines:
                if ':8000' in line or ':5173' in line:
                    print(f"  {line.strip()}")
        else:
            # Linux/Mac
            result = subprocess.run(['ps', 'aux'], capture_output=True, text=True)
            print("Python processes:")
            for line in result.stdout.split('\n'):
                if 'python' in line.lower():
                    print(f"  {line}")
                    
            result = subprocess.run(['netstat', '-an'], capture_output=True, text=True)
            print("\nListening ports:")
            for line in result.stdout.split('\n'):
                if ':8000' in line or ':5173' in line:
                    print(f"  {line.strip()}")
    except Exception as e:
        print(f"Error checking processes: {e}")

def main():
    print("🌱 ZUBA SOIL SENSE - CONNECTION DIAGNOSTICS")
    print("This script will help diagnose connection issues between frontend and backend")
    
    # Check if ports are listening
    print_header("PORT AVAILABILITY")
    backend_port = check_port_listening(8000)
    frontend_port = check_port_listening(5173)
    
    print(f"Backend port 8000: {'✅ LISTENING' if backend_port else '❌ NOT LISTENING'}")
    print(f"Frontend port 5173: {'✅ LISTENING' if frontend_port else '❌ NOT LISTENING'}")
    
    if not backend_port:
        print("\n🚨 Backend is not running on port 8000!")
        print("   Try starting the backend with: python backend/start_server.py")
    
    if not frontend_port:
        print("\n🚨 Frontend is not running on port 5173!")
        print("   Try starting the frontend with: npm run dev (from frontend/zubasense/)")
    
    # Test API endpoints
    if backend_port:
        print_header("API ENDPOINT TESTS")
        test_api_endpoint("http://localhost:8000/health")
        test_api_endpoint("http://localhost:8000/latest")
        test_api_endpoint("http://127.0.0.1:8000/health")
        test_api_endpoint("http://127.0.0.1:8000/latest")
    
    # Check running processes
    check_running_processes()
    
    print_header("RECOMMENDATIONS")
    if not backend_port and not frontend_port:
        print("❌ Neither backend nor frontend is running")
        print("🔧 Run: python start_zuba.py (and choose option 1 or 3)")
    elif not backend_port:
        print("❌ Backend is not running")
        print("🔧 Run: python backend/start_server.py")
    elif not frontend_port:
        print("❌ Frontend is not running")
        print("🔧 Run: npm run dev (from frontend/zubasense/ directory)")
    else:
        print("✅ Both servers appear to be running")
        print("🔧 Check browser console for detailed error messages")
        print("🔧 Try opening: http://localhost:5173")
    
    print("\n💡 If issues persist:")
    print("   • Check browser console (F12)")
    print("   • Verify no firewall is blocking the ports")
    print("   • Try restarting both servers")
    print("   • Ensure no other applications are using ports 8000 or 5173")

if __name__ == "__main__":
    main()
