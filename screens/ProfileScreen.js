import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  RefreshControl,
  StatusBar,
  Dimensions,
} from 'react-native';
import { pickleZoneAPI } from '../services/pickleZoneAPI';

const { width } = Dimensions.get('window');

const ProfileScreen = ({ onLogout, user, onNavigate }) => {
  const [userProfile, setUserProfile] = useState(user);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    console.log('=== ProfileScreen mounted ===');
    console.log('User prop received:', user);
    
    // Extract the actual player data from nested structure if needed
    let playerData = user;
    if (user?.data?.player) {
      playerData = user.data.player;
      console.log('Extracted player data from nested structure:', playerData);
    }
    
    if (playerData) {
      setUserProfile(playerData);
      console.log('Set userProfile to clean player data:', playerData);
    } else {
      loadUserData();
    }
  }, [user]);

  useEffect(() => {
    console.log('=== ProfileScreen: userProfile state changed ===');
    console.log('Current userProfile:', userProfile);
  }, [userProfile]);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      console.log('=== ProfileScreen: Comprehensive search for IC number and Phone number ===');
      
      // Test multiple endpoints to find IC number and phone number
      const endpoints = [
        { name: 'Mobile Player Essential', method: 'getMobilePlayerEssential' },
        { name: 'Player Profile', method: 'getPlayerProfile' },
        { name: 'Player Details', method: 'getPlayerDetails' },
        { name: 'Player Info', method: 'getPlayerInfo' },
        { name: 'Player Personal', method: 'getPlayerPersonal' },
        { name: 'Player Registration', method: 'getPlayerRegistration' }
      ];

      let foundICNumber = false;
      let foundPhoneNumber = false;
      let bestPlayerData = user; // fallback to login data

      for (const endpoint of endpoints) {
        try {
          console.log(`\n🔍 Testing ${endpoint.name}...`);
          
          if (typeof pickleZoneAPI[endpoint.method] === 'function') {
            const result = await pickleZoneAPI[endpoint.method]();
            
            if (result.success && result.player) {
              console.log(`✅ ${endpoint.name} success!`);
              console.log(`Data keys:`, Object.keys(result.player));
              
              const player = result.player;
              
              // Check for IC number in various possible field names
              const icFields = ['ic', 'icNumber', 'nric', 'nricNumber', 'identityCard', 'nationalId', 'myKad', 'identification'];
              for (const field of icFields) {
                if (player[field]) {
                  console.log(`🎯 FOUND IC NUMBER in ${field}:`, player[field]);
                  foundICNumber = true;
                }
              }
              
              // Check for phone number in various possible field names
              const phoneFields = ['phone', 'phoneNumber', 'mobile', 'mobileNumber', 'contact', 'contactNumber', 'tel', 'telephone', 'cellphone', 'handphone'];
              for (const field of phoneFields) {
                if (player[field]) {
                  console.log(`📱 FOUND PHONE NUMBER in ${field}:`, player[field]);
                  foundPhoneNumber = true;
                }
              }
              
              // Use the most complete data
              if (Object.keys(player).length > Object.keys(bestPlayerData).length) {
                bestPlayerData = player;
                console.log(`📊 Using ${endpoint.name} as best data source`);
              }
              
            } else {
              console.log(`❌ ${endpoint.name} failed:`, result.message);
            }
          } else {
            console.log(`⚠️ ${endpoint.method} method not available`);
          }
        } catch (error) {
          console.log(`❌ ${endpoint.name} error:`, error.message);
        }
      }

      // Set the best available profile data
      setUserProfile(bestPlayerData);
      
      // Summary of findings
      console.log('\n📋 SEARCH SUMMARY:');
      console.log(`IC Number found: ${foundICNumber ? '✅' : '❌'}`);
      console.log(`Phone Number found: ${foundPhoneNumber ? '✅' : '❌'}`);
      
      if (!foundICNumber && !foundPhoneNumber) {
        console.log('⚠️ Neither IC Number nor Phone Number found in any endpoint');
        console.log('Available fields in best data:', Object.keys(bestPlayerData));
      }

    } catch (error) {
      console.error('Load user data error:', error);
      if (user) {
        setUserProfile(user);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: onLogout,
        },
      ]
    );
  };

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Profile editing will be available soon!');
  };

  const handleUploadPhoto = () => {
    Alert.alert('Upload Photo', 'Photo upload will be available soon!');
  };

  const handleBackToHome = () => {
    if (onNavigate) {
      onNavigate('inbox');
    }
  };

  const getInitials = () => {
    if (userProfile?.fullName) {
      return userProfile.fullName.split(' ').map(name => name.charAt(0)).join('').toUpperCase();
    }
    return userProfile?.username?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#007AFF" />
      
      {/* Header with Gradient Background */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleLogout}
          >
            <Text style={styles.headerButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Profile Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.profileImageContainer}>
            <TouchableOpacity 
              style={styles.profileImageWrapper}
              onPress={handleUploadPhoto}
            >
              {userProfile?.profilePicture || userProfile?.profilePictureUrl ? (
                <Image
                  source={{ 
                    uri: userProfile.profilePicture?.startsWith('http') 
                      ? userProfile.profilePicture 
                      : `https://www.malaysiapickleball.my${userProfile.profilePicture || userProfile.profilePictureUrl}`
                  }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Text style={styles.profileImageText}>
                    {getInitials()}
                  </Text>
                </View>
              )}
              <View style={styles.cameraIcon}>
                <Text style={styles.cameraIconText}>📷</Text>
              </View>
            </TouchableOpacity>
          </View>
          
          <View style={styles.profileBasicInfo}>
            <Text style={styles.profileName}>
              {userProfile?.fullName || userProfile?.username || 'User'}
            </Text>
            <Text style={styles.profileUsername}>
              @{userProfile?.username || 'username'}
            </Text>
            <Text style={styles.profileId}>
              ID: {userProfile?.playerId || userProfile?.id || 'N/A'}
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.editProfileButton}
            onPress={handleEditProfile}
          >
            <Text style={styles.editProfileButtonText}>✏️ Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {userProfile?.tournamentsPlayed || 0}
              </Text>
              <Text style={styles.statLabel}>Tournaments</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {userProfile?.ranking || 'Unranked'}
              </Text>
              <Text style={styles.statLabel}>Ranking</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {userProfile?.wins || 0}
              </Text>
              <Text style={styles.statLabel}>Wins</Text>
            </View>
          </View>
        </View>

        {/* Debug Section - Remove this later */}
        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Debug: Raw User Data</Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.debugText}>
              {JSON.stringify(userProfile, null, 2)}
            </Text>
          </View>
        </View>

        {/* Personal Information Card */}
        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Personal Information</Text>
          </View>
          
          <View style={styles.cardContent}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Text style={styles.iconText}>🆔</Text>
              </View>
              <View style={styles.infoDetails}>
                <Text style={styles.infoLabel}>Player ID</Text>
                <Text style={styles.infoValue}>
                  {userProfile?.playerId || userProfile?.id || 'Not available'}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Text style={styles.iconText}>👤</Text>
              </View>
              <View style={styles.infoDetails}>
                <Text style={styles.infoLabel}>Full Name</Text>
                <Text style={styles.infoValue}>
                  {userProfile?.fullName || 'Not provided'}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Text style={styles.iconText}>📧</Text>
              </View>
              <View style={styles.infoDetails}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>
                  {userProfile?.email || 'Not provided'}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Text style={styles.iconText}>🪪</Text>
              </View>
              <View style={styles.infoDetails}>
                <Text style={styles.infoLabel}>IC Number</Text>
                <Text style={styles.infoValue}>
                  {userProfile?.icNumber || userProfile?.ic || userProfile?.nric || 'Not provided'}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Text style={styles.iconText}>📱</Text>
              </View>
              <View style={styles.infoDetails}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>
                  {userProfile?.phone || userProfile?.phoneNumber || 'Not provided'}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Text style={styles.iconText}>🏆</Text>
              </View>
              <View style={styles.infoDetails}>
                <Text style={styles.infoLabel}>Skill Level</Text>
                <Text style={styles.infoValue}>
                  {userProfile?.skillLevel || userProfile?.level || 'Not specified'}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Text style={styles.iconText}>📅</Text>
              </View>
              <View style={styles.infoDetails}>
                <Text style={styles.infoLabel}>Member Since</Text>
                <Text style={styles.infoValue}>
                  {userProfile?.createdAt ? 
                    new Date(userProfile.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 
                    'Recently joined'
                  }
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Settings Card */}
        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Settings</Text>
          </View>
          
          <View style={styles.cardContent}>
            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.infoIcon}>
                <Text style={styles.iconText}>🔔</Text>
              </View>
              <View style={styles.settingDetails}>
                <Text style={styles.settingLabel}>Notifications</Text>
                <Text style={styles.settingSubtext}>Manage your notifications</Text>
              </View>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.infoIcon}>
                <Text style={styles.iconText}>🔒</Text>
              </View>
              <View style={styles.settingDetails}>
                <Text style={styles.settingLabel}>Privacy</Text>
                <Text style={styles.settingSubtext}>Privacy and security settings</Text>
              </View>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.infoIcon}>
                <Text style={styles.iconText}>❓</Text>
              </View>
              <View style={styles.settingDetails}>
                <Text style={styles.settingLabel}>Help & Support</Text>
                <Text style={styles.settingSubtext}>Get help and contact support</Text>
              </View>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.infoIcon}>
                <Text style={styles.iconText}>ℹ️</Text>
              </View>
              <View style={styles.settingDetails}>
                <Text style={styles.settingLabel}>About</Text>
                <Text style={styles.settingSubtext}>App version and information</Text>
              </View>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>
          </View>
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
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  headerButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    backgroundColor: '#fff',
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  profileImageContainer: {
    marginBottom: 20,
  },
  profileImageWrapper: {
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#007AFF',
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  profileImageText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '600',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#fff',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  cameraIconText: {
    fontSize: 14,
  },
  profileBasicInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  profileUsername: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  profileId: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'monospace',
  },
  editProfileButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  editProfileButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  cardContent: {
    paddingVertical: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconText: {
    fontSize: 18,
  },
  infoDetails: {
    flex: 1,
  },
  settingDetails: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  settingLabel: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  settingSubtext: {
    fontSize: 14,
    color: '#666',
  },
  settingArrow: {
    fontSize: 20,
    color: '#ccc',
    fontWeight: '300',
  },
  bottomSpacing: {
    height: 40,
  },
  debugText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#666',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
  },
});

export default ProfileScreen;