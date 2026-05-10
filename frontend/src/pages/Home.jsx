import React, { useState, useEffect } from 'react';
import { MapPin, Truck, Clock, Award, Phone, ArrowRight, ShieldCheck, Shirt, Star, UserCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button.jsx';
import { Card, CardContent } from '../components/ui/Card.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Label } from '../components/ui/Label.jsx';
import API_URL from '../api';
import { businessInfo, services, testimonials } from '../mockData';

const Home = () => {
    const [apiReviews, setApiReviews] = useState([]);

    useEffect(() => {
        fetch(`${API_URL}/api/reviews`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    setApiReviews(data);
                } else {
                    setApiReviews(testimonials);
                }
            })
            .catch(() => setApiReviews(testimonials));
    }, []);

    const topServices = services.slice(0, 3);
    const displayReviews = (apiReviews || []).slice(0, 4);

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative h-[90vh] flex items-center overflow-hidden bg-gray-900">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <div className="inline-flex items-center bg-blue-600/20 text-blue-400 px-4 py-2 rounded-full text-sm font-medium">
                                <Award className="h-4 w-4 mr-2" />
                                5.0 Rating • 6 Reviews
                            </div>
                            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                                Smart Dry Cleaning for Smart People
                            </h1>
                            <p className="text-lg text-gray-300">
                                Professional laundry and dry cleaning services in Pithapuram. Free pickup and delivery. Same-day service available.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link to="/contact">
                                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">
                                        Book Pickup
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>
                                <Link to="/register">
                                    <Button size="lg" variant="outline" className="border-green-500 text-green-500 hover:bg-green-50 w-full sm:w-auto shadow-lg shadow-green-500/10">
                                        <UserCircle2 className="mr-2 h-5 w-5" />
                                        Join & Earn 10%
                                    </Button>
                                </Link>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-blue-600/10">
                                <img
                                    src="/hero_banner.png"
                                    alt="Professional laundry service"
                                    className="w-full h-[400px] object-cover hover:scale-105 transition-transform duration-700"
                                />
                            </div>
                            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg">
                                <div className="flex items-center space-x-3">
                                    <div className="bg-green-100 p-3 rounded-full">
                                        <Truck className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">Free Pickup</p>
                                        <p className="text-sm text-gray-500">In Pithapuram Area</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Bar */}
            <section className="bg-blue-600 py-8">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-white text-center">
                        <div className="flex items-center justify-center space-x-3">
                            <Clock className="h-8 w-8" />
                            <div>
                                <p className="font-semibold">Open Till 8 PM</p>
                                <p className="text-sm text-blue-100">Convenient Hours</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-center space-x-3">
                            <Truck className="h-8 w-8" />
                            <div>
                                <p className="font-semibold">Free Home Delivery</p>
                                <p className="text-sm text-blue-100">Pickup & Drop Service</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-center space-x-3">
                            <Award className="h-8 w-8" />
                            <div>
                                <p className="font-semibold">5.0 Star Rating</p>
                                <p className="text-sm text-blue-100">Trusted by Locals</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Overview */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Our Premium Services
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            From everyday laundry to delicate dry cleaning, we handle all your garment care needs with expertise.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                        {topServices.map((service) => {
                            const IconComponent = service.id === 'laundry' ? Shirt :
                                service.id === 'dryclean' ? ShieldCheck : Truck;
                            return (
                                <Card key={service.id} className="hover:shadow-lg transition-shadow duration-300">
                                    <CardContent className="p-6">
                                        <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                                            <IconComponent className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                            {service.title}
                                        </h3>
                                        <p className="text-gray-600 mb-4">{service.description}</p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 mt-8">
                        <Link to="/services">
                            <Button variant="outline" size="lg" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                                View Service Details
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Customer Reviews</h2>
                        <p className="text-gray-600">Hear what our customers say about our smart cleaning services</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                        {displayReviews.map((testimonial, index) => (
                            <Card key={index} className="hover:shadow-xl transition-shadow duration-300">
                                <CardContent className="p-8">
                                    <div className="flex text-yellow-400 mb-4">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={18} fill={i < testimonial.rating ? "currentColor" : "none"} />
                                        ))}
                                    </div>
                                    <p className="text-gray-600 mb-6 italic">"{testimonial.comment || testimonial.text}"</p>
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                                        <span className="text-sm text-gray-500">{testimonial.date || (testimonial.createdAt ? new Date(testimonial.createdAt).toLocaleDateString() : '')}</span>
                                    </div>
                                    {testimonial.reply && (
                                        <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-600 text-xs">
                                            <p className="font-bold text-blue-900">Reply from LK Smart Wash:</p>
                                            <p className="text-blue-800 italic">{testimonial.reply}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Quick Review Form */}
                    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Share Your Experience</h3>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            const review = {
                                name: formData.get('name'),
                                rating: parseInt(formData.get('rating')),
                                comment: formData.get('comment')
                            };
                            try {
                                await fetch(`${API_URL}/api/reviews`, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify(review)
                                });
                                alert("Thank you for your review!");
                                e.target.reset();
                                // Refresh reviews
                                fetch(`${API_URL}/api/reviews`)
                                    .then(res => res.json())
                                    .then(data => setApiReviews(data));
                            } catch (err) {
                                alert("Failed to submit review.");
                            }
                        }} className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label>Your Name</Label>
                                    <Input name="name" required placeholder="John Doe" />
                                </div>
                                <div>
                                    <Label>Rating (1-5)</Label>
                                    <select name="rating" className="w-full border rounded-md p-2 h-10" required>
                                        <option value="5">5 Stars - Excellent</option>
                                        <option value="4">4 Stars - Very Good</option>
                                        <option value="3">3 Stars - Good</option>
                                        <option value="2">2 Stars - Fair</option>
                                        <option value="1">1 Star - Poor</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <Label>Your Comment</Label>
                                <textarea name="comment" required className="w-full border rounded-md p-3 h-24" placeholder="Tell us about our service..."></textarea>
                            </div>
                            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12">
                                Submit Review
                            </Button>
                        </form>
                    </div>
                </div>
            </section>

            {/* Location Map */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                Visit Our Store
                            </h2>
                            <p className="text-lg text-gray-600 mb-6">
                                Conveniently located in the heart of Pithapuram. Stop by or call us for free pickup service.
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <MapPin className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                                    <div>
                                        <p className="font-semibold text-gray-900">Address</p>
                                        <p className="text-gray-600">
                                            {businessInfo.address.street}, {businessInfo.address.area},<br />
                                            {businessInfo.address.city}, {businessInfo.address.state} {businessInfo.address.pincode}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <Phone className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                                    <div className="flex flex-col">
                                        <p className="font-semibold text-gray-900">Phone Numbers</p>
                                        <a href={`tel:${businessInfo.phone}`} className="text-blue-600 hover:underline">
                                            {businessInfo.phone}
                                        </a>
                                        <a href={`tel:${businessInfo.phone2}`} className="text-blue-600 hover:underline">
                                            {businessInfo.phone2}
                                        </a>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <Clock className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                                    <div>
                                        <p className="font-semibold text-gray-900">Hours</p>
                                        <p className="text-gray-600">{businessInfo.hours}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl overflow-hidden shadow-lg h-[400px]">
                            <iframe
                                src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1913.3!2d${businessInfo.coordinates.lng}!3d${businessInfo.coordinates.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTfCsDA3JzA4LjAiTiA4MsKwMTUnMTkuMSJF!5e0!3m2!1sen!2sin!4v1709450000000`}
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="LK Smart Wash Location"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-blue-600 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Ready for Fresh, Clean Clothes?
                    </h2>
                    <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
                        Book your pickup today and experience the best laundry service in Pithapuram.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/contact">
                            <Button size="lg" variant="outline" className="bg-white text-blue-600 border-white hover:bg-gray-100 w-full sm:w-auto shadow-lg">
                                Schedule Pickup
                                <Truck className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <a href={`https://wa.me/${businessInfo.whatsapp}?text=Hi, I need laundry service.`} target="_blank" rel="noopener noreferrer">
                            <Button size="lg" variant="outline" className="border-white text-white hover:bg-blue-700 w-full sm:w-auto">
                                WhatsApp Us
                            </Button>
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
