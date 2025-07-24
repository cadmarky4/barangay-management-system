import React from 'react';
import { type ViewSuggestion } from '@/services/helpDesk/suggestions/suggestions.types';

interface SuggestionTimestampsSectionProps {
  suggestion: ViewSuggestion;
}

export const SuggestionTimestampsSection: React.FC<SuggestionTimestampsSectionProps> = ({
  suggestion,
}) => {
  return (
    <div className="pt-4 border-t text-sm text-gray-500">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <strong>Created:</strong> {new Date(suggestion.ticket.created_at).toLocaleString()}
        </div>
        <div>
          <strong>Last Updated:</strong> {new Date(suggestion.ticket.updated_at).toLocaleString()}
        </div>
      </div>
    </div>
  );
};