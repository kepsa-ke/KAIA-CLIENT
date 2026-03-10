import { useEffect, useState } from "react";
import {
  AiOutlineClose,
  AiOutlineMenu,
  AiOutlineDown,
  AiOutlineUp,
} from "react-icons/ai";
import Logo from "../assets/kai2.png";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const Navlinks = [
    { id: 1, title: "Home", goTo: "/" },
    { id: 2, title: "Membership", goTo: "/membership" },
    { id: 3, title: "Training Partners", goTo: "/training-partners" },
    {
      id: 4,
      title: "Resources",
      goTo: "#",
      dropdown: [
        { title: "News", goTo: "/news" },
        { title: "Blogs", goTo: "/blogs" },
        { title: "Events", goTo: "/events" },
        { title: "Jobs", goTo: "/jobs" },
      ],
    },
    { id: 5, title: "Contact Us", goTo: "/contact" },
    { id: 6, title: "Login", goTo: "/login" },
  ];

  const [toggle, setToggle] = useState(false);
  const [active, setActive] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState({});
  const [hoverTimeout, setHoverTimeout] = useState(null);

  const location = useLocation();
  const pathname = location.pathname;
  const currentPath = pathname.replace(/^\/+/, "");

  useEffect(() => {
    const activeLink = Navlinks.find(
      (link) => link?.goTo.toLowerCase() === `/${currentPath.toLowerCase()}`,
    );
    setActive(activeLink ? activeLink.title : "");
  }, [currentPath]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  const handleMouseEnter = (id) => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }
    setOpenDropdown(id);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setOpenDropdown(null);
    }, 300); // 300ms delay before closing
    setHoverTimeout(timeout);
  };

  const handleDropdownMouseEnter = (id) => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }
    setOpenDropdown(id);
  };

  // Handle dropdown toggle for desktop
  const handleDropdownToggle = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  // Handle dropdown toggle for mobile
  const handleMobileDropdownToggle = (id) => {
    setMobileDropdownOpen((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div>
      {/* desktop navbar */}
      <div
        className={`hidden xl:block py-2 top-0 left-0 fixed w-full px-[2em] xl:px-[5em] z-20`}
        style={{
          background: "rgba(247, 240, 240, 0.9)",
          backdropFilter: "blur(4px)",
        }}
      >
        <div className="flex justify-between items-center">
          <div>
            <Link to="/" className="flex items-center gap-3">
              <img src={Logo} alt="Logo" className="h-14 object-contain" />
            </Link>
          </div>

          <div>
            <ul className="flex gap-[30px]">
              {Navlinks?.map((item) => (
                <li
                  key={item.id}
                  className={`relative hover:text-[#0067b8] text-inherit no-underline cursor-pointer`}
                >
                  {item.dropdown ? (
                    <div
                      className="flex items-center gap-1"
                      onMouseEnter={() => handleMouseEnter(item.id)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <span
                        className={`${
                          item.title === active
                            ? "text-[#0067b8]"
                            : "text-inherit"
                        } cursor-default`}
                      >
                        {item.title}
                      </span>
                      <button
                        onClick={() => handleDropdownToggle(item.id)}
                        className="focus:outline-none"
                      >
                        {openDropdown === item.id ? (
                          <AiOutlineUp className="text-xs" />
                        ) : (
                          <AiOutlineDown className="text-xs" />
                        )}
                      </button>

                      {/* Dropdown menu */}
                      {openDropdown === item.id && (
                        <div
                          className="absolute top-full left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-50"
                          onMouseEnter={() => handleDropdownMouseEnter(item.id)}
                          onMouseLeave={handleMouseLeave}
                        >
                          {item.dropdown.map((dropItem, index) => (
                            <Link
                              key={index}
                              to={dropItem.goTo}
                              className="block px-4 py-2 text-gray-800 hover:bg-gray-100 hover:text-[#0067b8]"
                              onClick={() => {
                                setActive(dropItem.title);
                                setOpenDropdown(null);
                                setToggle(false);
                              }}
                            >
                              {dropItem.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={item.goTo}
                      onClick={() => setActive(item.title)}
                      className={`${
                        item.title === active
                          ? "text-[#0067b8]"
                          : "text-inherit"
                      }`}
                    >
                      {item.title}
                    </Link>
                  )}
                </li>
              ))}
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
          }}
        >
          <div>
            <Link to="/" className="flex items-center gap-3">
              <img src={Logo} alt="Logo" className="h-10 object-contain" />
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
          className="xl:hidden h-[100vh] top-0 left-0 w-full fixed px-[1em] z-20 overflow-y-auto"
          style={{
            background: "rgba(247, 240, 240, 0.9)",
            backdropFilter: "blur(3px)",
          }}
        >
          <div className="flex justify-between items-center pt-[10px]">
            <div></div>
            <div>
              <AiOutlineClose
                className="text-3xl cursor-pointer"
                onClick={() => setToggle(false)}
              />
            </div>
          </div>

          {/* mobile links */}
          <div className="pt-[1em]">
            <ul className="flex flex-col my-[1em] gap-[10px] text-end">
              {Navlinks?.map((item) => (
                <li key={item.id} className="border-b border-gray-400 pb-2">
                  {item.dropdown ? (
                    <div>
                      <div className="flex justify-between items-center">
                        <span
                          className={`flex-1 text-left ${
                            item.title === active
                              ? "text-[#0067b8]"
                              : "text-inherit"
                          } cursor-default`}
                        >
                          {item.title}
                        </span>
                        <button
                          onClick={() => handleMobileDropdownToggle(item.id)}
                          className="p-2 focus:outline-none"
                        >
                          {mobileDropdownOpen[item.id] ? (
                            <AiOutlineUp className="text-sm" />
                          ) : (
                            <AiOutlineDown className="text-sm" />
                          )}
                        </button>
                      </div>

                      {/* Mobile dropdown menu */}
                      {mobileDropdownOpen[item.id] && (
                        <div className="mt-2 ml-4 space-y-2">
                          {item.dropdown.map((dropItem, index) => (
                            <Link
                              key={index}
                              to={dropItem.goTo}
                              className="block py-2 text-left text-gray-600 hover:text-[#0067b8] border-b border-gray-300"
                              onClick={() => {
                                setActive(dropItem.title);
                                setToggle(false);
                                setMobileDropdownOpen({});
                              }}
                            >
                              {dropItem.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={item.goTo}
                      className={`block w-full text-left ${
                        item.title === active
                          ? "text-[#0067b8]"
                          : "text-inherit"
                      }`}
                      onClick={() => {
                        setActive(item.title);
                        setToggle(false);
                      }}
                    >
                      {item.title}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
