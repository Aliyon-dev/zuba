#!/usr/bin/env python3
"""
Zuba Backend Server Startup Script
This script starts the FastAPI server for the Zuba Soil Sense project
"""

import uvicorn
import os
import sys

def main():
    """Start the FastAPI server"""
    
    # Change to backend directory if not already there
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(backend_dir)
    
    print("="*60)
    print("🌱 Starting Zuba Soil Sense Backend Server")
    print("="*60)
    print("📍 Server will run on: http://localhost:8000")
    print("📊 API Documentation: http://localhost:8000/docs")
    print("🔗 Frontend should connect to: http://localhost:8000")
    print("="*60)
    print("Press Ctrl+C to stop the server")
    print("="*60)
    
    # Run the FastAPI server
    uvicorn.run(
        "backend:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        reload_dirs=[backend_dir]
    )

if __name__ == "__main__":
    main()
