import React from 'react';
import { type ViewComplaint } from '@/services/helpDesk/complaints/complaints.types';
import { ComplaintTicketInformationSection } from './ComplaintTicketInformationSection';
import { ComplaintComplainantInformationSection } from './ComplaintComplainantInformationSection';
import { ComplaintDetailsSection } from './ComplaintDetailsSection';
import { ComplaintTimestampsSection } from './ComplaintTimestampsSection';

interface ComplaintModalContentProps {
  complaint: ViewComplaint;
  mode: 'view' | 'edit';
}

export const ComplaintModalContent: React.FC<ComplaintModalContentProps> = ({
  complaint,
  mode,
}) => {
  return (
    <div className="space-y-6">
      <ComplaintTicketInformationSection complaint={complaint} mode={mode} />
      <ComplaintComplainantInformationSection complaint={complaint} mode={mode} />
      <ComplaintDetailsSection complaint={complaint} mode={mode} />
      <ComplaintTimestampsSection complaint={complaint} />
    </div>
  );
};