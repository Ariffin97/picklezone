import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';

const InboxScreen = () => {
  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search messages..."
          placeholderTextColor="#999"
        />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Message Categories */}
          <View style={styles.categoriesContainer}>
            <TouchableOpacity style={[styles.categoryButton, styles.activeCategory]}>
              <Text style={[styles.categoryText, styles.activeCategoryText]}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryButton}>
              <Text style={styles.categoryText}>Tournaments</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryButton}>
              <Text style={styles.categoryText}>System</Text>
            </TouchableOpacity>
          </View>

          {/* Messages List */}
          <View style={styles.messagesList}>
            <Text style={styles.sectionTitle}>Messages</Text>
            
            {/* Sample Message Items - Empty for now */}
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>No Messages Yet</Text>
              <Text style={styles.emptyStateText}>
                You'll receive tournament updates, notifications, and messages here
              </Text>
            </View>

            {/* Placeholder for future messages */}
            <View style={styles.messagePlaceholder}>
              <View style={styles.messageItem}>
                <View style={styles.messageHeader}>
                  <Text style={styles.messageTitle}>Tournament Notification</Text>
                  <Text style={styles.messageTime}>Soon</Text>
                </View>
                <Text style={styles.messagePreview}>
                  Tournament updates and notifications will appear here
                </Text>
                <View style={styles.messageStatus}>
                  <Text style={styles.messageStatusText}>Ready for messages</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  categoriesContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
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
  messagesList: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  messagePlaceholder: {
    marginTop: 20,
  },
  messageItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  messageTime: {
    fontSize: 12,
    color: '#999',
  },
  messagePreview: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
    marginBottom: 8,
  },
  messageStatus: {
    alignSelf: 'flex-start',
  },
  messageStatusText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
});

export default InboxScreen; 