import {
  categoryOptionsAll,
  prioritiesAll,
  statusOptionsAll,
  type Priority,
  type Status,
  type TicketCategory,
} from "@/services/helpDesk/helpDesk.type";
import { FiSearch } from "react-icons/fi";
import { CustomDropdown } from "./CustomDropdown";
import { enumToTitleCase } from "../utilities/enumToTitleCase";

interface HelpDeskSearchProps {
  searchTerm: string;
  activeTab: TicketCategory | undefined;
  status: Status | undefined;
  priority: Priority | undefined;
  onSearchChange: (term: string) => void;
  handleActiveTabChange: (category: TicketCategory | undefined) => void;
  handleStatusChange: (status: Status | undefined) => void;
  handlePriorityChange: (priority: Priority | undefined) => void;
}

export const HelpDeskSearch: React.FC<HelpDeskSearchProps> = ({
  searchTerm,
  activeTab,
  status,
  priority,
  onSearchChange,
  handleActiveTabChange,
  handleStatusChange,
  handlePriorityChange,
}) => {
  return (
    <div
      className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8 transition-all duration-700 ease-out "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: "200ms" }}
    >
      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by title, submitter, or reference number..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-smblue-400 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex flex-col w-full @lg/main:w-auto @lg/main:flex-row gap-6">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <p className="text-gray-400">Status</p>
            <CustomDropdown
              value={status}
              onChange={(val) =>
                handleStatusChange(val === "ALL" ? undefined : (val as Status))
              }
              options={statusOptionsAll.map((status) => ({
                label: enumToTitleCase(status),
                value: status === "ALL" ? undefined : status,
              }))}
              placeholder={"Select Filter"}
            />
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-2">
            <p className="text-gray-400">Priority</p>
            <CustomDropdown
              value={priority}
              onChange={(val) =>
                handlePriorityChange(
                  val === "ALL" ? undefined : (val as Priority)
                )
              }
              options={prioritiesAll.map((priority) => ({
                label: enumToTitleCase(priority),
                value: priority === "ALL" ? undefined : priority,
              }))}
              placeholder={"Select Filter"}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mt-6 border-b border-gray-200">
        {categoryOptionsAll.map((tab) => (
          <button
            key={tab}
            onClick={() =>
              handleActiveTabChange(tab === "ALL" ? undefined : tab)
            }
            className={`cursor-pointer px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
              (activeTab === undefined && tab === "ALL") || activeTab === tab
                ? "box-border text-smblue-400 border border-smblue-100 font-semibold bg-smblue-50"
                : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
};