// PickleZone API Service - Malaysia Pickleball Integration
import { cacheService } from './cacheService';

const API_BASE_URL = 'https://www.malaysiapickleball.my/api';

class PickleZoneAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = null;
    this.refreshToken = null;
    
    // Load cached session on initialization
    this.initializeFromCache();
  }

  async initializeFromCache() {
    try {
      const session = await cacheService.getUserSession();
      if (session && session.tokens) {
        this.token = session.tokens.accessToken;
        this.refreshToken = session.tokens.refreshToken;
        console.log('🔑 Restored session from cache');
      }
    } catch (error) {
      console.error('❌ Failed to restore session from cache:', error);
    }
  }

  // Helper method to make API requests
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for session-based auth
      ...options,
    };

    // Add authorization header if token exists
    if (this.token) {
      config.headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      console.log(`🌐 Making request to: ${url}`);
      console.log(`📤 Request config:`, {
        method: config.method || 'GET',
        headers: config.headers,
        credentials: config.credentials
      });
      
      const response = await fetch(url, config);
      
      console.log(`📥 Response status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`✅ Response data from ${endpoint}:`, data);
      return { success: true, data };
    } catch (error) {
      console.error(`❌ API request failed for ${endpoint}:`, error);
      return { 
        success: false, 
        message: error.message || 'Network request failed',
        error 
      };
    }
  }

  // Authentication Methods
  async login(username, password) {
    try {
      console.log('🌐 Making request to:', `${this.baseURL}/auth/player/login`);
      console.log('📤 Request config:', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      const response = await fetch(`${this.baseURL}/auth/player/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      console.log('📥 Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Login response:', data);

      if (data.success && data.data) {
        // Store tokens
        this.token = data.data.tokens?.accessToken;
        this.refreshToken = data.data.tokens?.refreshToken;
        
        // Cache user session
        await cacheService.saveUserSession(data.data.player, data.data.tokens);
        
        // Cache user profile
        await cacheService.saveUserProfile(data.data.player);
        
        console.log('💾 User session and profile cached');
        
        return {
          success: true,
          data: data.data
        };
      }

      return { success: false, message: data.message || 'Login failed' };
    } catch (error) {
      console.error('❌ Login error:', error);
      return { success: false, message: error.message };
    }
  }

  // Tournament Methods
  async getTournaments(forceRefresh = false) {
    return await cacheService.getOrFetch(
      cacheService.CACHE_KEYS.TOURNAMENTS,
      async () => {
        try {
          const response = await fetch(`${this.baseURL}/tournaments`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          
          await cacheService.updateLastSync('tournaments');
          
          return {
            success: true,
            data: data.tournaments || data
          };
        } catch (error) {
          console.error('❌ Tournaments fetch error:', error);
          return { success: false, message: error.message };
        }
      },
      forceRefresh
    );
  }

  async getUpcomingTournaments(forceRefresh = false) {
    return await cacheService.getOrFetch(
      cacheService.CACHE_KEYS.UPCOMING_TOURNAMENTS,
      async () => {
        try {
          const response = await fetch(`${this.baseURL}/tournaments/upcoming`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          
          await cacheService.updateLastSync('upcoming_tournaments');
          
          return {
            success: true,
            data: data.tournaments || data
          };
        } catch (error) {
          console.error('❌ Upcoming tournaments fetch error:', error);
          return { success: false, message: error.message };
        }
      },
      forceRefresh
    );
  }

  async getTournamentDetails(tournamentId) {
    try {
      const response = await this.makeRequest(`/tournaments/${tournamentId}`);
      return response;
    } catch (error) {
      console.error('Get tournament details error:', error);
      return {
        success: false,
        message: 'Failed to fetch tournament details',
      };
    }
  }

  // Player Methods
  async getPlayerProfile(forceRefresh = false) {
    // First try to get from cache
    if (!forceRefresh) {
      const cachedProfile = await cacheService.getUserProfile();
      if (cachedProfile) {
        console.log('📦 Using cached profile data');
        return { success: true, player: cachedProfile, fromCache: true };
      }
    }

    // If no cache or force refresh, try API
    try {
      if (!this.token) {
        console.log('❌ No authentication token available');
        return { success: false, message: 'Authentication required' };
      }

      const response = await fetch(`${this.baseURL}/player/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.player) {
        // Cache the fresh profile data
        await cacheService.saveUserProfile(data.player);
        return { success: true, player: data.player, fromCache: false };
      }

      return { success: false, message: data.message || 'Profile fetch failed' };
    } catch (error) {
      console.error('❌ Profile fetch error:', error);
      return { success: false, message: error.message };
    }
  }

  async updatePlayerProfile(profileData) {
    try {
      const response = await this.makeRequest('/player/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
      
      if (response.success) {
        return {
          success: true,
          player: response.data.player || response.data,
          message: 'Profile updated successfully',
        };
      }
      
      return {
        success: false,
        message: response.message || 'Failed to update profile',
      };
    } catch (error) {
      console.error('Update player profile error:', error);
      return {
        success: false,
        message: 'Failed to update player profile',
      };
    }
  }

  async getMobilePlayerEssential(forceRefresh = false) {
    // Use cached profile as fallback for mobile essential
    const profileResult = await this.getPlayerProfile(forceRefresh);
    if (profileResult.success) {
      return { success: true, player: profileResult.player, fromCache: profileResult.fromCache };
    }
    
    return { success: false, message: 'Player data not available' };
  }

  // Utility Methods
  async checkICNumber(icNumber) {
    try {
      const response = await this.makeRequest(`/check-ic/${icNumber}`);
      return response;
    } catch (error) {
      console.error('Check IC number error:', error);
      return {
        success: false,
        message: 'Failed to check IC number',
      };
    }
  }

  async healthCheck() {
    try {
      const response = await this.makeRequest('/health');
      return response;
    } catch (error) {
      console.error('Health check error:', error);
      return {
        success: false,
        message: 'Health check failed',
      };
    }
  }

  // Logout method
  async logout() {
    try {
      // Clear tokens
      this.token = null;
      this.refreshToken = null;
      
      // Clear cached data
      await cacheService.clearUserSession();
      await cacheService.removeCache(cacheService.CACHE_KEYS.USER_PROFILE);
      
      console.log('🚪 Logout completed, cache cleared');
      return { success: true };
    } catch (error) {
      console.error('❌ Logout error:', error);
      return { success: false, message: error.message };
    }
  }

  // Message and Notification Methods
  async getMessages(category = 'all') {
    try {
      let endpoint = '/messages';
      if (category !== 'all') {
        endpoint += `?category=${category}`;
      }
      
      const response = await this.makeRequest(endpoint);
      
      if (response.success) {
        return {
          success: true,
          messages: response.data.messages || response.data || [],
        };
      }
      
      return {
        success: false,
        message: 'Failed to fetch messages',
        messages: [],
      };
    } catch (error) {
      console.error('Get messages error:', error);
      return {
        success: false,
        message: 'Unable to fetch messages. Please try again.',
        messages: [],
      };
    }
  }

  async getNotifications() {
    try {
      const response = await this.makeRequest('/notifications');
      
      if (response.success) {
        return {
          success: true,
          notifications: response.data.notifications || response.data || [],
        };
      }
      
      return {
        success: false,
        message: 'Failed to fetch notifications',
        notifications: [],
      };
    } catch (error) {
      console.error('Get notifications error:', error);
      return {
        success: false,
        message: 'Unable to fetch notifications. Please try again.',
        notifications: [],
      };
    }
  }

  async markMessageAsRead(messageId) {
    try {
      const response = await this.makeRequest(`/messages/${messageId}/read`, {
        method: 'POST',
      });
      
      return response;
    } catch (error) {
      console.error('Mark message as read error:', error);
      return {
        success: false,
        message: 'Failed to mark message as read',
      };
    }
  }

  async getTournamentUpdates() {
    try {
      const response = await this.makeRequest('/tournament-updates');
      
      if (response.success) {
        return {
          success: true,
          updates: response.data.updates || response.data || [],
        };
      }
      
      return {
        success: false,
        message: 'Failed to fetch tournament updates',
        updates: [],
      };
    } catch (error) {
      console.error('Get tournament updates error:', error);
      return {
        success: false,
        message: 'Unable to fetch tournament updates. Please try again.',
        updates: [],
      };
    }
  }

  async getSystemAnnouncements() {
    try {
      const response = await this.makeRequest('/announcements');
      
      if (response.success) {
        return {
          success: true,
          announcements: response.data.announcements || response.data || [],
        };
      }
      
      return {
        success: false,
        message: 'Failed to fetch announcements',
        announcements: [],
      };
    } catch (error) {
      console.error('Get announcements error:', error);
      return {
        success: false,
        message: 'Unable to fetch announcements. Please try again.',
        announcements: [],
      };
    }
  }

  // Additional methods to search for IC number data
  async getPlayerDetails() {
    try {
      const response = await this.makeRequest('/player/details');
      
      if (response.success) {
        return {
          success: true,
          player: response.data.player || response.data,
        };
      }
      
      return {
        success: false,
        message: 'Failed to fetch player details',
      };
    } catch (error) {
      console.error('Get player details error:', error);
      return {
        success: false,
        message: 'Failed to fetch player details',
      };
    }
  }

  async getPlayerInfo() {
    try {
      const response = await this.makeRequest('/player/info');
      
      if (response.success) {
        return {
          success: true,
          player: response.data.player || response.data,
        };
      }
      
      return {
        success: false,
        message: 'Failed to fetch player info',
      };
    } catch (error) {
      console.error('Get player info error:', error);
      return {
        success: false,
        message: 'Failed to fetch player info',
      };
    }
  }

  async getPlayerPersonal() {
    try {
      const response = await this.makeRequest('/player/personal');
      
      if (response.success) {
        return {
          success: true,
          player: response.data.player || response.data,
        };
      }
      
      return {
        success: false,
        message: 'Failed to fetch player personal data',
      };
    } catch (error) {
      console.error('Get player personal error:', error);
      return {
        success: false,
        message: 'Failed to fetch player personal data',
      };
    }
  }

  async getPlayerRegistration() {
    try {
      const response = await this.makeRequest('/player/registration');
      
      if (response.success) {
        return {
          success: true,
          player: response.data.player || response.data,
        };
      }
      
      return {
        success: false,
        message: 'Failed to fetch player registration data',
      };
    } catch (error) {
      console.error('Get player registration error:', error);
      return {
        success: false,
        message: 'Failed to fetch player registration data',
      };
    }
  }

  // Check if data needs refresh
  async needsDataRefresh() {
    const checks = {
      tournaments: await cacheService.needsRefresh('tournaments', 60 * 60 * 1000), // 1 hour
      upcomingTournaments: await cacheService.needsRefresh('upcoming_tournaments', 30 * 60 * 1000), // 30 min
      profile: await cacheService.needsRefresh('profile', 24 * 60 * 60 * 1000), // 24 hours
    };
    
    return checks;
  }

  // Force refresh all data
  async refreshAllData() {
    console.log('🔄 Force refreshing all data...');
    
    const results = await Promise.allSettled([
      this.getTournaments(true),
      this.getUpcomingTournaments(true),
      this.getPlayerProfile(true)
    ]);
    
    const summary = {
      tournaments: results[0].status === 'fulfilled' && results[0].value.success,
      upcomingTournaments: results[1].status === 'fulfilled' && results[1].value.success,
      profile: results[2].status === 'fulfilled' && results[2].value.success
    };
    
    console.log('🔄 Refresh summary:', summary);
    return summary;
  }

  // Get cache statistics
  async getCacheInfo() {
    return await cacheService.getCacheStats();
  }
}

// Create and export singleton instance
export const pickleZoneAPI = new PickleZoneAPI();

// Export default for backward compatibility
export default pickleZoneAPI;