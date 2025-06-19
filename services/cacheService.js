import AsyncStorage from '@react-native-async-storage/async-storage';

class CacheService {
  constructor() {
    this.CACHE_KEYS = {
      USER_SESSION: 'user_session',
      USER_PROFILE: 'user_profile',
      TOURNAMENTS: 'tournaments',
      UPCOMING_TOURNAMENTS: 'upcoming_tournaments',
      MESSAGES: 'messages',
      LAST_SYNC: 'last_sync',
      APP_SETTINGS: 'app_settings'
    };
    
    // Cache expiration times (in milliseconds)
    this.CACHE_EXPIRY = {
      USER_PROFILE: 24 * 60 * 60 * 1000, // 24 hours
      TOURNAMENTS: 60 * 60 * 1000, // 1 hour
      UPCOMING_TOURNAMENTS: 30 * 60 * 1000, // 30 minutes
      MESSAGES: 5 * 60 * 1000, // 5 minutes
      USER_SESSION: 7 * 24 * 60 * 60 * 1000, // 7 days
    };
  }

  // Generic cache operations
  async setCache(key, data, customExpiry = null) {
    try {
      const cacheData = {
        data: data,
        timestamp: Date.now(),
        expiry: customExpiry || this.CACHE_EXPIRY[key] || (60 * 60 * 1000) // Default 1 hour
      };
      
      await AsyncStorage.setItem(key, JSON.stringify(cacheData));
      console.log(`💾 Cached data for key: ${key}`);
      return true;
    } catch (error) {
      console.error(`❌ Cache set error for ${key}:`, error);
      return false;
    }
  }

  async getCache(key) {
    try {
      const cachedItem = await AsyncStorage.getItem(key);
      if (!cachedItem) {
        console.log(`📭 No cache found for key: ${key}`);
        return null;
      }

      const cacheData = JSON.parse(cachedItem);
      const now = Date.now();
      
      // Check if cache has expired
      if (now - cacheData.timestamp > cacheData.expiry) {
        console.log(`⏰ Cache expired for key: ${key}`);
        await this.removeCache(key);
        return null;
      }

      console.log(`💾 Cache hit for key: ${key}`);
      return cacheData.data;
    } catch (error) {
      console.error(`❌ Cache get error for ${key}:`, error);
      return null;
    }
  }

  async removeCache(key) {
    try {
      await AsyncStorage.removeItem(key);
      console.log(`🗑️ Removed cache for key: ${key}`);
      return true;
    } catch (error) {
      console.error(`❌ Cache remove error for ${key}:`, error);
      return false;
    }
  }

  async clearAllCache() {
    try {
      const keys = Object.values(this.CACHE_KEYS);
      await AsyncStorage.multiRemove(keys);
      console.log('🧹 Cleared all cache');
      return true;
    } catch (error) {
      console.error('❌ Clear all cache error:', error);
      return false;
    }
  }

  // User session management
  async saveUserSession(userData, tokens) {
    const sessionData = {
      user: userData,
      tokens: tokens,
      loginTime: Date.now()
    };
    return await this.setCache(this.CACHE_KEYS.USER_SESSION, sessionData);
  }

  async getUserSession() {
    return await this.getCache(this.CACHE_KEYS.USER_SESSION);
  }

  async clearUserSession() {
    return await this.removeCache(this.CACHE_KEYS.USER_SESSION);
  }

  // User profile caching
  async saveUserProfile(profileData) {
    return await this.setCache(this.CACHE_KEYS.USER_PROFILE, profileData);
  }

  async getUserProfile() {
    return await this.getCache(this.CACHE_KEYS.USER_PROFILE);
  }

  // Tournament data caching
  async saveTournaments(tournaments) {
    return await this.setCache(this.CACHE_KEYS.TOURNAMENTS, tournaments);
  }

  async getTournaments() {
    return await this.getCache(this.CACHE_KEYS.TOURNAMENTS);
  }

  async saveUpcomingTournaments(tournaments) {
    return await this.setCache(this.CACHE_KEYS.UPCOMING_TOURNAMENTS, tournaments);
  }

  async getUpcomingTournaments() {
    return await this.getCache(this.CACHE_KEYS.UPCOMING_TOURNAMENTS);
  }

  // Messages caching
  async saveMessages(messages) {
    return await this.setCache(this.CACHE_KEYS.MESSAGES, messages);
  }

  async getMessages() {
    return await this.getCache(this.CACHE_KEYS.MESSAGES);
  }

  // Last sync tracking
  async updateLastSync(endpoint) {
    const syncData = await this.getCache(this.CACHE_KEYS.LAST_SYNC) || {};
    syncData[endpoint] = Date.now();
    return await this.setCache(this.CACHE_KEYS.LAST_SYNC, syncData);
  }

  async getLastSync(endpoint) {
    const syncData = await this.getCache(this.CACHE_KEYS.LAST_SYNC) || {};
    return syncData[endpoint] || 0;
  }

  // Check if data needs refresh based on last sync time
  async needsRefresh(endpoint, maxAge = 60 * 60 * 1000) { // Default 1 hour
    const lastSync = await this.getLastSync(endpoint);
    const now = Date.now();
    const needsUpdate = (now - lastSync) > maxAge;
    
    console.log(`🔄 ${endpoint} needs refresh: ${needsUpdate} (last sync: ${new Date(lastSync).toLocaleString()})`);
    return needsUpdate;
  }

  // App settings
  async saveAppSettings(settings) {
    return await this.setCache(this.CACHE_KEYS.APP_SETTINGS, settings, 30 * 24 * 60 * 60 * 1000); // 30 days
  }

  async getAppSettings() {
    return await this.getCache(this.CACHE_KEYS.APP_SETTINGS);
  }

  // Smart data fetching with cache
  async getOrFetch(cacheKey, fetchFunction, forceRefresh = false) {
    try {
      // Check cache first unless force refresh
      if (!forceRefresh) {
        const cachedData = await this.getCache(cacheKey);
        if (cachedData) {
          console.log(`📦 Using cached data for: ${cacheKey}`);
          return { success: true, data: cachedData, fromCache: true };
        }
      }

      // Fetch fresh data
      console.log(`🌐 Fetching fresh data for: ${cacheKey}`);
      const result = await fetchFunction();
      
      if (result.success && result.data) {
        // Cache the fresh data
        await this.setCache(cacheKey, result.data);
        return { success: true, data: result.data, fromCache: false };
      }
      
      return result;
    } catch (error) {
      console.error(`❌ getOrFetch error for ${cacheKey}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Cache statistics
  async getCacheStats() {
    const stats = {};
    
    for (const [name, key] of Object.entries(this.CACHE_KEYS)) {
      try {
        const cachedItem = await AsyncStorage.getItem(key);
        if (cachedItem) {
          const cacheData = JSON.parse(cachedItem);
          const age = Date.now() - cacheData.timestamp;
          const isExpired = age > cacheData.expiry;
          
          stats[name] = {
            exists: true,
            age: Math.round(age / 1000 / 60), // age in minutes
            expired: isExpired,
            size: cachedItem.length
          };
        } else {
          stats[name] = { exists: false };
        }
      } catch (error) {
        stats[name] = { exists: false, error: error.message };
      }
    }
    
    return stats;
  }

  // Development helpers
  async logCacheStats() {
    const stats = await this.getCacheStats();
    console.log('📊 Cache Statistics:');
    console.table(stats);
  }
}

export const cacheService = new CacheService(); 