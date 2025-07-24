import {
    type BaseTicket,
    type TicketCategory,
  } from "@/services/helpDesk/helpDesk.type";
  import { AlertCircle, Calendar, Edit, Eye, FileText, Trash } from "lucide-react";
import { getTypeColor } from "../utilities/getTypeColor";
import { getPriorityColor } from "../utilities/getPriorityColor";
import { getStatusColor } from "../utilities/getStatusColor";
import { PaginationNavigation } from "./PaginationNavigation";
  
  interface TicketsListProps {
    filteredTickets: BaseTicket[];
    isLoading: boolean;
    error: Error | null;
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    },
    handlePageChange: (page: number) => void;
    handleDelete: (ticket: BaseTicket) => void;
    handleView: (baseTicketId: string, category: TicketCategory) => void;
    handleEdit: (baseTicketId: string, category: TicketCategory) => void;
  }
  
  export const TicketsList: React.FC<TicketsListProps> = ({
    filteredTickets,
    isLoading,
    error,
    pagination,
    handlePageChange,
    handleDelete,
    handleView,
    handleEdit,
  }) => {
    return (
      <div
        className={`bg-white rounded-xl shadow-sm border border-gray-100 transition-all duration-700 ease-out "opacity-0 translate-y-8"
        }`}
        style={{ transitionDelay: "300ms" }}
      >
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Active Tickets ({filteredTickets.length})
          </h3>
        </div>{" "}
        <div className="divide-y divide-gray-200">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-smblue-400 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading help desk tickets...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error.message}</p>
              <button
                // onClick={loadAllTickets}
                className="px-4 py-2 bg-smblue-400 text-white rounded-lg hover:bg-smblue-300 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                No tickets found matching your criteria.
              </p>
            </div>
          ) : (
            filteredTickets.map((ticket: BaseTicket) => (
              <div
                key={ticket.id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900">
                            {ticket.subject}
                          </h4>
                          <span className="text-sm text-gray-500">
                            {ticket.ticket_number}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {ticket.description}
                        </p>
  
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full border ${getTypeColor(
                              ticket.category
                            )}`}
                          >
                            {ticket.category
                                .split("_")
                                .map(
                                (word) =>
                                    word.charAt(0).toUpperCase() +
                                    word.slice(1).toLowerCase()
                                )
                                .join(" ")}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(
                              ticket.priority
                            )}`}
                          >
                            {ticket.priority
                                .split("_")
                                .map(
                                (word) =>
                                    word.charAt(0).toUpperCase() +
                                    word.slice(1).toLowerCase()
                                )
                                .join(" ")} Priority
                          </span>
                          {/* {editingStatus === ticket.id ? (
                            <select
                              value={ticket.status}
                              onChange={(e) =>
                                handleStatusChange(
                                  ticket.id,
                                  e.target.value as TicketStatus
                                )
                              }
                              onBlur={() => setEditingStatus(null)}
                              className="px-2 py-1 text-xs font-medium rounded-full border focus:ring-2 focus:ring-smblue-400"
                              autoFocus
                            >
                              {statusOptions.map((status) => (
                                <option key={status} value={status}>
                                  {status
                                    .split("_")
                                    .map(
                                      (word) =>
                                        word.charAt(0).toUpperCase() +
                                        word.slice(1).toLowerCase()
                                    )
                                    .join(" ")}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full border cursor-pointer ${getStatusColor(
                                ticket.status
                              )}`}
                              // onClick={() => setEditingStatus(ticket.id)}
                              title="Click to change status"
                            >
                              {ticket.status}
                            </span>
                          )} */}
                          {/* ETO PO MUNA */}
                          <span
                              className={`px-2 py-1 text-xs font-medium rounded-full border cursor-pointer ${getStatusColor(
                                ticket.status
                              )}`}
                              // onClick={() => setEditingStatus(ticket.id)}
                              title="Click to change status"
                            >
                              {ticket.status
                                .split("_")
                                .map(
                                (word) =>
                                    word.charAt(0).toUpperCase() +
                                    word.slice(1).toLowerCase()
                                )
                                .join(" ")}
                            </span>
                        </div>
  
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Submitted by:</span>
                            {ticket.requester_name || "Anonymous"}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(ticket.created_at).toLocaleString('en-US', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false
                            }).replace(',', '')}
                          </div>
                          {/* <div className="flex items-center gap-1">
                              <span className="font-medium">Assigned to:</span>
                              {ticket.assignedTo}
                            </div> */}
                        </div>
                      </div>
                    </div>
                  </div>
  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleView(ticket.id || '', ticket.category)}
                      className="cursor-pointer p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(ticket.id || '', ticket.category)}
                      className="cursor-pointer p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Edit Ticket"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(ticket)}
                      className="cursor-pointer p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Delete Ticket"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <PaginationNavigation
        isLoading={isLoading}
        currentPage={pagination.current_page}
        lastPage={pagination.last_page}
        totalPages={pagination.total}
        perPage={pagination.per_page}
        onPageChange={handlePageChange}
        />
      </div>
    );
  };
  