import React, { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Clock, Send, MessageCircle, CreditCard, Wallet, Shirt, Zap } from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Textarea } from '../components/ui/Textarea.jsx';
import { Card, CardContent } from '../components/ui/Card.jsx';
import { Label } from '../components/ui/Label.jsx';

import { businessInfo, services as mockServices } from '../mockData';
import { PaymentModal } from '../components/PaymentModal';
import GoogleMap from '../components/GoogleMap';
import API_URL from '../api';
import axios from 'axios';

const Contact = () => {
    const [formData, setFormData] = useState({
        userId: localStorage.getItem("userId") || "",
        name: '',
        phone: '',
        email: '',
        address: '',
        serviceType: '', // Now acts as primary category ID
        notes: '',
        paymentMethod: 'cash',
        isFlashDelivery: false
    });

    const [selectedItems, setSelectedItems] = useState([]);

    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [bookingDetails, setBookingDetails] = useState(null);
    const [showPayment, setShowPayment] = useState(false);
    const [error, setError] = useState('');
    const [liveServices, setLiveServices] = useState(mockServices);
    const [userTier, setUserTier] = useState("Silver");

    useEffect(() => {
        const fetchPricing = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/public/pricing`);
                if (res.data && res.data.length > 0) {
                    const mapped = res.data.map((p, idx) => {
                        const mockMatch = mockServices.find(ms => ms.title.toLowerCase() === p.serviceName.toLowerCase());
                        return {
                            id: p.serviceName.toLowerCase().replace(/\s+/g, '-'),
                            title: p.serviceName,
                            basePrice: p.price,
                            description: p.description || "Professional care for your garments.",
                            icon: "Shirt",
                            subItems: mockMatch?.subItems || [] // Preserving itemized data
                        };
                    });
                    setLiveServices(mapped);
                }
            } catch (err) {
                console.error("Failed to fetch live pricing, using mock data", err);
            }
        };
        fetchPricing();

        const fetchUserTier = async () => {
            const token = localStorage.getItem("userToken");
            if (token) {
                try {
                    const res = await axios.get(`${API_URL}/api/user/wallet`, {
                        headers: { Authorization: token }
                    });
                    setUserTier(res.data.loyaltyTier || "Silver");
                } catch (err) { console.error("Tier fetch failed", err); }
            }
        };
        fetchUserTier();
    }, []);

    const selectedService = liveServices.find(s => s.id === formData.serviceType);

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
        // Clear items when switching main categories to avoid confusion
        setSelectedItems([]);
    };

    const toggleItem = (item) => {
        const existing = selectedItems.find(i => i.name === item.name);
        if (existing) {
            setSelectedItems(selectedItems.filter(i => i.name !== item.name));
        } else {
            setSelectedItems([...selectedItems, { ...item, quantity: 1 }]);
        }
    };

    const updateItemQuantity = (itemName, delta) => {
        setSelectedItems(selectedItems.map(item => {
            if (item.name === itemName) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const baseAmount = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const flashFee = formData.isFlashDelivery ? 200 : 0;
    const totalAmount = baseAmount + flashFee;

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
                    selectedItems: selectedItems,
                    amount: totalAmount,
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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label htmlFor="pincode">Pincode *</Label>
                                        <Input
                                            id="pincode"
                                            name="pincode"
                                            type="text"
                                            placeholder="6-digit Pincode"
                                            value={formData.pincode || ""}
                                            onChange={(e) => {
                                                const pin = e.target.value;
                                                const storeMapping = {
                                                    "110001": "Downtown", "110002": "Downtown", "110003": "Downtown",
                                                    "110045": "West End", "110046": "West End", "110048": "West End",
                                                    "110091": "East Plaza", "110092": "East Plaza",
                                                    "110017": "South Mall", "110018": "South Mall", "110019": "South Mall"
                                                };
                                                setFormData({
                                                    ...formData,
                                                    pincode: pin,
                                                    storeLocation: storeMapping[pin] || formData.storeLocation || "Main Store"
                                                });
                                            }}
                                            required
                                            className="mt-2"
                                            maxLength={6}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="storeLocation">Selected Store Area *</Label>
                                        <select
                                            value={formData.storeLocation || "Main Store"}
                                            onChange={(e) => setFormData({...formData, storeLocation: e.target.value})}
                                            required
                                            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent mt-2"
                                        >
                                            <option value="Main Store">Main Store (Default)</option>
                                            <option value="Downtown">Downtown Branch</option>
                                            <option value="West End">West End Branch</option>
                                            <option value="East Plaza">East Plaza Branch</option>
                                            <option value="South Mall">South Mall Branch</option>
                                        </select>
                                        <p className="text-[10px] text-gray-400 mt-1">System auto-selects based on pincode.</p>
                                    </div>
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
                                    <Label htmlFor="serviceType">Select Cleaning Category *</Label>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-2">
                                        {liveServices.map((service) => (
                                            <div
                                                key={service.id}
                                                onClick={() => handleServiceChange(service.id)}
                                                className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center space-y-2 ${
                                                    formData.serviceType === service.id
                                                        ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                                                        : 'border-slate-100 bg-white hover:border-blue-200'
                                                }`}
                                            >
                                                <div className={`p-2 rounded-lg ${
                                                    formData.serviceType === service.id ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400'
                                                }`}>
                                                    <Shirt className="h-4 w-4" />
                                                </div>
                                                <span className="font-bold text-[10px] text-center uppercase tracking-tight">{service.title.split(' (')[0]}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Itemized Selection Sub-menu */}
                                    {selectedService && selectedService.subItems && (
                                        <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 animate-in fade-in slide-in-from-top duration-300">
                                            <Label className="mb-3 block text-sm font-bold text-slate-700">Add Items from {selectedService.title}</Label>
                                            <div className="space-y-2">
                                                {selectedService.subItems.map((item) => {
                                                    const isSelected = selectedItems.find(i => i.name === item.name);
                                                    return (
                                                        <div key={item.name} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-bold text-slate-900">{item.name}</span>
                                                                <span className="text-xs font-black text-blue-600">₹{item.price}</span>
                                                            </div>
                                                            <div className="flex items-center space-x-3">
                                                                {isSelected ? (
                                                                    <div className="flex items-center bg-slate-900 text-white rounded-lg p-1 px-2 space-x-3 shadow-md">
                                                                        <button type="button" onClick={() => updateItemQuantity(item.name, -1)} className="hover:text-amber-400 transition-colors">-</button>
                                                                        <span className="text-xs font-bold w-4 text-center">{isSelected.quantity}</span>
                                                                        <button type="button" onClick={() => updateItemQuantity(item.name, 1)} className="hover:text-amber-400 transition-colors">+</button>
                                                                    </div>
                                                                ) : (
                                                                    <Button 
                                                                        type="button" 
                                                                        onClick={() => toggleItem(item)} 
                                                                        className="h-8 px-4 bg-blue-600 hover:bg-blue-700 text-white text-[10px] uppercase font-black tracking-widest rounded-lg"
                                                                    >
                                                                        Add
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            {selectedItems.length > 0 && (
                                                <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center">
                                                    <span className="text-xs font-black uppercase text-slate-400 italic">Total Estimated</span>
                                                    <span className="text-lg font-black text-slate-900">₹{totalAmount}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
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
                                        {formData.userId && (
                                            <div 
                                                onClick={() => setFormData({...formData, paymentMethod: 'wallet'})}
                                                className={`p-3 rounded-lg border-2 cursor-pointer transition-all flex items-center justify-between ${formData.paymentMethod === 'wallet' ? 'border-amber-600 bg-amber-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <Wallet size={18} className="text-amber-600" />
                                                    <span className="font-medium text-sm">My Wallet Balance</span>
                                                </div>
                                                <div className={`w-4 h-4 rounded-full border-2 ${formData.paymentMethod === 'wallet' ? 'bg-amber-600 border-amber-600' : 'border-gray-300'}`} />
                                            </div>
                                        )}
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

                                <div className="p-5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl border-2 border-amber-200 shadow-sm relative overflow-hidden group transition-all hover:shadow-md">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>
                                    <div className="flex items-center justify-between relative z-10">
                                        <div className="flex items-center space-x-4">
                                            <div className="bg-amber-500 p-2.5 rounded-2xl text-white shadow-lg shadow-amber-200">
                                                <Zap size={20} className="animate-pulse" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight">Flash Delivery Upgrade</h4>
                                                <p className="text-[10px] text-amber-700 font-bold">Guaranteed 3-Hour Turnaround • +₹200</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                className="sr-only peer" 
                                                checked={formData.isFlashDelivery} 
                                                onChange={(e) => setFormData({...formData, isFlashDelivery: e.target.checked})} 
                                            />
                                            <div className="w-12 h-6 bg-amber-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                                        </label>
                                    </div>
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
