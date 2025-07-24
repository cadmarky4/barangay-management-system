import React from 'react';
import { AlertCircle, Building2, MapPin, Tag } from 'lucide-react';
import { type ViewComplaint } from '@/services/helpDesk/complaints/complaints.types';
import { FormField } from '@/components/_global/components/FormField';
import { departments } from '@/services/helpDesk/appointments/appointments.types';
import { feedbackCategoryOptions } from '@/services/helpDesk/helpDesk.type';

interface ComplaintDetailsSectionProps {
  complaint: ViewComplaint;
  mode: 'view' | 'edit';
}

export const ComplaintDetailsSection: React.FC<ComplaintDetailsSectionProps> = ({
  complaint,
  mode,
}) => {
  const formatDepartment = (dept: string) => {
    return dept.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const formatCategory = (category: string) => {
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b">
        <AlertCircle className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold">Complaint Details</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          {mode === 'view' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <p className="text-sm text-gray-900 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                {formatDepartment(complaint.complaint.department)}
              </p>
            </div>
          ) : (
            <FormField
              type="select"
              name="complaint.department"
              label="Department"
              options={departments.map(dept => ({
                value: dept,
                label: formatDepartment(dept)
              }))}
              required
            />
          )}
        </div>

        <div>
          {mode === 'view' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <p className="text-sm text-gray-900 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  {formatCategory(complaint.complaint.c_category)}
                </span>
              </p>
            </div>
          ) : (
            <FormField
              type="select"
              name="complaint.c_category"
              label="Category"
              options={feedbackCategoryOptions.map(category => ({
                value: category,
                label: formatCategory(category)
              }))}
              required
            />
          )}
        </div>
      </div>

      <div>
        {mode === 'view' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline w-4 h-4 mr-1" />
              Location
            </label>
            <p className="text-sm text-gray-900 whitespace-pre-wrap">
              {complaint.complaint.location || 'Not specified'}
            </p>
          </div>
        ) : (
          <FormField
            name="complaint.location"
            label="Location"
            placeholder="Enter location details"
          />
        )}
      </div>
    </div>
  );
};