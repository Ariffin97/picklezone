// API Diagnostic Script for Malaysia Pickleball API
// This script will help identify the exact issue with the login endpoint

const API_BASE_URL = 'https://www.malaysiapickleball.my/api';

async function testEndpoint(endpoint, method = 'GET', body = null) {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`\n🔍 Testing: ${method} ${url}`);
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(url, options);
    const text = await response.text();
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`Headers:`, Object.fromEntries(response.headers.entries()));
    
    try {
      const data = JSON.parse(text);
      console.log(`Response:`, data);
      return { success: response.ok, status: response.status, data };
    } catch (e) {
      console.log(`Raw Response:`, text);
      return { success: response.ok, status: response.status, text };
    }
  } catch (error) {
    console.log(`Error:`, error.message);
    return { success: false, error: error.message };
  }
}

async function runDiagnostics() {
  console.log('🏥 Malaysia Pickleball API Diagnostics');
  console.log('=====================================');
  
  // Test 1: Health Check
  await testEndpoint('/health');
  
  // Test 2: Tournaments (known working endpoint)
  await testEndpoint('/tournaments');
  
  // Test 3: Login with your credentials
  await testEndpoint('/auth/player/login', 'POST', {
    username: 'Ariffinanuar',
    password: 'Ariffin.97'
  });
  
  // Test 4: Login with invalid credentials (to see different error)
  await testEndpoint('/auth/player/login', 'POST', {
    username: 'invalid',
    password: 'invalid'
  });
  
  // Test 5: Check if other auth endpoints exist
  await testEndpoint('/auth/login', 'POST', {
    username: 'Ariffinanuar',
    password: 'Ariffin.97'
  });
  
  console.log('\n✅ Diagnostics complete');
}

// Export for use in Node.js or browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runDiagnostics, testEndpoint };
} else {
  // Run in browser console
  runDiagnostics();
} 