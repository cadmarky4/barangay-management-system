import { Phone } from "lucide-react";

interface EmergencyContactCardProps {
  isLoaded: boolean;
}

export const EmergencyContactCard: React.FC<EmergencyContactCardProps> = ({
  isLoaded,
}) => {
  return (
    <div
      className={`mt-8 bg-red-50 rounded-lg p-6 transition-all duration-700 ease-out ${
        isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: "300ms" }}
    >
      <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
        <Phone className="h-5 w-5 mr-2 text-red-600" />
        Emergency Contacts
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <p className="font-medium text-gray-700">Police Emergency</p>
          <p className="text-gray-600">911 or (02) 8123-4567</p>
        </div>
        <div>
          <p className="font-medium text-gray-700">Barangay Hall</p>
          <p className="text-gray-600">(02) 8456-7890</p>
        </div>
        <div>
          <p className="font-medium text-gray-700">Fire Department</p>
          <p className="text-gray-600">(02) 8234-5678</p>
        </div>
      </div>
    </div>
  );
};
