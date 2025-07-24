import { useDebounce } from "@/hooks/useDebounce";
import type { Resident } from "@/services/residents/residents.types";
import { useEffect, useState, type Ref } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FiSearch } from "react-icons/fi";

interface SearchResidentProps {
  headSearchRef: Ref<HTMLDivElement> | undefined;
  search: string;
  isSearchingResidents: boolean;
  filteredResidents: Resident[];
  residentsFetchErrorMessage: string;
  residentSelectErrorMessage: string;
  isCheckingAlreadyRegisteredAsOfficial: boolean,
  onResidentClick: (residentId: string) => void;
}

export const SearchResidents: React.FC<SearchResidentProps> = ({
  headSearchRef,
  search,
  isSearchingResidents,
  filteredResidents,
  residentsFetchErrorMessage,
  residentSelectErrorMessage,
  isCheckingAlreadyRegisteredAsOfficial,
  onResidentClick,
}) => {
  const [showHeadDropdown, setShowHeadDropdown] = useState(false);
  const { register } = useFormContext();
  const { t } = useTranslation();
  // Debounce search to avoid too many API calls
  const debouncedSearchTerm = useDebounce(search, 500);

  const handleResidentClick = (
    e: React.MouseEvent<HTMLDivElement>,
    resident: Resident
  ) => {
    e.preventDefault();
    e.stopPropagation();
    // ganyan muna hanggat di pa sya naseset sa string
    onResidentClick(resident.id);
    setShowHeadDropdown(false);
    // Show notification if person was removed from members
  };

  useEffect(() => {
    if (debouncedSearchTerm.trim()) {
      setShowHeadDropdown(true);
    }
  },[debouncedSearchTerm])

  return (
    <div>
      {residentSelectErrorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800 text-sm">{residentSelectErrorMessage}</p>
        </div>
      )}
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {t("barangayOfficials.form.fields.residentSearch")}
      </label>
      <div className="relative" ref={headSearchRef}>
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />{" "}
        <input
          {...register("resident_search")}
          type="text"
          placeholder={t("barangayOfficials.form.placeholders.residentSearch")}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200"
          onFocus={() => {
            // console.log("SEARCH", search);
            if (debouncedSearchTerm.trim()) {
              setShowHeadDropdown(true);
            }
          }}
          onBlur={(e) => {
            setTimeout(() => {
              if (!e.currentTarget?.contains(document.activeElement)) {
                setShowHeadDropdown(false);
              }
            }, 100);
          }}
          disabled={isCheckingAlreadyRegisteredAsOfficial}
        />
        {/* Loading indicator for search */}
        {isSearchingResidents && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-smblue-400"></div>
          </div>
        )}
        {/* Search Results Dropdown */}
        {showHeadDropdown && filteredResidents.length > 0 && (
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
            {filteredResidents.map((resident) => (
              <div
                key={resident.id}
                className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                onClick={(e) => handleResidentClick(e, resident)}
                // onClick={(e) => console.log("hello po")}
              >
                <p className="font-medium text-gray-900">{`${resident.first_name} ${resident.last_name}`}</p>
                <p className="text-sm text-gray-600">
                  {resident.mobile_number || "No phone"}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* No results message */}
        {showHeadDropdown &&
          debouncedSearchTerm.trim() &&
          !isSearchingResidents &&
          filteredResidents.length === 0 && (
            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
              <p className="text-gray-500 text-sm">
                No residents found matching "{debouncedSearchTerm}"
              </p>
            </div>
          )}

        {/* Failed fetching residents */}
        {showHeadDropdown && residentsFetchErrorMessage && (
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
            <p className="text-gray-500 text-sm">{residentsFetchErrorMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
};
