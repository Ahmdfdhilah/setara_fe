import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FiArrowRight, FiChevronDown } from "react-icons/fi";
import AOS from "aos";
import "aos/dist/aos.css";
import home1 from '../assets/home1.png';

const Hero = () => {

    useEffect(() => {
        AOS.init({
            duration: 1000,
            once: true,
        });
    }, []);

    const scrollToNextSection = () => {
        window.scrollTo({
            top: window.innerHeight,
            behavior: 'smooth'
        });
    };

    return (
        <div className="relative w-full min-h-screen flex items-center bg-gray-50">
            <div className="w-full grid grid-cols-1 md:grid-cols-2 items-stretch">
                {/* Konten Teks */}
                <div
                    className="w-full px-4 sm:px-6 md:px-8 py-12 flex flex-col justify-center"
                    data-aos="fade-up"
                >
                    <div className="max-w-xl mx-auto w-full space-y-6">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                                Setara Commodity
                            </h1>
                            <p className="text-lg text-gray-600 mb-6">
                                Setara Commodity adalah Perusahaan yang
                                bergerak dibidang pemeliharaan, pengelolaan
                                dan pemasaran hasil bumi terutama kopi
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button className="flex items-center space-x-2">
                                <span>Daftar Menjadi Mitra Sekarang</span>
                                <FiArrowRight />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Kontainer Gambar */}
                <div
                    className="relative w-full h-[500px] md:h-screen group"
                    data-aos="fade-left"
                >
                    <img
                        src={home1}
                        alt="Hero Image"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/10 hover:bg-black/20 transition-all duration-300"></div>
                </div>
            </div>

            {/* Scroll Down Indicator */}
            <button
                onClick={scrollToNextSection}
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2 
        animate-bounce text-gray-600 hover:text-gray-800 
        transition-colors duration-300"
            >
                <FiChevronDown className="w-8 h-8" />
            </button>


        </div>
    );
};

export default Hero;