import { useEffect, useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import Navbar from "../components/Navbar";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { login, reset } from "../features/auth/authSlice";
import Spinner from "../components/Spinner";

const Login = () => {
  const [seePass, setSeePass] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError) {
      toast.error("Please Check Login Details", { theme: "dark" });
      // toast.error("Also Check Network", { theme: "dark" });
      console.log(message);
    }

    if (user) {
      // handleLogout();
      navigate("/admin-home");
      // toast.success("Welcome Back");
    }

    if (navigator.onLine) {
      console.log("online");
    } else {
      toast.error("Network Error", { theme: "dark" });
    }
    dispatch(reset());
  }, [user, isError, isSuccess, message, isLoading, navigate]);

  const [loading, setLoading] = useState(false);
  const handleSignin = async (e) => {
    e.preventDefault();

    if (!email) {
      return toast.error("email missing");
    }

    if (!password) {
      return toast.error("password missing");
    }
    try {
      setLoading(true);
      const userData = { email, password };
      await dispatch(login(userData));
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error("Failed to sign you in", { theme: "dark" });
    }
    setLoading(false);
  };

  return (
    <div>
      <div>
        <Navbar />
        <div className="mt-[8em]" />
        <div className=" w-[100%] md:w-[75%] lg:w-[35%] mx-auto my-[10px] sm:my-[3em] cardShadow p-[15px] sm:p-[3em] rounded-lg">
          <h2 className="text-3xl mb-3 text-gray-600">Sign In To Proceed</h2>
          <p className="text-gray-600 mb-8">
            If you don't have an account, please contact admin
          </p>

          <div>
            <form onSubmit={handleSignin}>
              {/* email */}
              <div className="flex flex-col gap-2 mb-8">
                <label htmlFor="email" className="font-semibold text-gray-600">
                  Your Email
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="border border-gray-400 p-2 rounded-md w-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* password */}
              <div className="flex gap-6 items-center mb-8">
                <div className=" w-[90%] flex flex-col ">
                  <label
                    htmlFor="password"
                    className="font-semibold text-gray-600"
                  >
                    Your Password
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type={seePass ? "text" : "password"}
                    id="password"
                    name="password"
                    required
                    className="border border-gray-400 p-2 rounded-md w-full"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div>
                  <p>
                    {seePass ? (
                      <AiOutlineEyeInvisible
                        className="text-3xl cursor-pointer"
                        title="see password"
                        onClick={() => setSeePass(false)}
                      />
                    ) : (
                      <AiOutlineEye
                        className="text-3xl cursor-pointer"
                        title="see password"
                        onClick={() => setSeePass(true)}
                      />
                    )}
                  </p>
                </div>
              </div>

              <div>
                {loading ? (
                  <div>
                    <Spinner message="Authenticating ..." />
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="bg-[#0067b8] text-white py-2 px-4 rounded-md hover:text-zinc-300 transition duration-300 cursor-pointer"
                    onClick={handleSignin}
                  >
                    Sign In
                  </button>
                )}
              </div>
            </form>
          </div>
          {/*  */}
        </div>
        {/*  */}
      </div>
    </div>
  );
};

export default Login;
