import { Award } from "lucide-react";

interface MotivationalBannerProps {
  isLoaded: boolean;
}

export const MotivationalBanner: React.FC<MotivationalBannerProps> = ({
  isLoaded,
}) => {
  return (
    <div
      className={`bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg p-6 mb-6 transition-all duration-700 ease-out ${
        isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: "100ms" }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold mb-2">Community Impact</h3>
          <p className="text-purple-100">
            Track and process valuable suggestions from residents to improve our
            services.
          </p>
        </div>
        <Award className="h-16 w-16 text-yellow-300" />
      </div>
    </div>
  );
};
