// PickleZone API Service - Malaysia Pickleball Integration
const API_BASE_URL = 'https://www.malaysiapickleball.my/api';

class PickleZoneAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = null;
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
  async login(credentials) {
    try {
      const response = await this.makeRequest('/auth/player/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      if (response.success && response.data) {
        // Extract user data from the response
        const userData = response.data.player || response.data.user || response.data;
        
        // Look for token in various possible locations
        const token = response.data.token || 
                     response.data.accessToken || 
                     response.data.authToken ||
                     response.data.jwt ||
                     userData.token ||
                     userData.accessToken;
        
        if (token) {
          this.token = token;
          console.log('Authentication token stored successfully');
        } else {
          console.log('No token found in response, but login successful');
          // Some APIs don't return tokens but use session-based auth
        }
        
        return {
          success: true,
          user: userData,
          token: token,
          message: response.data.message || 'Login successful',
        };
      } else {
        return {
          success: false,
          message: response.message || 'Login failed. Please check your credentials.',
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Unable to connect to server. Please check your internet connection and try again.',
      };
    }
  }

  // Tournament Methods
  async getTournaments() {
    try {
      const response = await this.makeRequest('/tournaments');
      
      if (response.success) {
        // Handle nested data structure: response.data.data.tournaments
        const tournaments = response.data?.data?.tournaments || 
                          response.data?.tournaments || 
                          response.data || 
                          [];
        
        console.log('Extracted tournaments:', tournaments);
        
        return {
          success: true,
          tournaments: Array.isArray(tournaments) ? tournaments : [],
        };
      }
      
      return {
        success: false,
        message: 'Failed to fetch tournaments',
        tournaments: [],
      };
    } catch (error) {
      console.error('Get tournaments error:', error);
      return {
        success: false,
        message: 'Unable to fetch tournaments. Please try again.',
        tournaments: [],
      };
    }
  }

  async getUpcomingTournaments() {
    try {
      const response = await this.makeRequest('/tournaments/upcoming');
      
      if (response.success) {
        return {
          success: true,
          tournaments: response.data.tournaments || response.data || [],
        };
      }
      
      return {
        success: false,
        message: 'Failed to fetch upcoming tournaments',
        tournaments: [],
      };
    } catch (error) {
      console.error('Get upcoming tournaments error:', error);
      return {
        success: false,
        message: 'Unable to fetch upcoming tournaments. Please try again.',
        tournaments: [],
      };
    }
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
  async getPlayerProfile() {
    try {
      const response = await this.makeRequest('/player/profile');
      
      if (response.success) {
        return {
          success: true,
          player: response.data.player || response.data,
        };
      }
      
      return {
        success: false,
        message: 'Failed to fetch player profile',
      };
    } catch (error) {
      console.error('Get player profile error:', error);
      return {
        success: false,
        message: 'Failed to fetch player profile',
      };
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

  async getMobilePlayerEssential() {
    try {
      const response = await this.makeRequest('/mobile/player/essential');
      
      if (response.success) {
        return {
          success: true,
          player: response.data.player || response.data,
        };
      }
      
      return {
        success: false,
        message: 'Failed to fetch mobile player data',
      };
    } catch (error) {
      console.error('Get mobile player essential error:', error);
      return {
        success: false,
        message: 'Failed to fetch mobile player data',
      };
    }
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
      if (this.token) {
        await this.makeRequest('/auth/logout', {
          method: 'POST',
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.token = null;
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
}

// Create and export singleton instance
export const pickleZoneAPI = new PickleZoneAPI();

// Export default for backward compatibility
export default pickleZoneAPI;