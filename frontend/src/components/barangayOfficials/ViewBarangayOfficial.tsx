import Breadcrumb from "../_global/Breadcrumb";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { STORAGE_BASE_URL } from "@/services/__shared/_storage/storage.types";
import { getStatusBadgeColor } from "./utils/getStatusBadgeColor";
import { FiEdit } from "react-icons/fi";
import { barangayOfficialsService } from '@/services/officials/barangayOfficials.service';


export default function ViewBarangayOfficial() {
    const [isLoaded, setIsLoaded] = useState(false);
    const { id } = useParams<{ id: string }>();
    const [official, setOfficial] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    // Animation trigger on component mount
    useEffect(() => {
    const timer = setTimeout(() => {
        setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
    }, []);

    // load officials
    useEffect(() => {
        const loadOfficial = async () => {
        // NO ID
        if (!id) {
            console.error('No official ID provided');
            setError('Official ID not provided');
            // setIsLoading(false);
            return;
        }
        try {
            console.log('Loading official with ID:', id);
            // setIsLoading(true);
            setError(null);
    
            // Validate ID is a valid number
            const officialId = id;
            if (!officialId) {
            console.error('Invalid official ID:', id);
            setError('Invalid official ID');
            // setIsLoading(false);
            return;
            }
    
            // Use the getResident method to fetch resident data
            console.log('Fetching official data from API...');
            const officialData = await barangayOfficialsService.getBarangayOfficial(officialId);
            console.log('Official data received:', officialData);
    
            if (!officialData) {
            console.error('No official data received');
            setError('Official not found');
            // setIsLoading(false);
            return;
            }
            setOfficial(officialData);
        } catch (error: any) {
            console.error('Failed to load resident:', error);
    
            // Check if it's a 404 error (resident not found)
            if (error.message?.includes('404') || error.message?.includes('not found')) {
            setError('Resident not found');
            } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
            setError('Unable to connect to server. Please check your connection.');
            } else {
            setError('Failed to load resident data. Please try again.');
            }
        } finally {
            // setIsLoading(false);
        }
        };
    
        loadOfficial();
        console.log("I LIKE PIZZAS");
    }, [id]);

    return (
        <main className={`p-6 bg-gray-50 min-h-screen flex flex-col gap-4 transition-all duration-500 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {/* Breadcrumb */}
          <Breadcrumb isLoaded={isLoaded} />

        {/* Error Display */}
        {error && (
            <div className={`bg-red-50 border border-red-200 rounded-lg p-4 mb-4 transform transition-all duration-500 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ animationDelay: '150ms' }}>
            <p className="text-red-800 text-sm">{error}</p>
            </div>
        )}
  
          {/* Header */}
          <div className={`mb-2 transform transition-all duration-500 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ animationDelay: '100ms' }}>
            <h1 className="text-2xl font-bold text-darktext pl-0">Official Details</h1>
            <p className="text-sm text-gray-600 mt-1">
              Detailed information about {official?.name}
            </p>
          </div>
  
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Profile Photo */}
              <div className="lg:w-1/3">
                <div className="flex flex-col items-center">
                  <div className="w-48 h-48 bg-gray-300 rounded-full flex items-center justify-center mb-4">
                    <img
                      src={official?.profile_photo ? `${STORAGE_BASE_URL}/${official?.photo}` : 'https://via.placeholder.com/150'}
                      alt={official?.name}
                      className="w-48 h-48 rounded-full object-cover"
                    />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 text-center">{official?.name}</h2>
                  <p className="text-lg text-gray-600 text-center">{official?.position}</p>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full mt-2 ${getStatusBadgeColor(official?.status)}`}>
                    {official?.status}
                  </span>
                </div>
              </div>
  
              {/* Details */}
              <div className="lg:w-2/3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Contact Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                        <p className="text-sm text-gray-900">{official?.contact}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Nationality</label>
                        <p className="text-sm text-gray-900">{official?.nationality}</p>
                      </div>
                    </div>
                  </div>
  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Position Details</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Committee Assignment</label>
                        <p className="text-sm text-gray-900">{official?.committee}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Term</label>
                        <p className="text-sm text-gray-900">{official?.term}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
  
            {/* Actions */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-8">
              <button
                onClick={() => navigate('/officials')}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <div className="flex space-x-4">
                <button
                  onClick={() => navigate(`/officials/${official.id}`)}
                  className="px-6 py-2 bg-smblue-400 text-white rounded-lg hover:bg-smblue-300 transition-colors flex items-center space-x-2"
                >
                  <FiEdit className="w-4 h-4" />
                  <span>Edit Official</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      );
}