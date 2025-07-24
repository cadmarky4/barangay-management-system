import React from 'react';
import { AlertTriangle, Calendar, Clock, MapPin } from 'lucide-react';
import { type ViewBlotter } from '@/services/helpDesk/blotters/blotters.types';
import { FormField } from '@/components/_global/components/FormField';
import { incidentOptions } from '@/services/helpDesk/blotters/blotters.types';
import { timeSlotOptions } from '@/services/helpDesk/helpDesk.type';

interface BlotterIncidentDetailsSectionProps {
  blotter: ViewBlotter;
  mode: 'view' | 'edit';
}

export const BlotterIncidentDetailsSection: React.FC<BlotterIncidentDetailsSectionProps> = ({
  blotter,
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

  const formatIncidentType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b">
        <AlertTriangle className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold">Incident Details</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          {mode === 'view' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type of Incident
              </label>
              <p className="text-sm text-gray-900">
                {formatIncidentType(blotter.blotter.type_of_incident)}
              </p>
            </div>
          ) : (
            <FormField
              type="select"
              name="blotter.type_of_incident"
              label="Type of Incident"
              options={incidentOptions.map(incident => ({
                value: incident,
                label: formatIncidentType(incident)
              }))}
              required
            />
          )}
        </div>

        <div>
          {mode === 'view' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location of Incident
              </label>
              <p className="text-sm text-gray-900 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {blotter.blotter.location_of_incident}
              </p>
            </div>
          ) : (
            <FormField
              name="blotter.location_of_incident"
              label="Location of Incident"
              placeholder="Enter location of incident"
              required
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          {mode === 'view' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Incident
              </label>
              <p className="text-sm text-gray-900 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formatDate(blotter.blotter.date_of_incident)}
              </p>
            </div>
          ) : (
            <FormField
              type="date"
              name="blotter.date_of_incident"
              label="Date of Incident"
              required
            />
          )}
        </div>

        <div>
          {mode === 'view' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time of Incident
              </label>
              <p className="text-sm text-gray-900 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {formatTime(blotter.blotter.time_of_incident)}
              </p>
            </div>
          ) : (
            <FormField
              type="select"
              name="blotter.time_of_incident"
              label="Time of Incident"
              options={timeSlotOptions.map(time => ({
                value: time,
                label: formatTime(time)
              }))}
              required
            />
          )}
        </div>
      </div>
    </div>
  );
};