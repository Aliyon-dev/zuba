#!/usr/bin/env python3
"""
Zuba Soil Sense - Complete Startup Script
This script helps you start both the backend and frontend services
"""

import os
import sys
import subprocess
import time
import platform
from pathlib import Path

def print_banner():
    """Print startup banner"""
    print("\n" + "="*80)
    print("🌱 ZUBA SOIL SENSE - STARTUP MANAGER")
    print("="*80)
    print("This script will help you start the complete Zuba system:")
    print("• Python FastAPI Backend (Port 8000)")
    print("• React TypeScript Frontend (Port 5173)")
    print("="*80)

def check_python():
    """Check if Python is available"""
    try:
        result = subprocess.run([sys.executable, "--version"], capture_output=True, text=True)
        print(f"✅ Python found: {result.stdout.strip()}")
        return True
    except:
        print("❌ Python not found!")
        return False

def check_node():
    """Check if Node.js is available"""
    try:
        result = subprocess.run(["node", "--version"], capture_output=True, text=True)
        print(f"✅ Node.js found: {result.stdout.strip()}")
        return True
    except:
        print("❌ Node.js not found! Please install Node.js from https://nodejs.org/")
        return False

def install_backend_deps():
    """Install Python backend dependencies"""
    print("\n🔧 Installing Python backend dependencies...")
    backend_dir = Path(__file__).parent / "backend"
    requirements_file = backend_dir / "requirements.txt"
    
    if requirements_file.exists():
        try:
            subprocess.run([
                sys.executable, "-m", "pip", "install", "-r", str(requirements_file)
            ], check=True, cwd=str(backend_dir))
            print("✅ Backend dependencies installed successfully!")
            return True
        except subprocess.CalledProcessError:
            print("❌ Failed to install backend dependencies!")
            return False
    else:
        print("❌ requirements.txt not found in backend directory!")
        return False

def install_frontend_deps():
    """Install Node.js frontend dependencies"""
    print("\n🔧 Installing Node.js frontend dependencies...")
    frontend_dir = Path(__file__).parent / "frontend" / "zubasense"
    
    if (frontend_dir / "package.json").exists():
        try:
            subprocess.run(["npm", "install"], check=True, cwd=str(frontend_dir))
            print("✅ Frontend dependencies installed successfully!")
            return True
        except subprocess.CalledProcessError:
            print("❌ Failed to install frontend dependencies!")
            return False
    else:
        print("❌ package.json not found in frontend directory!")
        return False

def start_backend():
    """Start the Python backend server"""
    print("\n🚀 Starting Backend Server...")
    backend_dir = Path(__file__).parent / "backend"
    
    try:
        # Start the backend server
        if platform.system() == "Windows":
            subprocess.Popen([
                sys.executable, str(backend_dir / "start_server.py")
            ], cwd=str(backend_dir), creationflags=subprocess.CREATE_NEW_CONSOLE)
        else:
            subprocess.Popen([
                sys.executable, "start_server.py"
            ], cwd=str(backend_dir))
        
        print("✅ Backend server starting on http://localhost:8000")
        print("📊 API docs will be available at http://localhost:8000/docs")
        return True
    except Exception as e:
        print(f"❌ Failed to start backend: {e}")
        return False

def start_frontend():
    """Start the React frontend"""
    print("\n🚀 Starting Frontend Development Server...")
    frontend_dir = Path(__file__).parent / "frontend" / "zubasense"
    
    try:
        # Start the frontend development server
        if platform.system() == "Windows":
            subprocess.Popen([
                "npm", "run", "dev"
            ], cwd=str(frontend_dir), creationflags=subprocess.CREATE_NEW_CONSOLE)
        else:
            subprocess.Popen([
                "npm", "run", "dev"
            ], cwd=str(frontend_dir))
        
        print("✅ Frontend server starting on http://localhost:5173")
        return True
    except Exception as e:
        print(f"❌ Failed to start frontend: {e}")
        return False

def main():
    """Main startup function"""
    print_banner()
    
    # Check prerequisites
    if not check_python():
        return False
    if not check_node():
        return False
    
    # Ask user what they want to do
    print("\nWhat would you like to do?")
    print("1. Install dependencies and start both servers")
    print("2. Install dependencies only")
    print("3. Start both servers (skip dependency installation)")
    print("4. Start backend only")
    print("5. Start frontend only")
    
    choice = input("\nEnter your choice (1-5): ").strip()
    
    if choice in ["1", "2"]:
        print("\n📦 Installing dependencies...")
        backend_success = install_backend_deps()
        frontend_success = install_frontend_deps()
        
        if not (backend_success and frontend_success):
            print("\n❌ Dependency installation failed!")
            return False
        
        if choice == "2":
            print("\n✅ Dependencies installed successfully!")
            print("You can now run this script again with option 3 to start the servers.")
            return True
    
    if choice in ["1", "3", "4"]:
        # Start backend
        if not start_backend():
            return False
        print("⏳ Waiting for backend to initialize...")
        time.sleep(3)
    
    if choice in ["1", "3", "5"]:
        # Start frontend
        if not start_frontend():
            return False
        print("⏳ Waiting for frontend to initialize...")
        time.sleep(2)
    
    if choice in ["1", "3"]:
        print("\n" + "="*80)
        print("🎉 ZUBA SOIL SENSE STARTED SUCCESSFULLY!")
        print("="*80)
        print("🌐 Frontend: http://localhost:5173")
        print("🔧 Backend API: http://localhost:8000")
        print("📊 API Documentation: http://localhost:8000/docs")
        print("="*80)
        print("💡 The frontend will automatically connect to the backend.")
        print("💡 Check the connection status indicator in the web interface.")
        print("💡 Press Ctrl+C in the server windows to stop the services.")
        print("="*80)
    
    return True

if __name__ == "__main__":
    try:
        success = main()
        if success:
            print("\n✅ Startup completed successfully!")
        else:
            print("\n❌ Startup failed. Please check the errors above.")
    except KeyboardInterrupt:
        print("\n\n🛑 Startup cancelled by user.")
