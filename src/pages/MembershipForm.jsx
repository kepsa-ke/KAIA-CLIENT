import React, { useState } from "react";
import Navbar from "../components/Navbar";
import axios from "../axios";
import { toast } from "react-toastify";
import Spinner from "../components/Spinner";
import { PiHandsClappingDuotone } from "react-icons/pi";
import ImageUpload from "../components/common/ImageUpload"; // Import the ImageUpload component
import { allCountiesKenya } from "../data";

const MembershipForm = () => {
  const [firstName, setFirstName] = useState("");
  const [surName, setsurName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [website, setWebsite] = useState("");
  const [category, setCategory] = useState("");

  // New state variables for the added fields
  const [companyLogo, setCompanyLogo] = useState("");
  const [membershipType, setMembershipType] = useState("");
  const [companyCounty, setCompanyCounty] = useState("");

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Handle logo upload
  const handleLogoUpload = (imageUrl) => {
    setCompanyLogo(imageUrl);
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    try {
      if (
        !firstName ||
        !surName ||
        !role ||
        !email ||
        !phone ||
        !organizationName ||
        !website ||
        !category ||
        !membershipType || // Added validation
        !companyCounty || // Added validation
        !companyLogo // Added validation - logo is required
      ) {
        toast.error("Please fill in all required fields");
        return;
      }
      setLoading(true);
      let dataToSend = {
        firstName: firstName.trim(),
        surName: surName.trim(),
        role: role.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        organizationName: organizationName.trim(),
        website: website.trim(),
        category: category.trim(),
        // New fields
        companyLogo: companyLogo.trim(),
        membershipType: membershipType.trim(),
        companyCounty: companyCounty.trim(),
      };
      const response = await axios.post("/members", dataToSend);
      if (response.data) {
        setLoading(false);
        setSubmitted(true);
        toast.success("Application submitted successfully!");
      }
    } catch (error) {
      setLoading(false);
      console.log("Error details:", error);

      let errorMessage = "Failed to submit application";

      if (error.response?.data) {
        errorMessage = error.response.data.message || errorMessage;

        if (error.response.status === 400) {
          if (error.response.data.message?.includes("email")) {
            errorMessage = "Email address is already registered";
          } else if (error.response.data.message?.includes("organization")) {
            errorMessage = "Organization name is already registered";
          } else if (error.response.data.message?.includes("Invalid email")) {
            errorMessage = "Please enter a valid email address";
          }
        } else if (error.response.status === 409) {
          errorMessage = "This member already exists";
        }
      } else if (
        error.code === "NETWORK_ERROR" ||
        error.code === "ECONNABORTED"
      ) {
        errorMessage = "Network error. Please check your internet connection";
      } else if (error.request) {
        errorMessage = "No response from server. Please try again";
      }

      toast.error(errorMessage);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="mt-[4em]" />
      <div className=" w-[100%] md:w-[75%] lg:w-[55%] mx-auto my-[10px] sm:my-[1em] cardShadow p-[10px] sm:p-[3em] rounded-lg">
        <h1 className="text-3xl mb-3 font-bold">Kenya AI Skilling Alliance</h1>
        <h2 className="text-2xl mb-3 text-gray-600">Apply to be a member</h2>
        <p className="text-gray-600 mb-8">
          Membership is free and open to organizations, associations, and
          business networks.
        </p>

        <div>
          {submitted ? (
            <div>
              <div className="flex justify-center mb-8">
                <PiHandsClappingDuotone className="text-center text-4xl text-[#1B12E8]" />
              </div>
              <h2 className="text-center text-3xl mb-8">
                Submitted Successfully
              </h2>
              <p className="text-center ">Someone will reach out soon</p>
            </div>
          ) : (
            <form onSubmit={handleSendRequest}>
              {/* Company Logo Upload */}
              <div className="flex flex-col gap-2 mb-8">
                <label className="font-semibold text-gray-600">
                  Company Logo <span className="text-red-500">*</span>
                </label>
                <ImageUpload
                  onImageUpload={handleLogoUpload}
                  folder="member-logos" // Optional: organize logos in a separate folder
                  buttonText="Upload Company Logo"
                  acceptedTypes={["image/jpeg", "image/png", "image/webp"]}
                  maxSize={5}
                  id="company-logo-upload"
                />
                {companyLogo && (
                  <p className="text-sm text-green-600 mt-1">
                    ✓ Logo uploaded successfully
                  </p>
                )}
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
                  Link To Organization Website. (Actual Link)
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

              {/* Membership Type - New Field */}
              <div className="flex flex-col gap-2 mb-8">
                <label
                  htmlFor="membershipType"
                  className="font-semibold text-gray-600"
                >
                  Membership Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="membershipType"
                  id="membershipType"
                  className="border border-gray-400 p-2 rounded-md w-full"
                  value={membershipType}
                  onChange={(e) => setMembershipType(e.target.value)}
                  required
                >
                  <option value="">Select Membership Type</option>
                  <option value="government">Government</option>
                  <option value="academia">
                    Academia/Training institutions
                  </option>
                  <option value="developmentPartners">
                    Development partners
                  </option>
                  <option value="civilSociety">Civil society</option>
                  <option value="innovationHubs">Innovation hubs</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Company County - New Field */}
              <div className="flex flex-col gap-2 mb-8">
                <label
                  htmlFor="companyCounty"
                  className="font-semibold text-gray-600"
                >
                  Company County <span className="text-red-500">*</span>
                </label>
                <select
                  name="companyCounty"
                  id="companyCounty"
                  className="border border-gray-400 p-2 rounded-md w-full"
                  value={companyCounty}
                  onChange={(e) => setCompanyCounty(e.target.value)}
                  required
                >
                  <option value="">Select County</option>
                  {allCountiesKenya.map((county) => (
                    <option key={county} value={county.toLowerCase()}>
                      {county}
                    </option>
                  ))}
                </select>
              </div>

              {/* category */}
              <div className="flex flex-col gap-2 mb-8">
                <label
                  htmlFor="category"
                  className="font-semibold text-gray-600"
                >
                  Select Membership Category
                  <span className="text-red-500">*</span>
                </label>

                <select
                  name="category"
                  id="category"
                  className="border border-gray-400 p-2 rounded-md w-full"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="">Choose</option>
                  <option value="trainer">AI Trainer</option>
                  <option value="partner">AI Partner</option>
                  <option value="consumer">AI Consumer</option>
                </select>
              </div>

              {loading ? (
                <div>
                  <Spinner message="Sending ..." />
                </div>
              ) : (
                <button
                  type="submit"
                  className="bg-[#1B12E8] text-white py-2 px-4 rounded-md hover:text-zinc-300 transition duration-300 cursor-pointer"
                >
                  Submit Application
                </button>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default MembershipForm;
