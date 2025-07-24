import { Clock, Mail, Phone } from "lucide-react";

export default function InformationCards({ isLoaded }: { isLoaded: boolean }) {
    return (
      <div
        className={`mt-8 grid grid-cols-1 @lg/main:grid-cols-2 @4xl/main:grid-cols-3 gap-6 transition-all duration-700 ease-out ${
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
        style={{ transitionDelay: "300ms" }}
      >
        <div className="bg-blue-50 rounded-lg p-6">
          <Clock className="h-8 w-8 text-blue-600 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Office Hours</h3>
          <p className="text-sm text-gray-600">
            Monday to Friday: 8:00 AM - 5:00 PM
          </p>
          <p className="text-sm text-gray-600">Lunch Break: 12:00 PM - 1:00 PM</p>
        </div>
  
        <div className="bg-green-50 rounded-lg p-6">
          <Mail className="h-8 w-8 text-green-600 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Confirmation</h3>
          <p className="text-sm text-gray-600">
            You'll receive an email confirmation within 24 hours
          </p>
        </div>
  
        <div className="bg-purple-50 rounded-lg p-6">
          <Phone className="h-8 w-8 text-purple-600 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
          <p className="text-sm text-gray-600">Call us at: (02) 8123-4567</p>
          <p className="text-sm text-gray-600">Email: appointments@lgu.gov.ph</p>
        </div>
      </div>
    );
  }
  