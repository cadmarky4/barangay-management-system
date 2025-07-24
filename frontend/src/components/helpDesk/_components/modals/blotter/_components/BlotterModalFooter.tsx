import React from "react";
import { Edit3, Eye, Save, X, Loader2 } from "lucide-react";

interface BlotterModalFooterProps {
  mode: "view" | "edit";
  isDirty: boolean;
  isSubmitting: boolean;
  onModeToggle: () => void;
  onCancel: () => void;
  onSubmit: () => void;
  onClose: () => void;
}

export const BlotterModalFooter: React.FC<BlotterModalFooterProps> = ({
  mode,
  isDirty,
  isSubmitting,
  onModeToggle,
  onCancel,
  onSubmit,
  onClose,
}) => {
  if (mode === "view") {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={onModeToggle}
          className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Edit3 className="w-4 h-4 mr-2" />
          Edit
        </button>
        <button
          onClick={onClose}
          className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg text-sm font-medium transition-colors"
        >
          <X className="w-4 h-4 mr-2" />
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onModeToggle}
        disabled={isSubmitting}
        className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Eye className="w-4 h-4 mr-2" />
        View
      </button>
      <button
        onClick={onCancel}
        disabled={isSubmitting}
        className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Cancel
      </button>
      <button
        onClick={onSubmit}
        disabled={isSubmitting || !isDirty}
        className="cursor-pointer inline-flex items-center px-4 py-2 bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </>
        )}
      </button>
    </div>
  );
};
