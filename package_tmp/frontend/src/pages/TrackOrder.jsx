import React, { useState } from "react";
import { Search, Package, Clock, CheckCircle2, Truck, ShieldCheck, AlertCircle } from "lucide-react";
import { Input } from "../components/ui/input";
import API_URL from "../api";
import { PaymentModal } from "../components/PaymentModal";

const STATUS_STEPS = [
    { key: "pending", label: "Booking Received", icon: Clock },
    { key: "received", label: "Laundry Collected", icon: Package },
    { key: "processing", label: "Sorting & Prep", icon: ShieldCheck },
    { key: "cleaning", label: "Washing/Dry Cleaning", icon: ShieldCheck },
    { key: "ready_for_pickup", label: "Ready for Delivery", icon: CheckCircle2 },
    { key: "delivered", label: "Home Delivered", icon: Truck },
];

const TrackOrder = () => {
    const [phone, setPhone] = useState("");
    const [bookings, setBookings] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showPayment, setShowPayment] = useState(false);

    const handleTrack = async (e) => {
        e.preventDefault();
        if (!phone) return;
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${API_URL}/api/bookings/track/${phone}`);
            const data = await res.json();
            if (res.ok) {
                setBookings(data);
            } else {
                setError(data.error || "No orders found for this number.");
                setBookings(null);
            }
        } catch (err) {
            setError("Unable to connect to server. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const getStatusIndex = (status) => {
        if (status === "completed") return 6;
        const index = STATUS_STEPS.findIndex(s => s.key === status);
        return index !== -1 ? index : 0;
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 font-sans">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 mb-4 tracking-tight">Track Your Laundry</h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Real-time updates for your garments at LK Smart Wash.
                    </p>
                </div>

                {/* Search Box */}
                <Card className="mb-12 shadow-2xl border-none bg-white rounded-3xl overflow-hidden">
                    <CardContent className="p-10">
                        <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <Search className="h-6 w-6 text-slate-400" />
                                </div>
                                <Input
                                    type="tel"
                                    placeholder="Enter Phone Number (e.g. 9030347111)"
                                    className="pl-14 h-16 text-lg rounded-2xl border-slate-200 focus:ring-blue-500 bg-slate-50"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>
                            <Button 
                                type="submit" 
                                disabled={loading}
                                className="h-16 px-10 rounded-2xl bg-blue-600 hover:bg-blue-700 text-lg font-bold shadow-xl shadow-blue-200 transition-all active:scale-95"
                            >
                                {loading ? "Finding..." : "Track Now"}
                            </Button>
                        </form>
                        {error && (
                            <div className="mt-6 flex items-center space-x-3 text-red-600 bg-red-50 p-5 rounded-2xl animate-in fade-in duration-300">
                                <AlertCircle size={20} />
                                <span className="font-semibold">{error}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Results */}
                {bookings && bookings.map((booking, bIdx) => {
                    const currentIndex = getStatusIndex(booking.status);
                    
                    return (
                        <Card key={booking._id} className={`mb-10 border-none shadow-2xl rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-blue-100 ${bIdx === 0 ? 'ring-2 ring-blue-500' : ''}`}>
                            <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-white flex justify-between items-center">
                                <div>
                                    <p className="text-blue-100 text-[10px] font-bold uppercase tracking-[0.2em] mb-2 opacity-80">Order Reference</p>
                                    <h3 className="text-2xl font-black tracking-tight">{booking.serviceType.toUpperCase()}</h3>
                                </div>
                                <div className="text-right">
                                    <p className="text-blue-100 text-[10px] font-bold uppercase tracking-[0.2em] mb-2 opacity-80">Booked Date</p>
                                    <h3 className="text-xl font-bold">{new Date(booking.createdAt).toLocaleDateString()}</h3>
                                </div>
                            </div>
                            
                            <CardContent className="p-8 md:p-10">
                                <div className="relative mb-16 mt-6">
                                    <div className="absolute top-1/2 left-0 w-full h-1.5 bg-slate-100 -translate-y-1/2 hidden md:block rounded-full"></div>
                                    <div 
                                        className="absolute top-1/2 left-0 h-1.5 bg-blue-500 -translate-y-1/2 transition-all duration-1000 ease-out hidden md:block rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                        style={{ width: `${(currentIndex / 5) * 100}%` }}
                                    ></div>

                                    <div className="flex flex-col md:flex-row justify-between relative z-10 gap-10 md:gap-0">
                                        {STATUS_STEPS.map((step, idx) => {
                                            const Icon = step.icon;
                                            const isCompleted = idx <= currentIndex;
                                            const isCurrent = idx === currentIndex;
                                            
                                            return (
                                                <div key={step.key} className="flex md:flex-col items-center group">
                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg ${
                                                        isCompleted ? 'bg-blue-600 text-white' : 'bg-white text-slate-300'
                                                    } ${isCurrent ? 'ring-8 ring-blue-50 scale-110 shadow-xl rotate-3' : ''}`}>
                                                        <Icon size={24} />
                                                    </div>
                                                    <div className="ml-5 md:ml-0 md:mt-5 text-left md:text-center">
                                                        <p className={`text-[10px] font-black uppercase tracking-widest ${isCompleted ? 'text-blue-900' : 'text-slate-400'}`}>
                                                            {step.label}
                                                        </p>
                                                        {isCurrent && <span className="inline-block px-3 py-1 mt-1.5 text-[9px] bg-blue-100 text-blue-700 rounded-lg font-black animate-pulse">ACTIVE NOW</span>}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-t border-slate-100">
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Amount Due</p>
                                        <p className="text-xl font-black text-slate-900">₹{booking.amount || 0}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Payment Status</p>
                                        <p className={`text-sm font-black flex items-center ${booking.paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>
                                            <span className={`w-2 h-2 rounded-full mr-2 ${booking.paymentStatus === 'paid' ? 'bg-green-600' : 'bg-orange-600 animate-ping'}`}></span>
                                            {booking.paymentStatus.toUpperCase()}
                                        </p>
                                    </div>
                                    <div className="col-span-2 flex justify-end">
                                        {booking.paymentStatus !== 'paid' && (
                                            <Button 
                                                onClick={() => {
                                                    setSelectedBooking(booking);
                                                    setShowPayment(true);
                                                }}
                                                className="bg-blue-600 hover:bg-blue-700 text-white font-black px-8 h-12 rounded-xl flex items-center space-x-2 shadow-lg shadow-blue-100 transition-all active:scale-95"
                                            >
                                                <CreditCard size={18} />
                                                <span>Pay via UPI Now</span>
                                            </Button>
                                        )}
                                        {booking.paymentStatus === 'paid' && (
                                            <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-4 py-2 rounded-xl border border-green-100">
                                                <ShieldCheck size={18} />
                                                <span className="text-sm font-black uppercase tracking-tight">Verified Payment</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {selectedBooking && (
                <PaymentModal 
                    isOpen={showPayment}
                    onClose={() => setShowPayment(false)}
                    amount={selectedBooking.amount}
                    bookingId={selectedBooking._id}
                    onPaymentSuccess={() => {
                        handleTrack({ preventDefault: () => {} }); // Refresh listing
                    }}
                />
            )}
        </div>
    );
};

export default TrackOrder;
