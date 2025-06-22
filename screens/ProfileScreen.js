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
  Platform,
  Modal,
  Switch,
} from 'react-native';
import { pickleZoneAPI } from '../services/pickleZoneAPI';

const { width } = Dimensions.get('window');

const ProfileScreen = ({ onLogout, user, onNavigate }) => {
  const [userProfile, setUserProfile] = useState(user);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    tournaments: true,
    systemUpdates: true,
    announcements: true,
    registrationReminders: true,
    tournamentResults: true,
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
  });

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

  const handlePrivacyPolicy = () => {
    setShowPrivacyModal(true);
  };

  const handleHelpSupport = () => {
    setShowHelpModal(true);
  };

  const handleAbout = () => {
    setShowAboutModal(true);
  };

  const handleNotifications = () => {
    setShowNotificationModal(true);
  };

  const toggleNotificationSetting = (setting) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const getInitials = () => {
    if (userProfile?.fullName) {
      return userProfile.fullName.split(' ').map(name => name.charAt(0)).join('').toUpperCase();
    }
    return userProfile?.username?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
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


          </View>
        </View>

        {/* Settings Card */}
        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Settings</Text>
          </View>
          
          <View style={styles.cardContent}>
            <TouchableOpacity style={styles.settingRow} onPress={handleNotifications}>
              <View style={styles.infoIcon}>
                <Text style={styles.iconText}>🔔</Text>
              </View>
              <View style={styles.settingDetails}>
                <Text style={styles.settingLabel}>Notifications</Text>
                <Text style={styles.settingSubtext}>Manage your notifications</Text>
              </View>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingRow} onPress={handlePrivacyPolicy}>
              <View style={styles.infoIcon}>
                <Text style={styles.iconText}>🔒</Text>
              </View>
              <View style={styles.settingDetails}>
                <Text style={styles.settingLabel}>Privacy Policy</Text>
                <Text style={styles.settingSubtext}>Data protection and privacy rights</Text>
              </View>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingRow} onPress={handleHelpSupport}>
              <View style={styles.infoIcon}>
                <Text style={styles.iconText}>❓</Text>
              </View>
              <View style={styles.settingDetails}>
                <Text style={styles.settingLabel}>Help & Support</Text>
                <Text style={styles.settingSubtext}>Get help and contact support</Text>
              </View>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingRow} onPress={handleAbout}>
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

      {/* Privacy Policy Modal */}
      <Modal
        visible={showPrivacyModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPrivacyModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Privacy Policy</Text>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowPrivacyModal(false)}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.privacyTitle}>PICKLE ZONE PRIVACY POLICY</Text>
            <Text style={styles.privacySubtitle}>Effective Date: {new Date().toLocaleDateString('en-MY')}</Text>
            
            <Text style={styles.privacyText}>
              This Privacy Policy explains how Fenix Digital, operating Pickle Zone ("we", "our", or "us") collects, uses, and protects your personal data in compliance with the Personal Data Protection Act 2010 (PDPA) of Malaysia.
            </Text>

            <Text style={styles.sectionTitle}>1. DATA CONTROLLER</Text>
            <Text style={styles.privacyText}>
              Fenix Digital, the owner and operator of Pickle Zone, is the data controller responsible for your personal data. You can contact our Data Protection Officer at ariffin@fenixdigital.my for any privacy-related inquiries.
            </Text>

            <Text style={styles.sectionTitle}>2. PERSONAL DATA WE COLLECT</Text>
            <Text style={styles.privacyText}>
              Under the PDPA, we collect the following categories of personal data:
            </Text>
            <Text style={styles.bulletPoint}>• Identity Information: Full name, NRIC/IC number, date of birth</Text>
            <Text style={styles.bulletPoint}>• Contact Information: Phone number, email address, residential address</Text>
            <Text style={styles.bulletPoint}>• Profile Information: Username, profile picture, skill level</Text>
            <Text style={styles.bulletPoint}>• Tournament Data: Registration details, match results, rankings</Text>
            <Text style={styles.bulletPoint}>• Device Information: Device ID, IP address, app usage data</Text>

            <Text style={styles.sectionTitle}>3. PURPOSE OF DATA COLLECTION</Text>
            <Text style={styles.privacyText}>
              We process your personal data for the following lawful purposes under PDPA:
            </Text>
            <Text style={styles.bulletPoint}>• Account creation and management</Text>
            <Text style={styles.bulletPoint}>• Tournament registration and management</Text>
            <Text style={styles.bulletPoint}>• Player ranking and statistics</Text>
            <Text style={styles.bulletPoint}>• Communication regarding tournaments and updates</Text>
            <Text style={styles.bulletPoint}>• Compliance with legal obligations</Text>
            <Text style={styles.bulletPoint}>• Fraud prevention and security</Text>

            <Text style={styles.sectionTitle}>4. YOUR RIGHTS UNDER PDPA</Text>
            <Text style={styles.privacyText}>
              As a data subject under Malaysian PDPA, you have the following rights:
            </Text>
            <Text style={styles.bulletPoint}>• Right to Access: Request copies of your personal data</Text>
            <Text style={styles.bulletPoint}>• Right to Correction: Request correction of inaccurate data</Text>
            <Text style={styles.bulletPoint}>• Right to Limit Processing: Limit how we use your data</Text>
            <Text style={styles.bulletPoint}>• Right to Data Portability: Request transfer of your data</Text>
            <Text style={styles.bulletPoint}>• Right to Withdraw Consent: Withdraw consent for data processing</Text>

            <Text style={styles.sectionTitle}>5. DATA SHARING AND DISCLOSURE</Text>
            <Text style={styles.privacyText}>
              We may share your personal data with:
            </Text>
            <Text style={styles.bulletPoint}>• Tournament organizers (with your consent)</Text>
            <Text style={styles.bulletPoint}>• Payment processors for tournament fees</Text>
            <Text style={styles.bulletPoint}>• Legal authorities when required by Malaysian law</Text>
            <Text style={styles.bulletPoint}>• Service providers under strict confidentiality agreements</Text>

            <Text style={styles.sectionTitle}>6. DATA SECURITY</Text>
            <Text style={styles.privacyText}>
              We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction, including:
            </Text>
            <Text style={styles.bulletPoint}>• Encryption of sensitive data</Text>
            <Text style={styles.bulletPoint}>• Regular security assessments</Text>
            <Text style={styles.bulletPoint}>• Access controls and authentication</Text>
            <Text style={styles.bulletPoint}>• Staff training on data protection</Text>

            <Text style={styles.sectionTitle}>7. DATA RETENTION</Text>
            <Text style={styles.privacyText}>
              We retain your personal data only for as long as necessary to fulfill the purposes outlined in this policy or as required by Malaysian law. Tournament data may be retained for historical records and statistical purposes.
            </Text>

            <Text style={styles.sectionTitle}>8. INTERNATIONAL DATA TRANSFERS</Text>
            <Text style={styles.privacyText}>
              If we transfer your personal data outside Malaysia, we ensure adequate protection through appropriate safeguards as required by PDPA, including standard contractual clauses or adequacy decisions.
            </Text>

            <Text style={styles.sectionTitle}>9. COOKIES AND TRACKING</Text>
            <Text style={styles.privacyText}>
              Our app may use cookies and similar technologies to enhance user experience. You can manage cookie preferences through your device settings.
            </Text>

            <Text style={styles.sectionTitle}>10. CHILDREN'S PRIVACY</Text>
            <Text style={styles.privacyText}>
              We do not knowingly collect personal data from children under 12 years old without parental consent, in accordance with Malaysian law.
            </Text>

            <Text style={styles.sectionTitle}>11. CHANGES TO THIS POLICY</Text>
            <Text style={styles.privacyText}>
              We may update this Privacy Policy from time to time. We will notify you of any material changes through the app or via email.
            </Text>

            <Text style={styles.sectionTitle}>12. CONTACT INFORMATION</Text>
            <Text style={styles.privacyText}>
              For any questions about this Privacy Policy or to exercise your rights under PDPA, please contact us:
            </Text>
            <Text style={styles.contactInfo}>
              Company: Fenix Digital{'\n'}
              Email: ariffin@fenixdigital.my{'\n'}
              Phone: +6011-16197471{'\n'}
              Address: Lot 1875, 1st floor, Marina Square Phase 2{'\n'}
              980000, Miri, Sarawak, Malaysia{'\n'}
              Data Protection Officer: ariffin@fenixdigital.my
            </Text>

            <Text style={styles.sectionTitle}>13. COMPLAINT PROCEDURE</Text>
            <Text style={styles.privacyText}>
              If you believe we have not complied with PDPA requirements, you may file a complaint with:
            </Text>
            <Text style={styles.contactInfo}>
              Personal Data Protection Department{'\n'}
              Ministry of Digital{'\n'}
              Level 4-7, Menara Usahawan{'\n'}
              No. 18 Persiaran Perdana, Precinct 2{'\n'}
              62000 Putrajaya{'\n'}
              Email: pdp@digital.gov.my{'\n'}
              Phone: +60 3-8911 7000
            </Text>

            <Text style={styles.acknowledgment}>
              By using Pickle Zone, you acknowledge that you have read and understood this Privacy Policy and consent to the collection, use, and disclosure of your personal data as described herein by Fenix Digital.
            </Text>

            <View style={styles.modalBottomSpacing} />
          </ScrollView>
        </View>
      </Modal>

      {/* Help & Support Modal */}
      <Modal
        visible={showHelpModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowHelpModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Help & Support</Text>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowHelpModal(false)}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.privacyTitle}>PICKLE ZONE HELP CENTER</Text>
            <Text style={styles.privacySubtitle}>We're here to help you get the most out of your pickleball experience!</Text>
            
            <Text style={styles.sectionTitle}>📞 CONTACT SUPPORT</Text>
            <Text style={styles.contactInfo}>
              📧 Email: ariffin@fenixdigital.my{'\n'}
              📱 Phone: +6011-16197471{'\n'}
              🏢 Office Hours: Monday - Friday, 9:00 AM - 6:00 PM (MYT){'\n'}
              📍 Address: Lot 1875, 1st floor, Marina Square Phase 2{'\n'}
              980000, Miri, Sarawak, Malaysia
            </Text>

            <Text style={styles.sectionTitle}>🚀 GETTING STARTED</Text>
            
            <Text style={styles.helpSubtitle}>Creating Your Account</Text>
            <Text style={styles.bulletPoint}>• Register with your valid email address</Text>
            <Text style={styles.bulletPoint}>• Verify your account through the email link</Text>
            <Text style={styles.bulletPoint}>• Complete your profile with personal information</Text>
            <Text style={styles.bulletPoint}>• Upload a profile picture (optional)</Text>

            <Text style={styles.helpSubtitle}>Setting Up Your Profile</Text>
            <Text style={styles.bulletPoint}>• Add your skill level to find suitable tournaments</Text>
            <Text style={styles.bulletPoint}>• Update your contact information</Text>
            <Text style={styles.bulletPoint}>• Set your location preferences</Text>
            <Text style={styles.bulletPoint}>• Configure notification settings</Text>

            <Text style={styles.sectionTitle}>🏆 TOURNAMENTS</Text>
            
            <Text style={styles.helpSubtitle}>Finding Tournaments</Text>
            <Text style={styles.bulletPoint}>• Browse all available tournaments on the main page</Text>
            <Text style={styles.bulletPoint}>• Use filters to find tournaments by date, location, or skill level</Text>
            <Text style={styles.bulletPoint}>• Check tournament details including fees, rules, and schedules</Text>
            <Text style={styles.bulletPoint}>• View tournament organizer information</Text>

            <Text style={styles.helpSubtitle}>Tournament Registration</Text>
            <Text style={styles.bulletPoint}>• Click on any tournament to view details</Text>
            <Text style={styles.bulletPoint}>• Check eligibility requirements</Text>
            <Text style={styles.bulletPoint}>• Register online through the Malaysia Pickleball website</Text>
            <Text style={styles.bulletPoint}>• Pay tournament fees as directed by organizers</Text>

            <Text style={styles.sectionTitle}>📱 APP FEATURES</Text>
            
            <Text style={styles.helpSubtitle}>Inbox & Notifications</Text>
            <Text style={styles.bulletPoint}>• Receive system notifications about tournaments</Text>
            <Text style={styles.bulletPoint}>• Get updates about tournament changes or cancellations</Text>
            <Text style={styles.bulletPoint}>• View important announcements from Malaysia Pickleball</Text>
            <Text style={styles.bulletPoint}>• Filter messages by category (System, Tournaments)</Text>

            <Text style={styles.helpSubtitle}>QR Scanner</Text>
            <Text style={styles.bulletPoint}>• Use the QR scanner in the top-right corner of the inbox</Text>
            <Text style={styles.bulletPoint}>• Scan tournament QR codes for quick registration</Text>
            <Text style={styles.bulletPoint}>• Scan player QR codes to connect with other players</Text>
            <Text style={styles.bulletPoint}>• Access exclusive tournament information</Text>

            <Text style={styles.sectionTitle}>🔧 TROUBLESHOOTING</Text>
            
            <Text style={styles.helpSubtitle}>Login Issues</Text>
            <Text style={styles.bulletPoint}>• Ensure you're using the correct username and password</Text>
            <Text style={styles.bulletPoint}>• Check your internet connection</Text>
            <Text style={styles.bulletPoint}>• Try logging out and logging back in</Text>
            <Text style={styles.bulletPoint}>• Contact support if you've forgotten your password</Text>

            <Text style={styles.helpSubtitle}>Tournament Loading Problems</Text>
            <Text style={styles.bulletPoint}>• Pull down on the tournament list to refresh</Text>
            <Text style={styles.bulletPoint}>• Check your internet connection</Text>
            <Text style={styles.bulletPoint}>• Close and reopen the app</Text>
            <Text style={styles.bulletPoint}>• Contact support if problems persist</Text>

            <Text style={styles.helpSubtitle}>Profile Update Issues</Text>
            <Text style={styles.bulletPoint}>• Ensure all required fields are filled</Text>
            <Text style={styles.bulletPoint}>• Check that your email format is valid</Text>
            <Text style={styles.bulletPoint}>• Verify your phone number format (+60 for Malaysia)</Text>
            <Text style={styles.bulletPoint}>• Contact support for account verification issues</Text>

            <Text style={styles.sectionTitle}>❓ FREQUENTLY ASKED QUESTIONS</Text>
            
            <Text style={styles.helpSubtitle}>Q: How do I register for tournaments?</Text>
            <Text style={styles.privacyText}>
              A: Tournament registration is handled through the Malaysia Pickleball website. Click on any tournament in the app to view details and registration links.
            </Text>

            <Text style={styles.helpSubtitle}>Q: Are tournament fees paid through the app?</Text>
            <Text style={styles.privacyText}>
              A: No, tournament fees are paid directly to tournament organizers as specified in each tournament's details.
            </Text>

            <Text style={styles.helpSubtitle}>Q: How do I update my skill level?</Text>
            <Text style={styles.privacyText}>
              A: You can update your skill level by editing your profile. This feature will be available in future app updates.
            </Text>

            <Text style={styles.helpSubtitle}>Q: Can I cancel my tournament registration?</Text>
            <Text style={styles.privacyText}>
              A: Cancellation policies vary by tournament. Contact the tournament organizer directly for cancellation requests.
            </Text>

            <Text style={styles.helpSubtitle}>Q: How do I report a problem with the app?</Text>
            <Text style={styles.privacyText}>
              A: Contact our support team using the contact information above. Include details about the problem and your device information.
            </Text>

            <Text style={styles.sectionTitle}>🆘 EMERGENCY SUPPORT</Text>
            <Text style={styles.privacyText}>
              For urgent issues during tournaments or time-sensitive problems:
            </Text>
            <Text style={styles.contactInfo}>
              📱 Emergency Phone: +6011-16197471{'\n'}
              📧 Priority Email: ariffin@fenixdigital.my{'\n'}
              🕐 Available: 24/7 during tournament weekends
            </Text>

            <Text style={styles.sectionTitle}>📚 ADDITIONAL RESOURCES</Text>
            <Text style={styles.bulletPoint}>• Malaysia Pickleball Official Website: www.malaysiapickleball.my</Text>
            <Text style={styles.bulletPoint}>• Pickleball Rules and Regulations</Text>
            <Text style={styles.bulletPoint}>• Tournament Calendar and Schedules</Text>
            <Text style={styles.bulletPoint}>• Player Rankings and Statistics</Text>
            <Text style={styles.bulletPoint}>• Community Forums and Discussions</Text>

            <Text style={styles.acknowledgment}>
              Thank you for using Pickle Zone! We're committed to providing you with the best pickleball tournament experience in Malaysia. If you need any assistance, don't hesitate to reach out to our support team.
            </Text>

            <View style={styles.modalBottomSpacing} />
          </ScrollView>
        </View>
      </Modal>

      {/* About Modal */}
      <Modal
        visible={showAboutModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAboutModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>About</Text>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowAboutModal(false)}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.aboutLogoContainer}>
              <Text style={styles.aboutAppName}>🏓 PICKLE ZONE</Text>
              <Text style={styles.aboutVersion}>Version 1.1.0</Text>
              <Text style={styles.aboutTagline}>Malaysia's Premier Pickleball Tournament App</Text>
            </View>
            
            <Text style={styles.sectionTitle}>🏢 ABOUT FENIX DIGITAL</Text>
            <Text style={styles.privacyText}>
              Fenix Digital is a technology company based in Miri, Sarawak, Malaysia, specializing in mobile applications and digital solutions for sports communities. We are passionate about connecting athletes and promoting sports participation across Malaysia.
            </Text>

            <Text style={styles.sectionTitle}>🎯 OUR MISSION</Text>
            <Text style={styles.privacyText}>
              To revolutionize the pickleball experience in Malaysia by providing a comprehensive platform that connects players, organizes tournaments, and builds a vibrant pickleball community nationwide.
            </Text>

            <Text style={styles.sectionTitle}>🏓 ABOUT PICKLEBALL</Text>
            <Text style={styles.privacyText}>
              Pickleball is one of the fastest-growing sports in the world, combining elements of tennis, badminton, and ping-pong. It's played on a court with a net, using paddles and a plastic ball with holes. The sport is accessible to players of all ages and skill levels.
            </Text>

            <Text style={styles.helpSubtitle}>Why Pickleball is Growing in Malaysia:</Text>
            <Text style={styles.bulletPoint}>• Easy to learn, fun to play</Text>
            <Text style={styles.bulletPoint}>• Lower impact than tennis, easier on joints</Text>
            <Text style={styles.bulletPoint}>• Great social sport for all ages</Text>
            <Text style={styles.bulletPoint}>• Growing community of enthusiastic players</Text>
            <Text style={styles.bulletPoint}>• Increasing number of courts and facilities</Text>

            <Text style={styles.sectionTitle}>📱 APP FEATURES</Text>
            
            <Text style={styles.helpSubtitle}>Tournament Discovery</Text>
            <Text style={styles.bulletPoint}>• Browse all tournaments across Malaysia</Text>
            <Text style={styles.bulletPoint}>• Filter by location, date, and skill level</Text>
            <Text style={styles.bulletPoint}>• Real-time tournament updates</Text>
            <Text style={styles.bulletPoint}>• Direct registration links</Text>

            <Text style={styles.helpSubtitle}>Player Management</Text>
            <Text style={styles.bulletPoint}>• Personal player profiles</Text>
            <Text style={styles.bulletPoint}>• Tournament history tracking</Text>
            <Text style={styles.bulletPoint}>• Skill level management</Text>
            <Text style={styles.bulletPoint}>• Contact information management</Text>

            <Text style={styles.helpSubtitle}>Communication Hub</Text>
            <Text style={styles.bulletPoint}>• System notifications and updates</Text>
            <Text style={styles.bulletPoint}>• Tournament announcements</Text>
            <Text style={styles.bulletPoint}>• Important community messages</Text>
            <Text style={styles.bulletPoint}>• QR code scanning for quick actions</Text>

            <Text style={styles.sectionTitle}>🤝 PARTNERSHIPS</Text>
            <Text style={styles.privacyText}>
              Pickle Zone is proudly connected with Malaysia Pickleball, the official governing body for pickleball in Malaysia. This partnership ensures that our app provides accurate, up-to-date tournament information and maintains the highest standards for the Malaysian pickleball community.
            </Text>

            <Text style={styles.sectionTitle}>🌟 APP STATISTICS</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>21+</Text>
                <Text style={styles.statLabel}>Active Tournaments</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>1000+</Text>
                <Text style={styles.statLabel}>Registered Players</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>13</Text>
                <Text style={styles.statLabel}>States Covered</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>🏆 ACHIEVEMENTS</Text>
            <Text style={styles.bulletPoint}>• Official partner with Malaysia Pickleball</Text>
            <Text style={styles.bulletPoint}>• Successfully launched tournament management system</Text>
            <Text style={styles.bulletPoint}>• Connected players across Malaysia</Text>
            <Text style={styles.bulletPoint}>• Streamlined tournament registration process</Text>
            <Text style={styles.bulletPoint}>• Built active pickleball community platform</Text>

            <Text style={styles.sectionTitle}>🔮 FUTURE UPDATES</Text>
            <Text style={styles.privacyText}>
              We're constantly working to improve Pickle Zone. Upcoming features include:
            </Text>
            <Text style={styles.bulletPoint}>• Enhanced player profiles with statistics</Text>
            <Text style={styles.bulletPoint}>• In-app tournament registration</Text>
            <Text style={styles.bulletPoint}>• Player matching and networking</Text>
            <Text style={styles.bulletPoint}>• Live tournament scoring</Text>
            <Text style={styles.bulletPoint}>• Court booking integration</Text>
            <Text style={styles.bulletPoint}>• Player rankings and leaderboards</Text>

            <Text style={styles.sectionTitle}>📞 CONTACT INFORMATION</Text>
            <Text style={styles.contactInfo}>
              🏢 Fenix Digital{'\n'}
              📧 Email: ariffin@fenixdigital.my{'\n'}
              📱 Phone: +6011-16197471{'\n'}
              📍 Address: Lot 1875, 1st floor, Marina Square Phase 2{'\n'}
              980000, Miri, Sarawak, Malaysia{'\n'}
              🌐 Malaysia Pickleball: www.malaysiapickleball.my
            </Text>

            <Text style={styles.sectionTitle}>⚖️ LEGAL INFORMATION</Text>
            <Text style={styles.privacyText}>
              © 2024 Fenix Digital. All rights reserved. Pickle Zone is a trademark of Fenix Digital. This app is developed in compliance with Malaysian laws and regulations, including the Personal Data Protection Act 2010 (PDPA).
            </Text>

            <Text style={styles.sectionTitle}>🙏 ACKNOWLEDGMENTS</Text>
            <Text style={styles.privacyText}>
              Special thanks to Malaysia Pickleball for their partnership and support, all tournament organizers across Malaysia, the growing pickleball community, and every player who makes this sport amazing.
            </Text>

            <Text style={styles.acknowledgment}>
              Thank you for being part of the Malaysian pickleball community! Together, we're growing the sport and building lasting connections through the love of pickleball. 🏓❤️
            </Text>

            <View style={styles.modalBottomSpacing} />
          </ScrollView>
        </View>
      </Modal>

      {/* Notifications Modal */}
      <Modal
        visible={showNotificationModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowNotificationModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Notifications</Text>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowNotificationModal(false)}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.privacyTitle}>NOTIFICATION SETTINGS</Text>
            <Text style={styles.privacySubtitle}>Customize how you receive updates from Pickle Zone</Text>
            
            <Text style={styles.sectionTitle}>📢 CONTENT PREFERENCES</Text>
            
            <View style={styles.notificationSection}>
              <View style={styles.notificationItem}>
                <View style={styles.notificationInfo}>
                  <Text style={styles.notificationLabel}>Tournament Updates</Text>
                  <Text style={styles.notificationDescription}>New tournaments, registrations, and schedules</Text>
                </View>
                <Switch
                  value={notificationSettings.tournaments}
                  onValueChange={() => toggleNotificationSetting('tournaments')}
                  trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
                  thumbColor={notificationSettings.tournaments ? '#ffffff' : '#f4f3f4'}
                />
              </View>

              <View style={styles.notificationItem}>
                <View style={styles.notificationInfo}>
                  <Text style={styles.notificationLabel}>System Updates</Text>
                  <Text style={styles.notificationDescription}>App updates, maintenance, and important changes</Text>
                </View>
                <Switch
                  value={notificationSettings.systemUpdates}
                  onValueChange={() => toggleNotificationSetting('systemUpdates')}
                  trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
                  thumbColor={notificationSettings.systemUpdates ? '#ffffff' : '#f4f3f4'}
                />
              </View>

              <View style={styles.notificationItem}>
                <View style={styles.notificationInfo}>
                  <Text style={styles.notificationLabel}>Announcements</Text>
                  <Text style={styles.notificationDescription}>General announcements from Malaysia Pickleball</Text>
                </View>
                <Switch
                  value={notificationSettings.announcements}
                  onValueChange={() => toggleNotificationSetting('announcements')}
                  trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
                  thumbColor={notificationSettings.announcements ? '#ffffff' : '#f4f3f4'}
                />
              </View>

              <View style={styles.notificationItem}>
                <View style={styles.notificationInfo}>
                  <Text style={styles.notificationLabel}>Registration Reminders</Text>
                  <Text style={styles.notificationDescription}>Reminders for tournament registration deadlines</Text>
                </View>
                <Switch
                  value={notificationSettings.registrationReminders}
                  onValueChange={() => toggleNotificationSetting('registrationReminders')}
                  trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
                  thumbColor={notificationSettings.registrationReminders ? '#ffffff' : '#f4f3f4'}
                />
              </View>

              <View style={styles.notificationItem}>
                <View style={styles.notificationInfo}>
                  <Text style={styles.notificationLabel}>Tournament Results</Text>
                  <Text style={styles.notificationDescription}>Match results, rankings, and tournament outcomes</Text>
                </View>
                <Switch
                  value={notificationSettings.tournamentResults}
                  onValueChange={() => toggleNotificationSetting('tournamentResults')}
                  trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
                  thumbColor={notificationSettings.tournamentResults ? '#ffffff' : '#f4f3f4'}
                />
              </View>
            </View>

            <Text style={styles.sectionTitle}>📱 DELIVERY METHODS</Text>
            
            <View style={styles.notificationSection}>
              <View style={styles.notificationItem}>
                <View style={styles.notificationInfo}>
                  <Text style={styles.notificationLabel}>Push Notifications</Text>
                  <Text style={styles.notificationDescription}>Instant notifications on your device</Text>
                </View>
                <Switch
                  value={notificationSettings.pushNotifications}
                  onValueChange={() => toggleNotificationSetting('pushNotifications')}
                  trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
                  thumbColor={notificationSettings.pushNotifications ? '#ffffff' : '#f4f3f4'}
                />
              </View>

              <View style={styles.notificationItem}>
                <View style={styles.notificationInfo}>
                  <Text style={styles.notificationLabel}>Email Notifications</Text>
                  <Text style={styles.notificationDescription}>Receive updates via email</Text>
                </View>
                <Switch
                  value={notificationSettings.emailNotifications}
                  onValueChange={() => toggleNotificationSetting('emailNotifications')}
                  trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
                  thumbColor={notificationSettings.emailNotifications ? '#ffffff' : '#f4f3f4'}
                />
              </View>

              <View style={styles.notificationItem}>
                <View style={styles.notificationInfo}>
                  <Text style={styles.notificationLabel}>SMS Notifications</Text>
                  <Text style={styles.notificationDescription}>Text messages for urgent updates</Text>
                </View>
                <Switch
                  value={notificationSettings.smsNotifications}
                  onValueChange={() => toggleNotificationSetting('smsNotifications')}
                  trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
                  thumbColor={notificationSettings.smsNotifications ? '#ffffff' : '#f4f3f4'}
                />
              </View>
            </View>

            <Text style={styles.acknowledgment}>
              Your notification preferences are saved automatically. You can change these settings anytime to customize your Pickle Zone experience.
            </Text>

            <View style={styles.modalBottomSpacing} />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'ios' ? 60 : 30,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: '#1a1a1a',
    fontSize: 20,
    fontWeight: '600',
  },
  headerButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  headerButtonText: {
    color: '#007AFF',
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
  // Privacy Policy Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#ffffff',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '500',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  privacyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  privacySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
    marginTop: 24,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  privacyText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
    marginBottom: 16,
    textAlign: 'justify',
  },
  bulletPoint: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
    marginBottom: 8,
    marginLeft: 16,
  },
  contactInfo: {
    fontSize: 15,
    lineHeight: 22,
    color: '#007AFF',
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  acknowledgment: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
    marginTop: 24,
    marginBottom: 16,
    fontWeight: '500',
    backgroundColor: '#e8f4f8',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    textAlign: 'justify',
  },
  modalBottomSpacing: {
    height: 40,
  },
  helpSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  // About Modal Styles
  aboutLogoContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    marginBottom: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginTop: 20,
  },
  aboutAppName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  aboutVersion: {
    fontSize: 18,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  aboutTagline: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingVertical: 20,
    marginVertical: 16,
  },
  statItem: {
    alignItems: 'center',
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
    textAlign: 'center',
    fontWeight: '500',
  },
  // Notification Modal Styles
  notificationSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginVertical: 16,
    paddingVertical: 8,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  notificationInfo: {
    flex: 1,
    marginRight: 16,
  },
  notificationLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
});

export default ProfileScreen;