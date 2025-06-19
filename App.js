import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import LoginScreen from './screens/LoginScreen';
import InboxScreen from './screens/InboxScreen';
import ProfileScreen from './screens/ProfileScreen';
import TournamentHistoryScreen from './screens/TournamentHistoryScreen';
import { pickleZoneAPI } from './services/pickleZoneAPI';
import { cacheService } from './services/cacheService';

// Bottom Navigation Component
const BottomNavigation = ({ currentScreen, onNavigate }) => {
  const navItems = [
    { key: 'inbox', label: 'Home', icon: '🏠' },
    { key: 'tournaments', label: 'Tournaments', icon: '🏆' },
    { key: 'profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <View style={styles.bottomNav}>
      {navItems.map((item) => (
        <TouchableOpacity
          key={item.key}
          style={[
            styles.navItem,
            currentScreen === item.key && styles.activeNavItem
          ]}
          onPress={() => onNavigate(item.key)}
        >
          <Text style={[
            styles.navIcon,
            currentScreen === item.key && styles.activeNavIcon
          ]}>
            {item.icon}
          </Text>
          <Text style={[
            styles.navLabel,
            currentScreen === item.key && styles.activeNavLabel
          ]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('inbox');
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);

  useEffect(() => {
    // Check if user is already logged in (from cached session)
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('🔍 Checking authentication status...');
      
      // Try to restore session from cache
      const cachedSession = await cacheService.getUserSession();
      
      if (cachedSession && cachedSession.user) {
        console.log('✅ Found cached session:', cachedSession.user.username);
        
        // Restore user data and login state
        setUser(cachedSession.user);
        setIsLoggedIn(true);
        
        // Set tokens in API service
        if (cachedSession.tokens) {
          pickleZoneAPI.token = cachedSession.tokens.accessToken;
          pickleZoneAPI.refreshToken = cachedSession.tokens.refreshToken;
        }
        
        console.log('🔑 Session restored from cache');
        
        // Check if we need to refresh data in background
        checkDataRefresh();
      } else {
        console.log('❌ No cached session found');
      }
    } catch (error) {
      console.error('❌ Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkDataRefresh = async () => {
    try {
      const refreshNeeds = await pickleZoneAPI.needsDataRefresh();
      const needsAnyRefresh = Object.values(refreshNeeds).some(needs => needs);
      
      if (needsAnyRefresh) {
        console.log('🔄 Background data refresh needed:', refreshNeeds);
        // Refresh data in background without blocking UI
        pickleZoneAPI.refreshAllData().then(() => {
          setLastRefresh(new Date());
          console.log('✅ Background refresh completed');
        });
      } else {
        console.log('✅ All data is fresh, no refresh needed');
      }
    } catch (error) {
      console.error('❌ Data refresh check error:', error);
    }
  };

  const handleLogin = (userData) => {
    console.log('Login successful, full response:', userData);
    
    // Extract the actual player data from the nested structure
    const playerData = userData.data?.player || userData.player || userData;
    const accessToken = userData.data?.tokens?.accessToken || userData.tokens?.accessToken;
    
    console.log('Extracted player data:', playerData);
    console.log('Extracted access token:', accessToken);
    
    // Store the clean player data
    setUser(playerData);
    setIsLoggedIn(true);
    setCurrentScreen('inbox');
    
    // Store the access token in the API service
    if (accessToken && pickleZoneAPI) {
      pickleZoneAPI.token = accessToken;
      console.log('Access token stored in API service');
    }
    
    // Session is already cached by the API service during login
    console.log('💾 User session cached during login');
  };

  const handleLogout = async () => {
    try {
      console.log('🚪 Logging out...');
      
      // Clear API tokens and cache
      await pickleZoneAPI.logout();
      
      // Clear local state
      setUser(null);
      setIsLoggedIn(false);
      setCurrentScreen('inbox');
      setLastRefresh(null);
      
      console.log('✅ Logout completed');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Force logout even if there's an error
      setUser(null);
      setIsLoggedIn(false);
      setCurrentScreen('inbox');
    }
  };

  const handleNavigation = (screen) => {
    setCurrentScreen(screen);
  };

  const handleRefresh = async () => {
    try {
      console.log('🔄 Manual refresh triggered');
      await pickleZoneAPI.refreshAllData();
      setLastRefresh(new Date());
      console.log('✅ Manual refresh completed');
    } catch (error) {
      console.error('❌ Manual refresh error:', error);
    }
  };

  const renderCurrentScreen = () => {
    const screenProps = {
      user,
      onNavigate: handleNavigation,
      currentScreen,
      onRefresh: handleRefresh,
      lastRefresh
    };

    switch (currentScreen) {
      case 'profile':
        return (
          <ProfileScreen 
            {...screenProps}
            onLogout={handleLogout}
          />
        );
      case 'tournaments':
        return (
          <TournamentHistoryScreen {...screenProps} />
        );
      case 'inbox':
      default:
        return (
          <InboxScreen {...screenProps} />
        );
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading PickleZone...</Text>
        <Text style={styles.loadingSubtext}>Checking saved session...</Text>
      </View>
    );
  }

  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        <LoginScreen onLogin={handleLogin} />
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.screenContainer}>
        {renderCurrentScreen()}
      </View>
      <BottomNavigation 
        currentScreen={currentScreen} 
        onNavigate={handleNavigation}
      />
      <StatusBar style="auto" />
      
      {/* Debug info in development */}
      {__DEV__ && lastRefresh && (
        <View style={styles.debugInfo}>
          <Text style={styles.debugText}>
            Last refresh: {lastRefresh.toLocaleTimeString()}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  screenContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingBottom: 20,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  activeNavItem: {
    // Active nav item styling can be added here
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  activeNavIcon: {
    // Active icon styling
  },
  navLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  activeNavLabel: {
    color: '#007AFF',
    fontWeight: '600',
  },
  debugInfo: {
    position: 'absolute',
    bottom: 80,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 8,
    borderRadius: 4,
  },
  debugText: {
    color: '#fff',
    fontSize: 10,
  },
}); 