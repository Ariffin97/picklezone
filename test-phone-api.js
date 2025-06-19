// Standalone test script to find phone number fields in all API endpoints
// Uses only native Node.js fetch (available in Node 18+)

const API_BASE_URL = 'https://www.malaysiapickleball.my/api';

async function makeRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    console.log(`🌐 Making request to: ${url}`);
    const response = await fetch(url, config);
    console.log(`📥 Response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error(`❌ API request failed for ${endpoint}:`, error.message);
    return { 
      success: false, 
      message: error.message || 'Network request failed',
      error 
    };
  }
}

async function testPhoneNumberFields() {
  console.log('🔍 COMPREHENSIVE PHONE NUMBER FIELD SEARCH');
  console.log('==========================================\n');

  // First login to get authentication
  console.log('📱 Logging in...');
  let authToken = null;
  
  try {
    const loginResult = await makeRequest('/auth/player/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'Ariffinanuar',
        password: 'Ariffin.97'
      }),
    });
    
    if (!loginResult.success) {
      console.error('❌ Login failed:', loginResult.message);
      return;
    }
    
    console.log('✅ Login successful');
    console.log('📋 Login response data:', JSON.stringify(loginResult.data, null, 2));
    
    // Extract token from response
    const data = loginResult.data;
    authToken = data.token || data.accessToken || data.authToken || 
               data.data?.tokens?.accessToken || data.data?.token;
    
    if (authToken) {
      console.log('🔑 Authentication token obtained');
    } else {
      console.log('⚠️ No token found, using session-based auth');
    }
    
  } catch (error) {
    console.error('❌ Login error:', error.message);
    return;
  }

  // List of possible phone number field names to search for
  const phoneFields = [
    'phone', 'phoneNumber', 'phone_number',
    'mobile', 'mobileNumber', 'mobile_number',
    'contact', 'contactNumber', 'contact_number',
    'tel', 'telephone', 'cellphone', 'handphone',
    'primaryPhone', 'secondaryPhone', 'homePhone',
    'workPhone', 'personalPhone', 'emergencyContact'
  ];

  // Test all available endpoints
  const endpoints = [
    '/mobile/player/essential',
    '/player/profile',
    '/player/details',
    '/player/info',
    '/player/personal',
    '/player/registration'
  ];

  let foundPhoneNumbers = [];

  for (const endpoint of endpoints) {
    console.log(`\n🔍 Testing ${endpoint}...`);
    console.log('─'.repeat(50));
    
    try {
      const options = {};
      if (authToken) {
        options.headers = {
          'Authorization': `Bearer ${authToken}`
        };
      }
      
      const result = await makeRequest(endpoint, options);
      
      if (result.success) {
        console.log(`✅ ${endpoint} - SUCCESS`);
        
        // Extract player data from various possible structures
        const player = result.data.player || result.data.data?.player || result.data;
        
        if (player && typeof player === 'object') {
          // Show all available fields
          console.log(`📋 Available fields: ${Object.keys(player).join(', ')}`);
          
          // Search for phone number fields
          let foundInThisEndpoint = false;
          for (const field of phoneFields) {
            if (player[field]) {
              console.log(`📱 FOUND PHONE NUMBER! Field: "${field}", Value: "${player[field]}"`);
              foundPhoneNumbers.push({
                endpoint: endpoint,
                field: field,
                value: player[field]
              });
              foundInThisEndpoint = true;
            }
          }
          
          if (!foundInThisEndpoint) {
            console.log('❌ No phone number fields found in this endpoint');
          }
          
          // Also check for any field containing "phone" or "mobile" in the name
          const allFields = Object.keys(player);
          const phoneRelatedFields = allFields.filter(field => 
            field.toLowerCase().includes('phone') || 
            field.toLowerCase().includes('mobile') ||
            field.toLowerCase().includes('contact') ||
            field.toLowerCase().includes('tel')
          );
          
          if (phoneRelatedFields.length > 0) {
            console.log(`🔍 Phone-related field names found: ${phoneRelatedFields.join(', ')}`);
            phoneRelatedFields.forEach(field => {
              console.log(`   ${field}: ${player[field]}`);
            });
          }
          
          // Show full player object for debugging
          console.log(`🔍 Full player object:`, JSON.stringify(player, null, 2));
          
        } else {
          console.log('⚠️ No player data found in response');
          console.log('🔍 Full response:', JSON.stringify(result.data, null, 2));
        }
        
      } else {
        console.log(`❌ ${endpoint} - FAILED: ${result.message || 'No data returned'}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint} - ERROR: ${error.message}`);
    }
  }

  // Final summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 PHONE NUMBER SEARCH SUMMARY');
  console.log('='.repeat(60));
  
  if (foundPhoneNumbers.length > 0) {
    console.log(`✅ Found ${foundPhoneNumbers.length} phone number field(s):`);
    foundPhoneNumbers.forEach((found, index) => {
      console.log(`${index + 1}. ${found.endpoint} -> ${found.field}: ${found.value}`);
    });
  } else {
    console.log('❌ No phone number fields found in any endpoint');
    console.log('\n💡 Recommendations:');
    console.log('1. Check if phone number is stored in a different API endpoint');
    console.log('2. Verify if phone number collection is enabled in user registration');
    console.log('3. Check if phone number is stored under a different field name');
    console.log('4. Contact backend developer to confirm phone number storage');
  }
}

// Run the test
testPhoneNumberFields().catch(console.error); 