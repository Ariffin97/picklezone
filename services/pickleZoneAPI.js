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
      ...options,
    };

    // Add authorization header if token exists
    if (this.token) {
      config.headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      console.log(`Making request to: ${url}`);
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('API request failed:', error);
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

      if (response.success) {
        // Store token if provided
        if (response.data.token) {
          this.token = response.data.token;
        }
        
        return {
          success: true,
          user: response.data.user,
          token: response.data.token,
          message: 'Login successful',
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
        return {
          success: true,
          tournaments: response.data.tournaments || response.data || [],
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
      return response;
    } catch (error) {
      console.error('Get player profile error:', error);
      return {
        success: false,
        message: 'Failed to fetch player profile',
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
    
    return { success: true };
  }
}

// Create and export singleton instance
export const pickleZoneAPI = new PickleZoneAPI();

// Export default for backward compatibility
export default pickleZoneAPI;