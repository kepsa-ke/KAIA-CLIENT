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
    {
      id: 6,
      title: "About Us",
      goTo: "#",
      dropdown: [
        { title: "About Alliance", goTo: "/about" },
        { title: "Working Committees", goTo: "/about-committees" },
        // { title: "Who can Join", goTo: "/who-can-join" },
        // { title: "Our Guiding Principles", goTo: "/guiding-principles" },
      ],
    },
    { id: 2, title: "Our Members", goTo: "/membership" },
    {
      id: 5,
      title: "Solutions",
      goTo: "#",
      dropdown: [
        { title: "Learn", goTo: "/learn" },
        { title: "Browse Jobs", goTo: "/jobs" },
        { title: "Create Job", goTo: "/membership", isDivider: true },
      ],
    },
    {
      id: 4,
      title: "Impact",
      goTo: "#",
      dropdown: [
        { title: "News", goTo: "/news" },
        { title: "Blog", goTo: "/blogs" },
        { title: "Events", goTo: "/events" },
        { title: "Insights", goTo: "/insights" },
      ],
    },
    { id: 8, title: "Login", goTo: "/login" },
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
    let activeLink = Navlinks.find(
      (link) => link?.goTo.toLowerCase() === `/${currentPath.toLowerCase()}`,
    );

    if (!activeLink) {
      for (const link of Navlinks) {
        if (link.dropdown) {
          const found = link.dropdown.find(
            (dropItem) =>
              dropItem.goTo.toLowerCase() === `/${currentPath.toLowerCase()}`,
          );
          if (found) {
            activeLink = { title: found.title };
            break;
          }
        }
      }
    }

    setActive(activeLink ? activeLink.title : "");
  }, [currentPath]);

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
    }, 300);
    setHoverTimeout(timeout);
  };

  const handleDropdownMouseEnter = (id) => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }
    setOpenDropdown(id);
  };

  const handleDropdownToggle = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

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
          fontFamily: "Space Grotesk, sans-serif",
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
                  className={`relative hover:text-[#1B12E8] text-inherit no-underline cursor-pointer`}
                >
                  {item.dropdown ? (
                    <div
                      className="flex items-center gap-1"
                      onMouseEnter={() => handleMouseEnter(item.id)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <span
                        className={`${
                          item.dropdown.some(
                            (dropItem) => dropItem.title === active,
                          )
                            ? "text-[#1B12E8]"
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

                      {openDropdown === item.id && (
                        <div
                          className="absolute top-full left-0 mt-2 w-56 bg-white rounded-md shadow-lg py-2 z-50"
                          onMouseEnter={() => handleDropdownMouseEnter(item.id)}
                          onMouseLeave={handleMouseLeave}
                        >
                          {item.dropdown.map((dropItem, index) => (
                            <div key={index}>
                              {dropItem.isDivider && index > 0 && (
                                <div className="border-t border-gray-200 my-1" />
                              )}

                              <Link
                                to={dropItem.goTo}
                                className="block px-4 py-2 text-gray-800 hover:bg-gray-100 hover:text-[#1B12E8]"
                                onClick={() => {
                                  setActive(dropItem.title);
                                  setOpenDropdown(null);
                                  setToggle(false);
                                }}
                              >
                                {dropItem.title}
                              </Link>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={item.goTo}
                      onClick={() => setActive(item.title)}
                      className={`${
                        item.title === active && item.title !== "Login"
                          ? "text-[#1B12E8]"
                          : "text-inherit"
                      } ${item.title === "Login" ? "bg-[#1B12E8] text-white px-[22px] py-[11px] rounded-2xl" : ""} `}
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
          className="xl:hidden top-0 left-0 w-full fixed px-[1em] z-20 overflow-y-auto"
          style={{
            background: "rgba(247, 240, 240, 0.9)",
            backdropFilter: "blur(3px)",
            maxHeight: "100vh",
            height: "100vh",
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

          <div className="pt-[1em] pb-[4em]">
            <ul className="flex flex-col my-[1em] gap-[10px] text-end">
              {Navlinks?.map((item) => (
                <li key={item.id} className="border-b border-gray-400 pb-2">
                  {item.dropdown ? (
                    <div>
                      <div
                        className="flex justify-between items-center cursor-pointer"
                        onClick={() => handleMobileDropdownToggle(item.id)}
                      >
                        <span
                          className={`flex-1 text-left ${
                            item.dropdown.some(
                              (dropItem) => dropItem.title === active,
                            )
                              ? "text-[#1B12E8]"
                              : "text-inherit"
                          } cursor-default`}
                        >
                          {item.title}
                        </span>
                        <button className="p-2 focus:outline-none">
                          {mobileDropdownOpen[item.id] ? (
                            <AiOutlineUp className="text-sm" />
                          ) : (
                            <AiOutlineDown className="text-sm" />
                          )}
                        </button>
                      </div>

                      {mobileDropdownOpen[item.id] && (
                        <div className="mt-2 ml-4 space-y-2">
                          {item.dropdown.map((dropItem, index) => (
                            <Link
                              key={index}
                              to={dropItem.goTo}
                              className="block py-2 text-left text-gray-600 hover:text-[#1B12E8] border-b border-gray-300"
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
                          ? "text-[#1B12E8]"
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
