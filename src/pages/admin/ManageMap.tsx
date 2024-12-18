import Footer from "@/components/Footer";
import LahanPolygonDrawer from "@/components/LahanPolygonDrawer";
import Navbar from "@/components/Navbar";
import React from "react";

const ManageMap: React.FC = () => {
    return (
        <div className="overflow-hidden">
            <Navbar />
            <LahanPolygonDrawer />
            <Footer />
        </div>
    );
};

export default ManageMap;