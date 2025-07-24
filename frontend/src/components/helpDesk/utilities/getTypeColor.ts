import type { TicketCategory } from "@/services/helpDesk/helpDesk.type";

export const getTypeColor = (type: TicketCategory): string => {
    const typeColors = {
        APPOINTMENT: "bg-blue-100 text-blue-800 border-blue-200",
        BLOTTER: "bg-red-100 text-red-800 border-red-200",
        COMPLAINT: "bg-orange-100 text-orange-800 border-orange-200",
        SUGGESTION: "bg-purple-100 text-purple-800 border-purple-200",
      };

    return typeColors[type] || "bg-gray-100 text-gray-800 border-gray-200";
};