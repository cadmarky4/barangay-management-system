import React from 'react';
import { type ViewAppointment } from '@/services/helpDesk/appointments/appointments.types';

interface AppointmentTimestampsSectionProps {
  appointment: ViewAppointment;
}

export const AppointmentTimestampsSection: React.FC<AppointmentTimestampsSectionProps> = ({
  appointment,
}) => {
  return (
    <div className="pt-4 border-t text-sm text-gray-500">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <strong>Created:</strong> {new Date(appointment.ticket.created_at).toLocaleString()}
        </div>
        <div>
          <strong>Last Updated:</strong> {new Date(appointment.ticket.updated_at).toLocaleString()}
        </div>
      </div>
    </div>
  );
};