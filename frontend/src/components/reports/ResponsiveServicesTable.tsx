export default function ResponsiveServicesTable({
  data,
}: {
  data: {
    service: string;
    requested: number;
    completed: number;
    avgProcessingTimeInDays: number;
    feesCollected: number;
  }[];
}) {
  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[780px]">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-600 border-b border-gray-200">
              <th className="pb-4 font-medium">Position</th>
              <th className="pb-4 font-medium">Requests</th>
              <th className="pb-4 font-medium">Completed</th>
              <th className="pb-4 font-medium">Status</th>
              <th className="pb-4 font-medium">Avg. Processing Time</th>
              <th className="pb-4 font-medium">Fees Collected</th>
            </tr>
          </thead>
          <tbody>
            {data.map((service, index) => (
              <tr key={index} className="border-b border-gray-100 text-sm">
                <td className="py-4">{service.service}</td>
                <td className="py-4">{service.requested}</td>
                <td className="py-4">{service.completed}</td>
                <td className="py-4">
                  <span
                    className={`text-xs font-medium ${
                      (service.completed / service.requested) * 100 >= 90
                        ? "text-green-700 bg-green-100"
                        : (service.completed / service.requested) * 100 >= 70
                        ? "text-yellow-700 bg-yellow-100"
                        : "text-red-700 bg-red-100"
                    } py-2 px-4 rounded-full`}
                  >
                    {((service.completed / service.requested) * 100).toFixed(2)}
                    % complete
                  </span>
                </td>
                <td className="py-4 text-gray-900">
                  {service.avgProcessingTimeInDays}
                </td>
                <td className="py-4 text-gray-900 font-medium">
                  ₱{service.feesCollected.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

