# zuba_gsm_processor.py
import serial
import json
import time
import threading
from datetime import datetime
import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import os
import logging
from typing import Dict, Any, Optional


class ZubaGSMProcessor:
    def __init__(self, debug_mode=False):
        self.model = None
        self.label_encoder = None
        self.debug_mode = debug_mode
        self.user_texture = "Loamy"  # Default values
        self.user_color = "Brown"    # Default values

        # Configuration
        self.esp32_port = 'COM6'  # Your ESP32 port
        self.esp32_baud = 115200
        
        # Setup logging
        log_level = logging.DEBUG if debug_mode else logging.INFO
        logging.basicConfig(
            level=log_level,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler("zuba_processor.log", encoding='utf-8'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)

    def get_user_inputs(self):
        """Get soil texture and color from user input"""
        print("\n" + "="*50)
        print("SOIL PROPERTIES INPUT")
        print("="*50)
        
        # Get texture input
        texture_options = ["Gritty", "medium grit", "fine", "Smooth-powdery"]
        print("Available soil textures:")
        for i, texture in enumerate(texture_options, 1):
            print(f"{i}. {texture}")
        
        while True:
            try:
                texture_choice = input("\nSelect soil texture (1-4): ").strip()
                if texture_choice in ['1', '2', '3', '4']:
                    self.user_texture = texture_options[int(texture_choice) - 1]
                    break
                else:
                    print("Please enter a number between 1-4")
            except ValueError:
                print("Invalid input. Please enter a number.")
        
        # Get color input
        color_options = ["Brown", "Black", "Red", "Yellow", "White", "Grey"]
        print("\nAvailable soil colors:")
        for i, color in enumerate(color_options, 1):
            print(f"{i}. {color}")
        
        while True:
            try:
                color_choice = input("\nSelect soil color (1-6): ").strip()
                if color_choice in ['1', '2', '3', '4', '5', '6']:
                    self.user_color = color_options[int(color_choice) - 1]
                    break
                else:
                    print("Please enter a number between 1-6")
            except ValueError:
                print("Invalid input. Please enter a number.")
        
        print(f"\nSelected: {self.user_texture} texture, {self.user_color} color")
        print("="*50 + "\n")

    def load_ml_model(self):
        """Load ML model for soil prediction"""
        try:
            self.model = joblib.load('hybrid_soil_crop_model.pkl')
            self.label_encoder = joblib.load('label_encoder.pkl')
            self.logger.info("ML Model loaded successfully")
        except Exception as e:
            self.logger.warning("Model load failed: %s. Using dummy model.", e)
            # Fallback dummy model
            X_dummy = np.array([[28, 45, 6.5, 40, 25, 30, 0.8, 3]])
            y_dummy = ['Loamy']
            self.label_encoder = LabelEncoder()
            y_encoded = self.label_encoder.fit_transform(y_dummy)
            self.model = RandomForestClassifier(n_estimators=10, random_state=42)
            self.model.fit(X_dummy, y_encoded)

    def predict_soil_type(self, sensor_data: Dict[str, Any]) -> str:
        """Predict soil type from sensor data using user texture"""
        try:
            # Map texture to numerical code
            texture_map = {"Sandy": 1, "Loamy": 3, "Clayey": 2, "Silty": 4, "Unknown": 3}
            texture_code = texture_map.get(self.user_texture, 3)
            
            features = [
                sensor_data.get('temperature', 28.0),
                sensor_data.get('moisture', 50.0),
                6.5,  # ph_value placeholder
                sensor_data.get('n_value', 40),
                sensor_data.get('p_value', 25),
                sensor_data.get('k_value', 30),
                0.5,  # drainage_rate placeholder
                texture_code  # Use the texture code from user input
            ]
            features_array = np.array(features).reshape(1, -1)
            prediction_encoded = self.model.predict(features_array)
            return self.label_encoder.inverse_transform(prediction_encoded)[0]
        except Exception as e:
            self.logger.error("Prediction failed: %s", e)
            return self.user_texture  # Fallback to user input

    def get_recommendation(self, soil_type: str, moisture: float) -> str:
        """Generate agricultural recommendations based on soil type and moisture"""
        base_recommendations = {
            'Sandy': "Sunflower/Millet. Good drainage, needs frequent irrigation.",
            'Loamy': "Maize/Soybean. Balanced soil, moderate irrigation.",
            'Clayey': "Rice/Spinach. Poor drainage, careful irrigation needed.",
            'Silty': "Wheat/Barley. Fertile but may compact easily."
        }
        
        # Color-based adjustments
        color_notes = {
            'Brown': "Good organic content.",
            'Black': "High organic matter, very fertile.",
            'Red': "Iron-rich soil, may need pH adjustment.",
            'Yellow': "Possible drainage issues, may need improvement.",
            'White': "May be saline or leached, test pH.",
            'Grey': "Poor drainage, may need soil amendments."
        }
        
        base = base_recommendations.get(soil_type, "Consult agricultural expert")
        color_note = color_notes.get(self.user_color, "")
        
        # Moisture alert
        moisture_alert = ""
        if moisture < 20:
            moisture_alert = " 🚨 CRITICAL - IRRIGATE IMMEDIATELY!"
        elif moisture < 30:
            moisture_alert = " 🚨 IRRIGATE NOW!"
        elif moisture < 50 and soil_type in ['Sandy', 'Silty']:
            moisture_alert = " 💧 Irrigation recommended."
        elif moisture < 60 and soil_type in ['Clayey']:
            moisture_alert = " 💧 Irrigation recommended."
        
        return f"{base} {color_note}{moisture_alert}"

    def validate_sensor_data(self, data: Dict[str, Any]) -> bool:
        """Validate incoming sensor data from ESP32"""
        required_fields = ['temperature', 'moisture', 'n_value', 'p_value', 'k_value']
        for field in required_fields:
            if field not in data:
                self.logger.warning("Missing field: %s", field)
                return False
        
        if not (-40 <= data.get('temperature', 0) <= 100):
            self.logger.warning("Temperature out of range")
            return False
            
        if not (0 <= data.get('moisture', 0) <= 100):
            self.logger.warning("Moisture out of range")
            return False
            
        return True

    def process_sensor_data(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        """Main processing pipeline"""
        # Validate data first
        if not self.validate_sensor_data(raw_data):
            self.logger.warning("Invalid sensor data received")
            return None

        # Predict soil type
        soil_type = self.predict_soil_type(raw_data)

        processed_data = {
            "device_id": "ESP32_SoilSense_01",
            "timestamp": datetime.now().isoformat(),
            "soil_type": soil_type,
            "temperature": raw_data.get('temperature', 0),
            "moisture": raw_data.get('moisture', 0),
            "n_value": raw_data.get('n_value', 0),
            "p_value": raw_data.get('p_value', 0),
            "k_value": raw_data.get('k_value', 0),
            "user_texture": self.user_texture,
            "user_color": self.user_color,
            "recommendation": self.get_recommendation(soil_type, raw_data.get('moisture', 0))
        }

        self.last_sensor_read = processed_data

        # Display in terminal
        self.display_sensor_data(processed_data)

        return processed_data

    def display_sensor_data(self, data: Dict[str, Any]):
        """Display sensor data in a readable format in terminal"""
        print("\n" + "="*60)
        print("SOIL SENSE - SENSOR READINGS")
        print("="*60)
        print(f"Temperature: {data['temperature']:.1f}°C")
        print(f"Moisture:    {data['moisture']}%")
        print(f"N-P-K:       {data['n_value']}-{data['p_value']}-{data['k_value']}")
        print(f"User Input:  {data['user_texture']} texture, {data['user_color']} color")
        print(f"Prediction:  {data['soil_type']} soil")
        print("-"*60)
        print("RECOMMENDATION:")
        print(data['recommendation'])
        print("="*60 + "\n")

    def setup_serial_connection(self, port: str, baudrate: int, max_retries: int = 3) -> Optional[serial.Serial]:
        """Establish serial connection with retry logic"""
        for attempt in range(max_retries):
            try:
                ser = serial.Serial(port, baudrate, timeout=1)
                ser.flush()
                self.logger.info("Serial connected to %s", port)
                return ser
            except Exception as e:
                self.logger.error("Attempt %d/%d failed: %s", attempt+1, max_retries, e)
                time.sleep(2)
        return None

    def process_serial_data(self, ser: serial.Serial):
        """Process data from serial connection"""
        if ser and ser.in_waiting > 0:
            try:
                line = ser.readline().decode('utf-8', errors='ignore').strip()
                if not line:
                    return
                
                if line.startswith('{') and line.endswith('}'):
                    self.logger.debug("Raw JSON: %s", line)
                    sensor_data = json.loads(line)
                    result = self.process_sensor_data(sensor_data)
                    if result:
                        self.logger.info("Data processed successfully")
                else:
                    # Display non-JSON messages
                    if line and not line.isspace():
                        print(f"ESP32: {line}")
                        
            except json.JSONDecodeError as e:
                self.logger.error("JSON decode error: %s", e)
                self.logger.debug("Problematic data: %s", line)
            except Exception as e:
                self.logger.error("Processing error: %s", e)

    def test_serial_connection(self):
        """Test the serial connection and report available ports"""
        self.logger.info("Testing serial connections...")
        
        if os.name == 'nt':  # Windows
            ports = [f'COM{i}' for i in range(1, 10)]
        else:  # Linux/Mac
            ports = ['/dev/ttyUSB0', '/dev/ttyUSB1', '/dev/ttyACM0', '/dev/ttyACM1', '/dev/serial0']
        
        available_ports = []
        for port in ports:
            try:
                ser = serial.Serial(port)
                ser.close()
                available_ports.append(port)
                self.logger.info("Port available: %s", port)
            except:
                self.logger.debug("Port not available: %s", port)
        
        return available_ports

    def run(self):
        """Main processing loop"""
        print("\n" + "="*60)
        print("Zuba SoilSense Processor - Starting...")
        print("="*60)
        
        # Get user inputs first
        self.get_user_inputs()
        
        # Test serial connections
        available_ports = self.test_serial_connection()
        
        if self.esp32_port not in available_ports:
            print(f"Warning: Configured port {self.esp32_port} not found!")
            if available_ports:
                print(f"Trying first available port: {available_ports[0]}")
                self.esp32_port = available_ports[0]
            else:
                print("No serial ports available!")
                return

        # Load ML model
        self.load_ml_model()

        # Setup ESP32 communication
        esp32_serial = self.setup_serial_connection(self.esp32_port, self.esp32_baud)
        
        if not esp32_serial:
            print("Failed to establish serial connection.")
            print("Please check:")
            print(f"1. ESP32 is connected to {self.esp32_port}")
            print("2. The baud rate is 115200")
            print("3. No other program is using the serial port")
            return
        
        print("\n" + "="*60)
        print("Zuba SoilSense Processor - Ready!")
        print("Listening for sensor data from ESP32...")
        print("Press Ctrl+C to stop")
        print("="*60 + "\n")

        try:
            while True:
                self.process_serial_data(esp32_serial)
                time.sleep(0.1)
        except KeyboardInterrupt:
            print("\nProcessor stopped by user")
        finally:
            if esp32_serial:
                esp32_serial.close()
            print("Serial connection closed")


if __name__ == '__main__':
    # Create dummy model files if they don't exist
    if not os.path.exists('hybrid_soil_crop_model.pkl'):
        print("Creating dummy model files...")
        X_dummy = np.array([[28, 45, 6.5, 40, 25, 30, 0.8, 3]])
        y_dummy = ['Loamy']
        label_encoder = LabelEncoder()
        y_encoded = label_encoder.fit_transform(y_dummy)
        model = RandomForestClassifier(n_estimators=10, random_state=42)
        model.fit(X_dummy, y_encoded)
        joblib.dump(model, 'hybrid_soil_crop_model.pkl')
        joblib.dump(label_encoder, 'label_encoder.pkl')
        print("Dummy model files created!")
    
    processor = ZubaGSMProcessor(debug_mode=False)
    processor.run() 