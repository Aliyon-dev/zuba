// API service for communicating with Python FastAPI backend
const API_BASE_URL = 'http://localhost:8000';

export interface SensorData {
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

export interface UserPreferences {
  texture: string;
  color: string;
}

class ApiService {
  private async fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 5000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  }

  async getLatestSensorData(): Promise<SensorData | null> {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/latest`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check if we got actual sensor data or just a message
      if (data.message && data.message.includes('No sensor data yet')) {
        return null;
      }
      
      return data as SensorData;
    } catch (error) {
      console.error('Failed to fetch latest sensor data:', error);
      return null;
    }
  }

  async updateUserPreferences(preferences: UserPreferences): Promise<boolean> {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/preferences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Failed to update user preferences:', error);
      return false;
    }
  }

  async getRecommendation(): Promise<{ soil_type: string; recommendation: string } | null> {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/recommendation`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check if we got actual recommendation or just a message
      if (data.message && data.message.includes('No recommendation yet')) {
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Failed to fetch recommendation:', error);
      return null;
    }
  }

  // Check if API is accessible
  async checkApiHealth(): Promise<boolean> {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/latest`);
      return response.ok;
    } catch (error) {
      console.error('API health check failed:', error);
      return false;
    }
  }
}

export const apiService = new ApiService();
