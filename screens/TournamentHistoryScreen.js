import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import pickleZoneAPI from '../services/pickleZoneAPI';

const TournamentHistoryScreen = ({ user, onNavigate }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [allTournaments, setAllTournaments] = useState([]);
  const [upcomingTournaments, setUpcomingTournaments] = useState([]);
  const [displayTournaments, setDisplayTournaments] = useState([]);

  useEffect(() => {
    loadTournaments();
  }, []);

  useEffect(() => {
    if (!loading) {
      updateDisplayTournaments();
    }
  }, [activeFilter, searchQuery, allTournaments, upcomingTournaments, loading]);

  const loadTournaments = async () => {
    try {
      setLoading(true);
      
      // Force refresh to get latest data from your API
      console.log('🏆 Loading tournaments for tournament page...');
      const allResult = await pickleZoneAPI.getTournaments(true);
      const upcomingResult = await pickleZoneAPI.getUpcomingTournaments(true);

      console.log('🏆 All tournaments result:', allResult);
      console.log('📅 Upcoming tournaments result:', upcomingResult);

      // Fix: Access .data instead of .tournaments
      const allTournamentsData = allResult.success && Array.isArray(allResult.data) ? allResult.data : [];
      const upcomingTournamentsData = upcomingResult.success && Array.isArray(upcomingResult.data) ? upcomingResult.data : [];

      // Filter out null/undefined tournaments and ensure they have IDs
      const cleanAllTournaments = allTournamentsData.filter(t => t && (t._id || t.id));
      const cleanUpcomingTournaments = upcomingTournamentsData.filter(t => t && (t._id || t.id));

      console.log('🏆 All tournaments count:', allTournamentsData.length, '→ cleaned:', cleanAllTournaments.length);
      console.log('📅 Upcoming tournaments count:', upcomingTournamentsData.length, '→ cleaned:', cleanUpcomingTournaments.length);

      setAllTournaments(cleanAllTournaments);
      setUpcomingTournaments(cleanUpcomingTournaments);

    } catch (error) {
      console.error('Error loading tournaments:', error);
      setAllTournaments([]);
      setUpcomingTournaments([]);
      Alert.alert('Error', 'Failed to load tournaments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTournaments();
    setRefreshing(false);
  };

  const updateDisplayTournaments = () => {
    // Ensure we have arrays
    const upcoming = Array.isArray(upcomingTournaments) ? upcomingTournaments : [];
    const all = Array.isArray(allTournaments) ? allTournaments : [];
    
    let tournaments = [];
    
    switch (activeFilter) {
      case 'upcoming':
        tournaments = [...upcoming];
        break;
      case 'all':
        // Combine and remove duplicates based on _id
        const combined = [...upcoming, ...all];
        
        const seen = new Set();
        tournaments = combined.filter(t => {
          if (!t) return false;
          
          const tournamentId = t._id || t.id;
          if (!tournamentId) return true; // Keep tournaments without IDs but they won't be deduplicated
          
          if (seen.has(tournamentId)) return false;
          seen.add(tournamentId);
          return true;
        });
        break;
      case 'open':
        // Combine and remove duplicates, then filter for open registration
        const combinedOpen = [...upcoming, ...all];
        const seenOpen = new Set();
        const uniqueOpen = combinedOpen.filter(t => {
          if (!t) return false;
          const tournamentId = t._id || t.id;
          if (!tournamentId) return true;
          if (seenOpen.has(tournamentId)) return false;
          seenOpen.add(tournamentId);
          return true;
        });
        tournaments = uniqueOpen.filter(t => t && t.registrationOpen === true);
        break;
      case 'closed':
        // Combine and remove duplicates, then filter for closed registration
        const combinedClosed = [...upcoming, ...all];
        const seenClosed = new Set();
        const uniqueClosed = combinedClosed.filter(t => {
          if (!t) return false;
          const tournamentId = t._id || t.id;
          if (!tournamentId) return true;
          if (seenClosed.has(tournamentId)) return false;
          seenClosed.add(tournamentId);
          return true;
        });
        tournaments = uniqueClosed.filter(t => t && t.registrationOpen === false);
        break;
      default:
        // Default to all with duplicates removed
        const defaultCombined = [...upcoming, ...all];
        const seenDefault = new Set();
        tournaments = defaultCombined.filter(t => {
          if (!t) return false;
          const tournamentId = t._id || t.id;
          if (!tournamentId) return true;
          if (seenDefault.has(tournamentId)) return false;
          seenDefault.add(tournamentId);
          return true;
        });
    }

    // Apply search filter
    if (searchQuery && searchQuery.trim()) {
      const searchTerm = searchQuery.toLowerCase();
      tournaments = tournaments.filter(tournament => {
        if (!tournament) return false;
        
        const name = (tournament.name || '').toLowerCase();
        const city = (tournament.city || '').toLowerCase();
        const organizer = (tournament.organizer || '').toLowerCase();
        const type = (tournament.typeDisplayName || '').toLowerCase();
        
        return name.includes(searchTerm) || 
               city.includes(searchTerm) || 
               organizer.includes(searchTerm) || 
               type.includes(searchTerm);
      });
    }

    setDisplayTournaments(tournaments);
  };

  const handleFilterPress = (filter) => {
    setActiveFilter(filter);
  };

  const handleTournamentPress = (tournament) => {
    if (!tournament) return;
    
    Alert.alert(
      tournament.name || 'Tournament',
      'Tournament Details:\n\n' +
      'Venue: ' + (tournament.venue || 'TBA') + '\n' +
      'City: ' + (tournament.city || 'TBA') + '\n' +
      'Organizer: ' + (tournament.organizer || 'TBA') + '\n' +
      'Contact: ' + (tournament.phoneNumber || 'TBA') + '\n' +
      'Type: ' + (tournament.typeDisplayName || tournament.type || 'TBA') + '\n' +
      'Registration: ' + (tournament.registrationOpen ? 'Open' : 'Closed') + '\n' +
      'Status: ' + (tournament.status || 'TBA'),
      [
        { text: 'Close', style: 'cancel' },
        { 
          text: tournament.registrationOpen ? 'Register' : 'View Details', 
          onPress: () => {
            Alert.alert('Coming Soon', 'Tournament registration will be available soon!');
          }
        }
      ]
    );
  };

  const getStatusColor = (tournament) => {
    if (!tournament) return { backgroundColor: '#f8f9fa', textColor: '#6c757d' };
    
    if (tournament.registrationOpen) {
      return { backgroundColor: '#e8f5e8', textColor: '#4a9b4a' };
    } else if (tournament.status === 'upcoming') {
      return { backgroundColor: '#fff3cd', textColor: '#856404' };
    } else if (tournament.status === 'draft') {
      return { backgroundColor: '#f8f9fa', textColor: '#6c757d' };
    } else {
      return { backgroundColor: '#f8d7da', textColor: '#721c24' };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'TBA';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-MY', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });
    } catch (error) {
      return 'TBA';
    }
  };

  const getTypeIcon = (type) => {
    if (type === 'wmalaysia') return '🏆';
    if (type === 'sarawak') return '💜';
    if (type === 'sabah') return '🌟';
    return '🏓';
  };

  const renderTournamentCard = (tournament, index) => {
    if (!tournament) return null;
    
    const statusColors = getStatusColor(tournament);
    const typeIcon = getTypeIcon(tournament.type);

    return (
      <TouchableOpacity 
        key={`${activeFilter}-${tournament._id || tournament.id || index}`}
        style={styles.tournamentCard}
        onPress={() => handleTournamentPress(tournament)}
        activeOpacity={0.7}
      >
        <View style={styles.tournamentHeader}>
          <View style={styles.tournamentInfo}>
            <View style={styles.tournamentTitleRow}>
              <Text style={styles.typeIcon}>{typeIcon}</Text>
              <Text style={styles.tournamentName} numberOfLines={2}>
                {tournament.name || 'Unnamed Tournament'}
              </Text>
            </View>
            <Text style={styles.tournamentType}>
              {tournament.typeDisplayName || tournament.type || 'Tournament'}
            </Text>
            <Text style={styles.tournamentDate}>
              {tournament.startDate && tournament.endDate 
                ? formatDate(tournament.startDate) + ' - ' + formatDate(tournament.endDate)
                : tournament.startDate 
                  ? 'Starts: ' + formatDate(tournament.startDate)
                  : 'Date TBA'
              }
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColors.backgroundColor }]}>
            <Text style={[styles.statusText, { color: statusColors.textColor }]}>
              {tournament.registrationOpen ? 'Open' : tournament.status || 'Closed'}
            </Text>
          </View>
        </View>

        <View style={styles.tournamentDetails}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>📍 Venue</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
              {tournament.venue || 'TBA'}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>🏙️ City</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
              {tournament.city || 'TBA'}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>👤 Organizer</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
              {tournament.organizer || 'TBA'}
            </Text>
          </View>
        </View>

        {tournament.phoneNumber && (
          <View style={styles.contactInfo}>
            <Text style={styles.contactLabel}>📞 Contact: </Text>
            <Text style={styles.contactValue}>{tournament.phoneNumber}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Safe counting functions with duplicate removal
  const getTotalCount = () => {
    const upcoming = Array.isArray(upcomingTournaments) ? upcomingTournaments : [];
    const all = Array.isArray(allTournaments) ? allTournaments : [];
    
    // Combine and remove duplicates using the same logic as display
    const combined = [...upcoming, ...all];
    const seen = new Set();
    const unique = combined.filter(t => {
      if (!t) return false;
      const tournamentId = t._id || t.id;
      if (!tournamentId) return true;
      if (seen.has(tournamentId)) return false;
      seen.add(tournamentId);
      return true;
    });
    
    return unique.length;
  };

  const getOpenCount = () => {
    const upcoming = Array.isArray(upcomingTournaments) ? upcomingTournaments : [];
    const all = Array.isArray(allTournaments) ? allTournaments : [];
    
    // Combine and remove duplicates using the same logic as display
    const combined = [...upcoming, ...all];
    const seen = new Set();
    const unique = combined.filter(t => {
      if (!t) return false;
      const tournamentId = t._id || t.id;
      if (!tournamentId) return true;
      if (seen.has(tournamentId)) return false;
      seen.add(tournamentId);
      return true;
    });
    
    return unique.filter(t => t && t.registrationOpen).length;
  };

  const getUpcomingCount = () => {
    return Array.isArray(upcomingTournaments) ? upcomingTournaments.length : 0;
  };

  const getAllCount = () => {
    return Array.isArray(allTournaments) ? allTournaments.length : 0;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Tournaments</Text>
          <Text style={styles.headerSubtitleText}>
            {displayTournaments.length} tournament{displayTournaments.length !== 1 ? 's' : ''} available
          </Text>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search tournaments..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
              >
                <Text style={styles.clearButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Statistics Summary */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Tournament Overview</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{getTotalCount()}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{getUpcomingCount()}</Text>
              <Text style={styles.statLabel}>Upcoming</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{getOpenCount()}</Text>
              <Text style={styles.statLabel}>Open</Text>
            </View>
          </View>
        </View>

        {/* Filter Options */}
        <View style={styles.filtersSection}>
          <Text style={styles.sectionTitle}>Filter Tournaments</Text>
          <View style={styles.filterButtons}>
            <TouchableOpacity 
              style={[styles.filterButton, activeFilter === 'all' && styles.activeFilter]}
              onPress={() => handleFilterPress('all')}
            >
              <Text style={[styles.filterText, activeFilter === 'all' && styles.activeFilterText]}>
                All ({getTotalCount()})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterButton, activeFilter === 'upcoming' && styles.activeFilter]}
              onPress={() => handleFilterPress('upcoming')}
            >
              <Text style={[styles.filterText, activeFilter === 'upcoming' && styles.activeFilterText]}>
                Upcoming ({getUpcomingCount()})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterButton, activeFilter === 'open' && styles.activeFilter]}
              onPress={() => handleFilterPress('open')}
            >
              <Text style={[styles.filterText, activeFilter === 'open' && styles.activeFilterText]}>
                Open Registration
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterButton, activeFilter === 'closed' && styles.activeFilter]}
              onPress={() => handleFilterPress('closed')}
            >
              <Text style={[styles.filterText, activeFilter === 'closed' && styles.activeFilterText]}>
                Closed
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tournament List */}
        <View style={styles.tournamentsSection}>
          <Text style={styles.sectionTitle}>
            {activeFilter === 'all' ? 'All Tournaments' : 
             activeFilter === 'upcoming' ? 'Upcoming Tournaments' :
             activeFilter === 'open' ? 'Open for Registration' : 'Closed Registration'}
            {searchQuery && ' matching "' + searchQuery + '"'}
          </Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Loading tournaments...</Text>
            </View>
          ) : displayTournaments.length > 0 ? (
            displayTournaments.map((tournament, index) => renderTournamentCard(tournament, index))
          ) : (
            <View style={styles.emptyStateCard}>
              <Text style={styles.emptyStateIcon}>🏆</Text>
              <Text style={styles.emptyStateTitle}>
                {searchQuery ? 'No Tournaments Found' : 'No Tournaments Available'}
              </Text>
              <Text style={styles.emptyStateText}>
                {searchQuery 
                  ? 'No tournaments match your search "' + searchQuery + '". Try a different search term.'
                  : 'No tournaments are currently available. Check back later for new tournaments!'
                }
              </Text>
              {searchQuery && (
                <TouchableOpacity 
                  style={styles.exploreButton}
                  onPress={() => setSearchQuery('')}
                >
                  <Text style={styles.exploreButtonText}>Clear Search</Text>
                </TouchableOpacity>
              )}
            </View>
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
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: '#1a1a1a',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitleText: {
    color: '#666',
    fontSize: 16,
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#666',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#999',
  },
  statsSection: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
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
  filtersSection: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginRight: 8,
    marginBottom: 8,
  },
  activeFilter: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeFilterText: {
    color: '#fff',
  },
  tournamentsSection: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  tournamentCard: {
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
  tournamentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tournamentInfo: {
    flex: 1,
    marginRight: 12,
  },
  tournamentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  typeIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  tournamentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  tournamentType: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
    marginBottom: 2,
  },
  tournamentDate: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  tournamentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailItem: {
    flex: 1,
    marginRight: 8,
  },
  detailLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 13,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  contactLabel: {
    fontSize: 12,
    color: '#666',
  },
  contactValue: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  emptyStateCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    marginBottom: 20,
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
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 40,
  },
});

export default TournamentHistoryScreen; 