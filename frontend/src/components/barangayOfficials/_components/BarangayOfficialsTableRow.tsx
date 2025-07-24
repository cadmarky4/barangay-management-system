import type { BarangayOfficial } from "@/services/officials/barangayOfficials.types"
import { buildImageUrl, getPlaceholderImageUrl } from "@/utils/imageUtils";
import { getStatusBadgeColor } from "../utils/getStatusBadgeColor";
import { FiEdit, FiEye, FiTrash2 } from "react-icons/fi";
import { useTranslation } from "react-i18next";

interface BarangayOfficialsTableRowProps {
    official: BarangayOfficial;
    onView: (resident: BarangayOfficial) => void;
    onEdit: (resident: BarangayOfficial) => void;
    onDelete: (resident: BarangayOfficial) => void;
    isDeleting: boolean;
}

export const BarangayOfficialsTableRow: React.FC<BarangayOfficialsTableRowProps> = ({
    official,
    onView,
    onEdit,
    onDelete,
    isDeleting
}) => {
    const { t } = useTranslation();
    console.log(official);

    return (
        <tr key={official.id} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                    <img
                        src={buildImageUrl(official?.profile_photo_url || null)}
                        alt={official?.first_name}
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = getPlaceholderImageUrl(40, 'No Photo');
                        }}
                    />
                    <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{official?.first_name} {official?.last_name}</div>
                        <div className="text-sm text-gray-500">{official?.nationality ?? "Filipino"}</div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {official?.position}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {official?.mobile_number ?? t('barangayOfficials.table.noMobile')}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {official.term_start ? new Date(official.term_start).toLocaleDateString() : 'N/A'} to {official.term_end ? new Date(official.term_end).toLocaleDateString() : 'N/A'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(official?.status)}`}>
                    {official?.status}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {official.committee_assignment}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center space-x-2">
                    <button
                        className="text-smblue-400 hover:text-smblue-300 transition-colors"
                        title="View official details"
                        onClick={() => onView(official)}
                    >
                        <FiEye className="w-4 h-4" />
                    </button>
                    <button
                        className="text-smblue-400 hover:text-smblue-300 transition-colors"
                        title="Edit official"
                        onClick={() => onEdit(official)}
                    >
                        <FiEdit className="w-4 h-4" />
                    </button>
                    <button
                        className={`text-red-600 hover:text-red-900 transition-colors
                        ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                        title={isDeleting ? t('barangayOfficials.actions.deleting') : t('barangayOfficials.actions.delete')}
                        onClick={() => onDelete(official)}
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        ) : (
                            <FiTrash2 className="w-4 h-4" />
                        )}
                    </button>
                </div>
            </td>
        </tr>
    )
}