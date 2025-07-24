import Breadcrumb from "@/components/_global/Breadcrumb";
import { useTranslation } from "react-i18next";
import { useBarangayOfficialsForm } from "../_hooks/useBarangayOfficialsForm";
import { LoadingSpinner } from "@/components/__shared/LoadingSpinner";
import { FormProvider } from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import { FormField } from "@/components/_global/components/FormField";
import {
  committeeAssignments,
  positions,
  prefixes,
} from "@/services/officials/barangayOfficials.types";
import { civilStatuses, educationalAttainments, genders } from "@/services/__shared/types";
import { SearchResidents } from "./SearchResidents";
import { FiCheck, FiX } from "react-icons/fi";
import { STORAGE_BASE_URL } from "@/services/__shared/_storage/storage.types";

interface BarangayOfficialFormProps {
  mode: "create" | "edit";
  barangayOfficialId?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const BarangayOfficialForm: React.FC<BarangayOfficialFormProps> = ({
  mode,
  barangayOfficialId,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const {
    form,
    searchResident,
    official,
    isLoadingOfficial,
    filteredResidents,
    isLoadingResidents,
    residentsError,
    // profilePhotoPreview,
    isAlreadyRegisteredAsOfficialWarning,
    isSubmitting,
    isCheckingAlreadyRegisteredAsOfficial,
    isResidentValidNewOfficial,
    residentIdField,
    setSelectedResidentId,
    handleSubmit,
    saveDraft,
    // clearDraft,
  } = useBarangayOfficialsForm({ mode, barangayOfficialId, onSuccess });
  const [isLoaded, setIsLoaded] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [showResidentIdEmptyError, setShowResidentIdEmptyError] = useState(false);

  const handleSubmitButton = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent the default form submission
    
    console.log('Submit button clicked');
    console.log('residentIdField:', residentIdField);
    console.log('isResidentValidNewOfficial:', isResidentValidNewOfficial);
    console.log('Form values:', form.getValues());
    console.log('Form errors before submission:', form.formState.errors);
    
    if (!residentIdField) {
      setShowResidentIdEmptyError(true);
      console.log('No resident selected, showing error');
      return; // Don't submit if no resident selected
    }
    
    if (!isResidentValidNewOfficial) {
      console.log('Resident is not valid for new official');
      return;
    }
    
    setShowResidentIdEmptyError(false); // Clear the error if resident is selected
    console.log('Calling handleSubmit...');
    handleSubmit(); // This will trigger form validation and submission
  }

  const title =
    mode === "create"
      ? t("barangayOfficials.form.addTitle")
      : t("barangayOfficials.form.editTitle");

  // Toast state
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({ show: false, message: '', type: 'success' });

  // Animation trigger on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (isLoadingOfficial && mode === "edit") {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
        <span className="ml-2 text-gray-600">
          {t("barangayOfficials.form.messages.loadingResident")}
        </span>
      </div>
    );
  }

  return (
    <main
      className={`p-6 bg-gray-50 min-h-screen flex flex-col gap-4 transition-all duration-500 ease-out 'opacity-100 translate-y-0'`}
    >
      {/* Breadcrumb */}
      <Breadcrumb isLoaded={true} />

      {/* Header */}
      <div
        className={`mb-2 transform transition-all duration-500 'translate-y-0 opacity-100'`}
        style={{ animationDelay: "100ms" }}
      >
        <h1 className="text-2xl font-bold text-darktext pl-0">{title}</h1>
        {/* {localStorage.getItem(`officialDraft_${official?.id || 'new'}`) && ( */}
        {/* {localStorage.getItem("new") && (
          <p className="text-sm text-gray-600 mt-1">
            📝 Draft data loaded from previous session
          </p>
        )} */}
      </div>

      {/* Error Display */}
      {/* {error && (
        <div
          className={`bg-red-50 border border-red-200 rounded-lg p-4 mb-4 transform transition-all duration-500 ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
          style={{ animationDelay: "150ms" }}
        >
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )} */}

      {showResidentIdEmptyError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800 text-sm">Please select a resident first before submitting the form.</p>
        </div>
      )}

      {/* Success: Resident Selected */}
      {residentIdField && isResidentValidNewOfficial && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <p className="text-green-800 text-sm">✓ Resident selected successfully. You can now fill out the form and submit.</p>
        </div>
      )}

      {/* Debug: Show all form validation errors */}
      {Object.keys(form.formState.errors).length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <p className="text-yellow-800 text-sm font-medium mb-2">Form Validation Errors:</p>
          <ul className="text-yellow-800 text-xs space-y-1">
            {Object.entries(form.formState.errors).map(([field, error]) => (
              <li key={field}>
                <strong>{field}:</strong> {(error as { message?: string })?.message || 'Invalid value'}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Main Form */}
      <FormProvider {...form}>
        <form>
          <div
            className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transform transition-all duration-500 ${
              isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
            style={{ animationDelay: "250ms" }}
          >

            {/* Basic Information */}
            <section className="mb-8">
              <h2
                className={`text-lg font-semibold text-darktext mb-4 border-l-4 border-smblue-400 pl-4 transform transition-all duration-500 ${
                  isLoaded
                    ? "translate-y-0 opacity-100"
                    : "translate-y-4 opacity-0"
                }`}
                style={{ animationDelay: "300ms" }}
              >
                Basic Information
              </h2>
              <div className="border-b border-gray-200 mb-6"></div>

              {/* Search Residents */}
              <SearchResidents
                headSearchRef={searchRef}
                search={searchResident || ''}
                isSearchingResidents={isLoadingResidents}
                filteredResidents={filteredResidents?.data || []}
                residentsFetchErrorMessage={
                  residentsError?.message || ""
                }
                residentSelectErrorMessage={isAlreadyRegisteredAsOfficialWarning || ''}
                onResidentClick={setSelectedResidentId}
                isCheckingAlreadyRegisteredAsOfficial={isCheckingAlreadyRegisteredAsOfficial}
              />

              {/* Baka kasi mawala yung validation pagnirender ko sya conditionally */}
              <div
                className={`grid-cols-1 lg:grid-cols-3 gap-6 ${
                  isResidentValidNewOfficial ? "grid" : "hidden"
                }`}
              >
                {/* Profile Photo */}
                <div
                  className={`lg:col-span-3 flex justify-center transform transition-all duration-500 ${
                    isLoaded
                      ? "translate-y-0 opacity-100"
                      : "translate-y-4 opacity-0"
                  }`}
                  style={{ animationDelay: "350ms" }}
                >
                  {official?.profile_photo_url && (
                    <img
                      src={`${STORAGE_BASE_URL}/${official?.profile_photo_url}`}
                      alt="barangay official profile picture"
                      className="w-72 h-72 rounded-full"
                    />
                  )}

                  {/* <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-smblue-400 transition-all duration-200">
                  {previewUrl ? (
                    <div className="relative">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-16 h-16 mx-auto rounded-full object-cover mb-3"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewUrl(null);
                          setSelectedFile(null);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-3">
                      <FiUpload className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <input
                    type="file"
                    id="profilePhoto"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="profilePhoto"
                    className="text-smblue-400 hover:text-smblue-300 text-sm font-medium transition-colors cursor-pointer"
                  >
                    {previewUrl ? "Change Photo" : "Upload Profile Photo"}
                  </label>
                </div> */}
                </div>

                {/* Form Fields */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Resident ID */}
                  <div
                    className={`transform transition-all duration-500 ${
                      isLoaded
                        ? "translate-y-0 opacity-100"
                        : "translate-y-4 opacity-0"
                    }`}
                    style={{ animationDelay: "400ms" }}
                  >
                    <FormField
                      name="resident_id"
                      label={t("barangayOfficials.form.fields.residentId")}
                      placeholder={t(
                        "barangayOfficials.form.placeholders.residentId"
                      )}
                      required
                      readOnly
                    />
                  </div>

                  {/* Prefix */}
                  <div
                    className={`transform transition-all duration-500 ${
                      isLoaded
                        ? "translate-y-0 opacity-100"
                        : "translate-y-4 opacity-0"
                    }`}
                    style={{ animationDelay: "400ms" }}
                  >
                    <FormField
                      type="select"
                      name="prefix"
                      label={t("barangayOfficials.form.fields.prefix")}
                      placeholder={t(
                        "barangayOfficials.form.placeholders.prefix"
                      )}
                      options={prefixes.map((prefix) => ({
                        value: prefix,
                        label: prefix,
                      }))}
                    />
                  </div>

                  {/* First Name */}
                  <div
                    className={`transform transition-all duration-500 ${
                      isLoaded
                        ? "translate-y-0 opacity-100"
                        : "translate-y-4 opacity-0"
                    }`}
                    style={{ animationDelay: "450ms" }}
                  >
                    <FormField
                      name="first_name"
                      label={t("barangayOfficials.form.fields.firstName")}
                      placeholder={t(
                        "barangayOfficials.form.placeholders.firstName"
                      )}
                      readOnly
                      required
                    />
                  </div>

                  {/* Middle Name */}
                  <div
                    className={`transform transition-all duration-500 ${
                      isLoaded
                        ? "translate-y-0 opacity-100"
                        : "translate-y-4 opacity-0"
                    }`}
                    style={{ animationDelay: "500ms" }}
                  >
                    <FormField
                      name="middle_name"
                      label={t("barangayOfficials.form.fields.middleName")}
                      placeholder={t(
                        "barangayOfficials.form.placeholders.middleName"
                      )}
                      readOnly
                    />
                  </div>

                  {/* Last Name */}
                  <div
                    className={`transform transition-all duration-500 ${
                      isLoaded
                        ? "translate-y-0 opacity-100"
                        : "translate-y-4 opacity-0"
                    }`}
                    style={{ animationDelay: "550ms" }}
                  >
                    <FormField
                      name="last_name"
                      label={t("barangayOfficials.form.fields.lastName")}
                      placeholder={t(
                        "barangayOfficials.form.placeholders.lastName"
                      )}
                      readOnly
                      required
                    />
                  </div>

                  {/* Gender */}
                  <div
                    className={`transform transition-all duration-500 ${
                      isLoaded
                        ? "translate-y-0 opacity-100"
                        : "translate-y-4 opacity-0"
                    }`}
                    style={{ animationDelay: "600ms" }}
                  >
                    <FormField
                      type="select"
                      name="gender"
                      label={t("barangayOfficials.form.fields.gender")}
                      placeholder={t(
                        "barangayOfficials.form.placeholders.gender"
                      )}
                      options={genders.map((gender) => ({
                        value: gender,
                        label: gender.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                          ).join(' '),
                      }))}
                      readOnly
                      required
                    />
                  </div>

                  {/* Birthdate */}
                  <div
                    className={`transform transition-all duration-500 ${
                      isLoaded
                        ? "translate-y-0 opacity-100"
                        : "translate-y-4 opacity-0"
                    }`}
                    style={{ animationDelay: "650ms" }}
                  >
                    <FormField
                      name="birth_date"
                      label={t("barangayOfficials.form.fields.birthDate")}
                      type="date"
                      readOnly
                      required
                    />
                  </div>

                  {/* Contact Number */}
                  <div
                    className={`transform transition-all duration-500 ${
                      isLoaded
                        ? "translate-y-0 opacity-100"
                        : "translate-y-4 opacity-0"
                    }`}
                    style={{ animationDelay: "700ms" }}
                  >
                    <FormField
                      name="mobile_number"
                      label={t("barangayOfficials.form.fields.mobileNumber")}
                      type="tel"
                      placeholder={t(
                        "barangayOfficials.form.placeholders.mobileNumber"
                      )}
                      required
                      readOnly
                    />
                  </div>

                  {/* Email Address */}
                  <div
                    className={`transform transition-all duration-500 ${
                      isLoaded
                        ? "translate-y-0 opacity-100"
                        : "translate-y-4 opacity-0"
                    }`}
                    style={{ animationDelay: "750ms" }}
                  >
                    <FormField
                      name="email_address"
                      label={t("barangayOfficials.form.fields.emailAddress")}
                      type="email"
                      placeholder={t(
                        "barangayOfficials.form.placeholders.emailAddress"
                      )}
                      required
                      readOnly
                    />
                  </div>

                  {/* Complete Address */}
                  <div
                    className={`transform transition-all duration-500 ${
                      isLoaded
                        ? "translate-y-0 opacity-100"
                        : "translate-y-4 opacity-0"
                    }`}
                    style={{ animationDelay: "800ms" }}
                  >
                    <FormField
                      name="complete_address"
                      label={t("barangayOfficials.form.fields.completeAddress")}
                      // type="textarea"
                      placeholder={t(
                        "barangayOfficials.form.placeholders.completeAddress"
                      )}
                      required
                      readOnly
                    />
                  </div>

                  {/* Civil Status */}
                  <div
                    className={`transform transition-all duration-500 ${
                      isLoaded
                        ? "translate-y-0 opacity-100"
                        : "translate-y-4 opacity-0"
                    }`}
                    style={{ animationDelay: "850ms" }}
                  >
                    <FormField
                      name="civil_status"
                      label={t("barangayOfficials.form.fields.civilStatus")}
                      type="select"
                      placeholder={t(
                        "barangayOfficials.form.placeholders.selectCivilStatus"
                      )}
                      options={civilStatuses.map((civilStatus) => ({
                        value: civilStatus,
                        label: civilStatus.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                          ).join(' '),
                      }))}
                      readOnly
                    />
                  </div>

                  {/* Educational Background */}
                  <div
                    className={`transform transition-all duration-500 ${
                      isLoaded
                        ? "translate-y-0 opacity-100"
                        : "translate-y-4 opacity-0"
                    }`}
                    style={{ animationDelay: "900ms" }}
                  >
                    <FormField
                      name="educational_attainment"
                      type="select"
                      label={t(
                        "barangayOfficials.form.fields.educationalAttainment"
                      )}
                      placeholder={t(
                        "barangayOfficials.form.placeholders.educationalAttainment"
                      )}
                      readOnly
                      options={educationalAttainments.map((educ) => ({
                        value: educ,
                        label: educ.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                          ).join(' ')
                      }))}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Term Information */}
            <section className="mb-8">
              <h2
                className={`text-lg font-semibold text-darktext mb-4 border-l-4 border-smblue-400 pl-4 transform transition-all duration-500 ${
                  isLoaded
                    ? "translate-y-0 opacity-100"
                    : "translate-y-4 opacity-0"
                }`}
                style={{ animationDelay: "950ms" }}
              >
                Term Information
              </h2>
              <div className="border-b border-gray-200 mb-6"></div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Position */}
                <div
                  className={`transform transition-all duration-500 ${
                    isLoaded
                      ? "translate-y-0 opacity-100"
                      : "translate-y-4 opacity-0"
                  }`}
                  style={{ animationDelay: "625ms" }}
                >
                  <FormField
                    name="position"
                    label={t("barangayOfficials.form.fields.position")}
                    type="select"
                    placeholder={t(
                      "barangayOfficials.form.placeholders.position"
                    )}
                    options={positions.map((position) => ({
                      value: position,
                      label: position.split('_').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                        ).join(' ')
                    }))}
                    required
                  />
                </div>

                {/* Committee Assignment */}
                <div
                  className={`transform transition-all duration-500 ${
                    isLoaded
                      ? "translate-y-0 opacity-100"
                      : "translate-y-4 opacity-0"
                  }`}
                  style={{ animationDelay: "1000ms" }}
                >
                  <FormField
                    name="committee_assignment"
                    label={t(
                      "barangayOfficials.form.fields.committeeAssignment"
                    )}
                    type="select"
                    placeholder={t(
                      "barangayOfficials.form.placeholders.committeeAssignment"
                    )}
                    options={committeeAssignments.map((assignment) => ({
                      value: assignment,
                      label: assignment,
                    }))}
                    required
                  />
                </div>

                {/* Term Start */}
                <div
                  className={`transform transition-all duration-500 ${
                    isLoaded
                      ? "translate-y-0 opacity-100"
                      : "translate-y-4 opacity-0"
                  }`}
                  style={{ animationDelay: "1050ms" }}
                >
                  <FormField
                    name="term_start"
                    label={t("barangayOfficials.form.fields.termStart")}
                    type="date"
                    required
                  />
                </div>

                {/* Term End */}
                <div
                  className={`transform transition-all duration-500 ${
                    isLoaded
                      ? "translate-y-0 opacity-100"
                      : "translate-y-4 opacity-0"
                  }`}
                  style={{ animationDelay: "1100ms" }}
                >
                  <FormField
                    name="term_end"
                    label={t("barangayOfficials.form.fields.termEnd")}
                    type="date"
                    required
                  />
                </div>
              </div>
            </section>

            {/* Action Buttons */}
            <div
              className={`flex justify-between items-center pt-6 border-t border-gray-200 transform transition-all duration-500 ${
                isLoaded
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
              }`}
              style={{ animationDelay: "1150ms" }}
            >
              <button
                type="button"
                onClick={saveDraft}
                disabled={isSubmitting}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 hover:shadow-sm"
              >
                {/* {isSavingDraft && (
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                )}
                <span>{isSavingDraft ? "Saving Draft..." : "Save Draft"}</span> */}
                <span>Save Draft</span>
              </button>

              <div className="flex space-x-4">
                {/* Cancel button */}
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-sm"
                >
                  Cancel
                </button>

                {/* Submit button */}
                <button
                  type="submit"
                  onClick={handleSubmitButton}
                  disabled={isSubmitting || !residentIdField || !isResidentValidNewOfficial}
                  className="px-6 py-2 bg-smblue-400 text-white rounded-lg hover:bg-smblue-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 hover:shadow-sm"
                >
                  {isSubmitting && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {/* <span>{isSubmitting ? (official?.id ? 'Updating...' : 'Creating...') : (official?.id ? 'Save Changes' : 'Create Official')}</span> */}
                  <span>
                    {isSubmitting ? "Creating..." : "Create Official"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </FormProvider>

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
          <div
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg shadow-lg border ${
              toast.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {toast.type === "success" ? (
              <FiCheck className="w-5 h-5 text-green-600" />
            ) : (
              <FiX className="w-5 h-5 text-red-600" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
            <button
              onClick={() =>
                setToast({ show: false, message: "", type: "success" })
              }
              className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Close notification"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </main>
  );
};