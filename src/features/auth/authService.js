import axios from "../../axios";

// register user
const register = async (userData) => {
  const response = await axios.post("/users/register", userData);

  if (response.data) {
    // This will make our data persist even when we refresh
    localStorage.setItem("user", JSON.stringify(response.data));
  }

  return response.data;
};

// login user
const login = async (userData) => {
  const response = await axios.post("/users/login", userData);

  if (response.data) {
    // This will make our data persist even when we refresh
    // console.log(response.data);
    localStorage.setItem("user", JSON.stringify(response.data));
  }

  return response.data;
};

// logout user
const logout = async (userId) => {
  try {
    localStorage.removeItem("user");
  } catch (error) {
    console.log(error);
  }
};

const authService = {
  register,
  logout,
  login,
};

export default authService;
