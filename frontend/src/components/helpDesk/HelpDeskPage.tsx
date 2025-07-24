import React, { useState, useEffect } from "react";
import { Download } from "lucide-react";
import Breadcrumb from "../_global/Breadcrumb";

// Import API services
import type {
  BaseTicket,
  HelpDeskTicketParams,
  Priority,
  Status,
  TicketCategory,
} from "@/services/helpDesk/helpDesk.type";
import { useDebounce } from "@/hooks/useDebounce";
import {
  useDeleteHelpDeskTicket,
  useHelpDeskTickets,
} from "@/services/helpDesk/useHelpDesk";
import { useTranslation } from "react-i18next";
import { useNotifications } from "../_global/NotificationSystem";
import StatisticsCard from "./_components/StatisticsCards";
import { HelpDeskSearch } from "./_components/HelpDeskSearch";
import { TicketsList } from "./_components/TicketsList";
import { TicketFormsDropdown } from "./_components/TicketFormsDropdown";
import { DeleteConfirmModal } from "./_components/DeleteConfirmModal";
import { AppointmentModal } from "./_components/modals/appointments/AppointmentModal";
import { BlotterModal } from "./_components/modals/blotter/BlotterModal";
import { SuggestionModal } from "./_components/modals/suggestions/SuggestionModal";
import { ComplaintModal } from "./_components/modals/complaints/ComplaintModal";

