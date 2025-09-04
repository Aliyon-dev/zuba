# 🌱 Zuba Soil Sense - Smart Agriculture System

A comprehensive soil monitoring and analysis system that combines IoT sensors, machine learning, and modern web technologies to provide intelligent farming recommendations.

## 🏗️ System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   ESP32 Sensor  │───▶│  Python Backend  │───▶│ React Frontend  │
│     Hardware    │    │    (FastAPI)     │    │   (TypeScript)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
      ↓                          ↓                        ↓
   Serial Port              Port 8000                Port 5173
```

## 📋 Features

### Backend (Python FastAPI)
- 🔄 Real-time sensor data processing
- 🤖 Machine learning soil type prediction
- 📊 RESTful API with automatic documentation
- 🌐 CORS-enabled for frontend communication
- 📈 Historical data tracking
- 🎯 Smart recommendations based on soil conditions

### Frontend (React TypeScript)
- 📱 Responsive modern UI with Tailwind CSS
- 📊 Real-time data visualization with Recharts
- 🌡️ Live sensor monitoring dashboard
- 💧 Smart irrigation management
- 🗺️ Interactive field mapping
- 🌤️ Weather integration
- ⚠️ Groundwater nitrate risk assessment

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd zuba
   ```

2. **Run the automated setup**
   
   **On Windows:**
   ```bash
   # Double-click start_zuba.bat
   # OR run in command prompt:
   start_zuba.bat
   ```
   
   **On Linux/Mac:**
   ```bash
   python start_zuba.py
   ```

3. **Follow the interactive menu:**
   - Choose option 1 to install dependencies and start both servers
   - The script will automatically set up everything for you

### Option 2: Manual Setup

#### Prerequisites
- Python 3.8+ installed
- Node.js 16+ installed
- npm or yarn package manager

#### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the backend server**
   ```bash
   python start_server.py
   ```
   
   The backend will be available at: `http://localhost:8000`

#### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend/zubasense
   ```

2. **Install Node.js dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   
   The frontend will be available at: `http://localhost:5173`

## 📡 API Documentation

Once the backend is running, visit `http://localhost:8000/docs` for interactive API documentation.

### Key Endpoints

- `GET /health` - API health check
- `GET /latest` - Get latest sensor data
- `POST /preferences` - Update soil texture and color preferences
- `GET /recommendation` - Get farming recommendations

### Example API Response

```json
{
  "device_id": "ESP32_SoilSense_01",
  "timestamp": "2025-01-01T12:00:00",
  "soil_type": "Loamy",
  "temperature": 24.5,
  "moisture": 45.2,
  "n_value": 78,
  "p_value": 42,
  "k_value": 156,
  "user_texture": "Loamy",
  "user_color": "Brown",
  "recommendation": "Maize/Soybean. Balanced soil, moderate irrigation."
}
```

## 🔧 Configuration

### Backend Configuration (`backend/backend.py`)
- **Port**: 8000 (default)
- **CORS Origins**: `http://localhost:5173`
- **Serial Port**: COM6 (Windows) - Adjust for your ESP32 connection

### Frontend Configuration (`frontend/zubasense/src/services/api.ts`)
- **API Base URL**: `http://localhost:8000`
- **Polling Interval**: 5000ms (5 seconds)

## 📊 Frontend Features

### Dashboard
- Real-time sensor readings
- Soil characteristic inputs
- Analysis results with recommendations
- Connection status monitoring

### Smart Irrigation
- Automated irrigation recommendations
- Weather-based irrigation scheduling
- Water usage optimization
- Groundwater nitrate risk assessment

### Analytics
- Historical data visualization
- Temperature and moisture trends
- NPK nutrient level tracking
- pH monitoring over time

### Field Map
- Interactive sensor location mapping
- Real-time sensor status
- Coverage visualization
- GPS coordinates tracking

### Weather Integration
- Current weather conditions
- 5-day forecast
- Irrigation impact analysis
- Rain prediction integration

## 🌐 Network Architecture

```
ESP32 Sensors ──Serial/USB──> Python Backend ──HTTP API──> React Frontend
     │                              │                           │
     │                         Port 8000                   Port 5173
     │                              │                           │
  Hardware Layer              Processing Layer             Presentation Layer
```

## 🛠️ Development

### Adding New Sensors
1. Update the ESP32 firmware to include new sensor readings
2. Modify `backend/process.py` to handle new data fields
3. Update the API models in `backend/backend.py`
4. Add frontend components to display new sensor data

### Customizing ML Models
1. Train your model with local soil data
2. Save the model as `backend/hybrid_soil_crop_model.pkl`
3. Update the label encoder as `backend/label_encoder.pkl`
4. Modify prediction logic in `backend/process.py`

## 🐛 Troubleshooting

### Backend Issues

**"ModuleNotFoundError: No module named 'fastapi'"**
- Run: `pip install -r backend/requirements.txt`

**"Port already in use"**
- Change the port in `backend/start_server.py`
- Update the frontend API URL accordingly

**"Serial port not found"**
- Check ESP32 connection
- Update the port in `backend/process.py`
- Ensure no other applications are using the serial port

### Frontend Issues

**"API Disconnected" status**
- Ensure the backend is running on port 8000
- Check CORS configuration
- Verify network connectivity

**"Failed to fetch sensor data"**
- Check backend logs for errors
- Verify API endpoints are responding
- Check browser console for network errors

## 📁 Project Structure

```
zuba/
├── backend/
│   ├── backend.py              # FastAPI server
│   ├── process.py              # Sensor data processing
│   ├── start_server.py         # Server startup script
│   ├── requirements.txt        # Python dependencies
│   └── *.pkl                   # ML models
├── frontend/
│   └── zubasense/
│       ├── src/
│       │   ├── components/     # React components
│       │   ├── hooks/          # Custom React hooks
│       │   ├── services/       # API services
│       │   └── App.tsx         # Main application
│       └── package.json        # Node.js dependencies
├── start_zuba.py              # Main startup script
├── start_zuba.bat             # Windows batch file
└── README.md                  # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- ESP32 community for hardware inspiration
- FastAPI team for the excellent web framework
- React and TypeScript communities
- Tailwind CSS for beautiful styling
- Recharts for data visualization

## 📞 Support

For support, please:
1. Check the troubleshooting section above
2. Look at the API documentation at `http://localhost:8000/docs`
3. Open an issue on GitHub
4. Check the browser console and backend logs for error messages

---

**Happy Farming! 🌾**
