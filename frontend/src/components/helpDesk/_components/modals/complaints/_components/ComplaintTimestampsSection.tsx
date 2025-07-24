import React from 'react';
import { type ViewComplaint } from '@/services/helpDesk/complaints/complaints.types';

interface ComplaintTimestampsSectionProps {
  complaint: ViewComplaint;
}

export const ComplaintTimestampsSection: React.FC<ComplaintTimestampsSectionProps> = ({
  complaint,
}) => {
  return (
    <div className="pt-4 border-t text-sm text-gray-500">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <strong>Created:</strong> {new Date(complaint.ticket.created_at).toLocaleString()}
        </div>
        <div>
          <strong>Last Updated:</strong> {new Date(complaint.ticket.updated_at).toLocaleString()}
        </div>
      </div>
    </div>
  );
};