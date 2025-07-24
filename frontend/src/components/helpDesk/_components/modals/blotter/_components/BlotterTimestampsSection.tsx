import React from 'react';
import { type ViewBlotter } from '@/services/helpDesk/blotters/blotters.types';

interface BlotterTimestampsSectionProps {
  blotter: ViewBlotter;
}

export const BlotterTimestampsSection: React.FC<BlotterTimestampsSectionProps> = ({
  blotter,
}) => {
  return (
    <div className="pt-4 border-t text-sm text-gray-500">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <strong>Created:</strong> {new Date(blotter.ticket.created_at).toLocaleString()}
        </div>
        <div>
          <strong>Last Updated:</strong> {new Date(blotter.ticket.updated_at).toLocaleString()}
        </div>
      </div>
    </div>
  );
};