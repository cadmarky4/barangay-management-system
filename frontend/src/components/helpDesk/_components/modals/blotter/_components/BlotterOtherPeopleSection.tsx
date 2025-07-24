import React from 'react';
import { Users, X, Plus } from 'lucide-react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { type ViewBlotter, type EditBlotter, type BlotterInvolvement, blotterInvolvementOptions } from '@/services/helpDesk/blotters/blotters.types';
import { FormField } from '@/components/_global/components/FormField';
import { useTranslation } from 'react-i18next';

interface BlotterOtherPeopleSectionProps {
  blotter: ViewBlotter;
  mode: 'view' | 'edit';
}

export const BlotterOtherPeopleSection: React.FC<BlotterOtherPeopleSectionProps> = ({
  blotter,
  mode,
}) => {
  const { t } = useTranslation();
  const { control } = useFormContext<EditBlotter>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'blotter.other_people_involved',
  });

  const formatInvolvement = (involvement: string) => {
    return involvement.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const addPerson = () => {
    append({
      full_name: '',
      address: '',
      contact_number: '',
      involvement: 'WITNESS' as BlotterInvolvement,
    });
  };

  // Show empty state for view mode when no people involved
  if (mode === 'view' && (!blotter.blotter.other_people_involved || blotter.blotter.other_people_involved.length === 0)) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <Users className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold">Other People Involved</h3>
        </div>
        <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
          <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p>No other people involved in this incident</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row items-left lg:justify-between lg:items-center mb-4">
        <div className="flex items-center gap-2 pb-2 border-b lg:border-b-0 lg:pb-0">
          <Users className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold">Other People Involved ({mode === 'edit' ? fields.length : blotter.blotter.other_people_involved?.length || 0})</h3>
        </div>
        {mode === 'edit' && (
          <button
            type="button"
            onClick={addPerson}
            className="mt-4 lg:mt-0 cursor-pointer flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Person
          </button>
        )}
      </div>

      {mode === 'view' ? (
        // View mode - show static data
        <div className="space-y-3">
          {blotter.blotter.other_people_involved?.map((person, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-gray-600">
                  Person #{index + 1}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <p className="text-sm text-gray-900">{person.full_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Number
                  </label>
                  <p className="text-sm text-gray-900">{person.contact_number}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Involvement
                  </label>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {formatInvolvement(person.involvement)}
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <p className="text-sm text-gray-900">{person.address || 'Not provided'}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Edit mode - show form fields with useFieldArray
        <div className="space-y-3">
          {fields.length === 0 ? (
            <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>No people added yet</p>
              <p className="text-sm">Click "Add Person" to include witnesses, victims, etc.</p>
            </div>
          ) : (
            fields.map((field, index) => (
              <div key={field.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-600">
                        Person #{index + 1}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <FormField
                        name={`blotter.other_people_involved.${index}.full_name`}
                        label={t('helpDesk.fields.fullName')}
                        placeholder={t('helpDesk.placeholders.fullName')}
                        required
                      />
                      <FormField
                        name={`blotter.other_people_involved.${index}.contact_number`}
                        label={t('helpDesk.fields.contactNumber')}
                        placeholder={t('helpDesk.placeholders.contactNumber')}
                        required
                      />
                      <FormField
                        type="select"
                        name={`blotter.other_people_involved.${index}.involvement`}
                        label={t('helpDesk.blotterForm.fields.involvement')}
                        options={blotterInvolvementOptions.map((role) => ({
                          value: role,
                          label: formatInvolvement(role),
                        }))}
                        required
                      />
                    </div>
                    
                    <FormField
                      name={`blotter.other_people_involved.${index}.address`}
                      label={t('helpDesk.fields.completeAddress')}
                      placeholder={t('helpDesk.placeholders.completeAddress')}
                    />
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="cursor-pointer p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors flex-shrink-0"
                    title="Remove person"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};