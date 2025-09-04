// Test script to check frontend-backend connectivity
console.log('Testing API connection...');

const API_BASE_URL = 'http://localhost:8000';

async function testConnection() {
    try {
        console.log('1. Testing health endpoint...');
        const healthResponse = await fetch(`${API_BASE_URL}/health`);
        console.log('Health response status:', healthResponse.status);
        const healthData = await healthResponse.json();
        console.log('Health data:', healthData);

        console.log('\n2. Testing latest data endpoint...');
        const latestResponse = await fetch(`${API_BASE_URL}/latest`);
        console.log('Latest response status:', latestResponse.status);
        const latestData = await latestResponse.json();
        console.log('Latest data:', latestData);

        console.log('\n✅ Connection test successful!');
    } catch (error) {
        console.error('❌ Connection test failed:', error);
        console.error('Error details:', error.message);
    }
}

testConnection();
