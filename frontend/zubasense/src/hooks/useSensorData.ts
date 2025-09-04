import { useState, useEffect, useCallback, useRef } from 'react';

// Fallback types if API service is not available
interface SensorData {
  device_id: string;
  timestamp: string;
  soil_type: string;
  temperature: number;
  moisture: number;
  n_value: number;
  p_value: number;
  k_value: number;
  user_texture: string;
  user_color: string;
  recommendation: string;
}

interface UserPreferences {
  texture: string;
  color: string;
}

// Fallback API service
const fallbackApiService = {
  async getLatestSensorData(): Promise<SensorData | null> {
    // Return mock data when API is not available
    return {
      device_id: 'ESP32_SoilSense_01',
      timestamp: new Date().toISOString(),
      soil_type: 'Loamy',
      temperature: Math.round((24.5 + (Math.random() - 0.5) * 4) * 10) / 10,
      moisture: Math.round((45.2 + (Math.random() - 0.5) * 10) * 10) / 10,
      n_value: Math.round((78 + (Math.random() - 0.5) * 20) * 10) / 10,
      p_value: Math.round((42 + (Math.random() - 0.5) * 16) * 10) / 10,
      k_value: Math.round((156 + (Math.random() - 0.5) * 30) * 10) / 10,

      user_texture: 'Loamy',
      user_color: 'Brown',
      recommendation: 'Soil conditions are good for most crops'
    };
  },
  
  async updateUserPreferences(preferences: UserPreferences): Promise<boolean> {
    console.log('Mock: Updated preferences', preferences);
    return true;
  },
  
  async  checkApiHealth(): Promise<boolean> {
    return false; // API not available in fallback mode
  }
};

// Use fallback API service for now
const apiService = fallbackApiService;

interface UseSensorDataReturn {
  sensorData: SensorData | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  historicalData: Array<{
    time: string;
    temperature: number;
    moisture: number;
    ph: number;
    nitrogen: number;
    phosphorus: number;
    potassium: number;
  }>;
  updatePreferences: (preferences: UserPreferences) => Promise<boolean>;
  refreshData: () => Promise<void>;
}

export const useSensorData = (pollingInterval = 5000): UseSensorDataReturn => {
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [historicalData, setHistoricalData] = useState<Array<{
    time: string;
    temperature: number;
    moisture: number;
    ph: number;
    nitrogen: number;
    phosphorus: number;
    potassium: number;
  }>>([]);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(true);

  // Function to fetch data from API
  const fetchSensorData = useCallback(async () => {
    if (!isActiveRef.current) return;

    try {
      setError(null);
      
      // Check API health first
      const isHealthy = await apiService.checkApiHealth();
      setIsConnected(isHealthy);

      /* if (!isHealthy) {
        setError('Cannot connect to sensor API. Please ensure the Python backend is running on localhost:8000');
        setIsLoading(false);
        return;
      }*/

      // Fetch latest sensor data
      const data = await apiService.getLatestSensorData();
      
      if (data && isActiveRef.current) {
        setSensorData(data);
        setLastUpdated(new Date());
        
        // Update historical data (keep last 20 readings)
        setHistoricalData(prev => {
          const newEntry = {
            time: new Date(data.timestamp).toLocaleTimeString('en-US', { 
              hour12: false,
              hour: '2-digit',
              minute: '2-digit'
            }),
            temperature: data.temperature,
            moisture: data.moisture,
            ph: 6.8, // Placeholder - you can add pH sensor data to your Python API
            nitrogen: data.n_value,
            phosphorus: data.p_value,
            potassium: data.k_value,
          };

          const updated = [...prev, newEntry].slice(-20); // Keep last 20 readings
          return updated;
        });
      }

      setIsLoading(false);
    } catch (err) {
      if (isActiveRef.current) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(`Failed to fetch sensor data: ${errorMessage}`);
        setIsConnected(false);
        setIsLoading(false);
      }
    }
  }, []);

  // Function to update user preferences
  const updatePreferences = useCallback(async (preferences: UserPreferences): Promise<boolean> => {
    try {
      const success = await apiService.updateUserPreferences(preferences);
      if (success) {
        // Refresh data after updating preferences
        await fetchSensorData();
      }
      return success;
    } catch (err) {
      console.error('Failed to update preferences:', err);
      return false;
    }
  }, [fetchSensorData]);

  // Manual refresh function
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    await fetchSensorData();
  }, [fetchSensorData]);

  // Set up polling interval
  useEffect(() => {
    isActiveRef.current = true;

    // Initial fetch
    fetchSensorData();

    // Set up polling interval
    if (pollingInterval > 0) {
      intervalRef.current = setInterval(() => {
        fetchSensorData();
      }, pollingInterval);
    }

    // Cleanup function
    return () => {
      isActiveRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchSensorData, pollingInterval]);

  return {
    sensorData,
    isConnected,
    isLoading,
    error,
    lastUpdated,
    historicalData,
    updatePreferences,
    refreshData,
  };
};
