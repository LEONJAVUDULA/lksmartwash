import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import WhatsAppButton from "./components/WhatsAppButton.jsx";

import Home from "./pages/Home.jsx";
import Services from "./pages/Services.jsx";
import Gallery from "./pages/Gallery.jsx";
import Contact from "./pages/Contact.jsx";
import About from "./pages/About.jsx";
import TrackOrder from "./pages/TrackOrder.jsx";
import Wallet from "./pages/Wallet.jsx";

import Admin from "./pages/Admin.jsx";
import Login from "./pages/Login.jsx";

import DriverPortal from "./pages/DriverPortal.jsx";
import StaffTerminal from "./pages/StaffTerminal.jsx";

import CustomerRegister from "./pages/CustomerRegister.jsx";
import CustomerDashboard from "./pages/CustomerDashboard.jsx";

export default function App() {
    return (
        <BrowserRouter>
            <div className="flex flex-col min-h-screen font-sans">
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
                        <Route path="/wallet" element={<Wallet />} />

                        {/* UNIFIED LOGIN */}
                        <Route path="/login" element={<Login />} />
                        
                        {/* LEGACY REDIRECTS */}
                        <Route path="/admin-login" element={<Navigate to="/login" replace />} />
                        <Route path="/staff-login" element={<Navigate to="/login" replace />} />
                        <Route path="/driver-login" element={<Navigate to="/login" replace />} />

                        {/* PROTECTED PORTALS */}
                        <Route path="/admin" element={<Admin />} />
                        <Route path="/dashboard" element={<CustomerDashboard />} />
                        <Route path="/driver" element={<DriverPortal />} />
                        <Route path="/staff-terminal" element={<StaffTerminal />} />

                        {/* AUTH */}
                        <Route path="/register" element={<CustomerRegister />} />
                    </Routes>
                </main>

                <Footer />
                <WhatsAppButton />
            </div>
        </BrowserRouter>
    );
}
