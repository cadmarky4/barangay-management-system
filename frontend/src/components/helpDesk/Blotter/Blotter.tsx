import React, { useState, useEffect, useRef } from "react";
import {
  Shield,
  AlertTriangle,
  User,
  Loader,
} from "lucide-react";
// import { BlotterService } from "../../services/helpDesk/blotters/blotters.service";
// import type { CreateBlotterData, IncidentType } from "../../services/helpDesk/blotters/blotters.types";
import Breadcrumb from "../../_global/Breadcrumb";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useCreateBlotterForm } from "./useCreateBlotterForm";
import { FormField } from "@/components/_global/components/FormField";
import { SearchResidents } from "../_components/SearchResidents";
import { FormProvider } from "react-hook-form";
import { incidentOptions } from "@/services/helpDesk/blotters/blotters.types";
import { enumToTitleCase } from "../utilities/enumToTitleCase";
import { EmergencyContactCard } from "./_components/EmergencyContactCard";
import { RespondentInformationFields } from "./_components/RespondentInformationFields";
import { priorities, timeSlotOptions } from "@/services/helpDesk/helpDesk.type";
import { SupportingDocumentsSection } from "./_components/SupportingDocumentsSection";
import { ImportantNotice } from "./_components/ImportantNotice";

const BlotterPage: React.FC = () => {
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
    setSelectedResidentId,
    handleSubmit,
  } = useCreateBlotterForm({ onSuccess });
  const searchRef = useRef<HTMLDivElement>(null);

  const handleSubmitButton = () => {
    console.log(form.formState.errors);
    handleSubmit();
  };

  // Toast state 
  // const [toast, setToast] = useState<{
  //   show: boolean;
  //   message: string;
  //   type: "success" | "error";
  // }>({ show: false, message: "", type: "success" });

  // Animation trigger on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <Breadcrumb isLoaded={isLoaded} />

      {/* Header */}
      <div
        className={`mb-8 transition-all duration-700 ease-out ${
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        }`}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
          <Shield className="h-8 w-8 mr-3 text-red-600" />
          File Blotter Report
        </h1>
        <p className="text-gray-600">
          Process and document incidents reported by residents. All information
          will be recorded in the barangay blotter system.
        </p>
      </div>

      {/* Important Notice */}
      <ImportantNotice isLoaded={isLoaded}/>

      <FormProvider {...form}>
        <form onSubmit={handleSubmit}>
          <div className="bg-white shadow-lg rounded-lg p-6">
            {/* Complainant Information */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Complainant Information
              </h2>
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
                  Check this if you are a registered resident of the
                  municipality
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
                    placeholder={t("helpDesk.placeholders.fullName")}
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
                    placeholder={t("helpDesk.placeholders.emailAddress")}
                    readOnly={
                      residentIdField !== undefined && residentIdField !== null
                    }
                  />
                </div>
                <div>
                  <FormField
                    name="ticket.contact_number"
                    label={t("helpDesk.fields.contactNumber")}
                    placeholder={t("helpDesk.placeholders.contactNumber")}
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
                    placeholder={t("helpDesk.placeholders.completeAddress")}
                    required
                    readOnly={
                      residentIdField !== undefined && residentIdField !== null
                    }
                  />
                </div>
              </div>
            </div>

            {/* Incident Details */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Incident Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <FormField
                    type="select"
                    name="blotter.type_of_incident"
                    label={t("helpDesk.blotterForm.fields.typeOfIncident")}
                    placeholder={t(
                      "helpDesk.blotterForm.placeholders.typeOfIncident"
                    )}
                    options={incidentOptions.map((incident) => ({
                      value: incident,
                      label: enumToTitleCase(incident),
                    }))}
                    required
                  />
                </div>
                <div>
                  <FormField
                    name="blotter.location_of_incident"
                    label={t("helpDesk.blotterForm.fields.locationOfIncident")}
                    placeholder={t(
                      "helpDesk.blotterForm.placeholders.locationOfIncident"
                    )}
                    required
                  />
                </div>
                <div>
                  <FormField
                    name="blotter.date_of_incident"
                    label={t("helpDesk.blotterForm.fields.dateOfIncident")}
                    type="date"
                    required
                  />
                </div>
                <div>
                  <FormField
                    type="select"
                    name="blotter.time_of_incident"
                    label={t("helpDesk.blotterForm.fields.timeOfIncident")}
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
                    placeholder={t(
                      "helpDesk.blotterForm.placeholders.timeOfIncident"
                    )}
                    required
                  />
                </div>

                <div className="col-span-2 grid grid-cols-[3fr_1fr] gap-6">
                  <FormField
                    name="ticket.subject"
                    label={t("helpDesk.appointmentsForm.fields.subject")}
                    placeholder={t(
                      "helpDesk.appointmentsForm.placeholders.subject"
                    )}
                    required
                  />

                  <FormField
                    type="select"
                    name="ticket.priority"
                    label={t("helpDesk.fields.priority")}
                    placeholder={t("helpDesk.placeholders.priority")}
                    options={priorities.map((priority) => ({
                      value: priority,
                      label: priority
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

                <div className="md:col-span-2">
                  <FormField
                    type="textarea"
                    name="ticket.description"
                    label={t("helpDesk.blotterForm.fields.incidentDescription")}
                    placeholder={t(
                      "helpDesk.blotterForm.placeholders.incidentDescription"
                    )}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Respondent Information */}
            <RespondentInformationFields />

            {/* Additional Information */}
            <SupportingDocumentsSection/>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center justify-between">
              <p className="text-sm text-gray-500">* Required fields</p>{" "}
              <button
                onClick={handleSubmitButton}
                disabled={isSubmitting}
                className="cursor-pointer px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors duration-200 flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="h-5 w-5 mr-2 animate-spin" />
                    Submitting Report...
                  </>
                ) : (
                  <>
                    <Shield className="h-5 w-5 mr-2" />
                    Submit Blotter Report
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Emergency Contact Card */}
          <EmergencyContactCard isLoaded={isLoaded} />
        </form>
      </FormProvider>
    </div>
  );
};

export default BlotterPage;
