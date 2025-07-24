import { useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiPlus } from 'react-icons/fi';
import { X, Calendar as CalendarIcon } from 'lucide-react';
import AddAgenda from './AddAgenda';
import {
  useCalendarEvents,
  useCreateAgenda
} from '@/services/agenda/useAgenda';
import { type CalendarEvent, type AgendaFormData } from '@/services/agenda/agenda.types';

interface SelectedDate {
  day: number;
  dateKey: string;
  agendas: CalendarEvent[];
}

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<SelectedDate | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddAgendaModal, setShowAddAgendaModal] = useState(false);

  // Use agenda service hooks
  const { data: calendarEvents = [], refetch, isLoading, error } = useCalendarEvents(
    currentDate.getMonth() + 1,
    currentDate.getFullYear()
  );

  const createAgendaMutation = useCreateAgenda();

  // Debug logging
  console.log('Calendar Debug:', {
    currentMonth: currentDate.getMonth() + 1,
    currentYear: currentDate.getFullYear(),
    calendarEvents,
    calendarEventsLength: calendarEvents.length,
    isLoading,
    error: error?.message || 'none'
  });

  // Transform calendar events to agenda data format for rendering
  const agendaData = calendarEvents.reduce((acc: { [key: string]: CalendarEvent[] }, event: CalendarEvent) => {
    const dateKey = event.date.substring(0, 10); // Use date in YYYY-MM-DD format
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(event);
    return acc;
  }, {} as { [key: string]: CalendarEvent[] });

  console.log('Agenda Data:', agendaData);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDateKey = (year: number, month: number, day: number): string => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const handleDateClick = (day: number): void => {
    const dateKey = formatDateKey(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate({ day, dateKey, agendas: agendaData[dateKey] || [] });
    setShowModal(true);
  };

  const handlePrevMonth = (): void => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = (): void => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleAddAgenda = (): void => {
    setShowAddAgendaModal(true);
  };

  const handleSaveAgenda = async (newAgendaData: AgendaFormData): Promise<void> => {
    try {
      await createAgendaMutation.mutateAsync(newAgendaData);
      // Refetch calendar events after creating a new agenda
      refetch();
      console.log('Agenda saved successfully:', newAgendaData);
    } catch (error) {
      console.error('Error saving agenda:', error);
    }
  };

  // React Query will automatically refetch when the query key changes (month/year)
  // No manual refetch needed

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = getFirstDayOfMonth(currentDate);
  const currentMonth = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

  // Get today's date for comparison
  const today = new Date();
  const isToday = (day: number): boolean => {
    return day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear();
  };

  return (
    <>
      <style>{`
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideIn {
                from { transform: translateY(-10px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            @keyframes fadeInScale {
                from { transform: scale(0.95); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
            @keyframes modalSlideIn {
                from { transform: scale(0.95) translateY(-20px); opacity: 0; }
                to { transform: scale(1) translateY(0); opacity: 1; }
            }
            @keyframes slideDown {
                from { transform: translateY(-20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            @keyframes slideRight {
                from { transform: translateX(-20px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideUp {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            @keyframes pulseSlow {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
            @keyframes pulseDot {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.6; }
            }
            @keyframes subtlePulse {
                0%, 100% { opacity: 0.4; }
                50% { opacity: 0.8; }
            }
            
            .animate-fade-in { animation: fadeIn 0.3s ease-out; }
            .animate-slide-in { animation: slideIn 0.4s ease-out; }
            .animate-fade-in-scale { animation: fadeInScale 0.4s ease-out; }
            .animate-modal-slide-in { animation: modalSlideIn 0.3s ease-out; }
            .animate-slide-down { animation: slideDown 0.2s ease-out; }
            .animate-slide-right { animation: slideRight 0.3s ease-out; }
            .animate-slide-up { animation: slideUp 0.3s ease-out; }
            .animate-pulse-slow { animation: pulseSlow 3s ease-in-out infinite; }
            .animate-pulse-dot { animation: pulseDot 2s ease-in-out infinite; }
            .animate-subtle-pulse { animation: subtlePulse 2s ease-in-out infinite; }
        `}</style>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all duration-300 hover:shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 border-l-4 border-smblue-400 pl-4">
            Project Calendar
          </h3>
        </div>

        <div className="flex justify-between items-center mb-4">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-gray-100 rounded-2xl transition-all duration-150 transform hover:scale-102 active:scale-98"
          >
            <FiChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h4 className="font-medium text-gray-900 animate-fade-in">{currentMonth}</h4>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded-2xl transition-all duration-150 transform hover:scale-102 active:scale-98"
          >
            <FiChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <div
              key={index}
              className="text-center text-xs font-medium text-gray-500 py-2 animate-slide-in"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDayOfMonth }, (_, i) => (
            <div key={`empty-${i}`} className="p-2 h-12"></div>
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dateKey = formatDateKey(currentDate.getFullYear(), currentDate.getMonth(), day);
            const hasAgenda = (agendaData[dateKey] && agendaData[dateKey]?.length > 0) ?? false;
            console.log("Date Key" + dateKey + " hasAgenda: " + hasAgenda);


            return (
              <button
                key={day}
                onClick={() => handleDateClick(day)}
                className={`p-2 h-12 text-sm text-center rounded transition-all duration-200 transform hover:scale-102 active:scale-98 hover:shadow-sm animate-fade-in-scale relative cursor-pointer no-underline ${isToday(day)
                  ? 'bg-smblue-400 text-white hover:bg-smblue-500 shadow-md animate-pulse-slow'
                  : 'text-gray-700 hover:bg-gray-50'
                  }`}
                style={{ animationDelay: `${day * 15}ms` }}
              >
                <span className="block relative z-10">{day}</span>
                {(
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                    {hasAgenda && agendaData[dateKey]?.slice(0, 3)?.map((agenda: CalendarEvent, idx: number) => (
                      <div
                        key={idx}
                        className={`w-1.5 h-1.5 rounded-full animate-subtle-pulse`}
                        style={{
                          backgroundColor: agenda.color,
                          animationDelay: `${idx * 300}ms`
                        }}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Add Agenda Button - Positioned at bottom */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={handleAddAgenda}
            className="cursor-pointer no-underline w-full flex items-center justify-center gap-2 bg-smblue-400 text-white px-4 py-3 rounded-lg hover:bg-smblue-300 transition-all duration-150 transform shadow-sm hover:shadow-md"
          >
            <FiPlus className="w-4 h-4" />
            <span className="text-sm font-medium">Add Agenda</span>
          </button>
        </div>
      </div>

      {/* Modal for Agenda with Professional Animations - FIXED */}
      {showModal && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.2)] bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in" style={{ minHeight: '100vh', height: '100%' }}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden animate-modal-slide-in">
            <div className="bg-gradient-to-r from-smblue-400 to-smblue-300 text-white p-4 flex justify-between items-center animate-slide-down">
              <h3 className="text-lg font-semibold animate-slide-right">
                {selectedDate && `${monthNames[currentDate.getMonth()]} ${selectedDate.day}, ${currentDate.getFullYear()}`}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-white/10 rounded-2xl transition-all duration-150 transform hover:scale-102 active:scale-98"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
              {selectedDate && selectedDate.agendas.length > 0 ? (
                <div className="space-y-3">
                  {selectedDate.agendas.map((agenda: CalendarEvent, index: number) => (
                    <div
                      key={agenda.id}
                      className="border-l-4 pl-4 py-3 transform hover:scale-[1.005] transition-all duration-150 hover:shadow-sm rounded-r animate-slide-up bg-gray-50/30"
                      style={{
                        borderColor: agenda.color,
                        animationDelay: `${index * 80}ms`
                      }}
                    >
                      <h4 className="font-medium text-gray-900 animate-fade-in">{agenda.title}</h4>
                      <p className="text-sm text-gray-600 mt-1 animate-fade-in" style={{ animationDelay: `${index * 80 + 40}ms` }}>
                        {agenda.time}
                        {agenda.end_time && ` - ${agenda.end_time}`}
                      </p>
                      {agenda.location && (
                        <p className="text-xs text-gray-500 mt-1">{agenda.location}</p>
                      )}
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                          {agenda.category}
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                          {agenda.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <CalendarIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm font-medium">No agenda items for this day</p>
                  <p className="text-gray-400 text-xs mt-1">Click dates with indicators to view events</p>
                </div>
              )}
            </div>

            <div className="border-t p-4 bg-gray-50/50">
              <button
                onClick={() => setShowModal(false)}
                className="w-full bg-smblue-400 text-white py-3 px-4 rounded-2xl hover:bg-smblue-500 transition-all duration-150 transform hover:scale-[1.005] active:scale-[0.995] shadow-sm hover:shadow-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AddAgenda Modal */}
      <AddAgenda
        isOpen={showAddAgendaModal}
        onClose={() => setShowAddAgendaModal(false)}
        onSave={handleSaveAgenda}
      />
    </>
  );
};

export default Calendar;