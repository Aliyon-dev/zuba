import { useState, useEffect, useCallback, useRef } from 'react';
import { apiService, type SensorData, type UserPreferences } from '../services/api';

type HistoricalEntry = {
  time: string;
  temperature: number;
  moisture: number;
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
};

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
  const [historicalData, setHistoricalData] = useState<HistoricalEntry[]>([]);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
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
        setHistoricalData((prev: HistoricalEntry[]) => {
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
      } else if (isHealthy && isActiveRef.current) {
        // Backend is healthy but no sensor data yet - provide mock data for development
        const mockData: SensorData = {
          device_id: 'ESP32_SoilSense_Mock',
          timestamp: new Date().toISOString(),
          soil_type: 'Loamy',
          temperature: 24.5 + (Math.random() - 0.5) * 4,
          moisture: 45.2 + (Math.random() - 0.5) * 10,
          n_value: 78 + Math.floor((Math.random() - 0.5) * 20),
          p_value: 42 + Math.floor((Math.random() - 0.5) * 16),
          k_value: 156 + Math.floor((Math.random() - 0.5) * 30),
          user_texture: 'Loamy',
          user_color: 'Brown',
          recommendation: 'Soil conditions are good for most crops. Mock data for development.'
        };
        
        setSensorData(mockData);
        setLastUpdated(new Date());
        
        // Update historical data with mock entry
        setHistoricalData((prev: HistoricalEntry[]) => {
          const newEntry = {
            time: new Date().toLocaleTimeString('en-US', { 
              hour12: false,
              hour: '2-digit',
              minute: '2-digit'
            }),
            temperature: mockData.temperature,
            moisture: mockData.moisture,
            ph: 6.8,
            nitrogen: mockData.n_value,
            phosphorus: mockData.p_value,
            potassium: mockData.k_value,
          };

          const updated = [...prev, newEntry].slice(-20);
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
