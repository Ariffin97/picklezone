// Simple test to check API authentication and player profile endpoints
console.log('Testing API endpoints...\n');

const API_BASE_URL = 'https://www.malaysiapickleball.my/api';

async function testAPI() {
  try {
    // Test 1: Login
    console.log('1. Testing login...');
    const loginResponse = await fetch(`${API_BASE_URL}/auth/player/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important for session-based auth
      body: JSON.stringify({
        username: 'Ariffinanuar',
        password: 'Ariffin.97'
      })
    });

    const loginData = await loginResponse.json();
    console.log('Login response:', JSON.stringify(loginData, null, 2));

    if (loginData.success) {
      console.log('✅ Login successful!\n');

      // Test 2: Mobile Player Essential
      console.log('2. Testing mobile player essential...');
      const mobileResponse = await fetch(`${API_BASE_URL}/mobile/player/essential`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Use same session
      });

      const mobileData = await mobileResponse.json();
      console.log('Mobile player response:', JSON.stringify(mobileData, null, 2));

      // Test 3: Full Player Profile
      console.log('\n3. Testing full player profile...');
      const profileResponse = await fetch(`${API_BASE_URL}/player/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Use same session
      });

      const profileData = await profileResponse.json();
      console.log('Player profile response:', JSON.stringify(profileData, null, 2));

    } else {
      console.log('❌ Login failed:', loginData.message);
    }

  } catch (error) {
    console.error('Test error:', error);
  }
}

testAPI(); 