import React from 'react';
import { Award, Users, Target, Heart, Clock, MapPin } from 'lucide-react';
import { Card, CardContent } from "../components/ui/Card.jsx";
import { Button } from "../components/ui/Button.jsx";
import { businessInfo } from '../mockData';

const About = () => {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-blue-50 to-white py-16">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            About LK Smart Wash
                        </h1>
                        <p className="text-lg text-gray-600">
                            Your trusted partner for premium laundry and dry cleaning services in Pithapuram.
                        </p>
                    </div>
                </div>
            </section>

            {/* Story Section */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6"> Our Story</h2>
                            <div className="space-y-4 text-gray-600 leading-relaxed">
                                <p>
                                    LK Smart Wash has been serving the Pithapuram community with dedication and excellence. We understand that your clothes are more than just fabric – they represent your personality, your professionalism, and your comfort.
                                </p>
                                <p>
                                    Starting as a small local service, we've grown into a trusted name in laundry and dry cleaning, thanks to our commitment to quality, customer satisfaction, and attention to detail.
                                </p>
                                <p>
                                    Located at Church Centre, One Way Road in Veeraraghavapuram, we're conveniently accessible and proud to serve our local community with the highest standards of garment care.
                                </p>
                            </div>
                        </div>
                        <div className="rounded-2xl overflow-hidden shadow-xl">
                            <img
                                src="https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=800&q=80"
                                alt="Clean folded laundry"
                                className="w-full h-[400px] object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
                        Our Core Values
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="bg-white border-t-4 border-t-blue-600">
                            <CardContent className="p-6 text-center">
                                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Award className="h-8 w-8 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Quality First</h3>
                                <p className="text-gray-600 text-sm">
                                    We never compromise on the quality of our cleaning services and customer care.
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="bg-white border-t-4 border-t-green-600">
                            <CardContent className="p-6 text-center">
                                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Heart className="h-8 w-8 text-green-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Customer Care</h3>
                                <p className="text-gray-600 text-sm">
                                    Your satisfaction is our priority. We treat every garment with care and respect.
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="bg-white border-t-4 border-t-purple-600">
                            <CardContent className="p-6 text-center">
                                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Users className="h-8 w-8 text-purple-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Community</h3>
                                <p className="text-gray-600 text-sm">
                                    Proud to serve Pithapuram and build lasting relationships with our customers.
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="bg-white border-t-4 border-t-orange-600">
                            <CardContent className="p-6 text-center">
                                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Target className="h-8 w-8 text-orange-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Excellence</h3>
                                <p className="text-gray-600 text-sm">
                                    Continuous improvement and innovation in our cleaning processes and services.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-blue-600 text-white">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-4 gap-8 text-center">
                        <div>
                            <div className="text-4xl md:text-5xl font-bold mb-2">5.0</div>
                            <p className="text-blue-100">Star Rating</p>
                        </div>
                        <div>
                            <div className="text-4xl md:text-5xl font-bold mb-2">100+</div>
                            <p className="text-blue-100">Happy Customers</p>
                        </div>
                        <div>
                            <div className="text-4xl md:text-5xl font-bold mb-2">1000+</div>
                            <p className="text-blue-100">Garments Cleaned</p>
                        </div>
                        <div>
                            <div className="text-4xl md:text-5xl font-bold mb-2">24/7</div>
                            <p className="text-blue-100">Pickup Service</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Location & Hours */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
                        Visit Us
                    </h2>
                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-start space-x-4">
                                    <div className="bg-blue-100 p-3 rounded-lg flex-shrink-0">
                                        <MapPin className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-2">Our Location</h3>
                                        <p className="text-gray-600">
                                            {businessInfo.address.street}<br />
                                            {businessInfo.address.area}<br />
                                            {businessInfo.address.city}, {businessInfo.address.state}<br />
                                            {businessInfo.address.pincode}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-start space-x-4">
                                    <div className="bg-green-100 p-3 rounded-lg flex-shrink-0">
                                        <Clock className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-2">Business Hours</h3>
                                        <p className="text-gray-600">
                                            Monday - Sunday<br />
                                            Open till 8:00 PM<br />
                                            <span className="text-green-600 font-medium">Open Now</span>
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
