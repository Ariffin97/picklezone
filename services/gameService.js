import { apiClient } from './api';

class GameService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Cache helper methods
  getCacheKey(endpoint, params = {}) {
    return `${endpoint}:${JSON.stringify(params)}`;
  }

  isValidCache(cacheItem) {
    return cacheItem && (Date.now() - cacheItem.timestamp) < this.cacheTimeout;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  getCache(key) {
    const cacheItem = this.cache.get(key);
    return this.isValidCache(cacheItem) ? cacheItem.data : null;
  }

  clearCache() {
    this.cache.clear();
  }

  // Get tournaments
  async getTournaments(params = {}) {
    try {
      const cacheKey = this.getCacheKey('/mobile/tournaments', params);
      const cached = this.getCache(cacheKey);
      
      if (cached) {
        return cached;
      }

      // Build query parameters
      const queryParams = new URLSearchParams();
      if (params.status) queryParams.append('status', params.status);
      if (params.category) queryParams.append('category', params.category);
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.offset) queryParams.append('offset', params.offset.toString());
      if (params.search) queryParams.append('search', params.search);

      const queryString = queryParams.toString();
      const endpoint = `/mobile/tournaments${queryString ? `?${queryString}` : ''}`;

      const response = await apiClient.get(endpoint);
      
      if (response.success) {
        const result = {
          success: true,
          tournaments: response.tournaments || [],
          total: response.total || 0,
        };
        
        this.setCache(cacheKey, result);
        return result;
      } else {
        return {
          success: false,
          message: response.message || 'Failed to get tournaments.',
          tournaments: [],
        };
      }
    } catch (error) {
      console.error('Get tournaments error:', error);
      return {
        success: false,
        message: error.message || 'Failed to get tournaments.',
        tournaments: [],
      };
    }
  }

  // Get tournament details
  async getTournamentDetails(tournamentId) {
    try {
      if (!tournamentId) {
        return {
          success: false,
          message: 'Tournament ID is required.',
        };
      }

      const cacheKey = this.getCacheKey(`/mobile/tournaments/${tournamentId}`);
      const cached = this.getCache(cacheKey);
      
      if (cached) {
        return cached;
      }

      const response = await apiClient.get(`/mobile/tournaments/${tournamentId}`);
      
      if (response.success && response.tournament) {
        const result = {
          success: true,
          tournament: response.tournament,
        };
        
        this.setCache(cacheKey, result);
        return result;
      } else {
        return {
          success: false,
          message: response.message || 'Failed to get tournament details.',
        };
      }
    } catch (error) {
      console.error('Get tournament details error:', error);
      return {
        success: false,
        message: error.message || 'Failed to get tournament details.',
      };
    }
  }

  // Register for tournament
  async registerForTournament(tournamentId, registrationData = {}) {
    try {
      if (!tournamentId) {
        return {
          success: false,
          message: 'Tournament ID is required.',
        };
      }

      const response = await apiClient.post(`/mobile/tournaments/${tournamentId}/register`, registrationData);
      
      if (response.success) {
        // Clear tournaments cache to refresh data
        this.clearCache();
        
        return {
          success: true,
          message: response.message || 'Successfully registered for tournament!',
          registration: response.registration,
        };
      } else {
        return {
          success: false,
          message: response.message || 'Failed to register for tournament.',
        };
      }
    } catch (error) {
      console.error('Register for tournament error:', error);
      return {
        success: false,
        message: error.message || 'Failed to register for tournament.',
      };
    }
  }

  // Get rankings
  async getRankings(params = {}) {
    try {
      const cacheKey = this.getCacheKey('/mobile/rankings', params);
      const cached = this.getCache(cacheKey);
      
      if (cached) {
        return cached;
      }

      // Build query parameters
      const queryParams = new URLSearchParams();
      if (params.category) queryParams.append('category', params.category);
      if (params.gender) queryParams.append('gender', params.gender);
      if (params.ageGroup) queryParams.append('ageGroup', params.ageGroup);
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.offset) queryParams.append('offset', params.offset.toString());

      const queryString = queryParams.toString();
      const endpoint = `/mobile/rankings${queryString ? `?${queryString}` : ''}`;

      const response = await apiClient.get(endpoint);
      
      if (response.success) {
        const result = {
          success: true,
          rankings: response.rankings || [],
          total: response.total || 0,
        };
        
        this.setCache(cacheKey, result);
        return result;
      } else {
        return {
          success: false,
          message: response.message || 'Failed to get rankings.',
          rankings: [],
        };
      }
    } catch (error) {
      console.error('Get rankings error:', error);
      return {
        success: false,
        message: error.message || 'Failed to get rankings.',
        rankings: [],
      };
    }
  }

  // Get messages
  async getMessages(params = {}) {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (params.type) queryParams.append('type', params.type);
      if (params.unreadOnly) queryParams.append('unreadOnly', 'true');
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.offset) queryParams.append('offset', params.offset.toString());

      const queryString = queryParams.toString();
      const endpoint = `/mobile/player/messages${queryString ? `?${queryString}` : ''}`;

      const response = await apiClient.get(endpoint);
      
      if (response.success) {
        return {
          success: true,
          messages: response.messages || [],
          unreadCount: response.unreadCount || 0,
          total: response.total || 0,
        };
      } else {
        return {
          success: false,
          message: response.message || 'Failed to get messages.',
          messages: [],
        };
      }
    } catch (error) {
      console.error('Get messages error:', error);
      return {
        success: false,
        message: error.message || 'Failed to get messages.',
        messages: [],
      };
    }
  }

  // Mark message as read
  async markMessageAsRead(messageId) {
    try {
      if (!messageId) {
        return {
          success: false,
          message: 'Message ID is required.',
        };
      }

      const response = await apiClient.put(`/mobile/player/messages/${messageId}/read`);
      
      return {
        success: response.success,
        message: response.message || (response.success 
          ? 'Message marked as read.' 
          : 'Failed to mark message as read.'),
      };
    } catch (error) {
      console.error('Mark message as read error:', error);
      return {
        success: false,
        message: error.message || 'Failed to mark message as read.',
      };
    }
  }

  // Send message
  async sendMessage(messageData) {
    try {
      const { recipientId, subject, content, type = 'general' } = messageData;

      if (!recipientId || !content) {
        return {
          success: false,
          message: 'Recipient and message content are required.',
        };
      }

      const response = await apiClient.post('/mobile/player/messages', {
        recipientId,
        subject,
        content,
        type,
      });
      
      if (response.success) {
        return {
          success: true,
          message: response.message || 'Message sent successfully!',
          messageId: response.messageId,
        };
      } else {
        return {
          success: false,
          message: response.message || 'Failed to send message.',
        };
      }
    } catch (error) {
      console.error('Send message error:', error);
      return {
        success: false,
        message: error.message || 'Failed to send message.',
      };
    }
  }

  // Get dashboard stats
  async getDashboardStats() {
    try {
      const cacheKey = this.getCacheKey('/mobile/player/dashboard');
      const cached = this.getCache(cacheKey);
      
      if (cached) {
        return cached;
      }

      const response = await apiClient.get('/mobile/player/dashboard');
      
      if (response.success) {
        const result = {
          success: true,
          stats: response.stats || {},
        };
        
        this.setCache(cacheKey, result);
        return result;
      } else {
        return {
          success: false,
          message: response.message || 'Failed to get dashboard stats.',
          stats: {},
        };
      }
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      return {
        success: false,
        message: error.message || 'Failed to get dashboard stats.',
        stats: {},
      };
    }
  }

  // Search players
  async searchPlayers(params = {}) {
    try {
      const { query, limit = 20, offset = 0 } = params;

      if (!query || query.trim().length < 2) {
        return {
          success: false,
          message: 'Search query must be at least 2 characters.',
          players: [],
        };
      }

      const queryParams = new URLSearchParams({
        q: query.trim(),
        limit: limit.toString(),
        offset: offset.toString(),
      });

      const response = await apiClient.get(`/mobile/players/search?${queryParams.toString()}`);
      
      if (response.success) {
        return {
          success: true,
          players: response.players || [],
          total: response.total || 0,
        };
      } else {
        return {
          success: false,
          message: response.message || 'Failed to search players.',
          players: [],
        };
      }
    } catch (error) {
      console.error('Search players error:', error);
      return {
        success: false,
        message: error.message || 'Failed to search players.',
        players: [],
      };
    }
  }

  // Get player profile
  async getPlayerProfile(playerId) {
    try {
      if (!playerId) {
        return {
          success: false,
          message: 'Player ID is required.',
        };
      }

      const cacheKey = this.getCacheKey(`/mobile/players/${playerId}`);
      const cached = this.getCache(cacheKey);
      
      if (cached) {
        return cached;
      }

      const response = await apiClient.get(`/mobile/players/${playerId}`);
      
      if (response.success && response.player) {
        const result = {
          success: true,
          player: response.player,
        };
        
        this.setCache(cacheKey, result);
        return result;
      } else {
        return {
          success: false,
          message: response.message || 'Failed to get player profile.',
        };
      }
    } catch (error) {
      console.error('Get player profile error:', error);
      return {
        success: false,
        message: error.message || 'Failed to get player profile.',
      };
    }
  }

  // Get tournament history
  async getTournamentHistory(params = {}) {
    try {
      const cacheKey = this.getCacheKey('/mobile/player/tournaments', params);
      const cached = this.getCache(cacheKey);
      
      if (cached) {
        return cached;
      }

      // Build query parameters
      const queryParams = new URLSearchParams();
      if (params.status) queryParams.append('status', params.status);
      if (params.category) queryParams.append('category', params.category);
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.offset) queryParams.append('offset', params.offset.toString());

      const queryString = queryParams.toString();
      const endpoint = `/mobile/player/tournaments${queryString ? `?${queryString}` : ''}`;

      const response = await apiClient.get(endpoint);
      
      if (response.success) {
        const result = {
          success: true,
          tournaments: response.tournaments || [],
          stats: response.stats || {},
          total: response.total || 0,
        };
        
        this.setCache(cacheKey, result);
        return result;
      } else {
        return {
          success: false,
          message: response.message || 'Failed to get tournament history.',
          tournaments: [],
          stats: {},
        };
      }
    } catch (error) {
      console.error('Get tournament history error:', error);
      return {
        success: false,
        message: error.message || 'Failed to get tournament history.',
        tournaments: [],
        stats: {},
      };
    }
  }
}

// Export singleton instance
export const gameService = new GameService(); 