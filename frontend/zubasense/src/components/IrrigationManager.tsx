import React, { useState, useEffect } from 'react';
import { Droplets, AlertTriangle, CheckCircle, Clock, Thermometer, Cloud, Sun, CloudRain } from 'lucide-react';

interface SensorData {
  temperature: number;
  moisture: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
}

interface WeatherData {
  current: {
    temp: number;
    humidity: number;
    condition: string;
  };
  forecast: Array<{
    day: string;
    high: number;
    low: number;
    rain: number;
    condition: string;
  }>;
}

interface IrrigationManagerProps {
  sensorData: SensorData;
  weatherData: WeatherData;
  onIrrigationToggle: (status: boolean) => void;
  irrigationStatus: boolean;
}

export const IrrigationManager: React.FC<IrrigationManagerProps> = ({
  sensorData,
  weatherData,
  onIrrigationToggle,
  irrigationStatus
}) => {
  const [recommendations, setRecommendations] = useState({
    shouldIrrigate: false,
    urgency: 'low' as 'low' | 'medium' | 'high',
    reason: '',
    waterAmount: 0,
    nextIrrigation: '',
    weatherImpact: ''
  });

  // Calculate irrigation recommendations based on sensor data and weather
  const calculateIrrigationNeeds = () => {
    const { temperature, moisture } = sensorData;
    const { current, forecast } = weatherData;
    
    let shouldIrrigate = false;
    let urgency: 'low' | 'medium' | 'high' = 'low';
    let reason = '';
    let waterAmount = 0;
    let nextIrrigation = '';
    let weatherImpact = '';

    // Base moisture thresholds
    const criticalMoisture = 20;
    const lowMoisture = 35;
    const optimalMoisture = 60;

    // Temperature adjustments
    const tempMultiplier = temperature > 30 ? 1.3 : temperature > 25 ? 1.1 : 1.0;
    
    // Check upcoming rain in next 2 days
    const upcomingRain = forecast.slice(0, 2).reduce((total, day) => total + day.rain, 0);
    const rainExpected = upcomingRain > 40;

    // Determine irrigation need
    if (moisture < criticalMoisture) {
      shouldIrrigate = true;
      urgency = 'high';
      reason = `Critical moisture level (${moisture}%). Immediate irrigation required.`;
      waterAmount = Math.round((optimalMoisture - moisture) * 0.8 * tempMultiplier);
    } else if (moisture < lowMoisture && !rainExpected) {
      shouldIrrigate = true;
      urgency = 'medium';
      reason = `Low moisture level (${moisture}%) with no significant rain expected.`;
      waterAmount = Math.round((optimalMoisture - moisture) * 0.6 * tempMultiplier);
    } else if (moisture < lowMoisture && rainExpected) {
      shouldIrrigate = false;
      urgency = 'low';
      reason = `Moisture is low (${moisture}%) but ${upcomingRain}% rain expected in next 2 days.`;
      weatherImpact = 'Rain expected - irrigation delayed';
    } else {
      shouldIrrigate = false;
      urgency = 'low';
      reason = `Moisture level optimal (${moisture}%). No irrigation needed.`;
    }

    // Weather impact analysis
    if (!weatherImpact) {
      if (current.temp > 30) {
        weatherImpact = 'High temperature increases water needs';
      } else if (current.humidity < 40) {
        weatherImpact = 'Low humidity increases evaporation';
      } else if (upcomingRain > 60) {
        weatherImpact = 'Heavy rain expected - reduce irrigation';
      }
    }

    // Calculate next irrigation timing
    if (shouldIrrigate) {
      nextIrrigation = 'Now';
    } else if (rainExpected) {
      nextIrrigation = `After rain (${forecast.find(day => day.rain > 20)?.day || 'Soon'})`;
    } else {
      const hoursUntilNext = Math.max(6, Math.round((moisture - lowMoisture) * 2));
      nextIrrigation = `In ${hoursUntilNext} hours`;
    }

    setRecommendations({
      shouldIrrigate,
      urgency,
      reason,
      waterAmount: Math.max(waterAmount, 0),
      nextIrrigation,
      weatherImpact
    });
  };

  useEffect(() => {
    calculateIrrigationNeeds();
  }, [sensorData, weatherData]);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'high': return <AlertTriangle size={20} className="text-red-600" />;
      case 'medium': return <Clock size={20} className="text-orange-600" />;
      default: return <CheckCircle size={20} className="text-green-600" />;
    }
  };

  const getWeatherIcon = (condition: string) => {
    if (condition.toLowerCase().includes('rain') || condition.toLowerCase().includes('storm')) {
      return <CloudRain size={16} className="text-blue-600" />;
    } else if (condition.toLowerCase().includes('cloud')) {
      return <Cloud size={16} className="text-gray-600" />;
    }
    return <Sun size={16} className="text-yellow-600" />;
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
        <Droplets className="mr-3 text-blue-600" size={24} />
        Smart Irrigation Management
      </h2>

      {/* Current Status */}
      <div className={`p-4 rounded-xl border-2 mb-6 ${getUrgencyColor(recommendations.urgency)}`}>
        <div className="flex items-center mb-2">
          {getUrgencyIcon(recommendations.urgency)}
          <span className="font-semibold ml-2 capitalize">{recommendations.urgency} Priority</span>
        </div>
        <p className="text-sm">{recommendations.reason}</p>
      </div>

      {/* Irrigation Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-xl">
          <div className="flex items-center mb-2">
            <Droplets className="text-blue-600 mr-2" size={20} />
            <span className="font-medium text-gray-800">Water Amount</span>
          </div>
          <p className="text-xl font-bold text-blue-600">
            {recommendations.waterAmount > 0 ? `${recommendations.waterAmount} L/m²` : 'None needed'}
          </p>
        </div>

        <div className="bg-purple-50 p-4 rounded-xl">
          <div className="flex items-center mb-2">
            <Clock className="text-purple-600 mr-2" size={20} />
            <span className="font-medium text-gray-800">Next Irrigation</span>
          </div>
          <p className="text-xl font-bold text-purple-600">{recommendations.nextIrrigation}</p>
        </div>
      </div>

      {/* Weather Impact */}
      {recommendations.weatherImpact && (
        <div className="bg-yellow-50 p-4 rounded-xl mb-6">
          <div className="flex items-center mb-2">
            <Thermometer className="text-yellow-600 mr-2" size={20} />
            <span className="font-medium text-gray-800">Weather Impact</span>
          </div>
          <p className="text-sm text-gray-700">{recommendations.weatherImpact}</p>
        </div>
      )}

      {/* Weather Forecast Impact */}
      <div className="bg-gray-50 p-4 rounded-xl mb-6">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
          <Cloud className="mr-2" size={18} />
          3-Day Irrigation Forecast
        </h3>
        <div className="space-y-2">
          {weatherData.forecast.slice(0, 3).map((day, index) => {
            const irrigationNeeded = day.rain < 20 && (sensorData.moisture < 40 || day.high > 28);
            return (
              <div key={index} className="flex items-center justify-between p-2 bg-white rounded-lg">
                <div className="flex items-center space-x-3">
                  {getWeatherIcon(day.condition)}
                  <span className="font-medium w-16">{day.day}</span>
                  <span className="text-sm text-gray-600">{day.condition}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm">{day.high}°C</span>
                  <span className="text-sm text-blue-600">{day.rain}%</span>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    irrigationNeeded 
                      ? 'bg-orange-100 text-orange-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {irrigationNeeded ? 'Irrigate' : 'Skip'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Control Panel */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <span className="font-medium text-gray-800">Irrigation System</span>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            irrigationStatus 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {irrigationStatus ? 'ACTIVE' : 'STANDBY'}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => onIrrigationToggle(true)}
            disabled={irrigationStatus}
            className={`py-3 px-4 rounded-xl font-medium transition-all ${
              irrigationStatus
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : recommendations.shouldIrrigate
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
            }`}
          >
            Start Irrigation
          </button>
          
          <button
            onClick={() => onIrrigationToggle(false)}
            disabled={!irrigationStatus}
            className={`py-3 px-4 rounded-xl font-medium transition-all ${
              !irrigationStatus
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            Stop Irrigation
          </button>
        </div>

        {recommendations.shouldIrrigate && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle size={16} className="text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-800">
                Recommendation: Start irrigation for {recommendations.waterAmount} L/m² based on current conditions
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
