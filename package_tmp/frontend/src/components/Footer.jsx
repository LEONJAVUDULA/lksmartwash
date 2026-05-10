import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, Instagram, Youtube, Facebook } from 'lucide-react';
import { businessInfo } from '../mockData';

export const Footer = () => {
    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* About Section */}
                    <div className="space-y-4">
                        <div className="flex items-center">
                            <img src="/logo.png" alt="LK Smart Wash Logo" className="h-10 w-auto" onError={(e) => e.target.style.display = 'none'} />
                        </div>
                        <p className="text-sm">
                            Serving Pithapuram with quality laundry and dry cleaning services since years. Your trusted partner for all cleaning needs.
                        </p>
                        <div className="flex items-center space-x-1">
                            <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                    <span key={i}>★</span>
                                ))}
                            </div>
                            <span className="text-sm ml-2">5.0 ({businessInfo.reviewCount} reviews)</span>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/" className="text-sm hover:text-blue-400 transition-colors">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link to="/services" className="text-sm hover:text-blue-400 transition-colors">
                                    Services
                                </Link>
                            </li>
                            <li>
                                <Link to="/about" className="text-sm hover:text-blue-400 transition-colors">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link to="/gallery" className="text-sm hover:text-blue-400 transition-colors">
                                    Gallery
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className="text-sm hover:text-blue-400 transition-colors">
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Our Services</h4>
                        <ul className="space-y-2 text-sm">
                            <li>Laundry Wash & Fold</li>
                            <li>Dry Cleaning</li>
                            <li>Shoe & Bag Cleaning</li>
                            <li>Home Delivery</li>
                            <li>Carpet Cleaning</li>
                            <li>Express Service</li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Contact Us</h4>
                        <div className="space-y-3">
                            <div className="flex items-start space-x-2">
                                <MapPin className="h-4 w-4 mt-1 flex-shrink-0 text-blue-400" />
                                <p className="text-sm">
                                    {businessInfo.address.street}, {businessInfo.address.area},<br />
                                    {businessInfo.address.city}, {businessInfo.address.state} {businessInfo.address.pincode}
                                </p>
                            </div>
                            <div className="flex items-start space-x-2">
                                <Phone className="h-4 w-4 flex-shrink-0 mt-1 text-blue-400" />
                                <div className="flex flex-col">
                                    <a href={`tel:${businessInfo.phone}`} className="text-sm hover:text-blue-400 transition-colors">
                                        {businessInfo.phone}
                                    </a>
                                    <a href={`tel:${businessInfo.phone2}`} className="text-sm hover:text-blue-400 transition-colors">
                                        {businessInfo.phone2}
                                    </a>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Mail className="h-4 w-4 flex-shrink-0 text-blue-400" />
                                <a href={`mailto:${businessInfo.email}`} className="text-sm hover:text-blue-400 transition-colors">
                                    {businessInfo.email}
                                </a>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 flex-shrink-0 text-blue-400" />
                                <p className="text-sm">{businessInfo.hours}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-8 pt-8 text-center flex flex-col items-center">
                    <p className="text-sm text-gray-400">
                        © {new Date().getFullYear()} LK Smart Wash. All rights reserved. Serving Pithapuram with Quality.
                    </p>
                    <div className="flex space-x-4 pt-4">
                        <a href={`https://instagram.com/${businessInfo.socials.instagram}`} target="_blank" rel="noopener noreferrer" className="bg-gray-800 p-2 rounded-full hover:bg-blue-600 transition-colors">
                            <Instagram className="h-5 w-5" />
                        </a>
                        <a href={`https://facebook.com/${businessInfo.socials.facebook.replace(/\s+/g, '')}`} target="_blank" rel="noopener noreferrer" className="bg-gray-800 p-2 rounded-full hover:bg-blue-600 transition-colors">
                            <Facebook className="h-5 w-5" />
                        </a>
                        <a href={`https://youtube.com/@${businessInfo.socials.youtube}`} target="_blank" rel="noopener noreferrer" className="bg-gray-800 p-2 rounded-full hover:bg-blue-600 transition-colors">
                            <Youtube className="h-5 w-5" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};
export default Footer;
