import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Phone, Menu, X, User, LogIn } from 'lucide-react';
import { Button } from './ui/button';
import { businessInfo } from '../mockData';

export const Header = () => {
    const [logoLoaded, setLogoLoaded] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();
    const isLoggedIn = !!localStorage.getItem("userToken");

    const navLinks = [
        { path: '/', label: 'Home' },
        { path: '/services', label: 'Services' },
        { path: '/track', label: 'Track Order' },
        { path: '/about', label: 'About' },
        { path: '/gallery', label: 'Gallery' },
        { path: '/contact', label: 'Contact' }
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-20">
                    {/* Logo + Brand Name */}
                    <Link to="/" className="flex items-center space-x-3">
                        <div className="flex items-center">
                            <img 
                                src="/logo.png" 
                                alt="LK Smart Wash Logo" 
                                className="h-10 md:h-12 w-auto transition-transform duration-300 hover:scale-105"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Pacifico', cursive" }}>
                                LK Smart Wash
                            </h1>
                            <p className="text-[11px] text-gray-400 tracking-widest uppercase">For Smart People</p>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`text-sm font-medium transition-colors hover:text-blue-600 ${isActive(link.path) ? 'text-blue-600' : 'text-gray-700'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <Link
                            to={isLoggedIn ? "/dashboard" : "/login"}
                            className={`flex items-center text-sm font-bold transition-colors hover:text-blue-600 ${isActive("/dashboard") || isActive("/login") ? "text-blue-600" : "text-gray-900"}`}
                        >
                            {isLoggedIn ? (
                                <><User className="h-4 w-4 mr-1 text-blue-600" /> Dashboard</>
                            ) : (
                                <><LogIn className="h-4 w-4 mr-1 text-gray-400" /> Login</>
                            )}
                        </Link>
                    </nav>

                    {/* Call Button */}
                    <div className="hidden md:flex items-center space-x-4">
                        <a href={`tel:${businessInfo.phone}`}>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                <Phone className="h-4 w-4 mr-2" />
                                {businessInfo.phone}
                            </Button>
                        </a>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-gray-700 hover:text-blue-600 transition-colors"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t">
                        <nav className="flex flex-col space-y-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`text-sm font-medium transition-colors hover:text-blue-600 ${isActive(link.path) ? 'text-blue-600' : 'text-gray-700'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <Link
                                to={isLoggedIn ? "/dashboard" : "/login"}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`text-sm font-bold flex items-center py-2 transition-colors hover:text-blue-600 ${isActive("/dashboard") || isActive("/login") ? "text-blue-600" : "text-gray-900"}`}
                            >
                                {isLoggedIn ? (
                                    <><User className="h-4 w-4 mr-2 text-blue-600" /> My Dashboard</>
                                ) : (
                                    <><LogIn className="h-4 w-4 mr-2 text-gray-400" /> Login / Register</>
                                )}
                            </Link>
                            <div className="flex flex-col space-y-2 pt-2">
                                <a href={`tel:${businessInfo.phone}`}>
                                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                        <Phone className="h-4 w-4 mr-2" />
                                        {businessInfo.phone}
                                    </Button>
                                </a>
                                <a href={`tel:${businessInfo.phone2}`}>
                                    <Button variant="outline" className="w-full border-blue-600 text-blue-600">
                                        <Phone className="h-4 w-4 mr-2" />
                                        {businessInfo.phone2}
                                    </Button>
                                </a>
                            </div>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
};
export default Header;
