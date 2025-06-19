// Export all services from a single entry point
export { pickleZoneAPI } from './pickleZoneAPI';
export { cacheService } from './cacheService';
export { default as authService } from './authService';
export { default as gameService } from './gameService';
export { default as api } from './api';

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