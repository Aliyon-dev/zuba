# Zuba Soil Sense - Live Sensor Integration

This React frontend integrates with your existing Python FastAPI backend to display live sensor readings from your ESP32 soil monitoring system.

## Features
- **Real-time Dashboard**: Live sensor readings with color-coded status indicators
- **Historical Charts**: Time-series graphs of temperature, moisture, pH, and NPK levels
- **Connection Monitoring**: Shows API connection status and last update time
- **Manual Refresh**: Button to manually fetch latest data
- **Error Handling**: Clear feedback when API is disconnected

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Python Backend
In a separate terminal, start your Python API server:
```bash
cd ../backend
uvicorn backend:app --host localhost --port 8000 --reload
```

### 3. Start the Frontend
```bash
npm run dev
```

## API Integration

The frontend automatically connects to your Python API at `http://localhost:8000` and:
- Polls for new sensor data every 5 seconds
- Displays connection status in the header
- Shows historical data in interactive charts
- Updates soil texture/color preferences via the API

### API Endpoints Used
- `GET /latest` - Fetches latest sensor readings
- `POST /preferences` - Updates soil texture/color preferences
- `GET /recommendation` - Gets soil analysis recommendations

## Troubleshooting

### API Connection Issues
1. Ensure Python backend is running on `localhost:8000`
2. Check if ESP32 is connected and sending data
3. Verify the correct COM port in your `backend/process.py`

### CORS Issues
If you encounter CORS issues, add this to your `backend/backend.py`:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## URLs
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

Enjoy your live soil monitoring system! 🌱
