import React, { useState, useEffect } from 'react';
import { Play, Thermometer, Droplets, Activity, Leaf, MapPin, Cloud, Lightbulb, Power, Palette, Eye, RefreshCw, Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useSensorData } from './hooks/useSensorData';
import { IrrigationManager } from './components/IrrigationManager';

const ZubaSoilSense = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isRunning, setIsRunning] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [pumpStatus, setPumpStatus] = useState(false);
  const [soilTexture, setSoilTexture] = useState('');
  const [soilColor, setSoilColor] = useState('');
  
  // Use live sensor data from API
  const {
    sensorData: liveSensorData,
    isConnected,
    isLoading,
    error,
    lastUpdated,
    historicalData: liveHistoricalData,
    updatePreferences,
    refreshData
  } = useSensorData(5000); // Poll every 5 seconds
  
  // Transform live data to match existing component format
  const sensorData = liveSensorData ? {
    region: 'Lusaka Province',
    temperature: liveSensorData.temperature,
    moisture: liveSensorData.moisture,
    ph: 6.8, // Placeholder - can be added to your Python API
    nitrogen: liveSensorData.n_value,
    phosphorus: liveSensorData.p_value,
    potassium: liveSensorData.k_value
  } : {
    region: 'Lusaka Province',
    temperature: 0,
    moisture: 0,
    ph: 0,
    nitrogen: 0,
    phosphorus: 0,
    potassium: 0
  };

  // Use live historical data or fallback to default data
  const historicalData = liveHistoricalData.length > 0 ? liveHistoricalData : [
    { time: '08:00', temperature: 22.1, moisture: 48.5, ph: 6.7, nitrogen: 75, phosphorus: 40, potassium: 152 },
    { time: '10:00', temperature: 23.8, moisture: 46.8, ph: 6.8, nitrogen: 76, phosphorus: 41, potassium: 154 },
    { time: '12:00', temperature: 25.2, moisture: 44.1, ph: 6.9, nitrogen: 78, phosphorus: 42, potassium: 156 },
    { time: '14:00', temperature: 26.5, moisture: 42.3, ph: 6.8, nitrogen: 79, phosphorus: 43, potassium: 158 },
    { time: '16:00', temperature: 24.9, moisture: 45.7, ph: 6.7, nitrogen: 77, phosphorus: 41, potassium: 155 }
  ];

  const [weatherData] = useState({
    current: { temp: 26, humidity: 68, condition: 'Partly Cloudy' },
    forecast: [
      { day: 'Today', high: 28, low: 18, rain: 20, condition: 'Sunny' },
      { day: 'Tomorrow', high: 30, low: 20, rain: 10, condition: 'Clear' },
      { day: 'Wed', high: 27, low: 19, rain: 60, condition: 'Rainy' },
      { day: 'Thu', high: 25, low: 17, rain: 80, condition: 'Storms' },
      { day: 'Fri', high: 29, low: 21, rain: 15, condition: 'Sunny' }
    ]
  });

  const [testResults, setTestResults] = useState({
    soilType: '',
    region: '',
    climate: '',
    suitableCrop: '',
    recommendation: ''
  });

  const [fieldCoordinates] = useState([
    { x: 20, y: 30, value: 6.8, type: 'ph' },
    { x: 40, y: 25, value: 45.2, type: 'moisture' },
    { x: 60, y: 40, value: 78, type: 'nitrogen' },
    { x: 80, y: 35, value: 24.5, type: 'temperature' },
    { x: 30, y: 60, value: 42, type: 'phosphorus' },
    { x: 70, y: 55, value: 156, type: 'potassium' }
  ]);

  const analyzeSoil = () => {
    const { ph, nitrogen, phosphorus, potassium, moisture, temperature } = sensorData;
    
    let soilType = '';
    if (ph < 6.0) soilType = 'Acidic Loamy Soil';
    else if (ph > 7.5) soilType = 'Alkaline Clay Soil';
    else soilType = 'Neutral Sandy Loam';

    let suitableCrop = '';
    let recommendation = '';
    
    if (ph >= 6.0 && ph <= 7.0 && nitrogen > 60 && moisture > 40) {
      suitableCrop = 'Maize, Tomatoes, Beans';
      recommendation = 'Excellent conditions for vegetables and cereals. Consider crop rotation with legumes to maintain nitrogen levels.';
    } else if (ph < 6.0 && nitrogen < 50) {
      suitableCrop = 'Sweet Potatoes, Cassava';
      recommendation = 'Soil is acidic with low nitrogen. Add lime to raise pH and organic matter to improve nitrogen content.';
    } else if (moisture < 30) {
      suitableCrop = 'Sorghum, Millet, Groundnuts';
      recommendation = 'Low moisture content detected. Consider drought-resistant crops and implement irrigation or water conservation techniques.';
    } else {
      suitableCrop = 'Sunflower, Soybeans, Wheat';
      recommendation = 'Moderate soil conditions. Regular fertilization and proper water management will improve yields.';
    }

    return {
      soilType,
      region: sensorData.region,
      climate: temperature > 25 ? 'Warm Tropical' : 'Moderate Subtropical',
      suitableCrop,
      recommendation
    };
  };

  const runTest = async () => {
    setIsRunning(true);
    setShowResults(false);
    
    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const results = analyzeSoil();
    setTestResults(results);
    setIsRunning(false);
    setShowResults(true);
  };

  const togglePump = () => {
    setPumpStatus(!pumpStatus);
  };

  const getSensorStatus = (value, min, max) => {
    if (value < min) return 'text-red-500';
    if (value > max) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getColorForType = (type) => {
    const colors = {
      ph: '#8b5cf6',
      moisture: '#3b82f6',
      nitrogen: '#10b981',
      temperature: '#ef4444',
      phosphorus: '#f59e0b',
      potassium: '#f97316'
    };
    return colors[type] || '#6b7280';
  };

  // Estimate groundwater nitrate leaching risk from soil nitrogen and moisture
  const computeNitrateRisk = ({ nitrogen, moisture }: { nitrogen: number; moisture: number }) => {
    // Simple heuristic thresholds (ppm nitrogen in soil, % moisture)
    // High risk when high N and wet soil promotes leaching
    let level: 'Low' | 'Moderate' | 'High' = 'Low';
    let color = 'text-green-700';
    let bg = 'bg-green-50';
    let tips: string[] = [];

    if ((nitrogen >= 100 && moisture >= 50) || (nitrogen >= 80 && moisture >= 70)) {
      level = 'High';
      color = 'text-red-700';
      bg = 'bg-red-50';
      tips = [
        'Reduce nitrogen application rate immediately',
        'Schedule irrigation in shorter, targeted cycles to minimize leaching',
        'Incorporate cover crops or organic matter to improve retention'
      ];
    } else if ((nitrogen >= 60 && moisture >= 45) || (nitrogen >= 80)) {
      level = 'Moderate';
      color = 'text-amber-700';
      bg = 'bg-amber-50';
      tips = [
        'Split nitrogen applications (spoon feeding)',
        'Irrigate in the early morning/evening to lower evaporation',
        'Monitor forecast: postpone irrigation before heavy rain'
      ];
    } else {
      tips = [
        'Maintain current fertilization plan',
        'Monitor moisture to avoid over-irrigation',
        'Periodic soil testing to validate nitrate levels'
      ];
    }

    // EPA/WHO drinking water guideline reference in mg/L nitrate-N
    const guidelineNote = 'Guideline: 10 mg/L nitrate-nitrogen (NO3-N) in groundwater';

    return { level, color, bg, tips, guidelineNote };
  };

  const TabButton = ({ id, label, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`px-6 py-3 rounded-t-lg font-semibold transition-all ${
        isActive 
          ? 'bg-white text-green-600 border-b-2 border-green-600' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-800 mb-2">Zuba Soil Sense</h1>
          <p className="text-gray-600 text-lg">Advanced Soil Quality Testing System</p>
          
          {/* API Connection Status */}
          <div className="flex items-center justify-center mt-4 space-x-4">
            <div className={`flex items-center px-3 py-1 rounded-full text-sm ${
              isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {isConnected ? (
                <><Wifi size={16} className="mr-2" />API Connected</>
              ) : (
                <><WifiOff size={16} className="mr-2" />API Disconnected</>
              )}
            </div>
            
            {lastUpdated && (
              <div className="flex items-center text-sm text-gray-600">
                <RefreshCw size={16} className="mr-2" />
                Last update: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
            
            <button
              onClick={refreshData}
              disabled={isLoading}
              className="flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 disabled:opacity-50"
            >
              <RefreshCw size={16} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg flex items-center justify-center">
              <AlertCircle size={20} className="text-red-600 mr-2" />
              <span className="text-red-800 text-sm">{error}</span>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8 bg-gray-100 p-1 rounded-lg inline-flex w-full overflow-x-auto">
          <div className="flex space-x-1">
            <TabButton id="dashboard" label="Dashboard" isActive={activeTab === 'dashboard'} onClick={setActiveTab} />
            <TabButton id="irrigation" label="Smart Irrigation" isActive={activeTab === 'irrigation'} onClick={setActiveTab} />
            <TabButton id="graphs" label="Analytics" isActive={activeTab === 'graphs'} onClick={setActiveTab} />
            <TabButton id="map" label="Field Map" isActive={activeTab === 'map'} onClick={setActiveTab} />
            <TabButton id="weather" label="Weather" isActive={activeTab === 'weather'} onClick={setActiveTab} />
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Sensor Readings Panel */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                <Activity className="mr-3 text-green-600" size={24} />
                Sensor Readings
              </h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <div className="flex items-center">
                    <MapPin className="text-blue-600 mr-2" size={20} />
                    <span className="text-gray-600">Region</span>
                  </div>
                  <p className="text-xl font-semibold text-gray-800 mt-1">{sensorData.region}</p>
                </div>

                <div className="bg-red-50 p-4 rounded-xl">
                  <div className="flex items-center">
                    <Thermometer className="text-red-600 mr-2" size={20} />
                    <span className="text-gray-600">Temperature</span>
                  </div>
                  <p className="text-xl font-semibold text-gray-800 mt-1">{sensorData.temperature}°C</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl">
                  <div className="flex items-center">
                    <Droplets className="text-blue-600 mr-2" size={20} />
                    <span className="text-gray-600">Moisture</span>
                  </div>
                  <p className={`text-xl font-semibold mt-1 ${getSensorStatus(sensorData.moisture, 30, 70)}`}>
                    {sensorData.moisture}%
                  </p>
                </div>

                <div className="bg-purple-50 p-4 rounded-xl">
                  <div className="flex items-center">
                    <Activity className="text-purple-600 mr-2" size={20} />
                    <span className="text-gray-600">pH Level</span>
                  </div>
                  <p className={`text-xl font-semibold mt-1 ${getSensorStatus(sensorData.ph, 6.0, 7.5)}`}>
                    {sensorData.ph}
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-xl">
                  <div className="flex items-center">
                    <Leaf className="text-green-600 mr-2" size={20} />
                    <span className="text-gray-600">Nitrogen (N)</span>
                  </div>
                  <p className={`text-xl font-semibold mt-1 ${getSensorStatus(sensorData.nitrogen, 50, 100)}`}>
                    {sensorData.nitrogen} ppm
                  </p>
                </div>

                <div className="bg-orange-50 p-4 rounded-xl">
                  <div className="flex items-center">
                    <Activity className="text-orange-600 mr-2" size={20} />
                    <span className="text-gray-600">Phosphorus (P)</span>
                  </div>
                  <p className={`text-xl font-semibold mt-1 ${getSensorStatus(sensorData.phosphorus, 25, 60)}`}>
                    {sensorData.phosphorus} ppm
                  </p>
                </div>
              </div>

              {/* Soil Input Section */}
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Eye className="mr-2 text-gray-600" size={20} />
                  Soil Characteristics
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Soil Color</label>
                    <select 
                      value={soilColor} 
                      onChange={(e) => setSoilColor(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Select color</option>
                      <option value="dark-brown">Dark Brown</option>
                      <option value="light-brown">Light Brown</option>
                      <option value="red">Red</option>
                      <option value="yellow">Yellow</option>
                      <option value="black">Black</option>
                      <option value="gray">Gray</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Soil Texture</label>
                    <select 
                      value={soilTexture} 
                      onChange={(e) => setSoilTexture(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Select texture</option>
                      <option value="sandy">Sandy</option>
                      <option value="loamy">Loamy</option>
                      <option value="clay">Clay</option>
                      <option value="silty">Silty</option>
                      <option value="peaty">Peaty</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-xl mb-6">
                <div className="flex items-center">
                  <Activity className="text-yellow-600 mr-2" size={20} />
                  <span className="text-gray-600">Potassium (K)</span>
                </div>
                <p className={`text-xl font-semibold mt-1 ${getSensorStatus(sensorData.potassium, 100, 200)}`}>
                  {sensorData.potassium} ppm
                </p>
              </div>

              {/* Control Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={runTest}
                  disabled={isRunning}
                  className={`py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center ${
                    isRunning
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg'
                  }`}
                >
                  <Play className="mr-3" size={20} />
                  {isRunning ? 'Running...' : 'Run Test'}
                </button>

                <button
                  onClick={togglePump}
                  className={`py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center ${
                    pumpStatus
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <Power className="mr-3" size={20} />
                  Pump {pumpStatus ? 'ON' : 'OFF'}
                </button>
              </div>
              
              {isRunning && (
                <div className="mt-4 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  <span className="ml-3 text-gray-600">Analyzing soil composition...</span>
                </div>
              )}
            </div>

            {/* Results Panel */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                <Lightbulb className="mr-3 text-yellow-600" size={24} />
                Analysis Results
              </h2>
              
              {showResults ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <label className="text-sm font-medium text-gray-600 uppercase tracking-wide">Soil Type</label>
                    <p className="text-lg font-semibold text-gray-800 mt-1">{testResults.soilType}</p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-xl">
                    <label className="text-sm font-medium text-gray-600 uppercase tracking-wide">Region</label>
                    <p className="text-lg font-semibold text-gray-800 mt-1">{testResults.region}</p>
                  </div>

                  <div className="bg-sky-50 p-4 rounded-xl">
                    <label className="text-sm font-medium text-gray-600 uppercase tracking-wide">Climate</label>
                    <p className="text-lg font-semibold text-gray-800 mt-1">{testResults.climate}</p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-xl">
                    <label className="text-sm font-medium text-gray-600 uppercase tracking-wide">Suitable Crops</label>
                    <p className="text-lg font-semibold text-green-800 mt-1">{testResults.suitableCrop}</p>
                  </div>

                  {soilColor && soilTexture && (
                    <div className="bg-purple-50 p-4 rounded-xl">
                      <label className="text-sm font-medium text-gray-600 uppercase tracking-wide">Soil Analysis</label>
                      <p className="text-sm text-gray-800 mt-1">
                        {soilColor.replace('-', ' ')} {soilTexture} soil detected
                      </p>
                    </div>
                  )}

                  <div className="bg-yellow-50 p-4 rounded-xl">
                    <label className="text-sm font-medium text-gray-600 uppercase tracking-wide">Recommendation</label>
                    <p className="text-sm text-gray-800 mt-2 leading-relaxed">{testResults.recommendation}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <div className="text-center">
                    <Activity size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">Click "Run Test" to analyze soil quality</p>
                    <p className="text-sm mt-2">Results will appear here after testing</p>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* Smart Irrigation Tab */}
        {activeTab === 'irrigation' && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <IrrigationManager
                sensorData={{
                  temperature: sensorData.temperature,
                  moisture: sensorData.moisture,
                  nitrogen: sensorData.nitrogen,
                  phosphorus: sensorData.phosphorus,
                  potassium: sensorData.potassium,
                }}
                weatherData={weatherData}
                onIrrigationToggle={(status) => setPumpStatus(status)}
                irrigationStatus={pumpStatus}
              />
            </div>
            
            {/* Groundwater Nitrate Risk Panel */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                <Leaf className="mr-3 text-green-600" size={24} />
                Groundwater Nitrate Risk
              </h2>
              {(() => {
                const risk = computeNitrateRisk({ nitrogen: sensorData.nitrogen, moisture: sensorData.moisture });
                return (
                  <div className={`p-4 rounded-xl border ${risk.bg}`}>
                    <div className={`font-semibold mb-2 ${risk.color}`}>Risk Level: {risk.level}</div>
                    <div className="text-sm text-gray-700 mb-3">
                      Based on current nitrogen ({sensorData.nitrogen} ppm) and moisture ({sensorData.moisture}%),
                      the risk of nitrate leaching to groundwater is assessed as <span className="font-semibold">{risk.level}</span>.
                    </div>
                    <div className="mb-3">
                      <div className="text-sm font-medium text-gray-800 mb-1">Mitigation Tips:</div>
                      <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                        {risk.tips.map((t, i) => (
                          <li key={i}>{t}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="text-xs text-gray-500">{risk.guidelineNote}</div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'graphs' && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Temperature & Moisture Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="temperature" stroke="#ef4444" strokeWidth={2} name="Temperature (°C)" />
                  <Line type="monotone" dataKey="moisture" stroke="#3b82f6" strokeWidth={2} name="Moisture (%)" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">pH Level Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis domain={[6.0, 7.5]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="ph" stroke="#8b5cf6" strokeWidth={3} name="pH Level" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6 lg:col-span-2">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">NPK Nutrient Levels</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="nitrogen" fill="#10b981" name="Nitrogen (ppm)" />
                  <Bar dataKey="phosphorus" fill="#f59e0b" name="Phosphorus (ppm)" />
                  <Bar dataKey="potassium" fill="#f97316" name="Potassium (ppm)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Field Map Tab */}
        {activeTab === 'map' && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <MapPin className="mr-3 text-green-600" size={24} />
              Field Sensor Map
            </h3>
            <div className="relative bg-green-100 rounded-xl p-4 h-96 overflow-hidden">
              <div className="absolute inset-4 bg-gradient-to-br from-green-200 to-green-300 rounded-lg">
                {fieldCoordinates.map((point, index) => (
                  <div
                    key={index}
                    className="absolute w-4 h-4 rounded-full cursor-pointer transform -translate-x-2 -translate-y-2 hover:scale-150 transition-transform"
                    style={{
                      left: `${point.x}%`,
                      top: `${point.y}%`,
                      backgroundColor: getColorForType(point.type)
                    }}
                    title={`${point.type}: ${point.value}`}
                  />
                ))}
                <div className="absolute bottom-4 left-4 bg-white rounded-lg p-3 shadow-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Field: Plot A-1</h4>
                  <p className="text-sm text-gray-600">Area: 2.5 hectares</p>
                  <p className="text-sm text-gray-600">GPS: -15.3875°S, 28.3228°E</p>
                </div>
                <div className="absolute top-4 right-4 bg-white rounded-lg p-3 shadow-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Legend</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>pH</div>
                    <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>Moisture</div>
                    <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>Nitrogen</div>
                    <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>Temperature</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <h4 className="font-semibold text-gray-800">Active Sensors</h4>
                <p className="text-2xl font-bold text-green-600 mt-1">6</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <h4 className="font-semibold text-gray-800">Coverage</h4>
                <p className="text-2xl font-bold text-blue-600 mt-1">98%</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <h4 className="font-semibold text-gray-800">Last Update</h4>
                <p className="text-lg font-bold text-purple-600 mt-1">2 min ago</p>
              </div>
            </div>
          </div>
        )}

        {/* Weather Tab */}
        {activeTab === 'weather' && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                <Cloud className="mr-3 text-blue-600" size={24} />
                Current Weather
              </h3>
              <div className="text-center">
                <div className="text-6xl font-bold text-blue-600 mb-2">{weatherData.current.temp}°C</div>
                <p className="text-lg text-gray-600 mb-4">{weatherData.current.condition}</p>
                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600">Humidity: {weatherData.current.humidity}%</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6">5-Day Forecast</h3>
              <div className="space-y-4">
                {weatherData.forecast.map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div className="font-semibold text-gray-800 w-20">{day.day}</div>
                      <div className="text-gray-600">{day.condition}</div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <span className="font-semibold text-gray-800">{day.high}°</span>
                        <span className="text-gray-500">/{day.low}°</span>
                      </div>
                      <div className="text-blue-600 font-medium w-12 text-right">{day.rain}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-500">© 2025 Zuba Soil Sense - Advanced Agricultural Technology</p>
        </div>
      </div>
    </div>
  );
};

export default ZubaSoilSense;