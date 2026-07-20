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

import AdminPartners from "./pages/adminpages/AdminPartners";
import AdminNews from "./pages/adminpages/AdminNews";
import LeadersStatistics from "./pages/leaderspages/LeadersStatistics";
import LeadersNews from "./pages/leaderspages/LeadersNews";
import LeadersHome from "./pages/leaderspages/LeadersHome";
import News from "./pages/News";
import ResetPassword from "./pages/ResetPassword";
import AdminBlogs from "./pages/adminpages/AdminBlogs";
import LeadersBlogs from "./pages/leaderspages/LeadersBlogs";
import Blogs from "./pages/Blogs";
import AdminEvents from "./pages/adminpages/AdminEvents";
import LeadersEvents from "./pages/leaderspages/LeadersEvents";
import Events from "./pages/Events";
import AdminJobs from "./pages/adminpages/AdminJobs";
import LeadersJobs from "./pages/leaderspages/LeadersJobs";
import Jobs from "./pages/Jobs";
import AdminReports from "./pages/adminpages/AdminReports";
import AdminTrainingPartners from "./pages/adminpages/AdminTrainingPartners";
import LeadersTrainingPartner from "./pages/leaderspages/LeadersTrainingPartner";
import TrainingPartners from "./pages/TrainingPartners";
import LeadersCourses from "./pages/leaderspages/LeadersCourses";
import Courses from "./pages/Courses";
import WhyJoinAlliance from "./pages/aboutUs/WhyJoinAlliance";
import WhoCanJoin from "./pages/aboutUs/WhoCanJoin";
import AboutPrinciples from "./pages/aboutUs/Principles";
import Membership from "./pages/CompleteMembersPage";
import LeadersInsight from "./pages/leaderspages/LeadersInsight";
import AdminInsights from "./pages/adminpages/AdminInsights";
import Insights from "./pages/Insights";
import ConsolidatedAboutPage from "./pages/ConsolidatedAboutPage";
import KAISACommitteesPage from "./pages/aboutUs/KAISACommiteesPage";

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/learning" element={<Learning />} />
          <Route path="/training-partners" element={<TrainingPartners />} />
          <Route path="/news" element={<News />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/events" element={<Events />} />
          <Route path="/learn" element={<Courses />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/password-reset" element={<ResetPassword />} />
          <Route path="/why-join-alliance" element={<WhyJoinAlliance />} />
          <Route path="/who-can-join" element={<WhoCanJoin />} />
          <Route path="/guiding-principles" element={<AboutPrinciples />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/about" element={<ConsolidatedAboutPage />} />
          <Route path="/about-committees" element={<KAISACommitteesPage />} />

          {/* admin pages */}
          <Route path="/admin-home" element={<AdminHome />} />
          <Route path="/admin-users" element={<AdminUsers />} />
          <Route path="/admin-courses" element={<AdminCourses />} />
          <Route path="/admin-members" element={<AdminMembers />} />
          <Route path="/admin-requests" element={<AdminRequests />} />
          <Route path="/admin-stats" element={<AdminReports />} />
          <Route path="/admin-partners" element={<AdminPartners />} />
          <Route path="/admin-news" element={<AdminNews />} />
          <Route path="/admin-blogs" element={<AdminBlogs />} />
          <Route path="/admin-events" element={<AdminEvents />} />
          <Route path="/admin-jobs" element={<AdminJobs />} />
          <Route path="/admin-insights" element={<AdminInsights />} />
          <Route
            path="/admin-training-partners"
            element={<AdminTrainingPartners />}
          />

          {/* leaders pages */}
          <Route path="/leaders-home" element={<LeadersHome />} />
          <Route path="/leaders-stats" element={<LeadersStatistics />} />
          <Route path="/leaders-news" element={<LeadersNews />} />
          <Route path="/leaders-blogs" element={<LeadersBlogs />} />
          <Route path="/leaders-events" element={<LeadersEvents />} />
          <Route path="/leaders-jobs" element={<LeadersJobs />} />
          <Route path="/leaders-courses" element={<LeadersCourses />} />
          <Route path="/leaders-insights" element={<LeadersInsight />} />
          {/* <Route
            path="/leaders-training-partners"
            element={<LeadersTrainingPartner />}
          /> */}
        </Routes>
      </BrowserRouter>
      <ToastContainer />
    </div>
  );
}

export default App;
