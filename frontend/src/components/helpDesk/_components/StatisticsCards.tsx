import { useHelpDeskStatistics } from "@/services/helpDesk/useHelpDesk";
import { FileText, Clock, AlertCircle, CheckCircle } from "lucide-react";

interface StatisticsCardProps {
    isLoaded: boolean,
}

export default function StatisticsCard({
    isLoaded,
}: StatisticsCardProps) {
    const { data: stats, isLoading, error } = useHelpDeskStatistics();

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, index) => (
                    <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <div className="h-4 w-24 bg-gray-200 rounded"></div>
                                <div className="h-8 w-16 bg-gray-200 rounded"></div>
                            </div>
                            <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
                <p className="text-red-600">Failed to load statistics</p>
            </div>
        );
    }

    const statCards = [
        {
            title: "Total Tickets",
            value: stats?.total_tickets || 0,
            icon: FileText,
            color: "text-smblue-400",
            bgColor: "bg-smblue-100",
        },
        {
            title: "Pending Review",
            value: stats?.pending_review,
            icon: Clock,
            color: "text-yellow-600",
            bgColor: "bg-yellow-100",
        },
        {
            title: "In Progress",
            value: stats?.in_progress,
            icon: AlertCircle,
            color: "text-blue-600",
            bgColor: "bg-blue-100",
        },
        {
            title: "Resolved",
            value: stats?.resolved,
            icon: CheckCircle,
            color: "text-green-600",
            bgColor: "bg-green-100",
        },
    ];

    return (
        <div
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 transition-all duration-700 ease-out ${
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: "100ms" }}
        >
            {statCards.map((card, index: number) => {
                const IconComponent = card.icon;
                return (
                    <div
                        key={index}
                        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    {card.title}
                                </p>
                                <p className={`text-3xl font-bold mt-1 ${card.color}`}>
                                    {card.value}
                                </p>
                            </div>
                            <div className={`p-3 ${card.bgColor} rounded-lg`}>
                                <IconComponent className={`w-6 h-6 ${card.color}`} />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
  