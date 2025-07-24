import React, { useState, useEffect } from 'react';
import { FiUpload, FiX, FiCheck, FiCalendar, FiFileText, FiUser } from 'react-icons/fi';
import Breadcrumb from '../_global/Breadcrumb';

interface FileLeaveProps {
  onClose: () => void;
  onSave: (leaveData: any) => void;
}

const FileLeave: React.FC<FileLeaveProps> = ({ onClose, onSave }) => {
  // Loading and submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Animation trigger on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Toast state
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({ show: false, message: '', type: 'success' });

  // Toast utility function
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Sample officials data - in real app, this would come from props or API
  const officials = [
    { id: 1, name: 'Dela Cruz, Juan', position: 'Barangay Captain' },
    { id: 2, name: 'Jose, Felicity', position: 'Secretary' },
    { id: 3, name: 'Dalia, Emily', position: 'Kagawad' },
    { id: 4, name: 'Diaz, Sebastian', position: 'Kagawad' },
    { id: 5, name: 'Sabaricos, Joe', position: 'Kagawad' },
    { id: 6, name: 'Orebio, David', position: 'Kagawad' },
    { id: 7, name: 'Fulvidar, Emerson', position: 'Kagawad' },
    { id: 8, name: 'Kiniliatis, Bebe', position: 'Kagawad' },
    { id: 9, name: 'Karaniwan, Pepe', position: 'Kagawad' },
    { id: 10, name: 'Vicente, Biboy', position: 'Tanod' },
    { id: 11, name: 'Manaloto, Toribio', position: 'Tanod' }
  ];

  const [formData, setFormData] = useState({
    officialId: '',
    officialName: '',
    position: '',
    leaveType: 'Sick Leave',
    startDate: '',
    endDate: '',
    reason: '',
    medicalCertificate: null as File | null,
    supportingDocuments: [] as File[],
    emergencyContact: '',
    emergencyContactNumber: '',
    workCoverage: '',
    remarks: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // If selecting an official, update related fields
    if (name === 'officialId') {
      const selectedOfficial = officials.find(official => official.id.toString() === value);
      setFormData(prev => ({
        ...prev,
        [name]: value,
        officialName: selectedOfficial?.name || '',
        position: selectedOfficial?.position || ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const files = e.target.files;
    if (files) {
      if (fieldName === 'medicalCertificate') {
        setFormData(prev => ({
          ...prev,
          medicalCertificate: files[0]
        }));
      } else if (fieldName === 'supportingDocuments') {
        setFormData(prev => ({
          ...prev,
          supportingDocuments: [...prev.supportingDocuments, ...Array.from(files)]
        }));
      }
    }
  };

  const removeFile = (fieldName: string, index?: number) => {
    if (fieldName === 'medicalCertificate') {
      setFormData(prev => ({
        ...prev,
        medicalCertificate: null
      }));
    } else if (fieldName === 'supportingDocuments' && index !== undefined) {
      setFormData(prev => ({
        ...prev,
        supportingDocuments: prev.supportingDocuments.filter((_, i) => i !== index)
      }));
    }
  };

  const calculateLeaveDays = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    }
    return 0;
  };

  const handleSaveDraft = () => {
    setIsSavingDraft(true);
    try {
      // In a real app, save to localStorage or API
      setError(null);
      showToast('Draft saved successfully!', 'success');
    } catch (error) {
      showToast('Failed to save draft. Please try again.', 'error');
      console.error('Failed to save draft:', error);
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.officialId || !formData.startDate || !formData.endDate || !formData.reason) {
        throw new Error('Please fill in all required fields.');
      }

      // Transform form data for submission
      const leaveData = {
        official_id: formData.officialId,
        official_name: formData.officialName,
        position: formData.position,
        leave_type: formData.leaveType,
        start_date: formData.startDate,
        end_date: formData.endDate,
        total_days: calculateLeaveDays(),
        reason: formData.reason,
        emergency_contact: formData.emergencyContact,
        emergency_contact_number: formData.emergencyContactNumber,
        work_coverage: formData.workCoverage,
        remarks: formData.remarks,
        status: 'PENDING',
        filed_date: new Date().toISOString().split('T')[0]
      };

      // Use the existing client-side save
      onSave(leaveData);
      
      // Show success toast
      showToast('Leave application filed successfully!', 'success');
      
      // Close after a brief delay to show the toast
      setTimeout(() => {
        onClose();
      }, 1000);

    } catch (err: any) {
      console.error('Error filing leave:', err);
      setError(err.message || "Failed to file leave application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={`p-6 bg-gray-50 min-h-screen flex flex-col gap-4 transition-all duration-500 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {/* Breadcrumb */}
      <Breadcrumb isLoaded={isLoaded} />
      
      {/* Header */}
      <div className={`mb-2 transform transition-all duration-500 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ animationDelay: '100ms' }}>
        <h1 className="text-2xl font-bold text-darktext pl-0">File Leave Application</h1>
        <p className="text-sm text-gray-600 mt-1">Submit a leave request for barangay officials</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className={`bg-red-50 border border-red-200 rounded-lg p-4 mb-4 transform transition-all duration-500 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ animationDelay: '150ms' }}>
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transform transition-all duration-500 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ animationDelay: '250ms' }}>
        
        {/* Official Information */}
        <section className="mb-8">
          <h2 className={`text-lg font-semibold text-darktext mb-4 border-l-4 border-smblue-400 pl-4 transform transition-all duration-500 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ animationDelay: '300ms' }}>
            <div className="flex items-center space-x-2">
              <FiUser className="w-5 h-5" />
              <span>Official Information</span>
            </div>
          </h2>
          <div className="border-b border-gray-200 mb-6"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Select Official */}
            <div className={`transform transition-all duration-500 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ animationDelay: '350ms' }}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Official *
              </label>
              <select
                name="officialId"
                value={formData.officialId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200 transition-all"
                title="Select official"
                required
              >
                <option value="">Choose an official...</option>
                {officials.map(official => (
                  <option key={official.id} value={official.id}>
                    {official.name} - {official.position}
                  </option>
                ))}
              </select>
            </div>

            {/* Official Name (Read-only) */}
            <div className={`transform transition-all duration-500 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ animationDelay: '400ms' }}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Official Name
              </label>
              <input
                type="text"
                name="officialName"
                value={formData.officialName}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                placeholder="Auto-filled when official is selected"
              />
            </div>

            {/* Position (Read-only) */}
            <div className={`transform transition-all duration-500 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ animationDelay: '450ms' }}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Position
              </label>
              <input
                type="text"
                name="position"
                value={formData.position}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                placeholder="Auto-filled when official is selected"
              />
            </div>
          </div>
        </section>

        {/* Leave Details */}
        <section className="mb-8">
          <h2 className={`text-lg font-semibold text-darktext mb-4 border-l-4 border-smblue-400 pl-4 transform transition-all duration-500 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ animationDelay: '500ms' }}>
            <div className="flex items-center space-x-2">
              <FiCalendar className="w-5 h-5" />
              <span>Leave Details</span>
            </div>
          </h2>
          <div className="border-b border-gray-200 mb-6"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Leave Type */}
            <div className={`transform transition-all duration-500 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ animationDelay: '550ms' }}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Leave Type *
              </label>
              <select
                name="leaveType"
                value={formData.leaveType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200 transition-all"
                title="Select leave type"
                required
              >
                <option value="Sick Leave">Sick Leave</option>
                <option value="Vacation Leave">Vacation Leave</option>
                <option value="Emergency Leave">Emergency Leave</option>
                <option value="Maternity Leave">Maternity Leave</option>
                <option value="Paternity Leave">Paternity Leave</option>
                <option value="Bereavement Leave">Bereavement Leave</option>
                <option value="Personal Leave">Personal Leave</option>
              </select>
            </div>

            {/* Start Date */}
            <div className={`transform transition-all duration-500 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ animationDelay: '600ms' }}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200 transition-all"
                required
              />
            </div>

            {/* End Date */}
            <div className={`transform transition-all duration-500 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ animationDelay: '650ms' }}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200 transition-all"
                required
              />
            </div>
          </div>

          {/* Leave Duration Display */}
          {formData.startDate && formData.endDate && (
            <div className={`bg-smblue-50 border border-smblue-200 rounded-lg p-4 mb-6 transform transition-all duration-500 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ animationDelay: '700ms' }}>
              <div className="flex items-center space-x-2">
                <FiCalendar className="w-5 h-5 text-smblue-400" />
                <span className="text-smblue-800 font-medium">
                  Total Leave Duration: {calculateLeaveDays()} day{calculateLeaveDays() !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}

          {/* Reason */}
          <div className={`transform transition-all duration-500 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ animationDelay: '750ms' }}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Leave *
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200 transition-all resize-none"
              placeholder="Please provide a detailed reason for your leave request..."
              required
            />
          </div>
        </section>

        {/* Additional Information */}
        <section className="mb-8">
          <h2 className={`text-lg font-semibold text-darktext mb-4 border-l-4 border-smblue-400 pl-4 transform transition-all duration-500 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ animationDelay: '800ms' }}>
            Additional Information
          </h2>
          <div className="border-b border-gray-200 mb-6"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Emergency Contact */}
            <div className={`transform transition-all duration-500 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ animationDelay: '850ms' }}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emergency Contact Person
              </label>
              <input
                type="text"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200 transition-all"
                placeholder="Full name of emergency contact"
              />
            </div>

            {/* Emergency Contact Number */}
            <div className={`transform transition-all duration-500 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ animationDelay: '900ms' }}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emergency Contact Number
              </label>
              <input
                type="tel"
                name="emergencyContactNumber"
                value={formData.emergencyContactNumber}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200 transition-all"
                placeholder="+63 912 345 6789"
              />
            </div>
          </div>

          {/* Work Coverage */}
          <div className={`mb-6 transform transition-all duration-500 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ animationDelay: '950ms' }}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Work Coverage Arrangement
            </label>
            <textarea
              name="workCoverage"
              value={formData.workCoverage}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200 transition-all resize-none"
              placeholder="Describe how your responsibilities will be covered during your absence..."
            />
          </div>

          {/* Remarks */}
          <div className={`transform transition-all duration-500 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ animationDelay: '1000ms' }}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Remarks
            </label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200 transition-all resize-none"
              placeholder="Any additional information or remarks..."
            />
          </div>
        </section>

        {/* Document Attachments */}
        <section className="mb-8">
          <h2 className={`text-lg font-semibold text-darktext mb-4 border-l-4 border-smblue-400 pl-4 transform transition-all duration-500 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ animationDelay: '1050ms' }}>
            <div className="flex items-center space-x-2">
              <FiFileText className="w-5 h-5" />
              <span>Document Attachments</span>
            </div>
          </h2>
          <div className="border-b border-gray-200 mb-6"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Medical Certificate */}
            <div className={`transform transition-all duration-500 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ animationDelay: '1100ms' }}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medical Certificate {formData.leaveType === 'Sick Leave' && '*'}
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-smblue-400 transition-all duration-200">
                <div className="flex flex-col items-center">
                  <FiUpload className="w-8 h-8 text-gray-400 mb-2" />
                  <label className="cursor-pointer text-smblue-400 hover:text-smblue-300 text-sm font-medium transition-colors">
                    Upload Medical Certificate
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload(e, 'medicalCertificate')}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG up to 5MB</p>
                </div>
                
                {formData.medicalCertificate && (
                  <div className="mt-3 flex items-center justify-between bg-gray-50 rounded-lg p-2">
                    <span className="text-sm text-gray-700 truncate">{formData.medicalCertificate.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile('medicalCertificate')}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="Remove file"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Supporting Documents */}
            <div className={`transform transition-all duration-500 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ animationDelay: '1150ms' }}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supporting Documents
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-smblue-400 transition-all duration-200">
                <div className="flex flex-col items-center">
                  <FiUpload className="w-8 h-8 text-gray-400 mb-2" />
                  <label className="cursor-pointer text-smblue-400 hover:text-smblue-300 text-sm font-medium transition-colors">
                    Upload Supporting Documents
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      multiple
                      onChange={(e) => handleFileUpload(e, 'supportingDocuments')}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">Multiple files allowed</p>
                </div>
                
                {formData.supportingDocuments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {formData.supportingDocuments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                        <span className="text-sm text-gray-700 truncate">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile('supportingDocuments', index)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Remove file"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <div className={`flex justify-between items-center pt-6 border-t border-gray-200 transform transition-all duration-500 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ animationDelay: '1200ms' }}>
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSavingDraft || isSubmitting}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 hover:shadow-sm"
          >
            {isSavingDraft && (
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            )}
            <span>{isSavingDraft ? "Saving Draft..." : "Save Draft"}</span>
          </button>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-smblue-400 text-white rounded-lg hover:bg-smblue-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 hover:shadow-sm"
            >
              {isSubmitting && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              <span>{isSubmitting ? 'Filing Leave...' : 'File Leave Application'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
          <div className={`flex items-center space-x-3 px-4 py-3 rounded-lg shadow-lg border ${
            toast.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {toast.type === 'success' ? (
              <FiCheck className="w-5 h-5 text-green-600" />
            ) : (
              <FiX className="w-5 h-5 text-red-600" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
            <button
              onClick={() => setToast({ show: false, message: '', type: 'success' })}
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

export default FileLeave;