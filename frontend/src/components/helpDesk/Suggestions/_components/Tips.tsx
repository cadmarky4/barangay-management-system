import { Star, Target, ThumbsUp } from "lucide-react";

interface TipsProps {
  isLoaded: boolean;
}

export const Tips: React.FC<TipsProps> = ({ isLoaded }) => {
  return (
    <div
      className={`mt-8 grid grid-cols-1 @lg/main:grid-cols-2 @4xl/main:grid-cols-3 gap-6 transition-all duration-700 ease-out ${
        isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: "300ms" }}
    >
      <div className="bg-blue-50 rounded-lg p-6">
        <Target className="h-8 w-8 text-blue-600 mb-3" />
        <h3 className="font-semibold text-gray-900 mb-2">Be Specific</h3>
        <p className="text-sm text-gray-600">
          Clear, detailed suggestions are more likely to be implemented
        </p>
      </div>

      <div className="bg-green-50 rounded-lg p-6">
        <ThumbsUp className="h-8 w-8 text-green-600 mb-3" />
        <h3 className="font-semibold text-gray-900 mb-2">Think Practical</h3>
        <p className="text-sm text-gray-600">
          Consider feasibility and available resources
        </p>
      </div>

      <div className="bg-purple-50 rounded-lg p-6">
        <Star className="h-8 w-8 text-purple-600 mb-3" />
        <h3 className="font-semibold text-gray-900 mb-2">Focus on Impact</h3>
        <p className="text-sm text-gray-600">
          Highlight how your idea benefits the community
        </p>
      </div>
    </div>
  );
};
