// Test script to find IC number in various API endpoints
const API_BASE_URL = 'https://www.malaysiapickleball.my/api';
const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NTQxYTM4NmI3YmE5YzZjMTc4ZDIyYSIsInBsYXllcklkIjoiQzlKUkciLCJ1c2VybmFtZSI6IkFyaWZmaW5hbnVhciIsInR5cGUiOiJwbGF5ZXIiLCJpYXQiOjE3NTAzNTAzODUsImV4cCI6MTc1MDk1NTE4NSwiYXVkIjoicGlja2xlem9uZS1tb2JpbGUiLCJpc3MiOiJtYWxheXNpYS1waWNrbGViYWxsLWFwaSJ9.t5AlZ8zqpKPxob-OCn_y078RZ5mCITYv0yOWJ5rFJCg';

async function testEndpoint(endpoint, description) {
  try {
    console.log(`\n🔍 Testing ${description}: ${endpoint}`);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ACCESS_TOKEN}`
      },
      credentials: 'include'
    });

    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Success:`, JSON.stringify(data, null, 2));
      
      // Check if IC number exists in the response
      const jsonStr = JSON.stringify(data);
      if (jsonStr.includes('ic') || jsonStr.includes('IC') || jsonStr.includes('nric') || jsonStr.includes('NRIC')) {
        console.log('🎯 FOUND POTENTIAL IC NUMBER DATA!');
      }
    } else {
      const errorText = await response.text();
      console.log(`❌ Error: ${errorText}`);
    }
  } catch (error) {
    console.log(`❌ Network error: ${error.message}`);
  }
}

async function searchForICNumber() {
  console.log('🔎 Searching for IC Number in various API endpoints...\n');

  // Test common endpoints that might contain IC number
  await testEndpoint('/player/profile', 'Player Profile');
  await testEndpoint('/mobile/player/essential', 'Mobile Player Essential');
  await testEndpoint('/player/details', 'Player Details');
  await testEndpoint('/player/info', 'Player Info');
  await testEndpoint('/player/personal', 'Player Personal Info');
  await testEndpoint('/player/full', 'Full Player Data');
  await testEndpoint('/player/complete', 'Complete Player Data');
  await testEndpoint('/player/registration', 'Player Registration Data');
  await testEndpoint('/player/verification', 'Player Verification Data');
  await testEndpoint('/user/profile', 'User Profile');
  await testEndpoint('/user/details', 'User Details');
  
  console.log('\n🏁 Search complete!');
}

searchForICNumber(); 