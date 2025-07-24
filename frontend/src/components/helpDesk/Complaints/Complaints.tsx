import React, { useState, useEffect, useRef } from "react";
import { AlertCircle, User, Loader } from "lucide-react";
import Breadcrumb from "../../_global/Breadcrumb";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useCreateComplaintForm } from "./useCreateComplaintForm";
import { FormProvider } from "react-hook-form";
import { FormField } from "@/components/_global/components/FormField";
import { departments } from "@/services/helpDesk/appointments/appointments.types";
import {
  feedbackCategoryOptions,
  priorities,
} from "@/services/helpDesk/helpDesk.type";
import { ProcessTimeline } from "./_components/ProcessTimeline";
import { SearchResidents } from "../_components/SearchResidents";
import { enumToTitleCase } from "../utilities/enumToTitleCase";
import { InfoBanner } from "./InfoBanner";

const ComplaintsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // loading ng breadcrumbs ni sean
  const [isLoaded, setIsLoaded] = useState(false);

  const onSuccess = () => {
    navigate("/help-desk");
  };

  const {
    form,
    isAnonymous,
    setIsAnonymous,
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
  } = useCreateComplaintForm({ onSuccess });
  const searchRef = useRef<HTMLDivElement>(null);

  const handleSubmitButton = () => {
    console.log(form.formState.errors);
    handleSubmit();
  };

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
          <AlertCircle className="h-8 w-8 mr-3 text-orange-600" />
          Process Complaint
        </h1>
        <p className="text-gray-600">
          Log and manage complaints received from residents regarding government
          services and facilities.
        </p>
      </div>

      {/* Information Banner */}
      <InfoBanner isLoaded={isLoaded}/>

      <FormProvider {...form}>
        <form onSubmit={handleSubmit}>
          <div
            className={`@container/main-form bg-white shadow-lg rounded-lg p-6 transition-all duration-700 ease-out ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: "200ms" }}
          >
            {/* Anonymous Option */}
            <div className="mb-6 bg-gray-50 rounded-lg p-4">
              <label
                htmlFor="isAnonymous"
                className="flex items-center cursor-pointer"
              >
                <input
                  type="checkbox"
                  name="isAnonymous"
                  id="isAnonymous"
                  checked={isAnonymous}
                  onChange={(event) => setIsAnonymous(event.target.checked)}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-gray-700">
                  Submit this complaint anonymously
                </span>
              </label>
              <p className="text-sm text-gray-500 mt-1 ml-6">
                Your identity will be kept confidential
              </p>
            </div>

            {/* Personal Information */}
            {!isAnonymous && (
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
                      readOnly={
                        residentIdField !== undefined &&
                        residentIdField !== null
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
                        residentIdField !== undefined &&
                        residentIdField !== null
                      }
                    />
                  </div>
                  <div>
                    <FormField
                      name="ticket.contact_number"
                      label={t("helpDesk.fields.contactNumber")}
                      placeholder={t("helpDesk.placeholders.contactNumber")}
                      readOnly={
                        residentIdField !== undefined &&
                        residentIdField !== null
                      }
                    />
                  </div>
                  <div>
                    <FormField
                      name="ticket.complete_address"
                      label={t("helpDesk.fields.completeAddress")}
                      placeholder={t("helpDesk.placeholders.completeAddress")}
                      readOnly={
                        residentIdField !== undefined &&
                        residentIdField !== null
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Complaint Details */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                Complaint Details
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <FormField
                      type="select"
                      name="complaint.department"
                      label={t("helpDesk.complaintsForm.fields.department")}
                      placeholder={t(
                        "helpDesk.complaintsForm.placeholders.department"
                      )}
                      options={departments.map((department) => ({
                        value: department,
                        label: enumToTitleCase(department),
                      }))}
                      required
                    />
                  </div>
                  <div>
                    <FormField
                      type="select"
                      name="complaint.c_category"
                      label={t("helpDesk.complaintsForm.fields.cCategory")}
                      placeholder={t(
                        "helpDesk.complaintsForm.placeholders.cCategory"
                      )}
                      options={feedbackCategoryOptions.map((feedback) => ({
                        value: feedback,
                        label: enumToTitleCase(feedback),
                      }))}
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

                <div>
                  <FormField
                    name="ticket.subject"
                    label={t("helpDesk.complaintsForm.fields.subject")}
                    placeholder={t(
                      "helpDesk.complaintsForm.placeholders.subject"
                    )}
                    required
                  />
                </div>

                <div>
                  <FormField
                    type="textarea"
                    name="ticket.description"
                    label={t(
                      "helpDesk.complaintsForm.fields.description"
                    )}
                    placeholder={t(
                      "helpDesk.complaintsForm.placeholders.description"
                    )}
                    required
                  />
                </div>

                <FormField
                  name="complaint.location"
                  label={t("helpDesk.complaintsForm.fields.location")}
                  placeholder={t(
                    "helpDesk.complaintsForm.placeholders.location"
                  )}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center justify-between">
              <p className="text-sm text-gray-500">* Required fields</p>{" "}
              <button
                onClick={handleSubmitButton}
                disabled={isSubmitting}
                className="cursor-pointer px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors duration-200 flex justify-center items-center disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <AlertCircle className="h-5 w-5 mr-2" />
                )}
                {isSubmitting ? "Submitting..." : "Submit Complaint"}
              </button>
            </div>
          </div>

          {/* Process Timeline */}
          <ProcessTimeline isLoaded={isLoaded} />
        </form>
      </FormProvider>
    </div>
  );
};

export default ComplaintsPage;
