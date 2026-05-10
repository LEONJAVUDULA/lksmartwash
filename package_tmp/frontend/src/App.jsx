import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";

import Home from "./pages/Home";
import Services from "./pages/Services";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";
import About from "./pages/About";
import TrackOrder from "./pages/TrackOrder";

import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";

import DriverLogin from "./pages/DriverLogin";
import DriverPortal from "./pages/DriverPortal";

import StaffLogin from "./pages/StaffLogin";
import StaffTerminal from "./pages/StaffTerminal";

import CustomerLogin from "./pages/CustomerLogin";
import CustomerRegister from "./pages/CustomerRegister";
import CustomerDashboard from "./pages/CustomerDashboard";

export default function App() {
    return (
        <BrowserRouter>
            <div className="flex flex-col min-h-screen">
                <Header />

                <main className="flex-grow">
                    <Routes>
                        {/* CUSTOMER WEBSITE */}
                        <Route path="/" element={<Home />} />
                        <Route path="/services" element={<Services />} />
                        <Route path="/gallery" element={<Gallery />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/track" element={<TrackOrder />} />

                        {/* ADMIN */}
                        <Route path="/admin-login" element={<AdminLogin />} />
                        <Route path="/admin" element={<Admin />} />

                        {/* CUSTOMER PORTAL */}
                        <Route path="/login" element={<CustomerLogin />} />
                        <Route path="/register" element={<CustomerRegister />} />
                        <Route path="/dashboard" element={<CustomerDashboard />} />

                        {/* DRIVER PORTAL */}
                        <Route path="/driver-login" element={<DriverLogin />} />
                        <Route path="/driver" element={<DriverPortal />} />

                        {/* STAFF TERMINAL */}
                        <Route path="/staff-login" element={<StaffLogin />} />
                        <Route path="/staff-terminal" element={<StaffTerminal />} />
                    </Routes>
                </main>

                <Footer />
                <WhatsAppButton />
            </div>
        </BrowserRouter>
    );
}
