import React, { useState, useEffect } from 'react';
import { DashboardService, type BarangayOfficial } from '../../services/dashboard/dashboard.service';
import { STORAGE_BASE_URL } from '@/services/__shared/_storage/storage.types';
import { Link } from 'react-router-dom';

const BarangayOfficials: React.FC = () => {
  const [officials, setOfficials] = useState<BarangayOfficial[]>([]);
  const [loading, setLoading] = useState(true);
  const [dashboardService] = useState(new DashboardService());
  // Separate captain and councilors
  const captain = officials.find(official => official.position.toLowerCase().includes('captain'));
  const councilors = officials.filter(official => !official.position.toLowerCase().includes('captain'));

  // Static fallback data
  const staticOfficials: BarangayOfficial[] = [
    {
      id: 1,
      name: 'Juan D. Cruz',
      position: 'Barangay Captain',
      email: 'juan.cruz@barangay.gov.ph',
      contact: '(02) 8123-4567',
      photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80'
    },
    {
      id: 2,
      name: 'Maria L. Santos',
      position: 'Barangay Councilor',
      email: 'maria.santos@barangay.gov.ph',
      contact: '(02) 8123-4568',
      photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80'
    },
    {
      id: 3,
      name: 'Jose M. Reyes',
      position: 'Barangay Councilor',
      email: 'jose.reyes@barangay.gov.ph',
      contact: '(02) 8123-4569',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80'
    },
    {
      id: 4,
      name: 'Anna K. Dela Cruz',
      position: 'Barangay Councilor',
      email: 'anna.delacruz@barangay.gov.ph',
      contact: '(02) 8123-4570',
      photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80'
    },
    {
      id: 5,
      name: 'Carlos B. Mendoza',
      position: 'Barangay Councilor',
      email: 'carlos.mendoza@barangay.gov.ph',
      contact: '(02) 8123-4571',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80'
    },
    {
      id: 6,
      name: 'Liza T. Navarro',
      position: 'Barangay Councilor',
      email: 'liza.navarro@barangay.gov.ph',
      contact: '(02) 8123-4572',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80'
    }];

  // Helper function to format position titles for display
  const formatPosition = (position: string): string => {
    return position
      .replace('_', ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase())
      .replace('Barangay Captain', 'Barangay Captain')
      .replace('Barangay Secretary', 'Barangay Secretary')
      .replace('Kagawad', 'Barangay Councilor');
  };

  useEffect(() => {
    const fetchOfficials = async () => {
      try {
        setLoading(true);
        const response = await dashboardService.getBarangayOfficials();

        if (response.data && Array.isArray(response.data)) {
          // Format the officials data for display
          const formattedOfficials = response.data.map(official => ({
            ...official,
            position: formatPosition(official.position),
            email: official.email === 'N/A' ? 'Not provided' : official.email
          }));
          setOfficials(formattedOfficials);
        } else {
          // Fallback to static data if API returns unexpected format
          setOfficials(staticOfficials);
        }
      } catch (error) {
        console.log('Barangay officials API not available, using static data');
        // Fallback to static data if API fails
        setOfficials(staticOfficials);
      } finally {
        setLoading(false);
      }
    };

    fetchOfficials();
  }, [dashboardService]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-darktext mb-6 border-l-4 border-smblue-400 pl-4">
          Barangay Officials
        </h3>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-smblue-400"></div>
          <span className="ml-2 text-gray-600">Loading officials...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-darktext mb-6 border-l-4 border-smblue-400 pl-4">
        Barangay Officials
      </h3>

      {(!captain && councilors.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-8">
          <p className="text-gray-600 mb-4">No barangay officials yet</p>
          <Link
            to="/officials"
            className="inline-block px-4 py-2 bg-gray-500 text-white rounded hover:bg-smblue-600 transition"
          >
            Go to Barangay Officials Page
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Barangay Captain Section */}
          {captain && (
            <div>
              <h4 className="text-md font-medium text-gray-800 mb-3">Barangay Captain</h4>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <img
                  src={captain.photo ? `${STORAGE_BASE_URL}/${captain.photo}` : 'https://via.placeholder.com/150'}
                  alt={captain.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900">{captain.name}</h5>
                  <p className="text-sm text-gray-600">Email: {captain.email}</p>
                  <p className="text-sm text-gray-600">Contact No.: {captain.contact}</p>
                </div>
              </div>
            </div>
          )}

          {/* Barangay Councilors Section */}
          {councilors.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-gray-800 mb-3">Barangay Councilors</h4>
              <div className="space-y-3">
                {councilors.map((official) => (
                  <div key={official.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <img
                      src={official.photo ? `${STORAGE_BASE_URL}/${official.photo}` : 'https://via.placeholder.com/150'}
                      alt={official.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">{official.name}</h5>
                      <p className="text-sm text-gray-600">Email: {official.email}</p>
                      <p className="text-sm text-gray-600">Contact No.: {official.contact}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BarangayOfficials;

