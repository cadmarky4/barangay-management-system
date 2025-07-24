import React from 'react';
import { Lightbulb, Target, Cog, DollarSign } from 'lucide-react';
import { type ViewSuggestion } from '@/services/helpDesk/suggestions/suggestions.types';
import { FormField } from '@/components/_global/components/FormField';
import { feedbackCategoryOptions } from '@/services/helpDesk/helpDesk.type';

interface SuggestionDetailsSectionProps {
  suggestion: ViewSuggestion;
  mode: 'view' | 'edit';
}

export const SuggestionDetailsSection: React.FC<SuggestionDetailsSectionProps> = ({
  suggestion,
  mode,
}) => {
  const formatCategory = (category: string) => {
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b">
        <Lightbulb className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold">Suggestion Details</h3>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          {mode === 'view' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                {formatCategory(suggestion.suggestion.s_category)}
              </span>
            </div>
          ) : (
            <FormField
              type="select"
              name="suggestion.s_category"
              label="Category"
              options={feedbackCategoryOptions.map(category => ({
                value: category,
                label: formatCategory(category)
              }))}
              required
            />
          )}
        </div>

        <div>
          {mode === 'view' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Target className="inline w-4 h-4 mr-1" />
                Expected Benefits
              </label>
              <p className="text-sm text-gray-900 whitespace-pre-wrap">
                {suggestion.suggestion.expected_benefits || 'Not specified'}
              </p>
            </div>
          ) : (
            <FormField
              type="textarea"
              name="suggestion.expected_benefits"
              label="Expected Benefits"
              placeholder="Describe the expected benefits of this suggestion"
              rows={3}
            />
          )}
        </div>

        <div>
          {mode === 'view' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Cog className="inline w-4 h-4 mr-1" />
                Implementation Ideas
              </label>
              <p className="text-sm text-gray-900 whitespace-pre-wrap">
                {suggestion.suggestion.implementation_ideas || 'Not specified'}
              </p>
            </div>
          ) : (
            <FormField
              type="textarea"
              name="suggestion.implementation_ideas"
              label="Implementation Ideas"
              placeholder="Share your ideas on how this could be implemented"
              rows={3}
            />
          )}
        </div>

        <div>
          {mode === 'view' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="inline w-4 h-4 mr-1" />
                Resources Needed
              </label>
              <p className="text-sm text-gray-900 whitespace-pre-wrap">
                {suggestion.suggestion.resources_needed || 'Not specified'}
              </p>
            </div>
          ) : (
            <FormField
              name="suggestion.resources_needed"
              label="Resources Needed"
              placeholder="What resources would be needed to implement this suggestion?"
            />
          )}
        </div>
      </div>
    </div>
  );
};