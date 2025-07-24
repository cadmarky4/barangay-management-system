import { Info } from "lucide-react";

interface InfoBannerProps {
  isLoaded: boolean;
}

export const InfoBanner: React.FC<InfoBannerProps> = ({ isLoaded }) => {
  return (
    <div
      className={`bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 transition-all duration-700 ease-out ${
        isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: "100ms" }}
    >
      <div className="flex items-start">
        <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
        <div>
          <h3 className="font-semibold text-blue-900">Processing Guidelines</h3>
          <ul className="text-sm text-blue-800 mt-1 space-y-1">
            <li>• Verify complainant details before processing</li>
            <li>• Document all relevant information accurately</li>
            <li>• Assign to appropriate department for action</li>
            <li>• Update status regularly until resolution</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
