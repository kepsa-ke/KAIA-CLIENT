import { AiOutlineMail } from "react-icons/ai";
import { MdOutlineLocalPhone } from "react-icons/md";
import { FiMapPin } from "react-icons/fi";
import { CiCalendar } from "react-icons/ci";

const Footer = () => {
  return (
    <div className="mt-8">
      <div className="flex flex-col md:flex-row justify-between items-center text-center  gap-8  bg-[#0067b8] text-white py-10 px-[2em]  xl:px-[5em] ">
        <div>
          <p>© Copyright 2023 KEPSA | All rights reserved.</p>
        </div>

        {/* contact information */}
        <div>
          <h3 className="font-bold text-lg mb-4">Contact Us</h3>
          <div className="flex items-center justify-center gap-2 mb-3">
            <AiOutlineMail className="text-lg" />
            <a href="mailto:test@kaia.org">ekingutu@kepsa.or.ke</a>
          </div>
          <div className="flex items-center justify-center gap-2 mb-3">
            <MdOutlineLocalPhone className="text-lg" />
            <a href="tel:+254 758 065544">+254 758 065544</a>
          </div>
          <div className="flex items-center justify-center gap-2 mb-3">
            <FiMapPin className="text-lg" />
            <p>Two Rivers Mall, South Towe, 7th Floor</p>
          </div>
          <div className="flex items-center justify-center gap-2 mb-3">
            <CiCalendar className="text-lg" />
            <p>Mon - Fri: 9:00 AM - 5:00 PM</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
