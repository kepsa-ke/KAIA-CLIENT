import { useEffect, useState } from "react";
import { AiOutlineClose, AiOutlineMenu } from "react-icons/ai";
import Logo from "../assets/kaii.png";
import { Link, useLocation, useParams } from "react-router-dom";

const Navbar = () => {
  const Navlinks = [
    { id: 1, title: "Home", goTo: "/" },

    { id: 3, title: "Membership", goTo: "/membership" },

    { id: 7, title: "AI Learning", goTo: "/learning" },

    { id: 5, title: "Contact Us", goTo: "/contact" },
    { id: 6, title: "Account", goTo: "/login" },
  ];

  const [toggle, setToggle] = useState(false);
  const [active, setActive] = useState("");

  const location = useLocation();
  // Get everything after the domain
  const pathname = location.pathname;
  // Remove leading slash if present
  const currentPath = pathname.replace(/^\/+/, "");
  console.log(currentPath);

  useEffect(() => {
    const activeLink = Navlinks.find(
      (link) => link?.goTo.toLowerCase() === `/${currentPath.toLowerCase()}`
    );
    setActive(activeLink ? activeLink.title : "");
  }, [currentPath]);

  return (
    <div>
      {/* desktop navbar */}
      <div
        className={` hidden xl:block py-[20px] top-0 left-0 fixed w-full px-[2em]  xl:px-[5em] z-20`}
        style={{
          background: "rgba(247, 240, 240, 0.9)",
          backdropFilter: "blur(4px)",
          // zIndex: 2,
        }}
      >
        <div className="flex justify-between items-center">
          <div>
            <Link to="/" className="flex items-center gap-3">
              <div className="bg-[#0067b8]/10 p-2 rounded-full border border-[#0067b8]/20 hover:border-[#0067b8]/40 transition">
                <img
                  src={Logo}
                  alt="Kenya"
                  className="h-8 w-8 object-contain hover:rotate-6 transition-transform duration-300"
                />
              </div>
              <h2 className="font-extrabold text-2xl sm:text-3xl bg-gradient-to-r from-[#0067b8] to-[#00bfa6] bg-clip-text text-transparent">
                AI Skilling Alliance
              </h2>
            </Link>
          </div>

          {/*  */}
          <div>
            <ul className="flex gap-[30px]">
              {Navlinks?.map((item) => (
                <li
                  key={item.id}
                  className={` 
                  hover:text-[#0067b8] text-inherit no-underline cursor-pointer`}
                >
                  <Link
                    to={item.goTo}
                    onClick={() => setActive(item.title)}
                    className={`${
                      item.title === active ? "text-[#0067b8]" : "text-inherit"
                    }`}
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="https://skills.ai4sp.org/"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#0067b8] text-white px-3 lg:px-3 py-2 rounded-md text-md text-center"
                >
                  Skills assessment
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      {/* mobile navbar */}
      {!toggle && (
        <div
          className="xl:hidden h-[8vh] top-0 left-0 flex justify-between items-center w-full fixed px-[1em] py-[1em] z-20"
          style={{
            background: "rgba(247, 240, 240, 0.9)",
            backdropFilter: "blur(4px)",
            // zIndex: 2,
          }}
        >
          <div>
            <Link to="/" className="flex items-center gap-3">
              <div className="bg-[#0067b8]/10 p-2 rounded-full border border-[#0067b8]/20 hover:border-[#0067b8]/40 transition">
                <img
                  src={Logo}
                  alt="Kenya"
                  className="h-8 w-8 object-contain hover:rotate-6 transition-transform duration-300"
                />
              </div>
              <h2 className="font-extrabold text-xl sm:text-3xl bg-gradient-to-r from-[#0067b8] to-[#00bfa6] bg-clip-text text-transparent">
                AI Skilling Alliance
              </h2>
            </Link>
          </div>

          <div>
            <AiOutlineMenu
              className="text-3xl cursor-pointer"
              onClick={() => setToggle(true)}
            />
          </div>
        </div>
      )}

      {toggle && (
        <div
          className="xl:hidden h-[100vh] top-0 left-0  w-full fixed px-[1em] z-20"
          style={{
            background: "rgba(247, 240, 240, 0.9)",
            backdropFilter: "blur(3px)",
            // zIndex: 2,
          }}
        >
          <div className="flex justify-between items-center pt-[10px]">
            <div>
              <Link to="/">
                {/* <img src={Logo} loading="lazy" alt="" className="h-14 w-14" /> */}
                {/* <h2 className="font-bold text-3xl">KAIA</h2> */}
              </Link>
            </div>
            <div>
              <AiOutlineClose
                className="text-3xl cursor-pointer"
                onClick={() => setToggle(false)}
              />
            </div>
          </div>
          {/* links */}
          <div className="pt-[1em]">
            <ul className="flex flex-col my-[1em] gap-[20px] text-end">
              {Navlinks?.map((item) => (
                <li
                  key={item.id}
                  className={`hover:text-[#0067b8] text-inherit no-underline cursor-pointer`}
                  style={{ borderBottom: "1px solid #535353" }}
                  onClick={() => {
                    // handleClick(item);
                    setToggle(false);
                  }}
                >
                  <Link
                    to={item.goTo}
                    className={`${
                      item.title === active ? "text-[#0067b8]" : "text-inherit"
                    }`}
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="https://skills.ai4sp.org/"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#0067b8] text-white px-3 lg:px-3 py-2 rounded-md text-md text-center"
                >
                  Skills assessment
                </Link>
              </li>
            </ul>
          </div>
          {/*  */}
        </div>
      )}
    </div>
  );
};

export default Navbar;
