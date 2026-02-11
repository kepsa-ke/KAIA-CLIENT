import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import MembershipForm from "./pages/MembershipForm";
import Learning from "./pages/Learning";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminHome from "./pages/adminpages/AdminHome";
import AdminUsers from "./pages/adminpages/AdminUsers";
import AdminCourses from "./pages/adminpages/AdminCourses";
import AdminMembers from "./pages/adminpages/AdminMembers";
import AdminRequests from "./pages/adminpages/AdminRequests";
import ImpactReportsPage from "./pages/adminpages/AdminReports";
import AdminPartners from "./pages/adminpages/AdminPartners";

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/membership" element={<MembershipForm />} />
          <Route path="/learning" element={<Learning />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          {/* admin pages */}
          <Route path="/admin-home" element={<AdminHome />} />
          <Route path="/admin-users" element={<AdminUsers />} />
          <Route path="/admin-courses" element={<AdminCourses />} />
          <Route path="/admin-members" element={<AdminMembers />} />
          <Route path="/admin-requests" element={<AdminRequests />} />
          <Route path="/admin-stats" element={<ImpactReportsPage />} />
          <Route path="/admin-partners" element={<AdminPartners />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer />
    </div>
  );
}

export default App;
