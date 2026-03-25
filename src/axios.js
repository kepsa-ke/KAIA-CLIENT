import axios from "axios";

const instance = axios.create({
  //baseURL: "http://localhost:8000/api/v1",
  baseURL: "https://kaia-server-khaki.vercel.app/api/v1", // kepsa deployment
});

//Add response interceptor (check is token is expired)
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired
      localStorage.removeItem("user");

      // Only redirect if we're on the client side and not already on login page
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/login")
      ) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default instance;
