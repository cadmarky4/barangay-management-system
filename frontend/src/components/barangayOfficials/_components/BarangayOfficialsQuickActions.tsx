import { FiEdit, FiUsers } from "react-icons/fi";

interface BarangayOfficialsQuickActionsProps {
    onAddOfficersClick: () => void;
    onEditOfficersClick: () => void;
    isLoaded: boolean;
}

export const BarangayOfficialsQuickActions:React.FC<BarangayOfficialsQuickActionsProps> = ({ onAddOfficersClick, onEditOfficersClick, isLoaded }) => {
    return (
        <div className={`bg-smblue-400 rounded-2xl p-6 transform transition-all duration-500 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ animationDelay: '350ms' }}>
            <h3 className="text-lg font-semibold text-white mb-6 border-l-4 border-white border-opacity-30 pl-4">Quick Actions</h3>
            <div className="space-y-4">            <button
            onClick={ onAddOfficersClick }
            className="cursor-pointer w-full bg-smblue-300 hover:bg-smblue-200 text-white p-4 rounded-lg transition-all duration-200 flex items-center space-x-3 shadow-sm"
            >
            <FiUsers className="w-5 h-5 text-white" />
            <span className="font-medium text-white">Add New Official</span>
            </button>
            <button
                onClick={ onEditOfficersClick }
                className="cursor-pointer w-full bg-smblue-300 hover:bg-smblue-200 text-white p-4 rounded-lg transition-all duration-200 flex items-center space-x-3 shadow-sm hover:shadow-md"
            >
                <FiEdit className="w-5 h-5 text-white" />
                <span className="font-medium text-white">Update Officers</span>
            </button>
            </div>
        </div>
    )
}