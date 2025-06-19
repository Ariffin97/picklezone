// Export all services from a single entry point
export { apiClient, API_CONFIG, STORAGE_KEYS } from './api';
export { pickleZoneAPI } from './pickleZoneAPI';
export { gameService } from './gameService';

// Re-export commonly used functions for convenience
export const {
  login,
  getTournaments,
  getPlayerProfile,
  checkICNumber,
  healthCheck,
} = pickleZoneAPI;

export const {
  getTournamentDetails,
  registerForTournament,
  getRankings,
  getMessages,
  markMessageAsRead,
  sendMessage,
  getDashboardStats,
  searchPlayers,
  getTournamentHistory,
} = gameService;