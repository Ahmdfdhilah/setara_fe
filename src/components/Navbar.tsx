import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FaChevronDown } from "react-icons/fa";
import AOS from "aos";
import "aos/dist/aos.css";
import logo from "../assets/logo.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 500,
      easing: "ease-out-cubic",
      once: true,
    });
  }, []);

  return (
    <nav className="relative flex justify-between items-center px-6 py-4 shadow-md bg-white z-40">
      {/* Logo */}
      <div
        className="text-xl font-bold text-primary"
        data-aos="fade-down"
        data-aos-delay="100"
      >
        <img src={logo} alt="logo" className="w-[100px] lg:w-[150px]" />
      </div>

      {/* Menu untuk layar besar */}
      <div
        className="hidden md:flex space-x-4"
        data-aos="fade-up"
        data-aos-delay="200"
      >
        <Button variant="ghost" className="text-lg lg:text-xl">
          Home
        </Button>
        <Button variant="ghost" className="text-lg lg:text-xl">
          Tentang Kami
        </Button>
        <Button variant="ghost" className="text-lg lg:text-xl">
          Program
        </Button>
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
              <Button
                variant="ghost"
                className="w-full text-left text-lg lg:text-xl"
              >
                Home
              </Button>
              <Button
                variant="ghost"
                className="w-full text-left text-lg lg:text-xl"
              >
                Tentang Kami
              </Button>
              <Button
                variant="ghost"
                className="w-full text-left text-lg lg:text-xl"
              >
                Program
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;