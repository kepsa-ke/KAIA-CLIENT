import { useEffect, useState } from "react";
import AdminNavbar from "../../components/adminComponents/AdminNavbar";
import { useSelector, useDispatch } from "react-redux";
import axios from "../../axios";
import Spinner from "../../components/Spinner";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../../features/auth/authSlice";

const AdminHome = () => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  // fetch users, courses, members, requests
  const [allUsers, setAllUsers] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [allRequests, setAllRequests] = useState([]);

  const navigate = useNavigate();

  // Check if token is expired
  const isTokenExpired = (token) => {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const isExpired = payload.exp * 1000 < Date.now();
      return isExpired;
    } catch (error) {
      console.error("Error decoding token:", error);
      return true;
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Check token expiration on component mount
    if (isTokenExpired(user?.token)) {
      toast.error("Your session has expired. Please login again.");
      dispatch(logout());
      navigate("/login");
      return;
    }
  }, [user, navigate, dispatch]);

  // Enhanced API call handler
  const handleApiCall = async (apiFunction, errorMessage) => {
    try {
      setLoading(true);

      // Check token expiration before making API call
      if (isTokenExpired(user?.token)) {
        toast.error("Your session has expired. Please login again.");
        dispatch(logout());
        navigate("/login");
        return null;
      }

      const token = user?.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await apiFunction(config);
      return response.data;
    } catch (error) {
      console.error("API Error:", error);

      // The axios interceptor will handle 401 errors globally
      // But we still want to show specific error messages for other errors
      if (error.response?.status !== 401) {
        toast.error(errorMessage);
      }

      return null;
    } finally {
      setLoading(false);
    }
  };

  // Individual fetch functions
  const handleFetchUsers = async () => {
    const users = await handleApiCall(
      (config) => axios.get("/users", config),
      "Error Fetching Users"
    );
    if (users) setAllUsers(users);
  };

  const handleFetchCourses = async () => {
    const courses = await handleApiCall(
      (config) => axios.get("/courses", config),
      "Error Fetching Courses"
    );
    if (courses) setAllCourses(courses);
  };

  const handleFetchMembers = async () => {
    const members = await handleApiCall(
      (config) => axios.get("/members", config),
      "Error Fetching Members"
    );
    if (members) setAllMembers(members);
  };

  const handleRequests = async () => {
    const requests = await handleApiCall(
      (config) => axios.get("/requests", config),
      "Error Fetching Requests"
    );
    if (requests) setAllRequests(requests);
  };

  // Fetch all data
  const fetchAllData = async () => {
    if (!user || isTokenExpired(user?.token)) {
      return;
    }

    setLoading(true);
    try {
      await Promise.all([
        handleFetchUsers(),
        handleFetchCourses(),
        handleFetchMembers(),
        handleRequests(),
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // useEffect(() => {
  //   if (!user) {
  //     navigate("/login");
  //     return;
  //   }
  // }, [user, navigate]);

  // fetch users
  // const handleFetchUsers = async () => {
  //   try {
  //     setLoading(true);
  //     let token = user?.token;
  //     const config = {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     };
  //     const response = await axios.get("/users", config);
  //     if (response) {
  //       setLoading(false);
  //       setAllUsers(response.data);
  //       // console.log(response.data);
  //     }
  //   } catch (error) {
  //     setLoading(false);
  //     toast.error("Error Fetching Users");
  //     console.log(error);
  //   }
  // };

  // // fetch courses
  // const handleFetchCourses = async () => {
  //   try {
  //     setLoading(true);
  //     let token = user?.token;
  //     const config = {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     };
  //     const response = await axios.get("/courses", config);
  //     if (response) {
  //       setLoading(false);
  //       setAllCourses(response.data);
  //       // console.log(response.data);
  //     }
  //   } catch (error) {
  //     setLoading(false);
  //     toast.error("Error Fetching Courses");
  //     console.log(error);
  //   }
  // };

  // // fetch members
  // const handleFetchMembers = async () => {
  //   try {
  //     setLoading(true);
  //     let token = user?.token;
  //     const config = {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     };
  //     const response = await axios.get("/members", config);
  //     if (response) {
  //       setLoading(false);
  //       setAllMembers(response.data);
  //       // console.log(response.data);
  //     }
  //   } catch (error) {
  //     setLoading(false);
  //     toast.error("Error Fetching Members");
  //     console.log(error);
  //   }
  // };
  // // fetch requests
  // const handleRequests = async () => {
  //   try {
  //     setLoading(true);
  //     let token = user?.token;
  //     const config = {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     };
  //     const response = await axios.get("/requests", config);
  //     if (response) {
  //       setLoading(false);
  //       setAllRequests(response.data);
  //       // console.log(response.data);
  //     }
  //   } catch (error) {
  //     setLoading(false);
  //     toast.error("Error Fetching Requests");
  //     console.log(error);
  //   }
  // };

  // useEffect(() => {
  //   setLoading(true);
  //   handleFetchUsers();
  //   handleFetchCourses();
  //   handleFetchMembers();
  //   handleRequests();
  //   setLoading(false);
  // }, []);

  return (
    <div>
      <AdminNavbar />
      <div className=" mt-[5em] px-[2em]  xl:px-[5em]">
        {user?.isAdmin ? (
          <p className="font-semibold mt-2 text-blue-600">
            Full Admin Rights Granted
          </p>
        ) : (
          <p className="font-semibold mt-2 text-blue-600">
            Manage {user?.organizationName}, <span>courses, reports</span>
          </p>
        )}
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
