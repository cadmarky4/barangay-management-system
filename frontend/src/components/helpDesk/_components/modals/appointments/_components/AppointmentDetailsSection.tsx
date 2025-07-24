import React from 'react';
import { Calendar, Clock, Building2 } from 'lucide-react';
import { type ViewAppointment } from '@/services/helpDesk/appointments/appointments.types';
import { FormField } from '@/components/_global/components/FormField';
import { departments } from '@/services/helpDesk/appointments/appointments.types';
import { timeSlotOptions } from '@/services/helpDesk/helpDesk.type';

interface AppointmentDetailsSectionProps {
  appointment: ViewAppointment;
  mode: 'view' | 'edit';
}

export const AppointmentDetailsSection: React.FC<AppointmentDetailsSectionProps> = ({
  appointment,
  mode,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDepartment = (dept: string) => {
    return dept.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b">
        <Calendar className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold">Appointment Details</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          {mode === 'view' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <p className="text-sm text-gray-900 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                {formatDepartment(appointment.appointment.department)}
              </p>
            </div>
          ) : (
            <FormField
              type="select"
              name="appointment.department"
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
                Date
              </label>
              <p className="text-sm text-gray-900">
                {formatDate(appointment.appointment.date)}
              </p>
            </div>
          ) : (
            <FormField
              type="date"
              name="appointment.date"
              label="Date"
              required
            />
          )}
        </div>

        <div>
          {mode === 'view' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time
              </label>
              <p className="text-sm text-gray-900 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {formatTime(appointment.appointment.time)}
              </p>
            </div>
          ) : (
            <FormField
              type="select"
              name="appointment.time"
              label="Time"
              options={timeSlotOptions.map(time => ({
                value: time,
                label: formatTime(time)
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
              Additional Notes
            </label>
            <p className="text-sm text-gray-900 whitespace-pre-wrap">
              {appointment.appointment.additional_notes || 'No additional notes'}
            </p>
          </div>
        ) : (
          <FormField
            type="textarea"
            name="appointment.additional_notes"
            label="Additional Notes"
            placeholder="Enter additional notes (optional)"
            rows={3}
          />
        )}
      </div>
    </div>
  );
};