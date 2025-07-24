// 1. React core
import { useState, useEffect } from "react";

// 2. Third-party libraries
import { useNavigate } from "react-router-dom";
import { FiSearch, FiEdit, FiUsers } from "react-icons/fi";

// 3. Internal/shared services
import { STORAGE_BASE_URL } from "@/services/__shared/_storage/storage.types";

// 4. Internal components
import Breadcrumb from "../_global/Breadcrumb";

// 5. Utils
import { getStatusBadgeColor } from './utils/getStatusBadgeColor';

export default function ListBarangayOfficalsToEdit() {
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoaded, setIsLoaded] = useState(false);

    const navigate = useNavigate();

    const [officials, setOfficials] = useState<any[]>([]);

    // Animation trigger on component mount
    useEffect(() => {
    const timer = setTimeout(() => {
        setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
    }, []);


    const filteredOfficials = officials.filter(official => {
        const matchesSearch = official?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          official?.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
          official.committee.toLowerCase().includes(searchTerm.toLowerCase());
    
        return matchesSearch;
      });

    return (
        <main className={`p-6 bg-gray-50 min-h-screen flex flex-col gap-4 transition-all duration-500 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {/* Breadcrumb */}
          <Breadcrumb isLoaded={isLoaded} />
  
          {/* Header */}
          <div className={`mb-2 transform transition-all duration-500 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ animationDelay: '100ms' }}>
            <h1 className="text-2xl font-bold text-darktext pl-0">Select Officer to Edit</h1>
            <p className="text-sm text-gray-600 mt-1">Choose which barangay official you want to update</p>
          </div>
  
          {/* Search Bar */}
          <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4 transform transition-all duration-500 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ animationDelay: '200ms' }}>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for an official to edit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200 transition-all"
              />
            </div>
          </div>
  
          {/* Officials Grid */}
          <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transform transition-all duration-500 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ animationDelay: '300ms' }}>
            <h3 className="text-lg font-semibold text-darktext mb-4 border-l-4 border-smblue-400 pl-4">
              Available Officials ({filteredOfficials.length})
            </h3>
  
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOfficials.map((official, index) => (
                <div
                  key={official.id}
                  onClick={() => navigate(`/officials/edit/${official.id}`)}
                  className={`border border-gray-200 rounded-lg p-4 hover:border-smblue-400 hover:shadow-md transition-all duration-200 cursor-pointer group transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                  style={{ animationDelay: `${400 + (index * 50)}ms` }}
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={official?.photo ? `${STORAGE_BASE_URL}/${official?.photo}` : 'https://via.placeholder.com/150'}
                      alt={official?.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 group-hover:text-smblue-400 transition-colors">
                        {official?.name}
                      </h4>
                      <p className="text-sm text-gray-600">{official?.position}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(official?.status)}`}>
                          {official?.status}
                        </span>
                        <span className="text-xs text-gray-500">{official.committee}</span>
                      </div>
                    </div>
                    <div className="text-gray-400 group-hover:text-smblue-400 transition-colors">
                      <FiEdit className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
  
            {filteredOfficials.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FiUsers className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No officials found matching your search.</p>
              </div>
            )}
          </div>
  
          {/* Back Button */}
          <div className={`flex justify-start transform transition-all duration-500 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ animationDelay: '500ms' }}>
            <button
              onClick={() => navigate('/officials')}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors hover:shadow-sm"
            >
              Back to Officials Page
            </button>
          </div>      </main>
      );
}