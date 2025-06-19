// Simple test script to verify login functionality
import { pickleZoneAPI } from './services/pickleZoneAPI.js';

async function testLogin() {
  console.log('🧪 Testing login functionality...');
  
  // Test your credentials
  const credentials = {
    username: 'Ariffinanuar',
    password: 'Ariffin.97'
  };
  
  console.log('🔐 Testing credentials:', credentials.username);
  
  try {
    const result = await pickleZoneAPI.login(credentials);
    
    console.log('📋 Login test result:');
    console.log('Success:', result.success);
    console.log('Message:', result.message);
    if (result.user) {
      console.log('User:', result.user.fullName);
      console.log('Email:', result.user.email);
      console.log('Ranking:', result.user.ranking);
    }
    
    return result;
  } catch (error) {
    console.error('🚨 Test failed:', error);
    return { success: false, error: error.message };
  }
}

// Run the test
testLogin().then(result => {
  if (result.success) {
    console.log('✅ Login test PASSED');
  } else {
    console.log('❌ Login test FAILED');
  }
}); 