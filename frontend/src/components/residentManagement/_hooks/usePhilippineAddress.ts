// ============================================================================
// hooks/residents/usePhilippineAddress.ts - Philippine address data hook with nested PSGC.json
// ============================================================================

import { useState, useEffect, useCallback } from 'react';

interface AddressOption {
  code: string;
  name: string;
}

interface PSGCBarangay {
  psgc: string;
  name: string;
  level: string;
  correspondenceCode: string;
}

interface PSGCCity {
  psgc: string;
  name: string;
  level: string;
  correspondenceCode: string;
  barangays: Record<string, PSGCBarangay>;
}

interface PSGCProvince {
  psgc: string;
  name: string;
  level: string;
  correspondenceCode: string;
  cities?: Record<string, PSGCCity>;
  municipalities?: Record<string, PSGCCity>;
}

interface PSGCRegion {
  psgc: string;
  name: string;
  level: string;
  correspondenceCode: string;
  provinces: Record<string, PSGCProvince>;
  cities?: Record<string, PSGCCity>; // NCR has cities directly under region
}

type PSGCData = Record<string, PSGCRegion>;

import psgcRawData from '@/assets/psgc.json';

// Cache for PSGC data
let psgcDataCache: PSGCData | null = null;

const loadPSGCData = async (): Promise<PSGCData> => {
  // Return cached data if available
  if (psgcDataCache) {
    return psgcDataCache;
  }

  try {
    // Type assertion to ensure the imported data matches our PSGCData interface
    psgcDataCache = psgcRawData as PSGCData;
    
    // Validate the data structure to ensure type safety
    if (!psgcDataCache || typeof psgcDataCache !== 'object') {
      throw new Error('Invalid PSGC data structure');
    }

    // Basic validation - check if we have regions with expected structure
    const regionKeys = Object.keys(psgcDataCache);
    if (regionKeys.length === 0) {
      throw new Error('No regions found in PSGC data');
    }

    // Validate first region structure
    const firstRegion = psgcDataCache[regionKeys[0]];
    if (!firstRegion || !firstRegion.name || !firstRegion.provinces) {
      throw new Error('Invalid region structure in PSGC data');
    }

    return psgcDataCache;
  } catch (error) {
    console.error('Error loading PSGC data:', error);
    // Reset cache on error
    psgcDataCache = null;
    throw error;
  }
};

