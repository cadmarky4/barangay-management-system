import React, { useRef } from "react";
import { User, Phone, Mail, MapPin, Check } from "lucide-react";
import { type ViewAppointment } from "@/services/helpDesk/appointments/appointments.types";
import { FormField } from "@/components/_global/components/FormField";
import { SearchResidents } from "../../../SearchResidents";
import { useSearchFilterResident } from "../../../_contexts/searchResidentContex";

interface RequesterInformationSectionProps {
  appointment: ViewAppointment;
  mode: "view" | "edit";
}

export const RequesterInformationSection: React.FC<
  RequesterInformationSectionProps
> = ({ appointment, mode }) => {
  const {
    // RESIDENT FIELDS
    isResident,
    setIsResident,
    searchResident,
    filteredResidents,
    isLoadingResidents,
    residentsError,
    residentIdField,
    setSelectedResidentId,
  } = useSearchFilterResident();

  const searchRef = useRef(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b">
        <User className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold">Requester Information</h3>
      </div>

      <div>
        {mode === "view" ? null : (
          <div>
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
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          {mode === "view" ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div>
                <p className="text-sm text-gray-900">
                  {appointment.ticket.requester_name}
                </p>
                {isResident && (
                  <div className="flex items-center gap-1">
                    <Check className="text-green-600 w-4 h-4" />{" "}
                    <span className="text-sm text-green-600">
                      Registered resident
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <FormField
              name="ticket.requester_name"
              label="Full Name"
              placeholder="Enter full name"
              required
              readOnly={isResident !== undefined && residentIdField !== null}
            />
          )}
        </div>

        <div>
          {mode === "view" ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Number
              </label>
              <p className="text-sm text-gray-900 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                {appointment.ticket.contact_number}
              </p>
            </div>
          ) : (
            <FormField
              name="ticket.contact_number"
              label="Contact Number"
              placeholder="Enter contact number"
              required
              readOnly={
                residentIdField !== undefined && residentIdField !== null
              }
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          {mode === "view" ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <p className="text-sm text-gray-900 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {appointment.ticket.email_address || "Not provided"}
              </p>
            </div>
          ) : (
            <FormField
              type="email"
              name="ticket.email_address"
              label="Email Address"
              placeholder="Enter email address"
              readOnly={
                residentIdField !== undefined && residentIdField !== null
              }
            />
          )}
        </div>

        <div>
          {mode === "view" ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Complete Address
              </label>
              <p className="text-sm text-gray-900 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {appointment.ticket.complete_address}
              </p>
            </div>
          ) : (
            <FormField
              name="ticket.complete_address"
              label="Complete Address"
              placeholder="Enter complete address"
              required
              readOnly={
                residentIdField !== undefined && residentIdField !== null
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};
