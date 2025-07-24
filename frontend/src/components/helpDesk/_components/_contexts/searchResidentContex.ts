import { createContext, useContext } from "react";

interface SearchResidentContextProps {
  // RESIDENT ID FIELDS
  isResident: boolean,
  setIsResident: (isResident: boolean) => void,
  searchResident: string | null | undefined,
  filteredResidents: any,
  isLoadingResidents: boolean,
  residentsError: Error | null,
  residentIdField: string | null | undefined,
  setSelectedResidentId: (residentId: string) => void,
}

export const SearchResidentContext = createContext<SearchResidentContextProps | undefined>(undefined);

export const useSearchFilterResident = () => {
  const context = useContext(SearchResidentContext);
  if (!context) {
    throw new Error('no context idk');
  }
  return context;
}