const HelpDeskPage: React.FC = () => {
  // const navigate = useNavigate();
  const { t } = useTranslation();

  // Notification
  const { showNotification } = useNotifications();

  // Local state
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<TicketCategory | undefined>(
    undefined
  );
  const [status, setStatus] = useState<Status | undefined>(undefined);
  const [priority, setPriority] = useState<Priority | undefined>(undefined);
  const [showModal, setShowModal] = useState(false);
  const [modalId, setModalId] = useState<string | null>(null);
  const [modalCategory, setModalCategory] = useState<TicketCategory | null>(
    null
  );
  const [mode, setMode] = useState<"edit" | "view">("view");

  // Delete states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<BaseTicket | null>(null);

  // Debounce search to avoid too many API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Query parameters
  const queryParams: HelpDeskTicketParams = {
    page: currentPage,
    per_page: 5,
    search: debouncedSearchTerm,
    category: activeTab,
    status: status,
    priority: priority,
  };

  // Queries and mutations
  const {
    data: helpDeskTicketData,
    isLoading,
    error,
    refetch,
  } = useHelpDeskTickets(queryParams);

  const deleteTicket = useDeleteHelpDeskTicket();

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDelete = (ticket: BaseTicket) => {
    setShowDeleteConfirm(true);
    setTicketToDelete(ticket);
  };

  const handleDeleteClose = () => {
    setShowDeleteConfirm(false);
  };

  const handleDeleteConfirm = async () => {
    if (!ticketToDelete?.id)
      throw new Error(t("helpDesk.errors.ticketNotFound"));

    try {
      await deleteTicket.mutateAsync(ticketToDelete.id);
      showNotification({
        type: "success",
        title: t("helpDesk.messages.deleteSuccess"),
        message: t("helpDesk.messages.deleteSuccess"),
        duration: 3000,
        persistent: false,
      });
      refetch();
    } catch (error) {
      console.error("Delete error:", error);
      const errorMessage = (error as Error)?.message || t('helpDesk.complaintsForm.messages.updateError');
      showNotification({
        type: "error",
        title: t("helpDesk.messages.deleteError"),
        message: errorMessage,
        duration: 3000,
        persistent: false,
      });
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  const handleActiveTabChange = (category: TicketCategory | undefined) => {
    setActiveTab(category);
    setCurrentPage(1);
  };

  const handleStatusChange = (status: Status | undefined) => {
    setStatus(status);
    setCurrentPage(1);
  };

  const handlePriorityChange = (priority: Priority | undefined) => {
    setPriority(priority);
    setCurrentPage(1);
  };

  const handleEditTicket = (id: string, category: TicketCategory) => {
    setMode("edit");
    setShowModal(true);
    setModalId(id);
    setModalCategory(category);
  };

  const handleViewTicket = (id: string, category: TicketCategory) => {
    setMode("view");
    setShowModal(true);
    setModalId(id);
    setModalCategory(category);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalId(null);
    setModalCategory(null);
    setMode("view");
  };

  // Prepare data
  const tickets: BaseTicket[] = helpDeskTicketData?.data || [];

  const pagination = helpDeskTicketData
    ? {
        current_page: helpDeskTicketData.current_page,
        last_page: helpDeskTicketData.last_page,
        per_page: helpDeskTicketData.per_page,
        total: helpDeskTicketData.total,
      }
    : {
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0,
      };

  // Animation trigger on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Reset to first page when search term changes
  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) {
      setCurrentPage(1);
    }
  }, [debouncedSearchTerm, searchTerm]);

  return (
    <div className="@container/main min-h-screen bg-gray-50 p-6">
      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={handleDeleteClose}
        onConfirm={handleDeleteConfirm}
      />

      {/* EDIT AND VIEW MODAL */}
      {(() => {
        switch (modalCategory) {
          case "APPOINTMENT":
            return (
              <AppointmentModal
                appointmentId={modalId}
                isOpen={showModal}
                onClose={handleCloseModal}
                mode={mode}
                setMode={setMode}
              />
            );
          case "BLOTTER":
            return (
              <BlotterModal
                blotterId={modalId}
                isOpen={showModal}
                onClose={handleCloseModal}
                mode={mode}
                setMode={setMode}
              />
            )
            case "COMPLAINT":
              return (
                <ComplaintModal
                  complaintId={modalId}
                  isOpen={showModal}
                  onClose={handleCloseModal}
                  mode={mode}
                  setMode={setMode}
                />
              )
            case "SUGGESTION":
              return (
                <SuggestionModal
                  suggestionId={modalId}
                  isOpen={showModal}
                  onClose={handleCloseModal}
                  mode={mode}
                  setMode={setMode}
                />
              )
          default:
            return null;
        }
      })()}

      {/* Breadcrumb */}
      <Breadcrumb isLoaded={isLoaded} />

      {/* Header Section */}
      <div className={`mb-8 transition-all duration-700 ease-out`}>
        <div className="flex flex-col @3xl/main:flex-row @3xl/main:items-center @3xl/main:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Help Desk Management
            </h1>
            <p className="text-gray-600 mt-1">
              Process and track resident service requests
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <TicketFormsDropdown />

            <button className="cursor-pointer flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Card */}
      <StatisticsCard isLoaded={isLoaded} />

      {/* Filters and Search */}
      <HelpDeskSearch
        searchTerm={searchTerm}
        activeTab={activeTab}
        status={status}
        priority={priority}
        onSearchChange={handleSearchChange}
        handleActiveTabChange={handleActiveTabChange}
        handleStatusChange={handleStatusChange}
        handlePriorityChange={handlePriorityChange}
      />

      {/* Tickets List */}
      <TicketsList
        filteredTickets={tickets}
        isLoading={isLoading}
        error={error}
        pagination={pagination}
        handlePageChange={handlePageChange}
        handleDelete={handleDelete}
        handleEdit={handleEditTicket}
        handleView={handleViewTicket}
      />

      {/* Modal */}
      {/* {showModal && modalTicket && (
        <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {modalTicket.title}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {modalTicket.referenceNumber}
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full border ${getTypeColor(
                      modalTicket.type
                    )}`}
                  >
                    {modalTicket.type}
                  </span>
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-gray-500">
                    Submitted by {modalTicket.submittedBy}
                  </span>
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-gray-500">
                    {modalTicket.submittedDate}
                  </span>
                </div>
              </div>

              {renderModalContent()} */}

      {/* Contact Information */}
      {/* <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3">
                  Contact Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {modalTicket.contactEmail && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {modalTicket.contactEmail}
                      </span>
                    </div>
                  )}
                  {modalTicket.contactPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {modalTicket.contactPhone}
                      </span>
                    </div>
                  )}
                </div>
              </div> */}

      {/* Action Buttons */}
      {/* <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end gap-3">
                {isEditMode ? (
                  <>
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveChanges}
                      className="px-4 py-2 bg-smblue-400 text-white rounded-lg hover:bg-smblue-300 transition-colors flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => setIsEditMode(true)}
                      className="px-4 py-2 bg-smblue-400 text-white rounded-lg hover:bg-smblue-300 transition-colors flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Ticket
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )} */}
      {/* <FloatingPaginationNavigation
        currentPage={currentPage}
        totalPages={pagination.last_page}
        onPageChange={setCurrentPage}
      /> */}
    </div>
  );
};

export default HelpDeskPage;
