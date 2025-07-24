import type { Status } from "@/services/helpDesk/helpDesk.type";

export const getStatusColor = (status: Status): string => {
    const statusColors = {
        OPEN: "bg-purple-100 text-purple-800 border-purple-200",
        PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
        IN_PROGRESS: "bg-blue-100 text-blue-800 border-blue-200",
        RESOLVED: "bg-green-100 text-green-800 border-green-200",
        CLOSED: "bg-gray-100 text-gray-800 border-gray-200",
      };

    return statusColors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };
