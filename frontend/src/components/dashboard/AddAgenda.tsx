import React, { useState } from 'react';
import { 
  type AgendaFormData, 
  transformAgendaToFormData,
  agendaCategories,
  getCategoryColor
} from '@/services/agenda/agenda.types';

interface AddAgendaProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (agendaData: AgendaFormData) => void;
}

const AddAgenda: React.FC<AddAgendaProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<AgendaFormData>(transformAgendaToFormData(null));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.date || !formData.time) return;
    
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('New agenda item:', formData);
    
    // Call the onSave callback if provided
    if (onSave) {
      onSave(formData);
    }
    
    setIsSubmitting(false);
    setShowSuccess(true);
    
    // Reset form and close modal after success
    setTimeout(() => {
      setShowSuccess(false);
      setFormData(transformAgendaToFormData(null));
      onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalSlideIn {
          from { transform: scale(0.95) translateY(-20px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
        
        .animate-fade-in { animation: fadeIn 0.3s ease-out; }
        .animate-modal-slide-in { animation: modalSlideIn 0.3s ease-out; }
      `}</style>
      
      <div className="fixed inset-0 bg-[rgba(0,0,0,0.1)] max-h  flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] flex flex-col animate-modal-slide-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-smblue-400 to-smblue-300 text-white p-6 rounded-t-2xl flex-shrink-0">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Add New Agenda</h2>
                <p className="text-smblue-100 text-sm mt-1">Schedule a new calendar event</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-all duration-150"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-4 flex-1 overflow-y-auto min-h-0">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Event Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-smblue-400 focus:border-transparent transition-all duration-200"
                placeholder="Enter event title"
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-smblue-400 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                  Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-smblue-400 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-smblue-400 focus:border-transparent transition-all duration-200"
              >
                {agendaCategories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0) + category.slice(1).toLowerCase().replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Preview */}
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Category Preview:</span>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getCategoryColor(formData.category) }}
                ></div>
                <span className="text-sm text-gray-600">
                  {formData.category.charAt(0) + formData.category.slice(1).toLowerCase().replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-smblue-400 focus:border-transparent transition-all duration-200 resize-none"
                placeholder="Enter event description (optional)"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="border-t p-6 bg-gray-50 rounded-b-2xl flex-shrink-0">
            {showSuccess ? (
              <div className="flex items-center justify-center space-x-2 text-green-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">Agenda added successfully!</span>
              </div>
            ) : (
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-150 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !formData.title || !formData.date || !formData.time}
                  className="flex-1 px-4 py-3 bg-smblue-400 text-white rounded-lg hover:bg-smblue-500 transition-all duration-150 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Adding...</span>
                    </>
                  ) : (
                    <span>Add Agenda</span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AddAgenda;