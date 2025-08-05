import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FiHome,
  FiUsers,
  FiFile,
  FiHelpCircle,
  FiBriefcase,
  FiUserCheck,
  FiBarChart,
  FiSettings,
  FiChevronDown,
  FiChevronRight,
  FiUpload,
} from "react-icons/fi";
import sanMiguelLogo from "@/assets/logo.jpg";

interface SidebarProps {
  activeItem: string;
  onItemClick: (item: string) => void;
  isExpanded: boolean;
  isMobile: boolean;
}

interface SubmenuPosition {
  top: number;
  left: number;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeItem,
  onItemClick,
  isExpanded,
  isMobile,
}) => {
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [submenuPositions, setSubmenuPositions] = useState<
    Record<string, SubmenuPosition>
  >({});
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const menuItemRefs = useRef<Record<string, HTMLAnchorElement>>({});
  const submenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: FiHome },
    { id: "residents", label: "Resident Management", icon: FiUsers },
    { id: "household", label: "Household Management", icon: FiUsers },
    { id: "import", label: "Data Import", icon: FiUpload }, 
    {
      id: "process-document",
      label: "Process Document",
      icon: FiFile,
      hasSubmenu: true,
      submenu: [
        { id: "barangay-clearance", label: "Barangay Clearance" },
        { id: "business-permit", label: "Business Permit" },
        { id: "certificate-indigency", label: "Certificate of Indigency" },
        { id: "certificate-residency", label: "Certificate of Residency" },
      ],
    },
    {
      id: "help-desk",
      label: "Help desk",
      icon: FiHelpCircle,
      hasSubmenu: true,
      submenu: [
        { id: "schedule-appointment", label: "Schedule an appointment" },
        { id: "file-blotter", label: "File blotter report" },
        { id: "file-complaint", label: "File a complaint" },
        { id: "share-suggestions", label: "Share suggestions" },
      ],
    },
    // { id: "projects", label: "Projects & Programs", icon: FiBriefcase },
    { id: "officials", label: "Barangay Officials", icon: FiUserCheck },
    { id: "reports", label: "Reports", icon: FiBarChart },
    { id: "users", label: "Manage Users", icon: FiUsers },
    { id: "settings", label: "Settings", icon: FiSettings },
  ];

  // Helper function to find which menu should be expanded based on active item
  const getActiveParentMenu = () => {
    // Check if active item is a parent menu
    const parentMenu = menuItems.find(item => item.id === activeItem);
    if (parentMenu?.hasSubmenu) {
      return parentMenu.id;
    }

    // Check if active item is a submenu item
    const activeSegments = activeItem.split('/');
    const parentId = activeSegments[0];
    
    const parent = menuItems.find(item => 
      item.id === parentId && 
      item.hasSubmenu && 
      item.submenu?.some(sub => 
        activeItem === `${parentId}/${sub.id}` || 
        activeSegments[1] === sub.id
      )
    );
    
    return parent?.id || null;
  };

  // Calculate submenu position
  const calculateSubmenuPosition = (menuId: string): SubmenuPosition => {
    const menuElement = menuItemRefs.current[menuId];
    if (!menuElement) return { top: 0, left: 64 };

    const rect = menuElement.getBoundingClientRect();
    const headerHeight = 81;

    // Calculate position
    let top = rect.top;
    const left = rect.right + 8; // Add small gap

    // Ensure submenu doesn't go above header
    if (top < headerHeight) {
      top = headerHeight;
    }

    // Ensure submenu doesn't go below viewport
    const maxTop = window.innerHeight - 200; // Assuming submenu height ~200px
    if (top > maxTop) {
      top = maxTop;
    }

    return { top, left };
  };

  // Update submenu positions
  const updateSubmenuPositions = () => {
    if (isMobile || isExpanded) return;

    const newPositions: Record<string, SubmenuPosition> = {};
    menuItems.forEach((item) => {
      if (item.hasSubmenu) {
        newPositions[item.id] = calculateSubmenuPosition(item.id);
      }
    });
    setSubmenuPositions(newPositions);
  };

  // Auto-expand parent menu based on active item
  useEffect(() => {
    const activeParent = getActiveParentMenu();
    
    if (isMobile) {
      // On mobile, expand all menus with submenus
      const menusWithSubmenus = menuItems
        .filter(item => item.hasSubmenu)
        .map(item => item.id);
      setExpandedMenus(menusWithSubmenus);
    } else if (isExpanded) {
      // When sidebar is expanded (desktop), only expand active parent
      if (activeParent) {
        setExpandedMenus([activeParent]);
      } else {
        // No active submenu, collapse all
        setExpandedMenus([]);
      }
    } else {
      // Collapsed sidebar - clear expanded menus
      setExpandedMenus([]);
    }
  }, [activeItem, isExpanded, isMobile]);

  // Clear hover state when sidebar collapses
  useEffect(() => {
    if (!isExpanded && !isMobile) {
      setHoveredMenu(null);
    }
  }, [isExpanded, isMobile]);

  // Update positions when menus expand/collapse or sidebar state changes
  useEffect(() => {
    if (!isMobile && !isExpanded) {
      // Pre-calculate all positions for collapsed sidebar
      updateSubmenuPositions();
    }
  }, [isExpanded, isMobile]);

  // Update positions on scroll/resize
  useEffect(() => {
    if (!isMobile && !isExpanded) {
      updateSubmenuPositions();
    }
  }, [expandedMenus]);

  // Listen for scroll events on sidebar
  useEffect(() => {
    const sidebar = sidebarRef.current;
    if (!sidebar) return;

    const handleScroll = () => {
      updateSubmenuPositions();
    };

    const handleResize = () => {
      updateSubmenuPositions();
    };

    sidebar.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);

    return () => {
      sidebar.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [expandedMenus, isExpanded, isMobile]);

  const toggleSubmenu = (menuId: string) => {
    // Don't allow toggling on mobile - submenus always expanded
    if (isMobile) return;
    
    if (!isExpanded) {
      // For collapsed sidebar, use hover behavior instead
      return;
    }

    setExpandedMenus((prev) => {
      // Only one submenu open at a time
      if (prev.includes(menuId)) {
        return prev.filter(id => id !== menuId);
      } else {
        return [menuId];
      }
    });
  };

  const handleMenuClick = (e: React.MouseEvent, item: any) => {
    // Allow right-click and middle-click to work naturally for links
    if (e.button === 1 || e.button === 2) return;

    e.preventDefault();

    // Always navigate to the menu item
    onItemClick(item.id);

    // If it has submenu and sidebar is expanded, ensure it's expanded
    if (item.hasSubmenu && (isExpanded || isMobile) && !isMobile) {
      // Don't toggle on mobile since they're always expanded
      if (!expandedMenus.includes(item.id)) {
        setExpandedMenus([item.id]);
      }
    }
  };

  const handleMenuHover = (menuId: string) => {
    if (!isExpanded && !isMobile) {
      // Clear any existing timeout
      if (submenuTimeoutRef.current) {
        clearTimeout(submenuTimeoutRef.current);
      }

      setHoveredMenu(menuId);
      setExpandedMenus([menuId]);
    }
  };

  // removed menuId: string
  const handleMenuLeave = () => {
    if (!isExpanded && !isMobile) {
      // Delay closing to allow moving to submenu
      submenuTimeoutRef.current = setTimeout(() => {
        setHoveredMenu(null);
        setExpandedMenus([]);
      }, 300);
    }
  };

  const handleSubmenuEnter = () => {
    if (submenuTimeoutRef.current) {
      clearTimeout(submenuTimeoutRef.current);
    }
  };

  const handleSubmenuLeave = () => {
    if (!isExpanded && !isMobile) {
      submenuTimeoutRef.current = setTimeout(() => {
        setHoveredMenu(null);
        setExpandedMenus([]);
      }, 300);
    }
  };

  const handleSubmenuClick = (e: React.MouseEvent, itemId: string, subItemId: string) => {
    // Allow right-click and middle-click to work naturally for links
    if (e.button === 1 || e.button === 2) return;

    // For regular left clicks, prevent default and use programmatic navigation
    e.preventDefault();

    // Navigate first
    onItemClick(itemId + "/" + subItemId);

    // Only close submenu if sidebar is collapsed
    if (!isExpanded && !isMobile) {
      setExpandedMenus([]);
      setHoveredMenu(null);
    }
  };

  const isSubmenuActive = (submenu: any[]) => {
    return submenu.some((subItem) => subItem.id === activeItem);
  };

  // Determine if submenu should be shown
  const shouldShowSubmenu = (itemId: string) => {
    if (isMobile) {
      // Always show on mobile
      return true;
    }
    
    if (isExpanded) {
      // Show if expanded in expanded sidebar
      return expandedMenus.includes(itemId);
    } else {
      // Show if hovered in collapsed sidebar
      return hoveredMenu === itemId && expandedMenus.includes(itemId);
    }
  };

  return (
    <aside
      ref={sidebarRef}
      className={`transition-all duration-200 ${
        isExpanded ? "md:w-72 md:min-w-72" : "md:min-w-16 md:w-16"
      } overflow-x-hidden overflow-y-auto ${
        isExpanded ? "min-w-screen w-screen" : "min-w-0 w-0"
      } bg-gray-50 border-r border-gray-200 min-h-screen`}
    >
      <nav className="py-4">
        {/* Logo and Title */}
        <div
          className={`transition-all duration-200 ${
            !isMobile && !isExpanded ? "w-16" : "w-72"
          } flex gap-3 space-x-3 px-3 py-4 overflow-x-hidden`}
        >
          <img
            src={sanMiguelLogo}
            className={`transition-all duration-200 ${
              !isMobile && !isExpanded ? "w-10 h-10" : "w-16 h-16"
            } rounded-full m-0`}
            alt="West Triangle Logo"
          />
          <div className={`${!isMobile && !isExpanded ? "max-w-0" : ""}`}>
            <h1 className="whitespace-nowrap text-md font-bold text-gray-900">
              Brgy. West Triangle
            </h1>
            <p
              className={`${
                !isMobile && !isExpanded
                  ? "whitespace-nowrap"
                  : "whitespace-normal"
              } text-sm text-gray-500`}
            >
              Information Management System
            </p>
          </div>
        </div>

        {menuItems.map((item) => (
          <div
            key={item.id}
            className="relative"
            onMouseEnter={() => item.hasSubmenu && handleMenuHover(item.id)}
            // removed menuId: string
            onMouseLeave={() => item.hasSubmenu && handleMenuLeave()}
          >
            <Link
              ref={(el) => {
                if (el) menuItemRefs.current[item.id] = el;
              }}
              to={`/${item.id}`}
              onClick={(e) => handleMenuClick(e, item)}
              className={`sidebar-link flex items-center px-[22px] min-h-12 transition-colors duration-200 cursor-pointer no-underline ${
                isExpanded ? "md:w-72" : "md:w-full"
              } w-screen overflow-x-hidden ${
                activeItem.split('/')[0] === item.id ||
                (item.hasSubmenu && isSubmenuActive(item.submenu || []))
                  ? `active font-medium ${
                      isExpanded ? "border-r-4" : "border-r-3"
                    } border-smblue-400`
                  : ""
              }`}
              title={!isMobile && !isExpanded ? item.label : ""}
            >
              <item.icon
                className={`transition-all duration-200 w-5 h-5 ${
                  isExpanded || isMobile ? "mr-3" : "mr-0"
                }`}
              />
              <span
                className={`flex-1 text-left transition-all duration-200 ${
                  !isMobile && !isExpanded
                    ? "opacity-0 max-w-0 overflow-hidden whitespace-nowrap"
                    : "opacity-100"
                }`}
              >
                {item.label}
              </span>
              {item.hasSubmenu && (
                <div
                  className={`transition-all duration-200 ${
                    !isMobile && !isExpanded
                      ? "opacity-0 max-w-0 overflow-hidden"
                      : "opacity-100"
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleSubmenu(item.id);
                  }}
                >
                  {(isMobile || expandedMenus.includes(item.id)) ? (
                    <FiChevronDown className="w-4 h-4" />
                  ) : (
                    <FiChevronRight className="w-4 h-4" />
                  )}
                </div>
              )}
            </Link>

            {/* Submenu */}
            {item.hasSubmenu && (
              <div
                className={`${
                  !isMobile && !isExpanded
                    ? `fixed bg-white p-3 rounded-2xl border border-gray-200 shadow-lg min-w-52 z-50 ${
                        shouldShowSubmenu(item.id) ? 'block' : 'hidden'
                      }`
                    : isMobile
                    ? "ml-8 mt-1 relative transition-all duration-300 ease-in-out"
                    : "ml-8 mt-1 relative transition-all duration-300 ease-in-out"
                }`}
                style={
                  !isMobile && !isExpanded
                    ? {
                        top: submenuPositions[item.id]?.top ? `${submenuPositions[item.id].top}px` : 'auto',
                        left: submenuPositions[item.id]?.left ? `${submenuPositions[item.id].left}px` : 'auto',
                      }
                    : {
                        maxHeight: (isMobile || expandedMenus.includes(item.id)) ? '500px' : '0',
                        opacity: (isMobile || expandedMenus.includes(item.id)) ? '1' : '0',
                        overflow: 'hidden'
                      }
                }
                onMouseEnter={handleSubmenuEnter}
                onMouseLeave={handleSubmenuLeave}
              >
                {/* Continuous vertical line */}
                <div
                  className={`${
                    !isMobile && !isExpanded ? "hidden" : "block"
                  } absolute left-2 top-0 bottom-0 w-px bg-gray-300`}
                ></div>

                <div className="space-y-0">
                  {item.submenu?.map((subItem) => (
                    <div key={subItem.id} className="relative">
                      <Link
                        to={`/${item.id}/${subItem.id}`}
                        onClick={(e) => handleSubmenuClick(e, item.id, subItem.id)}
                        className={`flex items-center ${
                          !isMobile && !isExpanded ? "px-3" : "pl-6 pr-4"
                        } py-2 text-sm w-full text-left rounded-md transition-colors cursor-pointer relative ${
                          activeItem.split('/')[1] === subItem.id
                            ? "bg-[#D2DEE7] text-smblue-400 font-medium"
                            : "hover:bg-[#E6EBF0] hover:text-smblue-400"
                        }`}
                      >
                        {subItem.label}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;

