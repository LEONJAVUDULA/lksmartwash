import React from 'react';
import { Shirt, Home as HomeIcon, Truck, Zap, ShoppingBag, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from "../components/ui/Button.jsx";
import { Card, CardContent } from "../components/ui/Card.jsx";
import { services } from '../mockData';

const Services = () => {
    const getIcon = (iconName) => {
        const icons = {
            shirt: Shirt,
            sparkles: Sparkles,
            'baggage-claim': ShoppingBag,
            truck: Truck,
            home: HomeIcon,
            zap: Zap
        };
        return icons[iconName] || Sparkles;
    };

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-blue-50 to-white py-20 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="text-left max-w-2xl flex-1">
                            <h1 className="text-4xl md:text-6xl font-extrabold text-blue-900 mb-6 tracking-tight">
                                Our Premium Services
                            </h1>
                            <p className="text-xl text-slate-600 leading-relaxed mb-8">
                                Comprehensive laundry and dry cleaning solutions tailored for your lifestyle. We combine traditional care with modern technology.
                            </p>
                            <div className="flex space-x-4">
                                <Link to="/contact">
                                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-14 text-lg shadow-xl shadow-blue-200">
                                        Book Pickup Now
                                    </Button>
                                </Link>
                            </div>
                        </div>
                        <div className="flex-1 relative hidden lg:block">
                            <div className="rounded-3xl overflow-hidden shadow-2xl skew-y-2 hover:skew-y-0 transition-transform duration-500 border-8 border-white">
                                <img 
                                    src="/service_dryclean.png" 
                                    alt="Premium Dry Cleaning" 
                                    className="w-full h-[450px] object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Grid */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {services.map((service) => {
                            const IconComponent = getIcon(service.icon);
                            return (
                                <Card key={service.id} className="hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-600">
                                    <CardContent className="p-8">
                                        <div className="bg-blue-100 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                                            <IconComponent className="h-8 w-8 text-blue-600" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                            {service.title}
                                        </h3>
                                        <p className="text-gray-600 mb-4 leading-relaxed">
                                            {service.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
                        Why Choose LK Smart Wash?
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <div className="text-4xl mb-3">✨</div>
                            <h3 className="font-semibold text-gray-900 mb-2">Premium Quality</h3>
                            <p className="text-sm text-gray-600">Expert care for all fabric types with advanced cleaning techniques.</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <div className="text-4xl mb-3">⚡</div>
                            <h3 className="font-semibold text-gray-900 mb-2">Fast Service</h3>
                            <p className="text-sm text-gray-600">Quick turnaround with same-day express service available.</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <div className="text-4xl mb-3">🏆</div>
                            <h3 className="font-semibold text-gray-900 mb-2">5 Star Rated</h3>
                            <p className="text-sm text-gray-600">Trusted by customers with consistently excellent reviews.</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <div className="text-4xl mb-3">♻️</div>
                            <h3 className="font-semibold text-gray-900 mb-2">Eco-Friendly</h3>
                            <p className="text-sm text-gray-600">Using environmentally safe cleaning products and methods.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-blue-600 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Ready to Get Started?
                    </h2>
                    <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
                        Experience the difference of professional cleaning services. Contact us today!
                    </p>
                    <Link to="/contact">
                        <Button size="lg" variant="outline" className="bg-white text-blue-600 border-white hover:bg-solid shadow-lg font-bold">
                            Book Your Service Now
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Services;
