import type { BarangayOfficial } from "@/services/officials/barangayOfficials.types"
import { buildImageUrl, getPlaceholderImageUrl } from "@/utils/imageUtils";

interface OrganizationalChartProps {
  captain?: BarangayOfficial;
  secretary?: BarangayOfficial;
  councilors?: BarangayOfficial[];
  isLoaded: boolean;
}

export const OrganizationalChart: React.FC<OrganizationalChartProps> = ({
  captain,
  secretary,
  councilors,
  isLoaded,
}) => {
    return (
      <section className={`bg-white rounded-2xl shadow-sm border border-gray-100 transform transition-all duration-500 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ animationDelay: '600ms' }}>
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-darktext border-l-4 border-smblue-400 pl-4">Organizational Chart</h3>
        </div>
        <div className="p-8">
          {/* Barangay Captain */}
          {captain && (
            <div className={`flex flex-col items-center mb-8 transform transition-all duration-500 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ animationDelay: '650ms' }}>
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center mb-3">
                  <img
                    src={buildImageUrl(captain?.profile_photo_url || null)}
                    alt={`${captain?.first_name} ${captain?.last_name}`}
                    className="w-24 h-24 rounded-full object-cover"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = getPlaceholderImageUrl(96, 'No Photo');
                    }}
                  />
                </div>
                <h3 className="font-semibold text-gray-900">{`${captain?.first_name} ${captain?.last_name}`}</h3>
                <p className="text-sm text-gray-600">{captain?.position}</p>
              </div>

              {/* Connection Line */}
              <div className="w-px h-8 bg-gray-300 mt-4"></div>
              <div className="w-full h-px bg-gray-300"></div>
            </div>
          )}

          {/* Secretary (if exists) */}
          {secretary && (
            <div className="flex flex-col items-center mb-8">
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center mb-3">
                  <img
                    src={buildImageUrl(secretary?.profile_photo_url || null)}
                    alt={`${secretary?.first_name} ${secretary?.last_name}`}
                    className="w-20 h-20 rounded-full object-cover"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = getPlaceholderImageUrl(80, 'No Photo');
                    }}
                  />
                </div>
                <h3 className="font-medium text-gray-900">{`${secretary?.first_name} ${secretary?.last_name}`}</h3>
                <p className="text-sm text-gray-600">{secretary?.position}</p>
              </div>

              {/* Connection Line to Kagawads */}
              <div className="w-px h-8 bg-gray-300 mt-4"></div>
              <div className="w-full h-px bg-gray-300"></div>
            </div>
          )}

          {/* Kagawads */}
          <div className="grid grid-cols-4 lg:grid-cols-8 gap-6">
            {councilors?.map((councilor, index) => (
              <div key={index} className={`flex flex-col items-center transform transition-all duration-500 ${isLoaded ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-95'}`} style={{ animationDelay: `${700 + (index * 100)}ms` }}>
                <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center mb-3">
                  <img
                    src={buildImageUrl(councilor?.profile_photo_url || null)}
                    alt={`${councilor?.first_name} ${councilor?.last_name}`}
                    className="w-20 h-20 rounded-full object-cover"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = getPlaceholderImageUrl(80, 'No Photo');
                    }}
                  />
                </div>
                <h4 className="text-sm font-medium text-gray-900 text-center">{`${councilor?.first_name} ${councilor?.last_name}`}</h4>
                <p className="text-xs text-gray-600 text-center">{councilor?.position}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
}