import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FaChevronDown, FaUserCircle } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import AOS from "aos";
import "aos/dist/aos.css";
import logo from "../assets/logo.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    AOS.init({
      duration: 500,
      easing: "ease-out-cubic",
      once: true,
    });
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsProfileOpen(false);
  };

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/about", label: "Tentang Kami" },
    { path: "/program", label: "Program" },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <nav className="relative flex justify-between items-center px-6 py-4 shadow-md bg-white z-40">
      {/* Logo */}
      <Link 
        to="/"
        className="text-xl font-bold text-primary"
        data-aos="fade-down"
        data-aos-delay="100"
      >
        <img src={logo} alt="logo" className="w-[100px] lg:w-[150px]" />
      </Link>

      {/* Menu untuk layar besar */}
      <div
        className="hidden md:flex space-x-4 items-center"
        data-aos="fade-up"
        data-aos-delay="200"
      >
        {navLinks.map((link) => (
          <Button
            key={link.path}
            variant="ghost"
            className={`text-lg lg:text-xl ${
              location.pathname === link.path ? "bg-gray-100" : ""
            }`}
            onClick={() => handleNavigation(link.path)}
          >
            {link.label}
          </Button>
        ))}

        {/* Profile menu for desktop */}
        {isAuthenticated && (
          <div className="relative">
            <Button
              variant="ghost"
              className="flex items-center space-x-2"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <FaUserCircle className="w-6 h-6" />
              <span>{user}</span>
              <FaChevronDown className="w-4 h-4" />
            </Button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                <div className="py-1">
                  <Button
                    variant="ghost"
                    className="w-full text-left hover:bg-gray-100"
                    onClick={() => {
                      handleNavigation('/admin/manage/map');
                      setIsProfileOpen(false);
                    }}
                  >
                    Manage
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full text-left text-red-600 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Menu untuk layar kecil (mobile) */}
      <div className="relative md:hidden" data-aos="fade-up" data-aos-delay="300">
        <button
          className="flex items-center space-x-2 text-lg"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>Menu</span>
          <FaChevronDown className="w-5 h-5" />
        </button>

        {/* Dropdown menu */}
        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
            <div className="px-1 py-1">
              {navLinks.map((link) => (
                <Button
                  key={link.path}
                  variant="ghost"
                  className={`w-full text-left text-lg lg:text-xl ${
                    location.pathname === link.path ? "bg-gray-100" : ""
                  }`}
                  onClick={() => handleNavigation(link.path)}
                >
                  {link.label}
                </Button>
              ))}
              
              {/* Profile section for mobile */}
              {isAuthenticated && (
                <>
                  <div className="border-t border-gray-200 my-1" />
                  <div className="px-4 py-2 text-sm text-gray-700">
                    Signed in as <span className="font-medium">{user}</span>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full text-left hover:bg-gray-100"
                    onClick={() => {
                      handleNavigation('/admin/manage/map');
                      setIsOpen(false);
                    }}
                  >
                    Manage
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full text-left text-red-600 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;