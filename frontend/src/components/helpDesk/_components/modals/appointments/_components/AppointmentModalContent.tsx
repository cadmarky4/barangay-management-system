import React from 'react';
import { type ViewAppointment } from '@/services/helpDesk/appointments/appointments.types';
import { TicketInformationSection } from './TicketInformationSection';
import { RequesterInformationSection } from './TicketRequesterInformation';
import { AppointmentDetailsSection } from './AppointmentDetailsSection';
import { AppointmentTimestampsSection } from './AppointmentTimestampsSection';

interface AppointmentModalContentProps {
  appointment: ViewAppointment;
  mode: 'view' | 'edit';
}

export const AppointmentModalContent: React.FC<AppointmentModalContentProps> = ({
  appointment,
  mode,
}) => {
  return (
    <div className="space-y-6">
      <TicketInformationSection appointment={appointment} mode={mode} />
      <RequesterInformationSection appointment={appointment} mode={mode} />
      <AppointmentDetailsSection appointment={appointment} mode={mode} />
      <AppointmentTimestampsSection appointment={appointment} />
    </div>
  );
};