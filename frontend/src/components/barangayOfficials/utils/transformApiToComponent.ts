import type { BarangayOfficial } from '../../../services/barangayOfficials.types';

// Transform API data to component format
export const transformApiToComponent = (official: BarangayOfficial) => ({
    id: official.id,
    name: `${official.last_name}, ${official.first_name}${official.middle_name ? ' ' + official.middle_name : ''}`,
    position: official?.position === 'BARANGAY_CAPTAIN' ? 'Barangay Captain' :
      official?.position === 'KAGAWAD' ? 'Kagawad' :
        official?.position === 'BARANGAY_SECRETARY' ? 'Secretary' :
          official?.position,
    contact: official?.contact_number,
    term: `${new Date(official.term_start).getFullYear()} - ${new Date(official.term_end).getFullYear()}`,
    status: official?.status === 'ACTIVE' ? 'Active' :
      official?.status === 'INACTIVE' ? 'Inactive' :
        official?.status,
    committee: official.committee_assignment || 'None',
    nationality: 'Filipino', // Default since not in API
    photo: official.profile_photo || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80'
  });