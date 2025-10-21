import axios from "../axios";
import { toast } from "react-toastify";
import Spinner from "../components/Spinner";
import { PiHandsClappingDuotone } from "react-icons/pi";
import Navbar from "../components/Navbar";
import { useState } from "react";

const Contact = () => {
  const [firstName, setFirstName] = useState("");
  const [surName, setsurName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSendRequest = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      let dataToSend = {
        firstName,
        surName,
        email,
        phone,
        organizationName,
        message,
      };
      const response = await axios.post("/requests", dataToSend);
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
      <div className="mt-[3em]">
        <div className=" w-[100%] md:w-[75%] lg:w-[55%] mx-auto my-[10px] sm:my-[1em] cardShadow p-[10px] sm:p-[3em] rounded-lg">
          <h1 className="text-3xl mb-3 font-bold">
            Kenya AI Skilling Alliance
          </h1>
          <h2 className="text-xl mb-3 text-gray-600">Request information</h2>
          <p className="text-gray-600 mb-1">Want to learn more ?</p>

          <p className="text-gray-600 mb-1">
            Fill out the form below to receive more details about the initiative
          </p>
          <p className="text-gray-600 mb-8">
            Our team will get back to you as soon as possible.
          </p>

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
                      required
                      className="border border-gray-400 p-2 rounded-md w-full"
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

                {/* contact email */}
                <div className="flex flex-col gap-2 mb-8">
                  <label
                    htmlFor="email"
                    className="font-semibold text-gray-600"
                  >
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
                    Phone Number
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="tel"
                    name="tel"
                    placeholder="phone"
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
                    Organization Name
                    <span className="text-red-500">*</span>
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

                {/* message */}
                <div className="flex flex-col gap-2 mb-8">
                  <label
                    htmlFor="message"
                    className="font-semibold text-gray-600"
                  >
                    Enter Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    id="message"
                    required
                    className="border border-gray-400 p-2 rounded-md w-full"
                    placeholder="message/request"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  ></textarea>
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
    </div>
  );
};

export default Contact;
