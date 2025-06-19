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
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { pickleZoneAPI } from '../services/pickleZoneAPI';

const InboxScreen = ({ user, onNavigate }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [tournamentUpdates, setTournamentUpdates] = useState([]);
  const [systemAnnouncements, setSystemAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(user || null);

  useEffect(() => {
    // Don't call loadUserProfile to prevent freezing
    // Just use the user prop directly
    console.log('📸 Setting userProfile from user prop:', user);
    setUserProfile(user);
    loadInboxData();
  }, []);

  useEffect(() => {
    loadInboxData();
  }, [activeCategory]);

  const loadUserProfile = async () => {
    try {
      console.log('📸 Loading user profile...');
      console.log('📸 Initial user prop:', user);
      
      // Just use the user prop data directly since it already contains profile picture
      // The mobile API endpoints return 401 errors and cause freezing
      if (user) {
        console.log('📸 Using user prop data:', user);
        console.log('📸 Profile picture from user:', user.profilePicture);
        setUserProfile(user);
      } else {
        console.log('📸 No user data available');
        setUserProfile(null);
      }
      
    } catch (error) {
      console.error('📸 Load user profile error:', error);
      setUserProfile(user);
    }
  };

  const loadInboxData = async () => {
    try {
      setLoading(true);
      
      // Temporarily disable tournament API calls to prevent freezing
      // We'll load static content for now
      if (activeCategory === 'all' || activeCategory === 'tournaments') {
        // Create sample tournament updates without API calls
        const sampleUpdates = [
          {
            id: 'tournament-1',
            type: 'tournament',
            title: 'Tournament: Kuala Lumpur Open',
            message: 'New tournament available for registration. Check details and register now!',
            content: 'Tournament details available',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            read: false,
            actionRequired: true
          },
          {
            id: 'tournament-2',
            type: 'tournament',
            title: 'Upcoming: Selangor Championship',
            message: 'Don\'t miss this upcoming tournament! Registration may be open.',
            content: 'Upcoming tournament details',
            createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            read: false,
            actionRequired: true
          }
        ];
        setTournamentUpdates(sampleUpdates);
      } else {
        setTournamentUpdates([]);
      }

      if (activeCategory === 'all' || activeCategory === 'system') {
        // Create system announcements with user-specific content
        const systemMessages = [
          {
            id: 'system-1',
            type: 'system',
            title: 'Profile Active',
            message: `Welcome ${userProfile?.fullName || userProfile?.username || user?.fullName || user?.username || 'Player'}! Your profile is now active and ready for tournament participation.`,
            content: 'Profile activation complete',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            read: false
          },
          {
            id: 'system-2',
            type: 'system',
            title: 'App Updated',
            message: 'PickleZone has been updated with new features and improvements.',
            content: 'App update notification',
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            read: true
          }
        ];
        setSystemAnnouncements(systemMessages);
      } else {
        setSystemAnnouncements([]);
      }

      // Create general notifications with user data
      const generalNotifications = [
        {
          id: 'notif-1',
          type: 'notification',
          title: 'Welcome to Malaysia Pickleball',
          message: `Hi ${userProfile?.fullName || userProfile?.username || user?.fullName || user?.username || 'Player'}! Thank you for joining the Malaysia Pickleball community. Explore tournaments and connect with players.`,
          content: 'Welcome message',
          createdAt: new Date().toISOString(),
          read: false
        }
      ];
      setNotifications(generalNotifications);

      // Set messages as empty for now
      setMessages([]);

    } catch (error) {
      console.error('Load inbox data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInboxData();
    setRefreshing(false);
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

  const handleMessagePress = async (messageId) => {
    if (messageId) {
      try {
        await pickleZoneAPI.markMessageAsRead(messageId);
        loadInboxData();
      } catch (error) {
        console.error('Mark message as read error:', error);
      }
    }
  };

  const getGreeting = () => {
    return 'Welcome';
  };

  const getUserDisplayName = () => {
    return userProfile?.fullName || userProfile?.username || user?.fullName || user?.username || 'Player';
  };

  const getProfileImageUrl = () => {
    // Get profile picture from user data
    const profilePic = userProfile?.profilePicture || user?.profilePicture;
    console.log('📸 Raw profile picture:', profilePic);
    console.log('📸 User profile:', userProfile);
    console.log('📸 User:', user);
    
    if (profilePic) {
      // If it's a relative path, prepend the base URL
      if (profilePic.startsWith('/')) {
        const fullUrl = `https://www.malaysiapickleball.my${profilePic}`;
        console.log('📸 Generated full URL:', fullUrl);
        return fullUrl;
      }
      console.log('📸 Using direct URL:', profilePic);
      return profilePic;
    }
    console.log('📸 No profile picture found');
    return null;
  };

  const getProfileInitials = () => {
    const fullName = userProfile?.fullName || user?.fullName;
    if (fullName) {
      const names = fullName.split(' ');
      if (names.length >= 2) {
        return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
      }
      return fullName.charAt(0).toUpperCase();
    }
    return (userProfile?.username?.charAt(0) || user?.username?.charAt(0) || 'U').toUpperCase();
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return 'Recently';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getFilteredMessages = () => {
    let allMessages = [];

    if (activeCategory === 'all') {
      allMessages = [
        ...messages.map(msg => ({ ...msg, type: 'message' })),
        ...notifications.map(notif => ({ ...notif, type: 'notification' })),
        ...tournamentUpdates.map(update => ({ ...update, type: 'tournament' })),
        ...systemAnnouncements.map(ann => ({ ...ann, type: 'system' })),
      ];
    } else if (activeCategory === 'tournaments') {
      allMessages = tournamentUpdates.map(update => ({ ...update, type: 'tournament' }));
    } else if (activeCategory === 'system') {
      allMessages = systemAnnouncements.map(ann => ({ ...ann, type: 'system' }));
    }

    if (searchQuery.trim()) {
      allMessages = allMessages.filter(msg => 
        msg.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.content?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return allMessages.sort((a, b) => {
      const timeA = new Date(a.createdAt || a.timestamp || 0);
      const timeB = new Date(b.createdAt || b.timestamp || 0);
      return timeB - timeA;
    });
  };

  const getMessageIcon = (type) => {
    switch (type) {
      case 'tournament': return '🏆';
      case 'system': return '🔔';
      case 'notification': return '📢';
      default: return '💬';
    }
  };

  const renderMessage = (message, index) => {
    return (
      <TouchableOpacity
        key={`${message.type}-${message.id || index}`}
        style={styles.messageCard}
        onPress={() => handleMessagePress(message.id)}
      >
        <View style={styles.messageHeader}>
          <View style={styles.messageIconContainer}>
            <Text style={styles.messageIcon}>
              {getMessageIcon(message.type)}
            </Text>
          </View>
          <View style={styles.messageContent}>
            <Text style={styles.messageTitle}>
              {message.title || message.subject || 'Message'}
            </Text>
            <Text style={styles.messageTime}>
              {formatMessageTime(message.createdAt || message.timestamp)}
            </Text>
          </View>
          {!message.read && (
            <View style={styles.unreadIndicator} />
          )}
        </View>
        <Text style={styles.messageBody} numberOfLines={3}>
          {message.message || message.content || message.body || 'No content available'}
        </Text>
        {message.actionRequired && (
          <View style={styles.messageActions}>
            <TouchableOpacity 
              style={styles.messageActionButton}
              onPress={() => handleTournamentsPress()}
            >
              <Text style={styles.messageActionText}>View Details</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
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
                  onError={() => {
                    console.log('Profile image failed to load:', getProfileImageUrl());
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

        {/* Message Categories */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Messages</Text>
          <View style={styles.categoriesContainer}>
            <TouchableOpacity 
              style={[styles.categoryButton, activeCategory === 'all' && styles.activeCategory]}
              onPress={() => handleCategoryPress('all')}
            >
              <Text style={[styles.categoryText, activeCategory === 'all' && styles.activeCategoryText]}>
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.categoryButton, activeCategory === 'tournaments' && styles.activeCategory]}
              onPress={() => handleCategoryPress('tournaments')}
            >
              <Text style={[styles.categoryText, activeCategory === 'tournaments' && styles.activeCategoryText]}>
                Tournaments
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.categoryButton, activeCategory === 'system' && styles.activeCategory]}
              onPress={() => handleCategoryPress('system')}
            >
              <Text style={[styles.categoryText, activeCategory === 'system' && styles.activeCategoryText]}>
                System
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages List */}
        <View style={styles.messagesSection}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Loading messages...</Text>
            </View>
          ) : getFilteredMessages().length > 0 ? (
            getFilteredMessages().map((message, index) => renderMessage(message, index))
          ) : (
            <>
              {/* Welcome Message for new users */}
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

              {/* Empty State */}
              <View style={styles.emptyStateCard}>
                <Text style={styles.emptyStateIcon}>📬</Text>
                <Text style={styles.emptyStateTitle}>
                  {searchQuery ? 'No matching messages found' : 'You\'re All Caught Up!'}
                </Text>
                <Text style={styles.emptyStateText}>
                  {searchQuery 
                    ? 'Try adjusting your search terms or check different categories'
                    : 'New tournament updates and messages will appear here'
                  }
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Bottom Spacing */}
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
    fontSize: 26,
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
    backgroundColor: 'rgba(255,255,255,0.15)',
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
  profileImageContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
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
  categoriesSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  categoriesContainer: {
    flexDirection: 'row',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginRight: 8,
  },
  activeCategory: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeCategoryText: {
    color: '#fff',
  },
  messagesSection: {
    paddingHorizontal: 20,
  },
  loadingContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
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
    color: '#999',
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
  },
  messageBody: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  messageActions: {
    flexDirection: 'row',
  },
  messageActionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  messageActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyStateCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 40,
  },
});

export default InboxScreen; 