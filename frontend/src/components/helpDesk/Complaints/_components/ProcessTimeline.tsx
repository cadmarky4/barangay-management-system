interface ProcessTimelineProps {
    isLoaded: boolean;
  }
  
  export const ProcessTimeline: React.FC<ProcessTimelineProps> = ({
    isLoaded,
  }) => {
    return (
      <div
        className={`mt-8 bg-gray-50 rounded-lg p-6 transition-all duration-700 ease-out ${
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
        style={{ transitionDelay: "300ms" }}
      >
        <h3 className="font-semibold text-gray-900 mb-4">
          Complaint Process Timeline
        </h3>
        <div className="space-y-3">
          <div className="flex items-start">
            <div className="bg-orange-600 text-white rounded-full min-w-8 min-h-8 flex items-center justify-center text-sm font-semibold mr-3">
              1
            </div>
            <div>
              <p className="font-medium text-gray-800">Submission</p>
              <p className="text-sm text-gray-600">
                Your complaint is received and logged in our system
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="bg-orange-600 text-white rounded-full min-w-8 min-h-8 flex items-center justify-center text-sm font-semibold mr-3">
              2
            </div>
            <div>
              <p className="font-medium text-gray-800">Review (1-2 days)</p>
              <p className="text-sm text-gray-600">
                Complaint is reviewed and assigned to the appropriate department
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="bg-orange-600 text-white rounded-full min-w-8 min-h-8 flex items-center justify-center text-sm font-semibold mr-3">
              3
            </div>
            <div>
              <p className="font-medium text-gray-800">
                Investigation (3-5 days)
              </p>
              <p className="text-sm text-gray-600">
                Department investigates the complaint and gathers information
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="bg-orange-600 text-white rounded-full min-w-8 min-h-8 flex items-center justify-center text-sm font-semibold mr-3">
              4
            </div>
            <div>
              <p className="font-medium text-gray-800">Resolution</p>
              <p className="text-sm text-gray-600">
                Action is taken and you are notified of the outcome
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };
  