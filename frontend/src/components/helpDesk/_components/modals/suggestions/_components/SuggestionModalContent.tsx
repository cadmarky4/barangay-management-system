import React from 'react';
import { type ViewSuggestion } from '@/services/helpDesk/suggestions/suggestions.types';
import { SuggestionTicketInformationSection } from './SuggestionTicketInformationSection';
import { SuggestionSubmitterInformationSection } from './SuggestionSubmitterInformationSection';
import { SuggestionDetailsSection } from './SuggestionDetailsSection';
import { SuggestionTimestampsSection } from './SuggestionTimestampsSection';

interface SuggestionModalContentProps {
  suggestion: ViewSuggestion;
  mode: 'view' | 'edit';
}

export const SuggestionModalContent: React.FC<SuggestionModalContentProps> = ({
  suggestion,
  mode,
}) => {
  return (
    <div className="space-y-6">
      <SuggestionTicketInformationSection suggestion={suggestion} mode={mode} />
      <SuggestionSubmitterInformationSection suggestion={suggestion} mode={mode} />
      <SuggestionDetailsSection suggestion={suggestion} mode={mode} />
      <SuggestionTimestampsSection suggestion={suggestion} />
    </div>
  );
};