import React, { useState } from "react";
import Navbar from "../components/Navbar";
import axios from "../axios";
import { toast } from "react-toastify";
import Spinner from "../components/Spinner";
import { PiHandsClappingDuotone } from "react-icons/pi";

const MembershipForm = () => {
  const [firstName, setFirstName] = useState("");
  const [surName, setsurName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [website, setWebsite] = useState("");

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSendRequest = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      let dataToSend = {
        firstName,
        surName,
        role,
        email,
        phone,
        organizationName,
        website,
      };
      const response = await axios.post("/members", dataToSend);
      if (response.data) {
        setLoading(false);
        setSubmitted(true);
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
      toast.error("Failed to Submit");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="mt-[4em]" />
      <div className=" w-[100%] md:w-[75%] lg:w-[55%] mx-auto my-[10px] sm:my-[1em] cardShadow p-[10px] sm:p-[3em] rounded-lg">
        <h1 className="text-3xl mb-3 font-bold">Kenya AI Skilling Alliance</h1>
        <h2 className="text-2xl mb-3 text-gray-600">Apply to be a member</h2>
        <p className="text-gray-600 mb-1">
          Membership is free and open to organizations, associations, and
          business networks.
        </p>
        <p className="text-gray-600 mb-8">Someone will reach out soon</p>

        <div>
          {submitted ? (
            <div>
              <div className="flex justify-center mb-8">
                <PiHandsClappingDuotone className="text-center text-4xl text-[#0067b8]" />
              </div>
              <h2 className="text-center text-3xl mb-8">
                Submitted Successfully
              </h2>
              <p className="text-center ">Someone will reach out soon</p>
            </div>
          ) : (
            <form onSubmit={handleSendRequest}>
              {/* first and surname name */}
              <div className="flex justify-between gap-4 mb-8">
                <div className="flex flex-col gap-2  w-full">
                  <label
                    htmlFor="firstName"
                    className="font-semibold text-gray-600"
                  >
                    First Name of the contact person{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    placeholder="first name"
                    className="border border-gray-400 p-2 rounded-md w-full"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2 w-full">
                  <label
                    htmlFor="surName"
                    className="font-semibold text-gray-600"
                  >
                    Surname of the contact person{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="surName"
                    name="surName"
                    placeholder="surname"
                    required
                    className="border border-gray-400 p-2 rounded-md w-full"
                    value={surName}
                    onChange={(e) => setsurName(e.target.value)}
                  />
                </div>
              </div>

              {/* your role */}
              <div className="flex flex-col gap-2 mb-8">
                <label htmlFor="role" className="font-semibold text-gray-600">
                  Role of the contact person
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="role"
                  name="role"
                  placeholder="role"
                  required
                  className="border border-gray-400 p-2 rounded-md w-full"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />
              </div>

              {/* contact email */}
              <div className="flex flex-col gap-2 mb-8">
                <label htmlFor="email" className="font-semibold text-gray-600">
                  Email of the contact person
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="email address"
                  required
                  className="border border-gray-400 p-2 rounded-md w-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* telephone */}
              <div className="flex flex-col gap-2 mb-8">
                <label htmlFor="tel" className="font-semibold text-gray-600">
                  Telephone/Mobile Number
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="tel"
                  name="tel"
                  placeholder="telephone"
                  required
                  className="border border-gray-400 p-2 rounded-md w-full"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              {/* company name */}
              <div className="flex flex-col gap-2 mb-8">
                <label
                  htmlFor="companyName"
                  className="font-semibold text-gray-600"
                >
                  Organization Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  placeholder="name"
                  required
                  className="border border-gray-400 p-2 rounded-md w-full"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                />
              </div>

              {/* company website */}
              <div className="flex flex-col gap-2 mb-8">
                <label
                  htmlFor="companyWebsite"
                  className="font-semibold text-gray-600"
                >
                  Organization Website / LinkedIn{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="companyWebsite"
                  name="companyWebsite"
                  placeholder="https://"
                  required
                  className="border border-gray-400 p-2 rounded-md w-full"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>

              {loading ? (
                <div>
                  <Spinner message="Sending ..." />
                </div>
              ) : (
                <button
                  type="submit"
                  className="bg-[#0067b8] text-white py-2 px-4 rounded-md hover:text-zinc-300 transition duration-300 cursor-pointer"
                  onClick={handleSendRequest}
                >
                  Submit Application
                </button>
              )}
            </form>
          )}
        </div>
        {/*  */}
      </div>
    </div>
  );
};

export default MembershipForm;
