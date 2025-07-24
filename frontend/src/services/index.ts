import { AuthService } from './__shared/_auth/auth.service';
import { residentsService, ResidentsService } from './residents/residents.service';
import { householdsService, HouseholdsService } from './households/households.service';
import { DocumentsService } from './documents/documents.service';
import { UsersService } from './users/users.service';
import { ComplaintService } from './helpDesk/complaints/complaints.service';
import { SuggestionService } from './helpDesk/suggestions/suggestions.service';
import { BlotterService } from './helpDesk/blotters/blotters.service';
import { AppointmentsService } from './helpDesk/appointments/appointments.service';
import { barangayOfficialsService, BarangayOfficialsService } from './officials/barangayOfficials.service';
import { settingsService, SettingsService } from './settings/settings.service';

// Create singleton instances
export const authService = new AuthService();
// export const residentsService = new ResidentsService();
// export const householdsService = new HouseholdsService();
// export const documentsService = new DocumentsService();
// export const usersService = new UsersService();
// export const complaintsService = new ComplaintsService();
// export const suggestionsService = new SuggestionsService();
// export const blotterService = new BlotterService();
// export const appointmentsService = new AppointmentsService();
// export const barangayOfficialsService = new BarangayOfficialsService();

// Export service classes for direct instantiation
export {
  AuthService,
  ResidentsService,
  HouseholdsService,
  DocumentsService,
  UsersService,
  ComplaintService,
  SuggestionService,
  BlotterService,
  AppointmentsService,
  BarangayOfficialsService,
  SettingsService
};

// Export all services as a single object for backward compatibility
export const apiService = {
  // Auth
  login: authService.login.bind(authService),
  logout: authService.logout.bind(authService),
  getCurrentUser: authService.getCurrentUser.bind(authService),
  
  // Residents
  getResidents: residentsService.getResidents.bind(residentsService),
  createResident: residentsService.createResident.bind(residentsService),
  updateResident: residentsService.updateResident.bind(residentsService),
  deleteResident: residentsService.deleteResident.bind(residentsService),
  getResidentStatistics: residentsService.getStatistics.bind(residentsService),
  checkDuplicateResident: residentsService.checkDuplicate.bind(residentsService),
    // Households
  getHouseholds: householdsService.getHouseholds.bind(householdsService),
  createHousehold: householdsService.createHousehold.bind(householdsService),
  updateHousehold: householdsService.updateHousehold.bind(householdsService),
  deleteHousehold: householdsService.deleteHousehold.bind(householdsService),
  getHouseholdStatistics: householdsService.getStatistics.bind(householdsService),
  
  // Barangay Officials
  getBarangayOfficials: barangayOfficialsService.getBarangayOfficials.bind(barangayOfficialsService),
  createBarangayOfficial: barangayOfficialsService.createBarangayOfficial.bind(barangayOfficialsService),
  updateBarangayOfficial: barangayOfficialsService.updateBarangayOfficial.bind(barangayOfficialsService),
  deleteBarangayOfficial: barangayOfficialsService.deleteBarangayOfficial.bind(barangayOfficialsService),
  getBarangayOfficialStatistics: barangayOfficialsService.getStatistics.bind(barangayOfficialsService),
  
  // Settings
  getSettings: settingsService.getSettings.bind(settingsService),
  updateSettings: settingsService.updateSettings.bind(settingsService),
  resetSettings: settingsService.resetSettings.bind(settingsService),
  validateSettings: settingsService.validateSettings.bind(settingsService),
  updateGeneralSettings: settingsService.updateGeneralSettings.bind(settingsService),
  updatePrivacySettings: settingsService.updatePrivacySettings.bind(settingsService),
  updateSystemSettings: settingsService.updateSystemSettings.bind(settingsService),
  getSettingsSection: settingsService.getSettingsSection.bind(settingsService),
  isDefaultSettings: settingsService.isDefaultSettings.bind(settingsService),
  backupSettings: settingsService.backupSettings.bind(settingsService),
  testSettings: settingsService.testSettings.bind(settingsService),
};

export default apiService;

