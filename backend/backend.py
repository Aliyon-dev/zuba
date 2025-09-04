# backend.py
from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
from process import ZubaGSMProcessor
import threading

app = FastAPI(title="Zuba SoilSense Backend")

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

@app.get("/latest")
def get_latest_data():
    """Return the last processed sensor data"""
    if hasattr(processor, "last_sensor_read"):
        return processor.last_sensor_read
    return {"message": "No sensor data yet"}

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
