import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, MessageCircle, CreditCard } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent } from '../components/ui/card';
import { Label } from '../components/ui/label';

import { businessInfo, services } from '../mockData';
import { PaymentModal } from '../components/PaymentModal';
import GoogleMap from '../components/GoogleMap';
import API_URL from '../api';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        serviceType: '',
        notes: '',
        paymentMethod: 'cash'
    });

    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [bookingDetails, setBookingDetails] = useState(null);
    const [showPayment, setShowPayment] = useState(false);
    const [error, setError] = useState('');

    const selectedService = services.find(s => s.id === formData.serviceType);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleServiceChange = (value) => {
        setFormData({
            ...formData,
            serviceType: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API_URL}/api/bookings`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    amount: selectedService?.basePrice || 0,
                    orderType: formData.paymentMethod === 'online' ? 'pre-paid' : 'post-paid'
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setBookingDetails(data);
                if (formData.paymentMethod === 'online') {
                    setShowPayment(true);
                } else {
                    setSubmitted(true);
                    window.scrollTo(0, 0);
                }
            } else {
                const data = await res.json();
                setError(data.message || 'Failed to submit booking. Please try again.');
            }
        } catch (err) {
            setError('Server error. Please check your connection.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-blue-50 to-white py-16">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Get In Touch
                        </h1>
                        <p className="text-lg text-gray-600">
                            Schedule a pickup or contact us for any inquiries. We're here to help!
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact Form & Info */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-12">
                        {/* Contact Form */}
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">Book Your Pickup</h2>

                            {submitted && (
                                <div className="bg-green-50 border border-green-200 text-green-700 p-6 rounded-xl mb-8 text-center">
                                    <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Send className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">Booking Request Submitted!</h3>
                                    <p className="mb-4">We have received your request and will contact you shortly.</p>
                                    
                                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg inline-block text-left max-w-md mx-auto">
                                        <p className="text-xs text-blue-800 font-bold uppercase mb-1">📢 Developer Note - Mock Notification</p>
                                        <p className="text-sm text-blue-700">
                                            The notification update for <strong>{bookingDetails?.phone}</strong> was sent to the <strong>Backend Terminal Console</strong>. 
                                            Check your server logs to see the generated order confirmation!
                                        </p>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <Label htmlFor="name">Full Name *</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        type="text"
                                        placeholder="Enter your name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="phone">Phone Number *</Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        placeholder="Enter your phone number"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="Enter your email (optional)"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="address">Pickup Address *</Label>
                                    <Textarea
                                        id="address"
                                        name="address"
                                        placeholder="Enter your complete pickup address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        required
                                        className="mt-2"
                                        rows={3}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="serviceType">Service Type *</Label>
                                    <select
                                        value={formData.serviceType}
                                        onChange={(e) => handleServiceChange(e.target.value)}
                                        required
                                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent mt-2"
                                    >
                                        <option value="" disabled hidden>Select service type</option>
                                        <option value="laundry">Laundry Wash & Fold</option>
                                        <option value="dryclean">Dry Cleaning</option>
                                        <option value="shoes">Shoe & Bag Cleaning</option>
                                        <option value="carpet">Carpet & Curtain Wash</option>
                                        <option value="express">Express Service</option>
                                    </select>
                                </div>
                                <div>
                                    <Label className="mb-3 block text-sm font-medium text-gray-700">Payment Option</Label>
                                    <div className="grid grid-cols-2 gap-4 mt-2">
                                        <div 
                                            onClick={() => setFormData({...formData, paymentMethod: 'cash'})}
                                            className={`p-3 rounded-lg border-2 cursor-pointer transition-all flex items-center justify-between ${formData.paymentMethod === 'cash' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                                        >
                                            <span className="font-medium text-sm">Pay After Service</span>
                                            <div className={`w-4 h-4 rounded-full border-2 ${formData.paymentMethod === 'cash' ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`} />
                                        </div>
                                        <div 
                                            onClick={() => setFormData({...formData, paymentMethod: 'online'})}
                                            className={`p-3 rounded-lg border-2 cursor-pointer transition-all flex items-center justify-between ${formData.paymentMethod === 'online' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                                        >
                                            <div className="flex items-center space-x-2">
                                                <CreditCard size={18} className="text-blue-600" />
                                                <span className="font-medium text-sm">Pay Now (UPI)</span>
                                            </div>
                                            <div className={`w-4 h-4 rounded-full border-2 ${formData.paymentMethod === 'online' ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`} />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="notes">Additional Notes</Label>
                                    <Textarea
                                        id="notes"
                                        name="notes"
                                        placeholder="Any special instructions or requirements"
                                        value={formData.notes}
                                        onChange={handleChange}
                                        className="mt-2"
                                        rows={2}
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    size="lg"
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                    disabled={loading}
                                >
                                    {loading ? 'Submitting...' : (
                                        <>
                                            <Send className="mr-2 h-5 w-5" />
                                            Submit Booking Request
                                        </>
                                    )}
                                </Button>
                            </form>
                        </div>

                        {/* Contact Information */}
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-6">Contact Information</h2>
                                <p className="text-gray-600 mb-8">
                                    Have questions? Reach out to us through any of these channels. We're happy to assist you!
                                </p>
                            </div>
                            <div className="space-y-4">
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-start space-x-4">
                                            <div className="bg-blue-100 p-3 rounded-lg flex-shrink-0">
                                                <Phone className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 mb-1">Phone Numbers</h3>
                                                <div className="flex flex-col">
                                                    <a href={`tel:${businessInfo.phone}`} className="text-blue-600 hover:underline">
                                                        {businessInfo.phone}
                                                    </a>
                                                    <a href={`tel:${businessInfo.phone2}`} className="text-blue-600 hover:underline">
                                                        {businessInfo.phone2}
                                                    </a>
                                                </div>
                                                <p className="text-sm text-gray-500 mt-1">Call us anytime</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-start space-x-4">
                                            <div className="bg-green-100 p-3 rounded-lg flex-shrink-0">
                                                <MessageCircle className="h-6 w-6 text-green-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 mb-1">WhatsApp</h3>
                                                <a
                                                    href={`https://wa.me/${businessInfo.whatsapp}?text=Hi, I need laundry service.`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-green-600 hover:underline"
                                                >
                                                    Chat on WhatsApp
                                                </a>
                                                <p className="text-sm text-gray-500 mt-1">Quick response guaranteed</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-start space-x-4">
                                            <div className="bg-purple-100 p-3 rounded-lg flex-shrink-0">
                                                <Mail className="h-6 w-6 text-purple-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                                                <a href="mailto:info@lksmartwash.com" className="text-purple-600 hover:underline">
                                                    {businessInfo.email}
                                                </a>
                                                <p className="text-sm text-gray-500 mt-1">We'll respond within 24 hours</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-start space-x-4">
                                            <div className="bg-red-100 p-3 rounded-lg flex-shrink-0">
                                                <MapPin className="h-6 w-6 text-red-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 mb-1">Visit Us</h3>
                                                <p className="text-gray-600">
                                                    {businessInfo.address.street}, {businessInfo.address.area},<br />
                                                    {businessInfo.address.city}, {businessInfo.address.state} {businessInfo.address.pincode}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-start space-x-4">
                                            <div className="bg-orange-100 p-3 rounded-lg flex-shrink-0">
                                                <Clock className="h-6 w-6 text-orange-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 mb-1">Business Hours</h3>
                                                <p className="text-gray-600">
                                                    Monday - Sunday<br />
                                                    {businessInfo.hours}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Map Section */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">Find Us</h2>
                    <p className="text-gray-500 text-center mb-8">Click the marker for directions to our shop</p>
                    <GoogleMap height="450px" zoom={16} />
                </div>
            </section>
            <PaymentModal 
                isOpen={showPayment}
                onClose={() => {
                    setShowPayment(false);
                    setSubmitted(true);
                    window.scrollTo(0, 0);
                }}
                amount={bookingDetails?.amount || 0}
                bookingId={bookingDetails?._id || ""}
                onPaymentSuccess={() => {
                    setSubmitted(true);
                    window.scrollTo(0, 0);
                }}
            />
        </div>
    );
};

export default Contact;
