import { AlertTriangle } from "lucide-react";

interface ImportantNoticeProps {
  isLoaded: boolean;
}

export const ImportantNotice: React.FC<ImportantNoticeProps> = ({
  isLoaded,
}) => {
  return (
    <div
      className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 transition-all duration-700 ease-out ${
        isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: "100ms" }}
    >
      <div className="flex items-start">
        <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
        <div>
          <h3 className="font-semibold text-yellow-900">Important Notice</h3>
          <p className="text-sm text-yellow-800 mt-1">
            For emergency situations or crimes in progress, please call the
            emergency hotline immediately at 911. This online blotter is for
            non-emergency reports only.
          </p>
        </div>
      </div>
    </div>
  );
};
