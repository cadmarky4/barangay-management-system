import {
    AlertCircle,
    CalendarIcon,
    ChevronRight,
    Lightbulb,
    Minus,
    Plus,
    Shield,
  } from "lucide-react";
  import { useState } from "react";
  import { Link } from "react-router-dom";
  
  export const TicketFormsDropdown = () => {
    const [showTicketDropdown, setShowTicketDropdown] = useState(false);
    // Ticket type options configuration
    const ticketTypeOptions = [
      {
        type: "Appointment",
        label: "Process Appointment",
        description: "Schedule resident appointments",
        icon: CalendarIcon,
        href: "/schedule-appointment",
        color: "text-blue-600",
      },
      {
        type: "Blotter",
        label: "File Blotter Report",
        description: "Document incidents and disputes",
        icon: Shield,
        href: "/file-blotter",
        color: "text-red-600",
      },
      {
        type: "Complaint",
        label: "Log Complaint",
        description: "Record service complaints",
        icon: AlertCircle,
        href: "/file-complaint",
        color: "text-orange-600",
      },
      {
        type: "Suggestion",
        label: "Submit Suggestion",
        description: "Process improvement ideas",
        icon: Lightbulb,
        href: "/share-suggestions",
        color: "text-purple-600",
      },
    ];
  
    return (
      <div className="flex-1 @3xl/main:flex-initial relative z-10">
        <button
          onClick={() => setShowTicketDropdown(!showTicketDropdown)}
          className="w-full cursor-pointer bg-smblue-400 hover:bg-smblue-300 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          {showTicketDropdown ? (
            <Minus className="w-4 h-4" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          Create New Ticket
        </button>
  
        {showTicketDropdown && (
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
            <div className="p-2">
              {ticketTypeOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <Link
                    key={option.type}
                    to={"/help-desk" + option.href}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => setShowTicketDropdown(false)}
                  >
                    <div className={`p-2 bg-gray-100 rounded-lg ${option.color}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{option.label}</p>
                      <p className="text-sm text-gray-500">
                        {option.description}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 mt-3" />
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };
  