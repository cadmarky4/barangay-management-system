import React, { useState, useEffect, useCallback } from 'react';
import { FiSettings, FiShield, FiServer, FiLoader, FiSave, FiRotateCcw, FiDownload, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { ZodError } from 'zod';
import { 
  settingsService, 
  type SettingsData, 
  SettingsSection 
} from '../../services/settings/settings.service';
import { useSettingsAddress } from './hooks/useSettingsAddress';
import TimeInput from '../ui/TimeInput';

interface ValidationError {
  field: string;
  message: string;
}

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsSection>(SettingsSection.GENERAL);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [backing, setBacking] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});

  const [formData, setFormData] = useState<SettingsData>({
    // General Information
    barangay: '',
    city: '',
    province: '',
    region: '',
    type: 'Urban',
    contactNumber: '',
    emailAddress: '',
    openingHours: '',
    closingHours: '',
    primaryLanguage: '',
    secondaryLanguage: '',
    
    // Privacy and Security
    sessionTimeout: '30',
    maxLoginAttempts: '3',
    dataRetention: '7',
    backupFrequency: 'Daily',
    
    // System
    systemName: '',
    versionNumber: ''
  });
  const [originalData, setOriginalData] = useState<SettingsData | null>(null);

  // Address cascade hook
  const {
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
  } = useSettingsAddress();

  // Clear messages after timeout
  const clearMessages = () => {
    setTimeout(() => {
      setSuccessMessage('');
      setErrorMessage('');
    }, 5000);
  };

  // Parse Zod validation errors
  const parseZodErrors = (error: ZodError): ValidationError[] => {
    return error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message
    }));
  };

  // Fetch settings from API
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      
      const settings = await settingsService.getSettings();
      setFormData(settings);
      setOriginalData(settings);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setErrorMessage('Failed to load settings. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle initial address loading when regions are available and formData has address data
  useEffect(() => {
    const loadInitialAddressData = async () => {
      if (regions.length > 0 && formData.region && !isLoadingAddress) {
        const regionCode = regions.find(r => r.name === formData.region)?.code || '';
        if (regionCode) {
          await loadInitialAddress(regionCode, formData.province, formData.city, formData.barangay);
        }
      }
    };

    loadInitialAddressData();
  }, [regions, formData.region, formData.province, formData.city, formData.barangay, loadInitialAddress, isLoadingAddress]);

  // Save settings to API
  const saveSettings = async () => {
    try {
      setSaving(true);
      setErrors([]);
      setSuccessMessage('');
      setErrorMessage('');

      // Validate current tab section first
      const isValid = await settingsService.validateSettings(formData, activeTab);
      if (!isValid) {
        setErrorMessage('Please fix validation errors before saving.');
        return;
      }

      const updatedSettings = await settingsService.updateSettings(formData);
      
      setFormData(updatedSettings);
      setOriginalData(updatedSettings);
      setSuccessMessage('Settings saved successfully!');
      clearMessages();
    } catch (error) {
      console.error('Error saving settings:', error);
      
      if (error instanceof ZodError) {
        setErrors(parseZodErrors(error));
      } else {
        setErrorMessage(error instanceof Error ? error.message : 'Failed to save settings. Please try again.');
      }
      clearMessages();
    } finally {
      setSaving(false);
    }
  };

  // Save specific section
  const saveSection = async (section: SettingsSection) => {
    try {
      setSaving(true);
      setErrors([]);
      setSuccessMessage('');
      setErrorMessage('');

      let updatedSettings: SettingsData;

      switch (section) {
        case SettingsSection.GENERAL:
          updatedSettings = await settingsService.updateGeneralSettings(formData);
          break;
        case SettingsSection.PRIVACY:
          updatedSettings = await settingsService.updatePrivacySettings(formData);
          break;
        case SettingsSection.SYSTEM:
          updatedSettings = await settingsService.updateSystemSettings(formData);
          break;
        default:
          updatedSettings = await settingsService.updateSettings(formData);
          break;
      }

      setFormData(updatedSettings);
      setOriginalData(updatedSettings);
      setSuccessMessage(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved successfully!`);
      clearMessages();
    } catch (error) {
      console.error('Error saving section:', error);
      
      if (error instanceof ZodError) {
        setErrors(parseZodErrors(error));
      } else {
        setErrorMessage(error instanceof Error ? error.message : 'Failed to save settings. Please try again.');
      }
      clearMessages();
    } finally {
      setSaving(false);
    }
  };

  // Reset settings to default values
  const resetSettings = async () => {
    if (!window.confirm('Are you sure you want to reset all settings to default values? This action cannot be undone.')) {
      return;
    }

    try {
      setSaving(true);
      setErrors([]);
      setSuccessMessage('');
      setErrorMessage('');

      const defaultSettings = await settingsService.resetSettings();
      
      setFormData(defaultSettings);
      setOriginalData(defaultSettings);
      setSuccessMessage('Settings reset to default values successfully!');
      clearMessages();
    } catch (error) {
      console.error('Error resetting settings:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to reset settings. Please try again.');
      clearMessages();
    } finally {
      setSaving(false);
    }
  };

  // Test settings configuration
  const testSettings = async (section: SettingsSection = SettingsSection.ALL) => {
    try {
      setTesting(true);
      setTestResults({});
      
      const success = await settingsService.testSettings(section);
      setTestResults({ [section]: success });
      
      if (success) {
        setSuccessMessage(`${section.charAt(0).toUpperCase() + section.slice(1)} settings test passed!`);
      } else {
        setErrorMessage(`${section.charAt(0).toUpperCase() + section.slice(1)} settings test failed. Please check your configuration.`);
      }
      clearMessages();
    } catch (error) {
      console.error('Error testing settings:', error);
      setErrorMessage('Failed to test settings configuration.');
      clearMessages();
    } finally {
      setTesting(false);
    }
  };

  // Create settings backup
  const createBackup = async () => {
    try {
      setBacking(true);
      setSuccessMessage('');
      setErrorMessage('');

      const backup = await settingsService.backupSettings();
      setSuccessMessage(`Backup created successfully! Backup ID: ${backup.timestamp}`);
      clearMessages();
    } catch (error) {
      console.error('Error creating backup:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create backup.');
      clearMessages();
    } finally {
      setBacking(false);
    }
  };

  // Load settings on component mount
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear specific field error when user starts typing
    if (errors.some(err => err.field === name)) {
      setErrors(prev => prev.filter(err => err.field !== name));
    }
  };

  // Special handler for address fields to trigger cascade
  const handleAddressChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear specific field error
    if (errors.some(err => err.field === name)) {
      setErrors(prev => prev.filter(err => err.field !== name));
    }

    // Handle cascading based on field - find the code for the selected name
    switch (name) {
      case 'region': {
        const selectedRegion = regions.find(r => r.name === value);
        const regionCode = selectedRegion ? selectedRegion.code : '';
        handleRegionChange(regionCode);
        // Reset dependent fields
        setFormData(prev => ({
          ...prev,
          province: '',
          city: '',
          barangay: ''
        }));
        break;
      }
      case 'province': {
        const selectedProvince = provinces.find(p => p.name === value);
        const provinceCode = selectedProvince ? selectedProvince.code : '';
        handleProvinceChange(provinceCode);
        // Reset dependent fields
        setFormData(prev => ({
          ...prev,
          city: '',
          barangay: ''
        }));
        break;
      }
      case 'city': {
        const selectedCity = cities.find(c => c.name === value);
        const cityCode = selectedCity ? selectedCity.code : '';
        handleCityChange(cityCode);
        // Reset dependent fields
        setFormData(prev => ({
          ...prev,
          barangay: ''
        }));
        break;
      }
      case 'barangay': {
        const selectedBarangay = barangays.find(b => b.name === value);
        const barangayCode = selectedBarangay ? selectedBarangay.code : '';
        handleBarangayChange(barangayCode);
        break;
      }
    }
  };

  // Check if form has unsaved changes
  const hasUnsavedChanges = () => {
    if (!originalData) return false;
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  };

  // Get field error message
  const getFieldError = (fieldName: string): string | null => {
    const error = errors.find(err => err.field === fieldName);
    return error ? error.message : null;
  };

  // Check if field has error
  const hasFieldError = (fieldName: string): boolean => {
    return errors.some(err => err.field === fieldName);
  };

  const tabs = [
    {
      id: SettingsSection.GENERAL,
      label: 'General Information',
      icon: FiSettings
    },
    {
      id: SettingsSection.PRIVACY,
      label: 'Privacy and Security',
      icon: FiShield
    },
    {
      id: SettingsSection.SYSTEM,
      label: 'System',
      icon: FiServer
    }
  ];

  if (loading) {
    return (
      <main className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <FiLoader className="w-6 h-6 animate-spin text-smblue-400" />
          <span className="text-gray-600">Loading settings...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6 bg-gray-50 min-h-screen flex flex-col gap-4">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold text-darktext">Settings</h1>
        <div className="flex space-x-2">
          <button
            onClick={createBackup}
            disabled={backing}
            className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          >
            {backing ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiDownload className="w-4 h-4" />}
            <span>{backing ? 'Creating...' : 'Backup'}</span>
          </button>
          <button
            onClick={() => testSettings(activeTab)}
            disabled={testing}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          >
            {testing ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiCheckCircle className="w-4 h-4" />}
            <span>{testing ? 'Testing...' : 'Test'}</span>
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center space-x-2">
          <FiCheckCircle className="w-5 h-5" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center space-x-2">
          <FiAlertCircle className="w-5 h-5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Validation Errors */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          <h3 className="font-medium mb-2">Please fix the following errors:</h3>
          <ul className="list-disc list-inside space-y-1">
            {errors.map((error, index) => (
              <li key={index} className="text-sm">
                <strong>{error.field}:</strong> {error.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Test Results */}
      {Object.keys(testResults).length > 0 && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg">
          <h3 className="font-medium mb-2">Test Results:</h3>
          {Object.entries(testResults).map(([section, success]) => (
            <div key={section} className="flex items-center space-x-2">
              {success ? (
                <FiCheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <FiAlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span className="text-sm">
                {section.charAt(0).toUpperCase() + section.slice(1)}: {success ? 'Passed' : 'Failed'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-smblue-400 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {/* General Information Tab */}
        {activeTab === SettingsSection.GENERAL && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-darktext border-l-4 border-smblue-400 pl-4">General Information</h2>
              <button
                onClick={() => saveSection(SettingsSection.GENERAL)}
                disabled={saving}
                className="flex items-center space-x-2 px-4 py-2 bg-smblue-400 hover:bg-smblue-500 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                {saving ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiSave className="w-4 h-4" />}
                <span>{saving ? 'Saving...' : 'Save Section'}</span>
              </button>
            </div>
            <div className="border-b border-gray-200 mb-6"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Region *
                </label>
                <select
                  name="region"
                  value={formData.region}
                  onChange={handleAddressChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200 ${
                    hasFieldError('region') ? 'border-red-300' : 'border-gray-300'
                  } ${isLoadingAddress ? 'cursor-wait' : ''}`}
                  disabled={isLoadingAddress}
                >
                  <option value="">Select Region</option>
                  {regions.map(region => (
                    <option key={region.code} value={region.name}>
                      {region.name}
                    </option>
                  ))}
                </select>
                {getFieldError('region') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('region')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Province *
                </label>
                <select
                  name="province"
                  value={formData.province}
                  onChange={handleAddressChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200 ${
                    hasFieldError('province') ? 'border-red-300' : 'border-gray-300'
                  } ${isLoadingAddress || !formData.region ? 'cursor-not-allowed bg-gray-100' : ''}`}
                  disabled={isLoadingAddress || !formData.region}
                >
                  <option value="">Select Province</option>
                  {provinces.map(province => (
                    <option key={province.code} value={province.name}>
                      {province.name}
                    </option>
                  ))}
                </select>
                {getFieldError('province') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('province')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City/Municipality *
                </label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleAddressChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200 ${
                    hasFieldError('city') ? 'border-red-300' : 'border-gray-300'
                  } ${isLoadingAddress || !formData.province ? 'cursor-not-allowed bg-gray-100' : ''}`}
                  disabled={isLoadingAddress || !formData.province}
                >
                  <option value="">Select City/Municipality</option>
                  {cities.map(city => (
                    <option key={city.code} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                </select>
                {getFieldError('city') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('city')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Barangay *
                </label>
                <select
                  name="barangay"
                  value={formData.barangay}
                  onChange={handleAddressChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200 ${
                    hasFieldError('barangay') ? 'border-red-300' : 'border-gray-300'
                  } ${isLoadingAddress || !formData.city ? 'cursor-not-allowed bg-gray-100' : ''}`}
                  disabled={isLoadingAddress || !formData.city}
                >
                  <option value="">Select Barangay</option>
                  {barangays.map(barangay => (
                    <option key={barangay.code} value={barangay.name}>
                      {barangay.name}
                    </option>
                  ))}
                </select>
                {getFieldError('barangay') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('barangay')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200 ${
                    hasFieldError('type') ? 'border-red-300' : 'border-gray-300'
                  }`}
                  title="Select type"
                >
                  <option value="">Select type</option>
                  <option value="Urban">Urban</option>
                  <option value="Rural">Rural</option>
                  <option value="Highly Urbanized">Highly Urbanized</option>
                </select>
                {getFieldError('type') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('type')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Number *
                </label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200 ${
                    hasFieldError('contactNumber') ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {getFieldError('contactNumber') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('contactNumber')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="emailAddress"
                  value={formData.emailAddress}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200 ${
                    hasFieldError('emailAddress') ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {getFieldError('emailAddress') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('emailAddress')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Opening Hours *
                </label>
                <TimeInput
                  name="openingHours"
                  value={formData.openingHours}
                  onChange={handleInputChange}
                  error={getFieldError('openingHours')}
                  placeholder="Select opening hours"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Closing Hours *
                </label>
                <TimeInput
                  name="closingHours"
                  value={formData.closingHours}
                  onChange={handleInputChange}
                  error={getFieldError('closingHours')}
                  placeholder="Select closing hours"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Language
                </label>
                <input
                  type="text"
                  name="primaryLanguage"
                  value={formData.primaryLanguage}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200 ${
                    hasFieldError('primaryLanguage') ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {getFieldError('primaryLanguage') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('primaryLanguage')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secondary Language
                </label>
                <input
                  type="text"
                  name="secondaryLanguage"
                  value={formData.secondaryLanguage}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200 ${
                    hasFieldError('secondaryLanguage') ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {getFieldError('secondaryLanguage') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('secondaryLanguage')}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Privacy and Security Tab */}
        {activeTab === SettingsSection.PRIVACY && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-darktext border-l-4 border-smblue-400 pl-4">Privacy and Security</h2>
              <button
                onClick={() => saveSection(SettingsSection.PRIVACY)}
                disabled={saving}
                className="flex items-center space-x-2 px-4 py-2 bg-smblue-400 hover:bg-smblue-500 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                {saving ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiSave className="w-4 h-4" />}
                <span>{saving ? 'Saving...' : 'Save Section'}</span>
              </button>
            </div>
            <div className="border-b border-gray-200 mb-6"></div>
            
            {/* Authentication and Authorization */}
            <div className="mb-8">
              <h3 className="text-md font-medium text-gray-800 mb-4">Authentication and Authorization</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Timeout (minutes) *
                  </label>
                  <input
                    type="number"
                    name="sessionTimeout"
                    value={formData.sessionTimeout}
                    onChange={handleInputChange}
                    min="5"
                    max="480"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200 ${
                      hasFieldError('sessionTimeout') ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {getFieldError('sessionTimeout') && (
                    <p className="mt-1 text-sm text-red-600">{getFieldError('sessionTimeout')}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">Between 5 and 480 minutes</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Login Attempts *
                  </label>
                  <input
                    type="number"
                    name="maxLoginAttempts"
                    value={formData.maxLoginAttempts}
                    onChange={handleInputChange}
                    min="1"
                    max="10"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200 ${
                      hasFieldError('maxLoginAttempts') ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {getFieldError('maxLoginAttempts') && (
                    <p className="mt-1 text-sm text-red-600">{getFieldError('maxLoginAttempts')}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">Between 1 and 10 attempts</p>
                </div>
              </div>
            </div>

            {/* Data Retention */}
            <div className="mb-8">
              <h3 className="text-md font-medium text-gray-800 mb-4">Data Retention</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Length of data retention (years) *
                  </label>
                  <input
                    type="number"
                    name="dataRetention"
                    value={formData.dataRetention}
                    onChange={handleInputChange}
                    min="1"
                    max="50"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200 ${
                      hasFieldError('dataRetention') ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {getFieldError('dataRetention') && (
                    <p className="mt-1 text-sm text-red-600">{getFieldError('dataRetention')}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">Between 1 and 50 years</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Backup Frequency
                  </label>
                  <select
                    name="backupFrequency"
                    value={formData.backupFrequency}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200 ${
                      hasFieldError('backupFrequency') ? 'border-red-300' : 'border-gray-300'
                    }`}
                    title="Select backup frequency"
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                  {getFieldError('backupFrequency') && (
                    <p className="mt-1 text-sm text-red-600">{getFieldError('backupFrequency')}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* System Tab */}
        {activeTab === SettingsSection.SYSTEM && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-darktext border-l-4 border-smblue-400 pl-4">System</h2>
              <button
                onClick={() => saveSection(SettingsSection.SYSTEM)}
                disabled={saving}
                className="flex items-center space-x-2 px-4 py-2 bg-smblue-400 hover:bg-smblue-500 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                {saving ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiSave className="w-4 h-4" />}
                <span>{saving ? 'Saving...' : 'Save Section'}</span>
              </button>
            </div>
            <div className="border-b border-gray-200 mb-6"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  System Name
                </label>
                <input
                  type="text"
                  name="systemName"
                  value={formData.systemName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200 ${
                    hasFieldError('systemName') ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {getFieldError('systemName') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('systemName')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Version Number
                </label>
                <input
                  type="text"
                  name="versionNumber"
                  value={formData.versionNumber}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200 ${
                    hasFieldError('versionNumber') ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {getFieldError('versionNumber') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('versionNumber')}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Save and Reset Buttons */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center space-x-4">
            {hasUnsavedChanges() && (
              <p className="text-sm text-amber-600 flex items-center space-x-1">
                <FiAlertCircle className="w-4 h-4" />
                <span>You have unsaved changes</span>
              </p>
            )}
          </div>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={resetSettings}
              disabled={saving}
              className="flex items-center space-x-2 cursor-pointer px-6 py-2 bg-red-500 hover:bg-red-300 disabled:bg-gray-400 text-white rounded-lg transition-colors"
            >
              {saving ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiRotateCcw className="w-4 h-4" />}
              <span>{saving ? 'Resetting...' : 'Reset to Default'}</span>
            </button>
            <button
              type="button"
              onClick={saveSettings}
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-2 bg-smblue-400 hover:bg-smblue-500 disabled:bg-gray-400 text-white rounded-lg transition-colors"
            >
              {saving ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiSave className="w-4 h-4" />}
              <span>{saving ? 'Saving...' : 'Save All Changes'}</span>
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default SettingsPage;