import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import LoginScreen from './screens/LoginScreen';
import InboxScreen from './screens/InboxScreen';
import ProfileScreen from './screens/ProfileScreen';
import TournamentHistoryScreen from './screens/TournamentHistoryScreen';

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

  useEffect(() => {
    // Check if user is already logged in (from stored token)
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // You could implement token validation here
      // For now, we'll just set loading to false
      setIsLoading(false);
    } catch (error) {
      console.error('Auth check error:', error);
      setIsLoading(false);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    setCurrentScreen('inbox'); // Always start at home after login
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    setCurrentScreen('inbox');
  };

  const handleNavigation = (screen) => {
    setCurrentScreen(screen);
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'profile':
        return (
          <ProfileScreen 
            user={user}
            onLogout={handleLogout}
            onNavigate={handleNavigation}
            currentScreen={currentScreen}
          />
        );
      case 'tournaments':
        return (
          <TournamentHistoryScreen 
            user={user}
            onNavigate={handleNavigation}
            currentScreen={currentScreen}
          />
        );
      case 'inbox':
      default:
        return (
          <InboxScreen 
            user={user}
            onNavigate={handleNavigation}
            currentScreen={currentScreen}
          />
        );
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading PickleZone...</Text>
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
    // Active item styling handled by text colors
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 4,
    opacity: 0.6,
  },
  activeNavIcon: {
    opacity: 1,
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
}); 