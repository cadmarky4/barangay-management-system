import React, { useState, useEffect, useRef } from "react";
import { Calendar, User, Loader } from "lucide-react";
import Breadcrumb from "../../_global/Breadcrumb";
import { useCreateAppointmentForm } from "./useCreateAppointmentForm";
import InformationCards from "./_components/InformationCard";
import { FormProvider } from "react-hook-form";
import { FormField } from "@/components/_global/components/FormField";
import { useTranslation } from "react-i18next";
import { departments } from "@/services/helpDesk/appointments/appointments.types";
import { SearchResidents } from "../_components/SearchResidents";
import { priorities, timeSlotOptions } from "@/services/helpDesk/helpDesk.type";
import { useNavigate } from "react-router-dom";
import { enumToTitleCase } from "../utilities/enumToTitleCase";

const AppointmentsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // loading ng breadcrumbs ni sean
  const [isLoaded, setIsLoaded] = useState(false);

  const onSuccess = () => {
    navigate("/help-desk");
  };

  const {
    form,
    isResident,
    setIsResident,
    searchResident,
    filteredResidents,
    isLoadingResidents,
    residentsError,
    isSubmitting,
    residentIdField,
    isScheduleUnavailableWarning,
    setSelectedResidentId,
    handleSubmit,
  } = useCreateAppointmentForm({ onSuccess });
  const searchRef = useRef<HTMLDivElement>(null);

  // Toast state
  // const [toast, setToast] = useState<{
  //   show: boolean;
  //   message: string;
  //   type: "success" | "error";
  // }>({ show: false, message: "", type: "success" });

  // Animation trigger on component mount
  useEffect(() => {
    console.log("HELLO", residentIdField);
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="@container/main p-6 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <Breadcrumb isLoaded={isLoaded} />

      {/* Header */}
      <div
        className={`mb-8 transition-all duration-700 ease-out ${
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        }`}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Process Appointment Request
        </h1>
        <p className="text-gray-600">
          Schedule and manage resident appointments with various LGU
          departments.
        </p>
      </div>

      <FormProvider {...form}>
        <form onSubmit={handleSubmit}>
          <div
            className={`@container/main-form bg-white shadow-lg rounded-lg p-6 transition-all duration-700 ease-out ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: "200ms" }}
          >
            {/* Personal Information */}
            <div className="col-span-2">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Resident Information
              </h2>
            </div>

            {/* IS RESIDENT? */}
            <div className="mb-6 bg-gray-50 rounded-lg p-4">
              <label
                htmlFor="isResident"
                className="flex items-center cursor-pointer"
              >
                <input
                  type="checkbox"
                  name="isResident"
                  id="isResident"
                  checked={isResident}
                  onChange={(event) => setIsResident(event.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-gray-700">
                  I am a registered resident
                </span>
              </label>
              <p className="text-sm text-gray-500 mt-1 ml-6">
                Check this if you are a registered resident of the municipality
              </p>
            </div>

            {/* Search Residents */}
            {isResident && (
              <div className="mb-6">
                <SearchResidents
                  headSearchRef={searchRef}
                  search={searchResident || ""}
                  isSearchingResidents={isLoadingResidents}
                  filteredResidents={filteredResidents?.data || []}
                  residentsFetchErrorMessage={residentsError?.message}
                  onResidentClick={setSelectedResidentId}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <FormField
                  name="ticket.requester_name"
                  label={t("helpDesk.fields.fullName")}
                  placeholder={t(
                    "helpDesk.placeholders.fullName"
                  )}
                  required
                  readOnly={
                    residentIdField !== undefined && residentIdField !== null
                  }
                />
              </div>

              <div>
                <FormField
                  type="email"
                  name="ticket.email_address"
                  label={t("helpDesk.fields.emailAddress")}
                  placeholder={t(
                    "helpDesk.placeholders.emailAddress"
                  )}
                  readOnly={
                    residentIdField !== undefined && residentIdField !== null
                  }
                />
              </div>

              <div>
                <FormField
                  name="ticket.contact_number"
                  label={t("helpDesk.fields.contactNumber")}
                  placeholder={t(
                    "helpDesk.placeholders.contactNumber"
                  )}
                  required
                  readOnly={
                    residentIdField !== undefined && residentIdField !== null
                  }
                />
              </div>

              <div>
                <FormField
                  name="ticket.complete_address"
                  label={t("helpDesk.fields.completeAddress")}
                  placeholder={t(
                    "helpDesk.placeholders.completeAddress"
                  )}
                  required
                  readOnly={
                    residentIdField !== undefined && residentIdField !== null
                  }
                />
              </div>
            </div>

            {/* Appointment Details */}
            <div className="col-span-2 mt-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Appointment Details
              </h2>
            </div>

            <div className="grid grid-cols-[3fr_1fr] gap-6">
              <div className="mb-6">
                <FormField
                  name="ticket.subject"
                  label={t("helpDesk.appointmentsForm.fields.subject")}
                  placeholder={t(
                    "helpDesk.appointmentsForm.placeholders.subject"
                  )}
                  required
                />
              </div>

              <div className="mb-6">
                <FormField
                  type="select"
                  name="appointment.department"
                  label={t("helpDesk.appointmentsForm.fields.department")}
                  placeholder={t(
                    "helpDesk.appointmentsForm.placeholders.department"
                  )}
                  options={departments.map((department) => ({
                    value: department,
                    label: department
                      .split("_")
                      .map(
                        (word) =>
                          word.charAt(0).toUpperCase() +
                          word.slice(1).toLowerCase()
                      )
                      .join(" "),
                  }))}
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <FormField
                type="textarea"
                name="ticket.description"
                label={t("helpDesk.appointmentsForm.fields.purpose")}
                placeholder={t(
                  "helpDesk.appointmentsForm.placeholders.purpose"
                )}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <FormField
                  name="appointment.date"
                  label={t("helpDesk.appointmentsForm.fields.date")}
                  type="date"
                  required
                />
              </div>

              <div>
                <FormField
                  type="select"
                  name="appointment.time"
                  label={t("helpDesk.appointmentsForm.fields.time")}
                  options={timeSlotOptions.map((slot) => {
                    // Convert 12-hour format (XX:XX AM/PM) to 24-hour format (HH:mm)
                    const [time, period] = slot.split(" ");
                    const [hours, minutes] = time.split(":");
                    let hour = parseInt(hours);

                    if (period === "PM" && hour !== 12) {
                      hour += 12;
                    } else if (period === "AM" && hour === 12) {
                      hour = 0;
                    }

                    const formattedTime = `${hour
                      .toString()
                      .padStart(2, "0")}:${minutes}`;

                    return {
                      value: formattedTime,
                      label: slot,
                    };
                  })}
                  placeholder={t("helpDesk.appointmentsForm.placeholders.time")}
                  required
                />
              </div>

              <div>
                <FormField
                  type="select"
                  name="ticket.priority"
                  label={t("helpDesk.fields.priority")}
                  options={priorities.map((priority) => ({
                    value: priority,
                    label: enumToTitleCase(priority),
                  }))}
                  placeholder={t("helpDesk.placeholders.priority")}
                  required
                />
              </div>
            </div>

            <div className="mt-6 col-span-2">
              <FormField
                type="textarea"
                name="ticket.additional_notes"
                label={t("helpDesk.appointmentsForm.fields.additionalNotes")}
                placeholder={t(
                  "helpDesk.appointmentsForm.placeholders.additionalNotes"
                )}
              />
            </div>

            <div className="flex-col @lg/main-form:flex-row mt-6 flex gap-2 @lg/main-form:items-center justify-between">
              <p className="text-sm text-gray-500">* Required fields</p>{" "}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="cursor-pointer @lg/main-form:px-6 px-3 py-3 bg-blue-600 justify-center text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <Calendar className="h-5 w-5 mr-2" />
                )}
                {isSubmitting ? "Submitting..." : "Submit Appointment Request"}
              </button>
            </div>
          </div>
        </form>
      </FormProvider>

      {/* Information Cards */}
      <InformationCards isLoaded={isLoaded} />
    </div>
  );
};

export default AppointmentsPage;
