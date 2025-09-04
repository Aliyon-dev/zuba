# backend.py
from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
from process import ZubaGSMProcessor
import threading
from fastapi.middleware.cors import CORSMiddleware



app = FastAPI(title="Zuba SoilSense Backend")
# Temporarily more permissive CORS for debugging
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for debugging
    allow_credentials=False,  # Set to False when allowing all origins
    allow_methods=["*"],
    allow_headers=["*"],
)

# Instantiate processor
processor = ZubaGSMProcessor(debug_mode=False)
processor.load_ml_model()

# Background thread to run serial processing
def run_processor():
    processor.run()

threading.Thread(target=run_processor, daemon=True).start()

# Pydantic models for clean API
class UserPreferences(BaseModel):
    texture: str
    color: str

@app.get("/health")
def health_check():
    """Health check endpoint for API status"""
    return {
        "status": "healthy",
        "service": "Zuba SoilSense Backend",
        "version": "1.0.0",
        "processor_running": hasattr(processor, "last_sensor_read")
    }

@app.get("/latest")
def get_latest_data():
    """Return the last processed sensor data"""
    if hasattr(processor, "last_sensor_read") and processor.last_sensor_read:
        return processor.last_sensor_read
    else:
        # Return mock data when no sensor data is available (for development)
        from datetime import datetime
        import random
        
        mock_data = {
            "device_id": "ESP32_SoilSense_Mock",
            "timestamp": datetime.now().isoformat(),
            "soil_type": "Loamy",
            "temperature": round(24.5 + (random.random() - 0.5) * 4, 1),
            "moisture": round(45.2 + (random.random() - 0.5) * 10, 1),
            "n_value": int(78 + (random.random() - 0.5) * 20),
            "p_value": int(42 + (random.random() - 0.5) * 16),
            "k_value": int(156 + (random.random() - 0.5) * 30),
            "user_texture": processor.user_texture,
            "user_color": processor.user_color,
            "recommendation": "Mock data for development - sensor readings unavailable"
        }
        return mock_data

@app.post("/preferences")
def update_preferences(prefs: UserPreferences):
    """Update soil texture and color from API instead of CLI input"""
    processor.user_texture = prefs.texture
    processor.user_color = prefs.color
    return {"message": "Preferences updated", "prefs": prefs.dict()}

@app.get("/recommendation")
def get_recommendation():
    """Get recommendation based on last soil reading"""
    if hasattr(processor, "last_sensor_read"):
        data = processor.last_sensor_read
        return {
            "soil_type": data["soil_type"],
            "recommendation": data["recommendation"]
        }
    return {"message": "No recommendation yet"}
