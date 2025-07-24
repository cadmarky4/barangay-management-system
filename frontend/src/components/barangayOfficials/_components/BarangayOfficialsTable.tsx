import type { BarangayOfficial } from "@/services/officials/barangayOfficials.types"
import { FiUsers } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { BarangayOfficialsTableRow } from "./BarangayOfficialsTableRow";

interface BarangayOfficialsTableProps {
    filteredOfficials: BarangayOfficial[],
    isLoading: boolean,
    searchTerm: string;
    deletingId: string | null;
    onView: (official: BarangayOfficial) => void;
    onEdit: (official: BarangayOfficial) => void;
    onDelete: (official: BarangayOfficial) => void;
}

export const BarangayOfficialsTable: React.FC<BarangayOfficialsTableProps> = ({ filteredOfficials, isLoading, searchTerm, deletingId, onDelete, onEdit, onView }) => {
    const { t } = useTranslation();
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('barangayOfficials.table.headers.official')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('barangayOfficials.table.headers.position')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('barangayOfficials.table.headers.contact')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('barangayOfficials.table.headers.term')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('barangayOfficials.table.headers.status')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('barangayOfficials.table.headers.committee')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('barangayOfficials.table.headers.actions')}</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                // Loading skeleton rows
                Array(5).fill(0).map((_, index) => (
                    <tr key={`loading-${index}`} className="animate-pulse">
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <div className="ml-4">
                            <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                            <div className="h-3 bg-gray-200 rounded w-24"></div>
                        </div>
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-28"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                        <div className="w-8 h-8 bg-gray-200 rounded"></div>
                        <div className="w-8 h-8 bg-gray-200 rounded"></div>
                        </div>
                    </td>
                    </tr>
                ))
                ) : filteredOfficials.length === 0 ? (
                <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        <FiUsers className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>{searchTerm
                            ? t('barangayOfficials.table.noResultsSearch', { searchTerm })
                            : t('barangayOfficials.table.noResults')
                            }
                        </p>
                    </td>
                </tr>
                ) : (
                filteredOfficials.map((official) => (
                    <BarangayOfficialsTableRow
                        key={official.id}
                        official={official}
                        onView={onView}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        isDeleting={deletingId === official.id}
                    />
                ))
                )}
            </tbody>
            </table>
        </div>
    )
}