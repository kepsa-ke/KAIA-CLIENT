import React, { useState } from "react";
import axios from "../axios";
import { Link } from "react-router-dom";

const ResetPassword = () => {
  const [step, setStep] = useState(1); // 1: Request, 2: Verify OTP, 3: Reset Password
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Step 1: Request reset
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
  });

  // Step 2: Verify OTP
  const [otpData, setOtpData] = useState({
    userId: "",
    otp: "",
  });

  // Step 3: Reset password
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [userInfo, setUserInfo] = useState(null);
  const [countdown, setCountdown] = useState(0);

  // Handle step 1: Request password reset
  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post("/auth/forgot-password", formData);

      if (response.data.success) {
        setUserInfo({
          userId: response.data.userId,
          email: response.data.email,
          phone: response.data.phone,
        });
        setOtpData((prev) => ({ ...prev, userId: response.data.userId }));
        setStep(2);
        setSuccess(response.data.message);
        startCountdown(60); // 60 seconds countdown for resend OTP
      }
    } catch (error) {
      setError(
        error.response?.data?.error || "Failed to request password reset",
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("/auth/verify-otp", otpData);

      if (response.data.success) {
        setStep(3);
        setSuccess(
          "OTP verified successfully. You can now set your new password.",
        );
      }
    } catch (error) {
      setError(error.response?.data?.error || "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  // Handle step 3: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.put("/auth/reset-password", {
        ...otpData,
        ...passwordData,
      });

      if (response.data.success) {
        setSuccess(
          "Password has been reset successfully! You can now login with your new password.",
        );
        setTimeout(() => {
          window.location.href = "/login";
        }, 3000);
      }
    } catch (error) {
      setError(error.response?.data?.error || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setLoading(true);
    setError("");

    try {
      const response = await axios.post("/auth/resend-otp", {
        userId: userInfo.userId,
      });

      if (response.data.success) {
        setSuccess("New OTP has been sent to your email");
        startCountdown(60);
      }
    } catch (error) {
      setError(error.response?.data?.error || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  // Countdown timer for resend OTP
  const startCountdown = (seconds) => {
    setCountdown(seconds);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleInputChange = (setter) => (e) => {
    const { name, value } = e.target;
    setter((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-[#0067b8] text-white p-3 rounded-lg">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Reset Your Password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Follow the steps to reset your password
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Error and Success Messages */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Request Reset */}
          {step === 1 && (
            <form onSubmit={handleRequestReset} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email Address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange(setFormData)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              {/* <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or</span>
                </div>
              </div> */}

              {/* <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone Number
                </label>
                <div className="mt-1">
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange(setFormData)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div> */}

              <div>
                <button
                  type="submit"
                  disabled={loading || (!formData.email && !formData.phone)}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0067b8]  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0067b8] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending OTP..." : "Send OTP"}
                </button>
              </div>

              <div className="text-center">
                <Link to="/login" className="font-medium text-[#0067b8] ">
                  Back to Login
                </Link>
              </div>
            </form>
          )}

          {/* Step 2: Verify OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  We've sent a 6-digit OTP to your email{" "}
                  <span className="font-medium text-gray-900">
                    {userInfo?.email}
                  </span>
                </p>

                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-gray-700"
                >
                  Enter OTP Code
                </label>
                <div className="mt-1">
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    maxLength="6"
                    value={otpData.otp}
                    onChange={handleInputChange(setOtpData)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-center text-2xl font-bold tracking-widest"
                    placeholder="000000"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={loading || countdown > 0}
                  className="text-sm text-blue-600 hover:text-blue-500 disabled:text-gray-400"
                >
                  {countdown > 0 ? `Resend OTP in ${countdown}s` : "Resend OTP"}
                </button>

                <button
                  type="submit"
                  disabled={loading || otpData.otp.length !== 6}
                  className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Use different email/phone
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Reset Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  New Password
                </label>
                <div className="mt-1">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={handleInputChange(setPasswordData)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter new password"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm New Password
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={handleInputChange(setPasswordData)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Resetting Password..." : "Reset Password"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
