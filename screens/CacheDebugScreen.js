import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { cacheService } from '../services/cacheService';
import { pickleZoneAPI } from '../services/pickleZoneAPI';

const CacheDebugScreen = ({ onNavigate }) => {
  const [cacheStats, setCacheStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    loadCacheStats();
  }, []);

  const loadCacheStats = async () => {
    try {
      setLoading(true);
      const stats = await cacheService.getCacheStats();
      setCacheStats(stats);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('❌ Failed to load cache stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshStats = async () => {
    setRefreshing(true);
    await loadCacheStats();
    setRefreshing(false);
  };

  const handleClearCache = (cacheKey, cacheName) => {
    Alert.alert(
      'Clear Cache',
      `Are you sure you want to clear ${cacheName} cache?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await cacheService.removeCache(cacheKey);
              await loadCacheStats();
              Alert.alert('Success', `${cacheName} cache cleared`);
            } catch (error) {
              Alert.alert('Error', `Failed to clear ${cacheName} cache`);
            }
          }
        }
      ]
    );
  };

  const handleClearAllCache = () => {
    Alert.alert(
      'Clear All Cache',
      'This will clear all cached data including user session. You will need to login again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await cacheService.clearAllCache();
              await loadCacheStats();
              Alert.alert('Success', 'All cache cleared');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear all cache');
            }
          }
        }
      ]
    );
  };

  const handleForceRefresh = async () => {
    try {
      setRefreshing(true);
      await pickleZoneAPI.refreshAllData();
      await loadCacheStats();
      Alert.alert('Success', 'All data refreshed from API');
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatAge = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    if (minutes < 24 * 60) return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
    return `${Math.floor(minutes / (24 * 60))}d ${Math.floor((minutes % (24 * 60)) / 60)}h`;
  };

  const renderCacheItem = (name, key, stats) => {
    const isExpired = stats.expired;
    const hasData = stats.exists;

    return (
      <View key={name} style={styles.cacheItem}>
        <View style={styles.cacheHeader}>
          <Text style={styles.cacheName}>{name.replace('_', ' ')}</Text>
          <View style={styles.cacheStatus}>
            <View style={[
              styles.statusIndicator,
              { backgroundColor: hasData ? (isExpired ? '#FF9500' : '#4CAF50') : '#FF5722' }
            ]} />
            <Text style={styles.statusText}>
              {hasData ? (isExpired ? 'Expired' : 'Fresh') : 'Empty'}
            </Text>
          </View>
        </View>
        
        {hasData && (
          <View style={styles.cacheDetails}>
            <Text style={styles.cacheDetailText}>
              Age: {formatAge(stats.age)} • Size: {formatSize(stats.size)}
            </Text>
          </View>
        )}
        
        <View style={styles.cacheActions}>
          {hasData && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => handleClearCache(key, name)}
            >
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading cache statistics...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => onNavigate('profile')}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cache Debug</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefreshStats}
          disabled={refreshing}
        >
          <Text style={styles.refreshButtonText}>
            {refreshing ? '...' : '🔄'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cache Overview</Text>
          {lastUpdate && (
            <Text style={styles.lastUpdate}>
              Last updated: {lastUpdate.toLocaleTimeString()}
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cache Status</Text>
          {Object.entries(cacheStats).map(([name, stats]) =>
            renderCacheItem(name, cacheService.CACHE_KEYS[name], stats)
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleForceRefresh}
            disabled={refreshing}
          >
            <Text style={styles.actionButtonText}>
              {refreshing ? 'Refreshing...' : '🔄 Force Refresh All Data'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.dangerButton]}
            onPress={handleClearAllCache}
          >
            <Text style={[styles.actionButtonText, styles.dangerButtonText]}>
              🗑️ Clear All Cache
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cache Info</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              • Cache automatically expires based on data type{'\n'}
              • User sessions last 7 days{'\n'}
              • Tournament data expires after 1 hour{'\n'}
              • Profile data expires after 24 hours{'\n'}
              • Pull to refresh forces fresh data fetch
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  refreshButton: {
    padding: 8,
  },
  refreshButtonText: {
    fontSize: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  lastUpdate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  cacheItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cacheHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cacheName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    textTransform: 'capitalize',
  },
  cacheStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  cacheDetails: {
    marginBottom: 8,
  },
  cacheDetailText: {
    fontSize: 14,
    color: '#666',
  },
  cacheActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  clearButton: {
    backgroundColor: '#FF5722',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  actionButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  dangerButton: {
    backgroundColor: '#FF5722',
  },
  dangerButtonText: {
    color: '#fff',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default CacheDebugScreen; 