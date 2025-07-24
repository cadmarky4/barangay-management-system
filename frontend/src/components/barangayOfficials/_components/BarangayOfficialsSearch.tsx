import { useTranslation } from "react-i18next";
import { FiSearch } from "react-icons/fi"

interface BarangayOfficialsSearchProps {
    searchTerm: string;
    onSearchChange: (term: string) => void;
}

export const BarangayOfficialsSearch: React.FC<BarangayOfficialsSearchProps> = ({ searchTerm, onSearchChange }) => {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                type="text"
                placeholder={t('barangayOfficials.search')}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200 transition-all"
                />
            </div>

            {/* Next time na lang iimplement itong filter :) */}
            {/* Filters */}
            {/* <div className="flex gap-4">
                <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200 transition-all"
                title="Filter officials"
                >
                    <option value="All Active Officials">All Active Officials</option>
                    <option value="Active Only">Active Only</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Inactive">Inactive</option>
                </select>

                <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition-all hover:shadow-sm">
                <FiFilter className="w-4 h-4" />
                <span>Advanced Filter</span>
                </button>
            </div> */}
        </div>
    )
}