// Standalone test script to find tournament event data and endpoints
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

async function testTournamentEvents() {
  console.log('🏆 COMPREHENSIVE TOURNAMENT EVENT SEARCH');
  console.log('========================================\n');

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
    
    // Extract token from response
    const data = loginResult.data;
    authToken = data.data?.tokens?.accessToken || data.token || data.accessToken;
    
    if (authToken) {
      console.log('🔑 Authentication token obtained');
    } else {
      console.log('⚠️ No token found, using session-based auth');
    }
    
  } catch (error) {
    console.error('❌ Login error:', error.message);
    return;
  }

  // Test tournament-related endpoints
  const endpoints = [
    { path: '/tournaments', name: 'All Tournaments' },
    { path: '/tournaments/upcoming', name: 'Upcoming Tournaments' },
    { path: '/tournaments/past', name: 'Past Tournaments' },
    { path: '/tournaments/active', name: 'Active Tournaments' },
    { path: '/tournaments/events', name: 'Tournament Events' },
    { path: '/events', name: 'Events' },
    { path: '/events/upcoming', name: 'Upcoming Events' },
    { path: '/events/active', name: 'Active Events' },
    { path: '/player/tournaments', name: 'Player Tournaments' },
    { path: '/player/events', name: 'Player Events' },
    { path: '/player/registrations', name: 'Player Registrations' },
    { path: '/registrations', name: 'Registrations' },
    { path: '/matches', name: 'Matches' },
    { path: '/games', name: 'Games' },
    { path: '/competitions', name: 'Competitions' }
  ];

  let tournamentData = [];

  for (const endpoint of endpoints) {
    console.log(`\n🔍 Testing ${endpoint.name} (${endpoint.path})...`);
    console.log('─'.repeat(60));
    
    try {
      const options = {};
      if (authToken) {
        options.headers = {
          'Authorization': `Bearer ${authToken}`
        };
      }
      
      const result = await makeRequest(endpoint.path, options);
      
      if (result.success) {
        console.log(`✅ ${endpoint.name} - SUCCESS`);
        
        // Extract tournament/event data from various possible structures
        const responseData = result.data;
        let items = [];
        
        // Try different data extraction patterns
        if (responseData.tournaments) {
          items = responseData.tournaments;
        } else if (responseData.events) {
          items = responseData.events;
        } else if (responseData.data?.tournaments) {
          items = responseData.data.tournaments;
        } else if (responseData.data?.events) {
          items = responseData.data.events;
        } else if (Array.isArray(responseData.data)) {
          items = responseData.data;
        } else if (Array.isArray(responseData)) {
          items = responseData;
        } else if (responseData.results) {
          items = responseData.results;
        }
        
        console.log(`📊 Found ${items.length} items`);
        
        if (items.length > 0) {
          // Show structure of first item
          const firstItem = items[0];
          console.log(`📋 First item fields: ${Object.keys(firstItem).join(', ')}`);
          console.log(`🔍 Sample item:`, JSON.stringify(firstItem, null, 2));
          
          // Look for event-specific fields
          const eventFields = ['events', 'matches', 'games', 'competitions', 'categories', 'divisions'];
          let hasEvents = false;
          
          for (const field of eventFields) {
            if (firstItem[field]) {
              console.log(`🎯 FOUND EVENT DATA in ${field}:`, firstItem[field]);
              hasEvents = true;
            }
          }
          
          if (hasEvents) {
            tournamentData.push({
              endpoint: endpoint.name,
              path: endpoint.path,
              count: items.length,
              hasEvents: true,
              sampleData: firstItem
            });
          } else {
            tournamentData.push({
              endpoint: endpoint.name,
              path: endpoint.path,
              count: items.length,
              hasEvents: false,
              sampleData: firstItem
            });
          }
        } else {
          console.log('📭 No items found');
        }
        
      } else {
        console.log(`❌ ${endpoint.name} - FAILED: ${result.message || 'No data returned'}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name} - ERROR: ${error.message}`);
    }
  }

  // Test specific tournament ID endpoints if we found tournaments
  if (tournamentData.length > 0) {
    console.log('\n🔍 Testing specific tournament endpoints...');
    
    const tournamentWithData = tournamentData.find(t => t.count > 0);
    if (tournamentWithData && tournamentWithData.sampleData.id) {
      const tournamentId = tournamentWithData.sampleData.id;
      
      const specificEndpoints = [
        `/tournaments/${tournamentId}`,
        `/tournaments/${tournamentId}/events`,
        `/tournaments/${tournamentId}/matches`,
        `/tournaments/${tournamentId}/games`,
        `/tournaments/${tournamentId}/schedule`,
        `/tournaments/${tournamentId}/brackets`
      ];
      
      for (const endpoint of specificEndpoints) {
        console.log(`\n🔍 Testing ${endpoint}...`);
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
            console.log(`📋 Response keys: ${Object.keys(result.data).join(', ')}`);
            
            // Look for event data
            if (result.data.events || result.data.matches || result.data.games) {
              console.log(`🎯 FOUND EVENT DATA!`);
              console.log(`🔍 Event data:`, JSON.stringify(result.data, null, 2));
            }
          } else {
            console.log(`❌ ${endpoint} - FAILED: ${result.message}`);
          }
        } catch (error) {
          console.log(`❌ ${endpoint} - ERROR: ${error.message}`);
        }
      }
    }
  }

  // Final summary
  console.log('\n' + '='.repeat(60));
  console.log('🏆 TOURNAMENT EVENT SEARCH SUMMARY');
  console.log('='.repeat(60));
  
  if (tournamentData.length > 0) {
    console.log(`✅ Found ${tournamentData.length} working tournament endpoint(s):`);
    tournamentData.forEach((found, index) => {
      console.log(`${index + 1}. ${found.endpoint} (${found.path})`);
      console.log(`   - Items: ${found.count}`);
      console.log(`   - Has Events: ${found.hasEvents ? '✅' : '❌'}`);
      if (found.sampleData) {
        console.log(`   - Fields: ${Object.keys(found.sampleData).join(', ')}`);
      }
    });
  } else {
    console.log('❌ No tournament event data found in any endpoint');
  }
  
  console.log('\n💡 Next Steps:');
  console.log('1. Check tournament detail endpoints for event/match data');
  console.log('2. Look for registration or participation endpoints');
  console.log('3. Check if events are stored separately from tournaments');
  console.log('4. Verify tournament structure with backend developer');
}

// Run the test
testTournamentEvents().catch(console.error); 