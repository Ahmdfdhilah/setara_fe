import  { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AOS from "aos";
import { FaChartLine, FaHandshake, FaLeaf, FaUserTie } from "react-icons/fa";
import { IoIosAnalytics } from "react-icons/io";

const ActionStepsSection = () => {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  const actionSteps = [
    {
      icon: <FaHandshake className="w-16 h-16 text-emerald-900" />,
      title: "Kolaborasi Strategis",
      description: "Membangun kemitraan komprehensif dengan petani lokal melalui program pendampingan intensif dan transfer teknologi pertanian modern.",
      steps: [
        "Identifikasi komunitas petani potensial",
        "Pengembangan program pelatihan berkelanjutan",
        "Fasilitasi akses modal dan teknologi pertanian"
      ]
    },
    {
      icon: <IoIosAnalytics className="w-16 h-16 text-emerald-900" />,
      title: "Riset & Pengembangan",
      description: "Implementasi program riset berkelanjutan untuk meningkatkan kualitas produksi dan efisiensi operasional.",
      steps: [
        "Analisis berkelanjutan praktik pertanian",
        "Pengembangan varietas unggul",
        "Optimasi rantai pasok dan distribusi"
      ]
    },
    {
      icon: <FaUserTie className="w-16 h-16 text-emerald-900" />,
      title: "Pemberdayaan SDM",
      description: "Strategi komprehensif untuk mengembangkan kapasitas sumber daya manusia melalui pelatihan dan pengembangan berkelanjutan.",
      steps: [
        "Program pelatihan berkelanjutan",
        "Pengembangan kepemimpinan",
        "Sistem manajemen kinerja berbasis kompetensi"
      ]
    },
    {
      icon: <FaChartLine className="w-16 h-16 text-emerald-900" />,
      title: "Akselerasi Pertumbuhan",
      description: "Implementasi strategi pertumbuhan berkelanjutan dengan pendekatan inovatif dan terukur.",
      steps: [
        "Pengembangan model bisnis adaptif",
        "Diversifikasi saluran distribusi",
        "Implementasi teknologi digital"
      ]
    }
  ];

  return (
    <section className="bg-white text-black py-16">
      <div className="container mx-auto px-4 lg:px-16 space-y-12">
        {/* Section Header */}
        <div 
          data-aos="fade-up" 
          className="text-center max-w-4xl mx-auto"
        >
          <div className="flex items-center justify-center mb-6">
            <h2 className="text-4xl font-bold text-black">
              Langkah Kami
            </h2>
          </div>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Kerangka komprehensif untuk mewujudkan visi dan misi Setara Commodity 
            melalui pendekatan sistematis dan berkelanjutan.
          </p>
        </div>

        {/* Action Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {actionSteps.map((step, index) => (
            <Card 
              key={step.title}
              data-aos="fade-up"
              data-aos-delay={index * 200}
              className="bg-white border border-emerald-900/30 text-black hover:border-emerald-900/70 transition-all duration-300"
            >
              <CardHeader className="flex flex-col items-center text-center pb-4">
                {step.icon}
                <CardTitle className="mt-4 text-2xl text-emerald-900">
                  {step.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-700 mb-6">
                  {step.description}
                </p>
                <div className="space-y-3">
                  {step.steps.map((substep, stepIndex) => (
                    <div 
                      key={stepIndex}
                      className="bg-emerald-100 border border-emerald-200 p-3 rounded-lg text-gray-800 flex items-center"
                    >
                      <FaLeaf className="mr-3 text-emerald-700 flex-shrink-0" />
                      <span>{substep}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ActionStepsSection;