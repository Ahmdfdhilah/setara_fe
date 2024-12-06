import { useEffect } from 'react';
import google from '../assets/google.svg';
import app from '../assets/app.png';
import app2 from '../assets/app2.png';

import AOS from "aos";
import "aos/dist/aos.css";

const BecomeMitraSection = () => {
    useEffect(() => {
        AOS.init({
            duration: 1000,
            once: true,
        });
    }, []);

    return (
        <div className="relative w-full min-h-screen flex items-center bg-gray-50">
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 items-stretch">
                {/* Registration Content */}
                <div
                    className="w-full px-4 sm:px-6 md:px-8 py-12 flex flex-col justify-center"
                    data-aos="fade-up"
                >
                    <div className="max-w-xl mx-auto w-full space-y-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
                                Daftar Menjadi Mitra Setara
                            </h1>
                            <p className="text-base sm:text-lg text-gray-600 mb-6">
                                Bergabunglah dengan kami dan dapatkan kemudahan dalam pengelolaan hasil bumi Anda. Proses pendaftaran cepat dan mudah melalui aplikasi mobile kami.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="mt-6">
                                <img
                                    src={google}
                                    className="w-32 sm:w-40 h-auto object-contain hover:scale-105 transition-transform"
                                    alt="Google Play Store"
                                />
                                <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mt-4">
                                    Tersedia di Play Store
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* PlayStore and Mobile App Showcase */}
                <div
                    className="relative w-full min-h-[50vh] md:min-h-[70vh] lg:min-h-[90vh] flex items-center justify-center"
                    data-aos="fade-left"
                >
                    <div className="flex flex-col md:flex-row items-center justify-center space-y-6 md:space-y-0 md:space-x-6">
                        {/* First App Image */}
                        <img
                            src={app}
                            className="max-w-[80%] sm:max-w-[60%] md:max-w-xs h-auto object-contain rounded-lg transform transition-transform duration-300 hover:scale-110"
                            alt="Mobile App Screenshot"
                        />
                        {/* Second App Image */}
                        <img
                            src={app2}
                            className="max-w-[80%] sm:max-w-[60%] md:max-w-xs h-auto object-contain rounded-lg transform transition-transform duration-300 hover:scale-110"
                            alt="Mobile App Screenshot 2"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BecomeMitraSection;