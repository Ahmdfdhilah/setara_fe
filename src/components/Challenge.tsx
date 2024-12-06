import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingDown, DollarSign } from 'lucide-react';

interface CoffeeChallengeData {
    title: string;
    description: string;
    icon: React.ElementType;
    subChallenges: string[];
    gradientFrom: string;
    gradientTo: string;
}

const coffeeChallenges: CoffeeChallengeData[] = [
    {
        title: "Rendahnya Produktivitas Perkebunan Kopi",
        description: "Kompleksitas tantangan dalam meningkatkan hasil produksi kopi di Indonesia",
        icon: TrendingDown,
        gradientFrom: "from-emerald-900/70",
        gradientTo: "to-emerald-700/70",
        subChallenges: [
            "Keterbatasan infrastruktur dan teknologi pertanian modern",
            "Degradasi kualitas bibit dan sistem pemeliharaan tanaman",
            "Variabilitas kondisi geografis dan kesuburan lahan"
        ]
    },
    {
        title: "Rendahnya Kualitas Hasil Panen Kopi",
        description: "Hambatan dalam mencapai standar mutu internasional",
        icon: AlertTriangle,
        gradientFrom: "from-emerald-900/70",
        gradientTo: "to-emerald-700/70",
        subChallenges: [
            "Ineffisiensi proses pascapanen yang kompleks",
            "Gap pengetahuan tentang standarisasi mutu global",
            "Sistem kontrol kualitas yang tidak terstandarisasi"
        ]
    },
    {
        title: "Kesenjangan Ekonomi Petani Kopi",
        description: "Dinamika ekonomi yang mempengaruhi kesejahteraan petani",
        icon: DollarSign,
        gradientFrom: "from-emerald-900/70",
        gradientTo: "to-emerald-700/70",
        subChallenges: [
            "Volatilitas harga kopi di pasar internasional",
            "Struktur rantai pasok yang tidak menguntungkan",
            "Keterbatasan akses modal dan jaringan pemasaran"
        ]
    }
];

const CoffeeChallengesSection: React.FC = () => {
    useEffect(() => {
        AOS.init({
            duration: 800,
            once: true,
        });
    }, []);

    return (
        <section
            data-aos="fade-up"
            className="w-full max-w-5xl mx-auto px-4 py-12"
        >
            <div
                data-aos="fade-up"
                className="text-center max-w-4xl mx-auto"
            >
                <div className="flex items-center justify-center mb-6">
                    <h2 className="text-4xl font-bold text-gray-900"> Tantangan Kopi Indonesia</h2>
                </div>
                <p className="text-lg text-gray-700 flex items-center justify-center">
                Tantangan utama kopi Indonesia mencakup produktivitas rendah, kualitas yang belum optimal, dan kesenjangan ekonomi petani.
                </p>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-6 mt-8">
                {coffeeChallenges.map((challenge, index) => (
                    <div
                        key={index}
                        data-aos="fade-left"
                        data-aos-delay={index * 200}
                    >
                        <AccordionItem value={`challenge-${index}`} className="border-none">
                            <AccordionTrigger
                                className={`
                  bg-gradient-to-r ${challenge.gradientFrom} ${challenge.gradientTo} 
                  hover:opacity-90 transition-all duration-300 
                  hover:no-underline
                  p-5 rounded-2xl shadow-lg group
                `}
                            >
                                <div className="flex items-center space-x-6 w-full">
                                    <div className="transition-transform duration-300 group-hover:scale-110">
                                        <challenge.icon className="h-8 w-8 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white flex-grow">
                                        {challenge.title}
                                    </h3>
                                    <Badge
                                        variant="secondary"
                                        className="bg-white/20 text-white border-none"
                                    >
                                        Tantangan {index + 1}
                                    </Badge>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <Card className="border-none shadow-xl rounded-2xl overflow-hidden">
                                    <CardHeader className="bg-emerald-50 p-6">
                                        <CardTitle className="text-lg text-emerald-900">
                                            {challenge.description}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6 bg-white">
                                        <ul className="space-y-3 pl-4 list-disc text-emerald-900">
                                            {challenge.subChallenges.map((subChallenge, idx) => (
                                                <li
                                                    key={idx}
                                                    data-aos="fade-right"
                                                    data-aos-delay={idx * 100}
                                                    className="pl-2 hover:text-emerald-700 transition-colors"
                                                >
                                                    {subChallenge}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            </AccordionContent>
                        </AccordionItem>
                    </div>
                ))}
            </Accordion>
        </section>
    );
};

export default CoffeeChallengesSection;