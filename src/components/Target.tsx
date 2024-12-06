import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import AOS from "aos";

// React Icons
import { FaLeaf } from "react-icons/fa";
import { FaUsers } from "react-icons/fa";
import { FaWarehouse } from "react-icons/fa";
import { IoTrendingUpSharp } from "react-icons/io5";


const TargetSection = () => {
    useEffect(() => {
        AOS.init({ duration: 1000, once: true });
    }, []);

    const targets = [
        {
            icon: <FaLeaf className="text-teal-700 w-12 h-12 mx-auto mb-4" />,
            title: "Green Bean",
            current: 10000,
            total: 27000,
            unit: "Ton",
            progress: 37,
            date: "November 2023",
            description: "Produksi green bean berkualitas tinggi untuk pasar global",
            primaryColor: "#107569",
            secondaryColor: "#14b8a6"
        },
        {
            icon: <FaUsers className="text-emerald-700 w-12 h-12 mx-auto mb-4" />,
            title: "Mitra Petani",
            current: 5000,
            total: 27000,
            unit: "Mitra",
            progress: 18.5,
            date: "Desember 2023",
            description: "Pemberdayaan ekonomi petani melalui kemitraan berkelanjutan",
            primaryColor: "#065f46",
            secondaryColor: "#10b981"
        },
        {
            icon: <FaWarehouse className="text-emerald-700 w-12 h-12 mx-auto mb-4" />,
            title: "Gudang",
            current: 10,
            total: 27,
            unit: "Gudang",
            progress: 37,
            date: "Januari 2024",
            description: "Infrastruktur logistik modern untuk distribusi efisien",
            primaryColor: "#065f46",
            secondaryColor: "#10b981"
        }
    ];

    return (
        <section className="py-16 bg-white">
            <div className="container mx-auto px-4 lg:px-16 space-y-12">
                {/* Header */}
                <div
                    data-aos="fade-up"
                    className="text-center max-w-4xl mx-auto"
                >
                    <div className="flex items-center justify-center mb-6">
                        <h2 className="text-4xl font-bold text-gray-900">Target Kami</h2>
                    </div>
                    <p className="text-lg text-gray-700 flex items-center justify-center">
                        Progres komprehensif menuju target strategis kami, dengan analisis
                        detail perkembangan setiap bidang
                    </p>
                </div>

                {/* Progress Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {targets.map((target, index) => (
                        <Card
                            key={target.title}
                            data-aos="fade-up"
                            data-aos-delay={index * 200}
                            className="text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-t-4"
                            style={{
                                borderTopColor: target.primaryColor
                            }}
                        >
                            <CardHeader className="pb-2">
                                {target.icon}
                                <CardTitle className="text-xl font-semibold" style={{ color: target.primaryColor }}>
                                    {target.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Progress
                                    value={target.progress}
                                    className="mb-4 h-3"
                                    style={{
                                        backgroundColor: `${target.secondaryColor}20`,
                                    }}
                                />
                                <div className="space-y-2">
                                    <p className="text-lg font-bold" style={{ color: target.primaryColor }}>
                                        {target.current} / {target.total} {target.unit}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {target.description}
                                    </p>
                                    <div
                                        className="flex items-center justify-center text-sm mt-2"
                                        style={{ color: target.primaryColor }}
                                    >
                                        <IoTrendingUpSharp className="mr-2" />
                                        Progres per {target.date}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TargetSection;