export function usePhilippineAddress() {
  const [regions, setRegions] = useState<AddressOption[]>([]);
  const [provinces, setProvinces] = useState<AddressOption[]>([]);
  const [cities, setCities] = useState<AddressOption[]>([]);
  const [barangays, setBarangays] = useState<AddressOption[]>([]);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track selected items for context in nested searches
  const [selectedRegionCode, setSelectedRegionCode] = useState<string>('');
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<string>('');
  const [selectedCityCode, setSelectedCityCode] = useState<string>('');

  // Initialize by loading regions
  useEffect(() => {
    const initializeRegions = async () => {
      if (isInitialized) return;

      setIsLoadingAddress(true);
      setError(null);

      try {
        const psgcData = await loadPSGCData();
        const regionOptions = Object.values(psgcData).map(region => ({
          code: region.psgc,
          name: region.name
        }));

        // Sort regions alphabetically
        regionOptions.sort((a, b) => a.name.localeCompare(b.name));

        setRegions(regionOptions);
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing regions:', error);
        setError('Failed to load address data. Please try again.');
        
        // Fallback to basic NCR data if PSGC fails
        setRegions([
          { code: '130000000', name: 'National Capital Region (NCR)' }
        ]);
      } finally {
        setIsLoadingAddress(false);
      }
    };

    initializeRegions();
  }, [isInitialized]);

  const loadProvinces = useCallback(async (regionCode: string) => {
    if (!regionCode) {
      setProvinces([]);
      setCities([]);
      setBarangays([]);
      return;
    }

    setIsLoadingAddress(true);
    setError(null);

    try {
      const psgcData = await loadPSGCData();
      const selectedRegion = psgcData[regionCode];
      
      if (!selectedRegion) {
        throw new Error('Region not found');
      }

      // Check if this is NCR (has cities directly under region)
      const isNCR = selectedRegion.cities && Object.keys(selectedRegion.cities).length > 0;

      let provinceOptions: AddressOption[];

      if (isNCR) {
        // For NCR, create a virtual "Metro Manila" province entry
        provinceOptions = [{
          code: 'METRO_MANILA',
          name: 'Metro Manila'
        }];
      } else {
        // For other regions, list actual provinces
        provinceOptions = Object.values(selectedRegion.provinces).map(province => ({
          code: province.psgc,
          name: province.name
        }));
        
        // Sort provinces alphabetically
        provinceOptions.sort((a, b) => a.name.localeCompare(b.name));
      }

      setProvinces(provinceOptions);
      setCities([]);
      setBarangays([]);
    } catch (error) {
      console.error('Error loading provinces:', error);
      setError('Failed to load provinces. Please try again.');
      setProvinces([]);
      setCities([]);
      setBarangays([]);
    } finally {
      setIsLoadingAddress(false);
    }
  }, []);

  const loadCities = useCallback(async (provinceCode: string) => {
    if (!provinceCode) {
      setCities([]);
      setBarangays([]);
      return;
    }

    setIsLoadingAddress(true);
    setError(null);

    try {
      const psgcData = await loadPSGCData();
      
      // Special handling for NCR "Metro Manila" virtual province
      if (provinceCode === 'METRO_MANILA') {
        // Find NCR region and get cities directly from it
        const ncrCities: AddressOption[] = [];
        
        for (const region of Object.values(psgcData)) {
          // Check if this region has cities directly (NCR structure)
          if (region.cities && Object.keys(region.cities).length > 0) {
            // Get all cities from NCR region
            Object.values(region.cities).forEach(city => {
              ncrCities.push({
                code: city.psgc,
                name: city.name
              });
            });
            break;
          }
        }
        
        // Sort NCR cities alphabetically
        ncrCities.sort((a, b) => a.name.localeCompare(b.name));
        setCities(ncrCities);
        setBarangays([]);
        return;
      }

      // For regular provinces, find the province across all regions
      let selectedProvince: PSGCProvince | null = null;
      
      for (const region of Object.values(psgcData)) {
        const province = region.provinces[provinceCode];
        if (province) {
          selectedProvince = province;
          break;
        }
      }

      if (!selectedProvince) {
        throw new Error('Province not found');
      }

      // Combine cities and municipalities into one array
      const cityOptions: AddressOption[] = [];
      
      // Add cities if they exist
      if (selectedProvince.cities) {
        Object.values(selectedProvince.cities).forEach(city => {
          cityOptions.push({
            code: city.psgc,
            name: city.name
          });
        });
      }
      
      // Add municipalities if they exist
      if (selectedProvince.municipalities) {
        Object.values(selectedProvince.municipalities).forEach(municipality => {
          cityOptions.push({
            code: municipality.psgc,
            name: municipality.name
          });
        });
      }

      // Sort alphabetically
      cityOptions.sort((a, b) => a.name.localeCompare(b.name));

      setCities(cityOptions);
      setBarangays([]);
    } catch (error) {
      console.error('Error loading cities:', error);
      setError('Failed to load cities. Please try again.');
      setCities([]);
      setBarangays([]);
    } finally {
      setIsLoadingAddress(false);
    }
  }, []);

  const loadBarangays = useCallback(async (cityCode: string) => {
    if (!cityCode) {
      setBarangays([]);
      return;
    }

    setIsLoadingAddress(true);
    setError(null);

    try {
      const psgcData = await loadPSGCData();
      
      // Find the city/municipality across all regions and provinces
      let selectedCity: PSGCCity | null = null;
      
      // First check if it's an NCR city (directly under region)
      for (const region of Object.values(psgcData)) {
        if (region.cities && region.cities[cityCode]) {
          selectedCity = region.cities[cityCode];
          break;
        }
      }
      
      // If not found in NCR, check provinces
      if (!selectedCity) {
        for (const region of Object.values(psgcData)) {
          for (const province of Object.values(region.provinces)) {
            // Check in cities
            if (province.cities && province.cities[cityCode]) {
              selectedCity = province.cities[cityCode];
              break;
            }
            // Check in municipalities
            if (province.municipalities && province.municipalities[cityCode]) {
              selectedCity = province.municipalities[cityCode];
              break;
            }
          }
          if (selectedCity) break;
        }
      }

      if (!selectedCity) {
        throw new Error('City/Municipality not found');
      }

      const barangayOptions = Object.values(selectedCity.barangays).map(barangay => ({
        code: barangay.psgc,
        name: barangay.name
      }));

      // Sort alphabetically
      barangayOptions.sort((a, b) => a.name.localeCompare(b.name));

      setBarangays(barangayOptions);
    } catch (error) {
      console.error('Error loading barangays:', error);
      setError('Failed to load barangays. Please try again.');
      setBarangays([]);
    } finally {
      setIsLoadingAddress(false);
    }
  }, []);

  // Retry function for error recovery
  const retry = useCallback(() => {
    setError(null);
    setIsInitialized(false);
    psgcDataCache = null;
    // Reset all selected context
    setSelectedRegionCode('');
    setSelectedProvinceCode('');
    setSelectedCityCode('');
  }, []);

  // Helper function to get address names by codes
  const getAddressNames = useCallback(async (codes: {
    regionCode?: string;
    provinceCode?: string;
    cityCode?: string;
    barangayCode?: string;
  }) => {
    try {
      const psgcData = await loadPSGCData();
      
      const result = {
        regionName: '',
        provinceName: '',
        cityName: '',
        barangayName: ''
      };

      // Get region name
      if (codes.regionCode && psgcData[codes.regionCode]) {
        result.regionName = psgcData[codes.regionCode].name;
      }

      // Get province name (handle NCR special case)
      if (codes.provinceCode) {
        if (codes.provinceCode === 'METRO_MANILA') {
          result.provinceName = 'Metro Manila';
        } else {
          for (const region of Object.values(psgcData)) {
            const province = region.provinces[codes.provinceCode];
            if (province) {
              result.provinceName = province.name;
              break;
            }
          }
        }
      }

      // Get city/municipality name
      if (codes.cityCode) {
        // First check NCR cities (directly under region)
        for (const region of Object.values(psgcData)) {
          if (region.cities && region.cities[codes.cityCode]) {
            result.cityName = region.cities[codes.cityCode].name;
            break;
          }
        }
        
        // If not found in NCR, check provinces
        if (!result.cityName) {
          for (const region of Object.values(psgcData)) {
            for (const province of Object.values(region.provinces)) {
              // Check in cities
              if (province.cities && province.cities[codes.cityCode]) {
                result.cityName = province.cities[codes.cityCode].name;
                break;
              }
              // Check in municipalities
              if (province.municipalities && province.municipalities[codes.cityCode]) {
                result.cityName = province.municipalities[codes.cityCode].name;
                break;
              }
            }
            if (result.cityName) break;
          }
        }
      }

      // Get barangay name
      if (codes.barangayCode) {
        // First check NCR cities (directly under region)
        for (const region of Object.values(psgcData)) {
          if (region.cities) {
            for (const city of Object.values(region.cities)) {
              if (city.barangays[codes.barangayCode]) {
                result.barangayName = city.barangays[codes.barangayCode].name;
                break;
              }
            }
          }
          if (result.barangayName) break;
        }
        
        // If not found in NCR, check provinces
        if (!result.barangayName) {
          for (const region of Object.values(psgcData)) {
            for (const province of Object.values(region.provinces)) {
              // Check in cities
              if (province.cities) {
                for (const city of Object.values(province.cities)) {
                  if (city.barangays[codes.barangayCode]) {
                    result.barangayName = city.barangays[codes.barangayCode].name;
                    break;
                  }
                }
              }
              // Check in municipalities
              if (province.municipalities) {
                for (const municipality of Object.values(province.municipalities)) {
                  if (municipality.barangays[codes.barangayCode]) {
                    result.barangayName = municipality.barangays[codes.barangayCode].name;
                    break;
                  }
                }
              }
              if (result.barangayName) break;
            }
            if (result.barangayName) break;
          }
        }
      }

      return result;
    } catch (error) {
      console.error('Error getting address names:', error);
      return {
        regionName: '',
        provinceName: '',
        cityName: '',
        barangayName: ''
      };
    }
  }, []);

  // Handler functions that update internal state and trigger cascading
  const handleRegionChange = useCallback((regionCode: string) => {
    setSelectedRegionCode(regionCode);
    if (regionCode) {
      loadProvinces(regionCode);
    } else {
      setProvinces([]);
      setCities([]);
      setBarangays([]);
    }
  }, [loadProvinces]);

  const handleProvinceChange = useCallback((provinceCode: string) => {
    setSelectedProvinceCode(provinceCode);
    if (provinceCode) {
      loadCities(provinceCode);
    } else {
      setCities([]);
      setBarangays([]);
    }
  }, [loadCities]);

  const handleCityChange = useCallback((cityCode: string) => {
    setSelectedCityCode(cityCode);
    if (cityCode) {
      loadBarangays(cityCode);
    } else {
      setBarangays([]);
    }
  }, [loadBarangays]);

  const handleBarangayChange = useCallback((_barangayCode: string) => {
    // For barangay, we just track the selection
    // No further cascading needed
  }, []);

  return {
    regions,
    provinces,
    cities,
    barangays,
    loadProvinces,
    loadCities,
    loadBarangays,
    handleRegionChange,
    handleProvinceChange,
    handleCityChange,
    handleBarangayChange,
    isLoadingAddress,
    isInitialized,
    error,
    retry,
    getAddressNames,
    // Expose selected context for debugging or external use
    selectedRegionCode,
    selectedProvinceCode,
    selectedCityCode
  };
}