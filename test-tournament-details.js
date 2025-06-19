// Test specific tournament endpoints for event data
const API_BASE_URL = 'https://www.malaysiapickleball.my/api';

async function makeRequest(endpoint) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    console.log(`🌐 Testing: ${url}`);
    const response = await fetch(url);
    console.log(`📥 Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      console.log(`❌ FAILED: HTTP ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    console.log(`✅ SUCCESS`);
    return data;
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
    return null;
  }
}

async function testTournamentDetails() {
  console.log('🏆 TESTING TOURNAMENT DETAIL ENDPOINTS FOR EVENTS\n');
  
  const tournamentId = "684ef540ea9e8aa32ba1616f"; // Kuala Lumpur Open
  
  const endpoints = [
    `/tournaments/${tournamentId}`,
    `/tournaments/${tournamentId}/events`,
    `/tournaments/${tournamentId}/matches`,
    `/tournaments/${tournamentId}/categories`,
    `/tournaments/${tournamentId}/divisions`,
    `/tournaments/${tournamentId}/schedule`,
    `/tournaments/${tournamentId}/brackets`,
    `/tournaments/${tournamentId}/registrations`
  ];
  
  for (const endpoint of endpoints) {
    console.log('\n' + '─'.repeat(50));
    const result = await makeRequest(endpoint);
    
    if (result) {
      console.log(`📋 Response keys: ${Object.keys(result).join(', ')}`);
      
      // Look for event-related data
      const data = result.data || result;
      if (data.events || data.matches || data.categories || data.divisions) {
        console.log(`🎯 FOUND EVENT DATA!`);
        console.log(`📊 Event fields: ${Object.keys(data).join(', ')}`);
        
        if (data.events) console.log(`   Events: ${data.events.length} items`);
        if (data.matches) console.log(`   Matches: ${data.matches.length} items`);
        if (data.categories) console.log(`   Categories: ${data.categories.length} items`);
        if (data.divisions) console.log(`   Divisions: ${data.divisions.length} items`);
      }
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('🏆 TOURNAMENT EVENT ANALYSIS COMPLETE');
}

testTournamentDetails().catch(console.error); 