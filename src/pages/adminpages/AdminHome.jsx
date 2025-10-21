import { useEffect, useState } from "react";
import AdminNavbar from "../../components/adminComponents/AdminNavbar";
import { useSelector } from "react-redux";
import axios from "../../axios";
import Spinner from "../../components/Spinner";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";

const AdminHome = () => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);

  // fetch users, courses, members, requests
  const [allUsers, setAllUsers] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [allRequests, setAllRequests] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      toast.error("Please sign in");
      return;
    }
  }, [user, navigate]);

  // fetch users
  const handleFetchUsers = async () => {
    try {
      setLoading(true);
      let token = user?.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get("/users", config);
      if (response) {
        setLoading(false);
        setAllUsers(response.data);
        // console.log(response.data);
      }
    } catch (error) {
      setLoading(false);
      toast.error("Error Fetching Users");
      console.log(error);
    }
  };

  // fetch courses
  const handleFetchCourses = async () => {
    try {
      setLoading(true);
      let token = user?.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get("/courses", config);
      if (response) {
        setLoading(false);
        setAllCourses(response.data);
        // console.log(response.data);
      }
    } catch (error) {
      setLoading(false);
      toast.error("Error Fetching Courses");
      console.log(error);
    }
  };

  // fetch members
  const handleFetchMembers = async () => {
    try {
      setLoading(true);
      let token = user?.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get("/members", config);
      if (response) {
        setLoading(false);
        setAllMembers(response.data);
        // console.log(response.data);
      }
    } catch (error) {
      setLoading(false);
      toast.error("Error Fetching Members");
      console.log(error);
    }
  };
  // fetch requests
  const handleRequests = async () => {
    try {
      setLoading(true);
      let token = user?.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get("/requests", config);
      if (response) {
        setLoading(false);
        setAllRequests(response.data);
        // console.log(response.data);
      }
    } catch (error) {
      setLoading(false);
      toast.error("Error Fetching Requests");
      console.log(error);
    }
  };

  useEffect(() => {
    setLoading(true);
    handleFetchUsers();
    handleFetchCourses();
    handleFetchMembers();
    handleRequests();
    setLoading(false);
  }, []);

  return (
    <div>
      <AdminNavbar />
      <div className=" mt-[5em] px-[2em]  xl:px-[5em]">
        <p className="font-bold">Hello {user?.username}</p>
      </div>
      <div className=" mt-[1em] px-[2em]  xl:px-[5em] h-[80vh] flex justify-center items-center">
        <div>
          {loading ? (
            <div className="h-[90vh] w-full flex justify-center items-center">
              <Spinner message="Loading Information" />
            </div>
          ) : (
            <div className="flex flex-col gap-8 justify-center items-center">
              {/* members */}
              {user?.isAdmin ? (
                <Link to="/admin-members">
                  <div className="border border-blue-600 p-5 rounded-lg">
                    <p className="text-center mb-4">Registered KAISA Members</p>
                    <p className="text-center font-bold">
                      {allMembers && allMembers.length} Members
                    </p>
                  </div>
                </Link>
              ) : (
                <div className="border border-blue-600 p-5 rounded-lg">
                  <p className="text-center mb-4">Registered KAISA Members</p>
                  <p className="text-center font-bold">
                    {allMembers && allMembers.length} Members
                  </p>
                </div>
              )}

              {/* users */}

              {user?.isAdmin && (
                <Link to="/admin-users">
                  <div className="border border-blue-600 p-5 rounded-lg">
                    <p className="text-center mb-4">
                      These users are managing their respective organizations
                    </p>
                    <p className="text-center font-bold">
                      {allUsers && allUsers.length} Users
                    </p>
                  </div>
                </Link>
              )}
              {/* courses */}

              <Link to="/admin-courses">
                <div className="border border-blue-600 p-5 rounded-lg">
                  <p className="text-center mb-4">
                    All courses under the AI learning page
                  </p>
                  <p className="text-center font-bold">
                    {allCourses && allCourses.length} Courses
                  </p>
                </div>
              </Link>
              {/* requests */}
              {user?.isAdmin && (
                <Link to="/admin-requests">
                  <div className="border border-blue-600 p-5 rounded-lg">
                    <p className="text-center mb-4">Total Requests So Far</p>
                    <p className="text-center font-bold">
                      {allRequests && allRequests.length} Requests
                    </p>
                  </div>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
