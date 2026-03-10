// components/adminComponents/AdminLayout.jsx
import { useState, useEffect } from "react";
import AdminNavbar from "./AdminNavbar";

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);

    // Listen for sidebar state changes
    const handleStorageChange = () => {
      const saved = localStorage.getItem("sidebarOpen");
      if (saved !== null) {
        setSidebarOpen(saved === "true");
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Initial check
    handleStorageChange();

    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <main
        className={`
          transition-all duration-300 ease-in-out
          ${!isMobile ? (sidebarOpen ? "ml-64" : "ml-20") : "ml-0"}
        `}
      >
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
