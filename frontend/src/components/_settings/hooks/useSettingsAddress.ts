// ============================================================================
// hooks/settings/useSettingsAddress.ts - Settings address cascade hook
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
  if (psgcDataCache) {
    return psgcDataCache;
  }

  try {
    psgcDataCache = psgcRawData as PSGCData;
    return psgcDataCache;
  } catch (error) {
    console.error('Error loading PSGC data:', error);
    throw new Error('Failed to load address data');
  }
};

export const useSettingsAddress = () => {
  const [regions, setRegions] = useState<AddressOption[]>([]);
  const [provinces, setProvinces] = useState<AddressOption[]>([]);
  const [cities, setCities] = useState<AddressOption[]>([]);
  const [barangays, setBarangays] = useState<AddressOption[]>([]);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [selectedRegionCode, setSelectedRegionCode] = useState<string>('');
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<string>('');
  const [selectedCityCode, setSelectedCityCode] = useState<string>('');

  // Load initial regions
  useEffect(() => {
    const initializeRegions = async () => {
      setIsLoadingAddress(true);
      try {
        const psgcData = await loadPSGCData();
        const regionOptions: AddressOption[] = Object.values(psgcData).map(region => ({
          code: region.psgc,
          name: region.name
        }));
        
        // Sort regions
        regionOptions.sort((a, b) => a.name.localeCompare(b.name));
        setRegions(regionOptions);
      } catch (error) {
        console.error('Error loading regions:', error);
      } finally {
        setIsLoadingAddress(false);
      }
    };

    initializeRegions();
  }, []);

  const loadProvinces = useCallback(async (regionCode: string) => {
    if (!regionCode) {
      setProvinces([]);
      setCities([]);
      setBarangays([]);
      return;
    }

    setIsLoadingAddress(true);
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
      setProvinces([]);
      setCities([]);
      setBarangays([]);
    } finally {
      setIsLoadingAddress(false);
    }
  }, []);

  const loadCities = useCallback(async (regionCode: string, provinceCode: string) => {
    if (!provinceCode) {
      setCities([]);
      setBarangays([]);
      return;
    }

    setIsLoadingAddress(true);
    try {
      const psgcData = await loadPSGCData();
      const selectedRegion = psgcData[regionCode];
      
      if (!selectedRegion) {
        throw new Error('Region not found');
      }

      let cityOptions: AddressOption[] = [];

      // Check if this is NCR/Metro Manila
      if (provinceCode === 'METRO_MANILA' && selectedRegion.cities) {
        // For NCR, get cities directly from region
        cityOptions = Object.values(selectedRegion.cities).map(city => ({
          code: city.psgc,
          name: city.name
        }));
      } else {
        // For other provinces, get cities/municipalities from province
        const selectedProvince = selectedRegion.provinces[provinceCode];
        if (selectedProvince) {
          const cities = selectedProvince.cities || {};
          const municipalities = selectedProvince.municipalities || {};
          
          cityOptions = [
            ...Object.values(cities).map(city => ({
              code: city.psgc,
              name: city.name
            })),
            ...Object.values(municipalities).map(municipality => ({
              code: municipality.psgc,
              name: municipality.name
            }))
          ];
        }
      }

      // Sort cities alphabetically
      cityOptions.sort((a, b) => a.name.localeCompare(b.name));
      setCities(cityOptions);
      setBarangays([]);
    } catch (error) {
      console.error('Error loading cities:', error);
      setCities([]);
      setBarangays([]);
    } finally {
      setIsLoadingAddress(false);
    }
  }, []);

  const loadBarangays = useCallback(async (regionCode: string, provinceCode: string, cityCode: string) => {
    if (!cityCode) {
      setBarangays([]);
      return;
    }

    setIsLoadingAddress(true);
    try {
      const psgcData = await loadPSGCData();
      const selectedRegion = psgcData[regionCode];
      
      if (!selectedRegion) {
        throw new Error('Region not found');
      }

      let selectedCity: PSGCCity | undefined;

      // Check if this is NCR/Metro Manila
      if (provinceCode === 'METRO_MANILA' && selectedRegion.cities) {
        selectedCity = selectedRegion.cities[cityCode];
      } else {
        // For other provinces
        const selectedProvince = selectedRegion.provinces[provinceCode];
        if (selectedProvince) {
          selectedCity = selectedProvince.cities?.[cityCode] || selectedProvince.municipalities?.[cityCode];
        }
      }

      if (selectedCity && selectedCity.barangays) {
        const barangayOptions: AddressOption[] = Object.values(selectedCity.barangays).map(barangay => ({
          code: barangay.psgc,
          name: barangay.name
        }));

        // Sort barangays alphabetically
        barangayOptions.sort((a, b) => a.name.localeCompare(b.name));
        setBarangays(barangayOptions);
      } else {
        setBarangays([]);
      }
    } catch (error) {
      console.error('Error loading barangays:', error);
      setBarangays([]);
    } finally {
      setIsLoadingAddress(false);
    }
  }, []);

  const handleRegionChange = useCallback((regionCode: string) => {
    setSelectedRegionCode(regionCode);
    setSelectedProvinceCode('');
    setSelectedCityCode('');
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
    setSelectedCityCode('');
    if (provinceCode && selectedRegionCode) {
      loadCities(selectedRegionCode, provinceCode);
    } else {
      setCities([]);
      setBarangays([]);
    }
  }, [loadCities, selectedRegionCode]);

  const handleCityChange = useCallback((cityCode: string) => {
    setSelectedCityCode(cityCode);
    if (cityCode && selectedRegionCode && selectedProvinceCode) {
      loadBarangays(selectedRegionCode, selectedProvinceCode, cityCode);
    } else {
      setBarangays([]);
    }
  }, [loadBarangays, selectedRegionCode, selectedProvinceCode]);

  const handleBarangayChange = useCallback((_barangayCode: string) => {
    // For barangay, we just track the selection
    // No further cascading needed
  }, []);

  const loadInitialAddress = useCallback(async (region?: string, province?: string, city?: string, _barangay?: string) => {
    if (!region) return;

    setIsLoadingAddress(true);
    try {
      // Set initial region
      setSelectedRegionCode(region);
      await loadProvinces(region);

      if (province) {
        setSelectedProvinceCode(province);
        await loadCities(region, province);

        if (city) {
          setSelectedCityCode(city);
          await loadBarangays(region, province, city);

          // Note: barangay selection is handled by the form itself
          // We just load the options, the form will set the selected value
        }
      }
    } catch (error) {
      console.error('Error loading initial address:', error);
    } finally {
      setIsLoadingAddress(false);
    }
  }, [loadProvinces, loadCities, loadBarangays]);

  return {
    regions,
    provinces,
    cities,
    barangays,
    isLoadingAddress,
    handleRegionChange,
    handleProvinceChange,
    handleCityChange,
    handleBarangayChange,
    loadInitialAddress,
    selectedRegionCode,
    selectedProvinceCode,
    selectedCityCode
  };
};
