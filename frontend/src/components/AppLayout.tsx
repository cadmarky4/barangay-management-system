import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Header from "./_global/Header";
import Sidebar from "./_global/Sidebar";

const AppLayout: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(
    window.matchMedia("(max-width: 767px)").matches
  );

  const location = useLocation();
  const navigate = useNavigate();

  // Get current active menu item from URL
  const getActiveMenuItem = () => {
    const path = location.pathname.substring(1) || "dashboard";

    // // Handle nested project routes
    // if (path.startsWith("projects")) {
    //   return "projects";
    // }
    // // Handle nested routes for residents and household
    // if (path.startsWith("residents")) {
    //   return "residents";
    // }
    // if (path.startsWith("household")) {
    //   return "household";
    // }
    // // Handle nested process-document routes
    // if (path.startsWith("process-document")) {
    //   return "process-document";
    // }
    // // Handle nested help-desk routes
    // if (path.startsWith("help-desk")) {
    //   return "help-desk";
    // }
    return path;
  };

  const handleMenuItemClick = (item: string) => {
    navigate(`/${item}`);
    if (isMobile) setIsOpen(false);
  };

  const handleSidebarToggle = () => {
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");

    const handleMediaChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
      setIsOpen(!event.matches);
    };

    setIsMobile(mediaQuery.matches);
    setIsOpen(!mediaQuery.matches);

    mediaQuery.addEventListener("change", handleMediaChange);
    return () => mediaQuery.removeEventListener("change", handleMediaChange);
  }, []);
  return (
    <>
      <Header
        isSidebarExpanded={isOpen}
        onToggleSidebar={handleSidebarToggle}
        isMobile={isMobile}
      />
      <div className="bg-gray-50 flex h-screen overflow-hidden">
        <Sidebar
          activeItem={getActiveMenuItem()}
          onItemClick={handleMenuItemClick}
          isExpanded={isOpen}
          isMobile={isMobile}
        />
        <main className="flex-1 mt-[81px] h-[calc(100vh-81px)] overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default AppLayout;