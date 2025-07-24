import { createBrowserRouter, RouterProvider, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./components/_global/NotificationSystem";
import ProtectedRoute from "./components/_auth/ProtectedRoute"; 
import AppLayout from "./components/AppLayout";
import Dashboard from "./components/dashboard/Dashboard";
import ResidentManagement from "./components/residentManagement/ResidentManagement";
import AddNewResident from "./components/residentManagement/AddNewResident";
import EditResident from "./components/residentManagement/EditResident";
import ViewResident from "./components/residentManagement/ViewResident";
import ProcessDocument from "./components/processDocument/ProcessDocument";
import BarangayClearanceForm from "./components/processDocument/BarangayClearanceForm";
import BusinessPermitForm from "./components/processDocument/BusinessPermitForm";
import CertificateOfIndigencyForm from "./components/processDocument/CertificateOfIndigencyForm";
import CertificateOfResidencyForm from "./components/processDocument/CertificateOfResidencyForm";
import DocumentQueue from "./components/processDocument/DocumentQueue";
import BarangayClearancePrint from "./components/processDocument/BarangayClearancePrint";
import CertificateOfResidencyPrint from "./components/processDocument/CertificateOfResidencyPrint";
import CertificateOfIndigencyPrint from "./components/processDocument/CertificateOfIndigencyPrint";
import BusinessPermitPrint from "./components/processDocument/BusinessPermitPrint";
import HouseholdManagement from "./components/householdManagement/HouseholdManagement";
import AddNewHousehold from "./components/householdManagement/AddNewHousehold";
import EditHousehold from "./components/householdManagement/EditHousehold";
import ViewHousehold from "./components/householdManagement/ViewHousehold";
import BarangayOfficialsPage from "./components/barangayOfficials/BarangayOfficialsPage";
import EditBarangayOfficial from "./components/barangayOfficials/EditBarangayOfficial";
import AddBarangayOfficial from "./components/barangayOfficials/AddBarangayOfficial";
import ListBarangayOfficalsToEdit from "./components/barangayOfficials/ListBarangayOfficalsToEdit";

import DataImport from "./components/import/DataImport";
import ReportsPage from "./components/reports/ReportsPage";
import SettingsPage from "./components/_settings/SettingsPage";
import LoginPage from "./components/_auth/LoginPage";
import SignupPage from "./components/_auth/SignupPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import './i18';
import ViewBarangayOfficial from "./components/barangayOfficials/ViewBarangayOfficial";
import ActivityLogManagement from "./components/activityLogs/ActivityLogManagement";
import HelpDeskPage from "./components/helpDesk/HelpDeskPage";
import AppointmentsPage from "./components/helpDesk/Appointments/Appointments";
import BlotterPage from "./components/helpDesk/Blotter/Blotter";
import ComplaintsPage from "./components/helpDesk/Complaints/Complaints";
import SuggestionsPage from "./components/helpDesk/Suggestions/Suggestions";
import UserManagement from "./components/userManagement/UserManagement";
import EditUserPage from "./components/userManagement/EditUserPage";
import ViewUserPage from "./components/userManagement/ViewUserPage";


// Wrapper components to handle navigation prop
const ProcessDocumentWrapper = () => {
  const navigate = useNavigate();
  return <ProcessDocument onNavigate={(item) => navigate(`/${item}`)} />;
};

const DocumentQueueWrapper = () => {
  const navigate = useNavigate();
  return <DocumentQueue onNavigate={(item) => navigate(`/${item}`)} />;
};

const BarangayClearanceFormWrapper = () => {
  const navigate = useNavigate();
  return <BarangayClearanceForm onNavigate={(item) => navigate(`/${item}`)} />;
};

const BusinessPermitFormWrapper = () => {
  const navigate = useNavigate();
  return <BusinessPermitForm onNavigate={(item) => navigate(`/${item}`)} />;
};

const CertificateOfIndigencyFormWrapper = () => {
  const navigate = useNavigate();
  return <CertificateOfIndigencyForm onNavigate={(item) => navigate(`/${item}`)} />;
};

const CertificateOfResidencyFormWrapper = () => {
  const navigate = useNavigate();
  return <CertificateOfResidencyForm onNavigate={(item) => navigate(`/${item}`)} />;
};

// Define routes using data format
const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <ProtectedRoute requireAuth={false}>
        <LoginPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/",
    element: (
      <ProtectedRoute requireAuth={true}>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "residents",
        children: [
          {
            index: true,
            element: <ResidentManagement />,
          },
          {
            path: "add",
            element: <AddNewResident />,
          },
          {
            path: "edit/:id",
            element: <EditResident />,
          },
          {
            path: "view/:id",
            element: <ViewResident />,
          },
        ],
      },
      {
        path: "household",
        children: [
          {
            index: true,
            element: <HouseholdManagement />,
          },
          {
            path: "add",
            element: <AddNewHousehold />,
          },
          {
            path: "edit/:id",
            element: <EditHousehold />,
          },
          {
            path: "view/:id",
            element: <ViewHousehold />,
          },
        ],
      },
      {
        path: "activity-logs",
        children: [
          {
            index: true,
            element: <ActivityLogManagement />,
          },
          {
            path: "add",
            element: <AddNewHousehold />,
          },
        ],
      },
      {
        path: "import",
        element: <DataImport />,
      },
      {
        path: "process-document",
        children: [
          {
            index: true,
            element: <ProcessDocumentWrapper />,
          },
          {
            path: "document-queue",
            element: <DocumentQueueWrapper />,
          },
          {
            path: "barangay-clearance",
            element: <BarangayClearanceFormWrapper />,
          },
          {
            path: "business-permit",
            element: <BusinessPermitFormWrapper />,
          },
          {
            path: "certificate-indigency",
            element: <CertificateOfIndigencyFormWrapper />,
          },
          {
            path: "certificate-residency",
            element: <CertificateOfResidencyFormWrapper />,
          },

        ],
      },
      {
        path: "officials",
        children: [
          {
            index: true,
            element: <BarangayOfficialsPage />,
          },
          {
            path: "add",
            element: <AddBarangayOfficial />,
          },
          {
            path: "edit",
            element: <ListBarangayOfficalsToEdit />,
          },
          {
            path: "edit/:id",
            element: <EditBarangayOfficial />,
          },
          {
            path: "view/:id",
            element: <ViewBarangayOfficial />
          }
        ]
      },
      {
        path: "projects",
        // children: [
        //   {
        //     index: true,
        //     element: <ProjectsAndPrograms />,
        //   },
        //   {
        //     path: "edit/:projectId",
        //     element: <EditProject />,
        //   },
        //   {
        //     path: "add",
        //     element: <AddNewProject />,
        //   },
        // ],
      },      {
        path: "users",
        children: [
          {
            index: true,
            element: <UserManagement />,
          },
          {
            path: "edit/:id",
            element: <EditUserPage />,
          },
          {
            path: "view/:id",
            element: <ViewUserPage />,
          },
        ],
      },
      {
        path: "settings",
         element: <SettingsPage />,
      },
      {
        path: "reports",
        element: <ReportsPage />,
      },
      {
        path: "help-desk",
        children: [
          {
            index: true,
            element: <HelpDeskPage />,
          },
          {
            path: "schedule-appointment",
            element: <AppointmentsPage />,
          },
          {
            path: "file-blotter",
            element: <BlotterPage />,
          },
          {
            path: "file-complaint",
            element: <ComplaintsPage />,
          },
          {
            path: "share-suggestions",
            element: <SuggestionsPage />,
          },
        ],
      },
      {
        path: "*",
        element: <Navigate to="/dashboard" replace />,
      },
    ],
  },
  // Standalone Print Routes (outside AppLayout to avoid headers/navigation)
  {
    path: "/print/barangay-clearance/:documentId",
    element: (
      <ProtectedRoute requireAuth={true}>
        <BarangayClearancePrint />
      </ProtectedRoute>
    ),
  },
  {
    path: "/print/certificate-residency/:documentId",
    element: (
      <ProtectedRoute requireAuth={true}>
        <CertificateOfResidencyPrint />
      </ProtectedRoute>
    ),
  },
  {
    path: "/print/certificate-indigency/:documentId",
    element: (
      <ProtectedRoute requireAuth={true}>
        <CertificateOfIndigencyPrint />
      </ProtectedRoute>
    ),
  },
  {
    path: "/print/business-permit/:documentId",
    element: (
      <ProtectedRoute requireAuth={true}>
        <BusinessPermitPrint />
      </ProtectedRoute>
    ),
  },
]);

// Main App Component
function App() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <NotificationProvider>
          <RouterProvider router={router} />
        </NotificationProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;