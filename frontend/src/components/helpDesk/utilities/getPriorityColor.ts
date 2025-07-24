import type { Priority } from "@/services/helpDesk/helpDesk.type";

export const getPriorityColor = (priority: Priority): string => {
  // Color mapping objects with proper typing
    const priorityColors = {
        CRITICAL: "bg-purple-100 text-purple-800 border-purple-200",
        HIGH: "bg-red-100 text-red-800 border-red-200",
        MEDIUM: "bg-yellow-100 text-yellow-800 border-yellow-200",
        LOW: "bg-green-100 text-green-800 border-green-200",
    };

    return (
        priorityColors[priority] || "bg-gray-100 text-gray-800 border-gray-200"
    );
};