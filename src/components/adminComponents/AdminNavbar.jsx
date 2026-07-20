// components/adminComponents/AdminNavbar.jsx
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../features/auth/authSlice";
import {
  AiOutlineHome,
  AiOutlineUser,
  AiOutlineBook,
  AiOutlineTeam,
  AiOutlinePartition,
  AiOutlineFileText,
  AiOutlineDashboard,
  AiOutlineLogout,
  AiOutlineMenu,
  AiOutlineClose,
  AiOutlineBarChart,
  AiOutlineAppstore,
  AiOutlineDoubleLeft,
  AiOutlineDoubleRight,
  AiOutlineCalendar,
  AiFillWechatWork,
  AiFillBehanceCircle,
} from "react-icons/ai";
import Logo from "../../assets/kai2.png";

const AdminNavbar = () => {
  const { user } = useSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(true); // Default to open on desktop
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      // On mobile, sidebar is closed by default
      if (mobile) {
        setIsOpen(false);
      } else {
        // On desktop, you might want to remember user preference
        const savedState = localStorage.getItem("sidebarOpen");
        if (savedState !== null) {
          setIsOpen(savedState === "true");
        } else {
          setIsOpen(true); // Default to open on desktop
        }
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Save sidebar state to localStorage when it changes (desktop only)
  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem("sidebarOpen", isOpen.toString());
    }
  }, [isOpen, isMobile]);

  const navItems = user?.isAdmin
    ? [
        { id: 1, title: "Dashboard", goTo: "/admin-home", icon: AiOutlineHome },
        { id: 2, title: "Users", goTo: "/admin-users", icon: AiOutlineUser },

        {
          id: 4,
          title: "Members",
          goTo: "/admin-members",
          icon: AiOutlineTeam,
        },
        {
          id: 5,
          title: "Partners",
          goTo: "/admin-partners",
          icon: AiOutlinePartition,
        },
        {
          id: 13,
          title: "Courses",
          goTo: "/admin-courses",
          icon: AiOutlineBook,
        },
        { id: 6, title: "News", goTo: "/admin-news", icon: AiOutlineFileText },
        {
          id: 7,
          title: "Blogs",
          goTo: "/admin-blogs",
          icon: AiOutlineAppstore,
        },
        {
          id: 8,
          title: "Events",
          goTo: "/admin-events",
          icon: AiOutlineCalendar,
        },
        {
          id: 9,
          title: "Jobs",
          goTo: "/admin-jobs",
          icon: AiFillWechatWork,
        },
        {
          id: 10,
          title: "Insights",
          goTo: "/admin-insights",
          icon: AiFillBehanceCircle,
        },
        {
          id: 11,
          title: "Requests",
          goTo: "/admin-requests",
          icon: AiOutlineDashboard,
        },
        {
          id: 12,
          title: "Statistics",
          goTo: "/admin-stats",
          icon: AiOutlineBarChart,
        },
      ]
    : [
        {
          id: 1,
          title: "Dashboard",
          goTo: "/leaders-home",
          icon: AiOutlineHome,
        },

        {
          id: 3,
          title: "News",
          goTo: "/leaders-news",
          icon: AiOutlineFileText,
        },
        {
          id: 4,
          title: "Blogs",
          goTo: "/leaders-blogs",
          icon: AiOutlineAppstore,
        },

        {
          id: 5,
          title: "Events",
          goTo: "/leaders-events",
          icon: AiOutlineCalendar,
        },

        {
          id: 6,
          title: "Jobs",
          goTo: "/leaders-jobs",
          icon: AiFillWechatWork,
        },
        {
          id: 7,
          title: "Insights",
          goTo: "/leaders-insights",
          icon: AiFillWechatWork,
        },

        // {
        //   id: 7,
        //   title: "Training Partner",
        //   goTo: "/leaders-training-partners",
        //   icon: AiFillBehanceCircle,
        // },

        {
          id: 8,
          title: "Advertise Courses",
          goTo: "/leaders-courses",
          icon: AiOutlineBook,
        },

        {
          id: 9,
          title: "Statistics",
          goTo: "/leaders-stats",
          icon: AiOutlineBarChart,
        },
      ];

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-lg shadow-lg"
      >
        {isOpen ? <AiOutlineClose size={24} /> : <AiOutlineMenu size={24} />}
      </button>

      {/* Desktop Toggle Button - appears when sidebar is collapsed */}
      {!isMobile && !isOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
          title="Expand sidebar"
        >
          <AiOutlineDoubleRight size={20} />
        </button>
      )}

      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-80 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white shadow-2xl z-40
          transition-all duration-300 ease-in-out
          ${isOpen ? (isMobile ? "w-64" : "w-64") : "w-0 lg:w-20"}
          ${isMobile ? (isOpen ? "translate-x-0" : "-translate-x-full") : "translate-x-0"}
          overflow-hidden
        `}
      >
        <div className="h-full flex flex-col">
          {/* Logo Area with Collapse Button for Desktop */}
          <div
            className={`
            p-4 border-b border-gray-200 flex items-center
            ${!isOpen && !isMobile ? "justify-center" : "justify-between"}
          `}
          >
            <Link to="/" className="flex items-center gap-3">
              <img
                src={Logo}
                alt="Logo"
                className="h-12object-contain flex-shrink-0"
              />
            </Link>

            {/* Collapse button for desktop - only shows when sidebar is open */}
            {!isMobile && isOpen && (
              <button
                onClick={toggleSidebar}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                title="Collapse sidebar"
              >
                <AiOutlineDoubleLeft size={18} className="text-gray-600" />
              </button>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-2 px-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <Link
                      to={item.goTo}
                      onClick={() => isMobile && setIsOpen(false)}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-lg
                        transition-colors duration-200 group relative
                        ${
                          isActive(item.goTo)
                            ? "bg-blue-50 text-blue-600"
                            : "text-gray-700 hover:bg-gray-100"
                        }
                        ${!isOpen && !isMobile ? "justify-center" : ""}
                      `}
                    >
                      <Icon size={20} className="flex-shrink-0" />
                      {(isOpen || isMobile) && (
                        <span className="text-sm font-medium truncate">
                          {item.title}
                        </span>
                      )}

                      {/* Tooltip for collapsed mode */}
                      {!isOpen && !isMobile && (
                        <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                          {item.title}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout Button */}
          <div className="p-3 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-lg
                text-red-600 hover:bg-red-50 w-full
                transition-colors duration-200 group relative
                ${!isOpen && !isMobile ? "justify-center" : ""}
              `}
            >
              <AiOutlineLogout size={20} className="flex-shrink-0" />
              {(isOpen || isMobile) && (
                <span className="text-sm font-medium">Logout</span>
              )}

              {/* Tooltip for collapsed mode */}
              {!isOpen && !isMobile && (
                <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                  Logout
                </span>
              )}
            </button>
          </div>
        </div>
      </aside>

      <style jsx>{`
        .main-content-adjustment {
          transition: padding-left 0.3s ease;
        }
      `}</style>
    </>
  );
};

export default AdminNavbar;
