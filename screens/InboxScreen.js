import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';

const InboxScreen = ({ user, onNavigate }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('📸 InboxScreen loaded with user:', user);
    console.log('📸 Profile picture:', user?.profilePicture);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const handleCategoryPress = (category) => {
    setActiveCategory(category);
  };

  const handleProfilePress = () => {
    if (onNavigate) {
      onNavigate('profile');
    }
  };

  const handleTournamentsPress = () => {
    if (onNavigate) {
      onNavigate('tournaments');
    }
  };

  const getUserDisplayName = () => {
    return user?.fullName || user?.username || 'Player';
  };

  const getProfileImageUrl = () => {
    const profilePic = user?.profilePicture;
    console.log('📸 Raw profile picture:', profilePic);
    
    if (profilePic) {
      if (profilePic.startsWith('/')) {
        const fullUrl = `https://www.malaysiapickleball.my${profilePic}`;
        console.log('📸 Generated full URL:', fullUrl);
        return fullUrl;
      }
      return profilePic;
    }
    return null;
  };

  const getProfileInitials = () => {
    const fullName = user?.fullName;
    if (fullName) {
      const names = fullName.split(' ');
      if (names.length >= 2) {
        return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
      }
      return fullName.charAt(0).toUpperCase();
    }
    return (user?.username?.charAt(0) || 'U').toUpperCase();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#007AFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.greetingSection}>
            <Text style={styles.greetingText}>Welcome</Text>
            <Text style={styles.userNameText}>{getUserDisplayName()}</Text>
            <Text style={styles.headerSubtitle}>Ready to play some pickleball?</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={handleProfilePress}
            activeOpacity={0.8}
          >
            <View style={styles.profileAvatar}>
              {getProfileImageUrl() ? (
                <Image 
                  source={{ uri: getProfileImageUrl() }}
                  style={styles.profileImage}
                  onError={(error) => {
                    console.log('📸 Profile image failed to load:', getProfileImageUrl());
                  }}
                  onLoad={() => {
                    console.log('📸 Profile image loaded successfully:', getProfileImageUrl());
                  }}
                />
              ) : (
                <Text style={styles.profileAvatarText}>
                  {getProfileInitials()}
                </Text>
              )}
              <View style={styles.onlineIndicator} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search messages and tournaments..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={handleTournamentsPress}
            >
              <View style={styles.quickActionIcon}>
                <Text style={styles.quickActionIconText}>🏆</Text>
              </View>
              <Text style={styles.quickActionTitle}>Tournaments</Text>
              <Text style={styles.quickActionSubtitle}>View upcoming events</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={handleProfilePress}
            >
              <View style={styles.quickActionIcon}>
                <Text style={styles.quickActionIconText}>👤</Text>
              </View>
              <Text style={styles.quickActionTitle}>Profile</Text>
              <Text style={styles.quickActionSubtitle}>Manage your account</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Welcome Message */}
        <View style={styles.messagesSection}>
          <Text style={styles.sectionTitle}>Messages</Text>
          
          <View style={styles.messageCard}>
            <View style={styles.messageHeader}>
              <View style={styles.messageIconContainer}>
                <Text style={styles.messageIcon}>🎉</Text>
              </View>
              <View style={styles.messageContent}>
                <Text style={styles.messageTitle}>Welcome to PickleZone!</Text>
                <Text style={styles.messageTime}>Just now</Text>
              </View>
            </View>
            <Text style={styles.messageBody}>
              Welcome to Malaysia Pickleball! You're all set up and ready to join tournaments, 
              track your progress, and connect with the pickleball community.
            </Text>
            <View style={styles.messageActions}>
              <TouchableOpacity 
                style={styles.messageActionButton}
                onPress={handleTournamentsPress}
              >
                <Text style={styles.messageActionText}>View Tournaments</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Profile Status Message */}
          <View style={styles.messageCard}>
            <View style={styles.messageHeader}>
              <View style={styles.messageIconContainer}>
                <Text style={styles.messageIcon}>✅</Text>
              </View>
              <View style={styles.messageContent}>
                <Text style={styles.messageTitle}>Profile Active</Text>
                <Text style={styles.messageTime}>2h ago</Text>
              </View>
            </View>
            <Text style={styles.messageBody}>
              Hi {getUserDisplayName()}! Your profile is now active and ready for tournament participation.
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
    backgroundColor: '#007AFF',
    paddingTop: 50,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  greetingSection: {
    flex: 1,
  },
  greetingText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  userNameText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '400',
  },
  profileButton: {
    padding: 4,
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    position: 'relative',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  profileAvatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  searchContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1a1a1a',
  },
  scrollView: {
    flex: 1,
  },
  quickActionsSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionIconText: {
    fontSize: 24,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  messagesSection: {
    paddingHorizontal: 20,
  },
  messageCard: {
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
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  messageIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  messageIcon: {
    fontSize: 18,
  },
  messageContent: {
    flex: 1,
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  messageTime: {
    fontSize: 12,
    color: '#666',
  },
  messageBody: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  messageActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  messageActionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  messageActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 20,
  },
});

export default InboxScreen; 