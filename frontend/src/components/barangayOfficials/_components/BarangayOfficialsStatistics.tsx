import { useBarangayOfficialStatistics } from "@/services/officials/useBarangayOfficials";
import { useTranslation } from "react-i18next";
import { FiUsers } from "react-icons/fi";

interface BarangayOfficialsStatisticsProps {
    isLoaded: boolean;
  }

export const BarangayOfficialsStatistics: React.FC<BarangayOfficialsStatisticsProps> = ({ isLoaded }) => {
    const { t } = useTranslation();
    const { data: officials, isLoading, error } = useBarangayOfficialStatistics();

    return (
        <div className={`lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm transform transition-all duration-500 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ animationDelay: '200ms' }}>
          <h3 className="text-lg font-semibold text-darktext mb-6 border-l-4 border-smblue-400 pl-4">{t('barangayOfficials.statistics.title')}</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className={`bg-white rounded-lg p-6 border border-gray-100 shadow-sm transform transition-all duration-500 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ animationDelay: '250ms' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{t('barangayOfficials.statistics.totalOfficials')}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoading ? '...' : error ? 'Error loading data' : `${officials?.total_officials || 0}`}
                  </p>
                </div>
                <div className="text-smblue-400">
                  <FiUsers className="w-8 h-8" />
                </div>
              </div>
            </div>

            <div className={`bg-white rounded-lg p-6 border border-gray-100 shadow-sm transform transition-all duration-500 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ animationDelay: '300ms' }}>
              <div className="flex items-center justify-between">
                {/* TODO: Implement upcoming elections tracking in backend statistics */}
                <div>
                  <p className="text-sm text-gray-600 mb-1">{t('barangayOfficials.statistics.upcomingElections')}</p>
                  <p className="text-2xl font-bold text-gray-900">To be announced</p>
                </div>
                <div className="text-smblue-400">
                  <FiUsers className="w-8 h-8" />
                </div>
              </div>
            </div>
          </div>
        </div>
    )
}