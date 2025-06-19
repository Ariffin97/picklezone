import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ProfileScreen from './screens/ProfileScreen';
import TournamentEventScreen from './screens/TournamentEventScreen';
import InboxScreen from './screens/InboxScreen';
import TournamentHistoryScreen from './screens/TournamentHistoryScreen';
import LoginScreen from './screens/LoginScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  // Show login screen if not logged in
  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // Show main app if logged in
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: 'gray',
          headerStyle: {
            backgroundColor: '#f8f9fa',
          },
          headerTintColor: '#000',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          tabBarStyle: {
            paddingBottom: 5,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
        }}
      >
        <Tab.Screen
          name="Profile"
          options={{
            tabBarLabel: 'Profile',
            headerTitle: 'Profile',
          }}
        >
          {(props) => <ProfileScreen {...props} onLogout={handleLogout} />}
        </Tab.Screen>
        <Tab.Screen
          name="Tournament"
          component={TournamentEventScreen}
          options={{
            tabBarLabel: 'Events',
            headerTitle: 'Tournament Events',
          }}
        />
        <Tab.Screen
          name="Inbox"
          component={InboxScreen}
          options={{
            tabBarLabel: 'Inbox',
            headerTitle: 'Inbox',
          }}
        />
        <Tab.Screen
          name="History"
          component={TournamentHistoryScreen}
          options={{
            tabBarLabel: 'History',
            headerTitle: 'Tournament History',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
} 