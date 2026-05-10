import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
    Wallet, 
    Gem, 
    History, 
    PlusCircle, 
    LogOut, 
    TrendingUp, 
    Clock, 
    CheckCircle2, 
    Truck,
    Smartphone
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import API_URL from "../api";

export default function CustomerDashboard() {
    const [user, setUser] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [topupAmount, setTopupAmount] = useState("");
    const [isTopupLoading, setIsTopupLoading] = useState(false);
    const navigate = useNavigate();
    const token = localStorage.getItem("userToken");

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }
        fetchData();
    }, [token]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [profileRes, bookingsRes] = await Promise.all([
                fetch(`${API_URL}/api/user/profile`, {
                    headers: { Authorization: token },
                }),
                fetch(`${API_URL}/api/user/bookings`, {
                    headers: { Authorization: token },
                }),
            ]);

            if (profileRes.ok && bookingsRes.ok) {
                const profileData = await profileRes.json();
                const bookingsData = await bookingsRes.json();
                setUser(profileData);
                setBookings(bookingsData);
            } else {
                localStorage.removeItem("userToken");
                navigate("/login");
            }
        } catch (err) {
            console.error("Dashboard error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleTopup = async () => {
        if (!topupAmount || isNaN(topupAmount)) return;
        setIsTopupLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/user/wallet/topup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                },
                body: JSON.stringify({ amount: Number(topupAmount) }),
            });

            if (res.ok) {
                await fetchData();
                setTopupAmount("");
                alert("Wallet Top-up Successful!");
            }
        } catch (err) {
            console.error("Topup error:", err);
        } finally {
            setIsTopupLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem("userToken");
        localStorage.removeItem("userData");
        navigate("/login");
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "completed": return "text-green-600 bg-green-50";
            case "delivered": return "text-blue-600 bg-blue-50";
            case "ready_for_pickup": return "text-indigo-600 bg-indigo-50";
            case "processing":
            case "cleaning": return "text-purple-600 bg-purple-50";
            default: return "text-amber-600 bg-amber-50";
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-20 animate-in fade-in duration-700">
            {/* Dashboard Header */}
            <header className="bg-white border-b px-4 py-6 sticky top-0 z-40 shadow-sm">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold border-2 border-blue-200 shadow-sm">
                            {user?.name?.[0].toUpperCase() || "C"}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 leading-none">Hi, {user?.name.split(' ')[0]}</h2>
                            <p className="text-xs text-gray-500 mt-1 flex items-center">
                                <Smartphone className="h-3 w-3 mr-1" /> {user?.phone}
                            </p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={logout} className="text-red-500 hover:text-red-700 border-red-100 hover:bg-red-50 border-none shadow-none font-bold">
                        <LogOut size={16} className="mr-2" /> Logout
                    </Button>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-5xl">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <Card className="bg-white border-none shadow-md overflow-hidden animate-in slide-in-from-left duration-500">
                        <CardContent className="p-0">
                            <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm font-medium opacity-80 uppercase tracking-widest">Smart Wallet</span>
                                    <Wallet className="h-6 w-6 opacity-80" />
                                </div>
                                <div className="text-4xl font-black mb-1">₹{user?.walletBalance.toLocaleString() || "0"}</div>
                                <p className="text-xs opacity-70">Available Balance</p>
                            </div>
                            <div className="p-4 flex items-center space-x-3">
                                <Input 
                                    type="number" 
                                    placeholder="Amount" 
                                    className="h-10 text-sm border-gray-100"
                                    value={topupAmount}
                                    onChange={(e) => setTopupAmount(e.target.value)}
                                />
                                <Button onClick={handleTopup} disabled={isTopupLoading} className="h-10 bg-blue-600 text-xs font-bold px-6 shadow-md">
                                    <PlusCircle size={14} className="mr-2" /> Top Up
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border-none shadow-md overflow-hidden animate-in slide-in-from-right duration-500">
                        <CardContent className="p-0">
                            <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 p-6 text-white text-right">
                                <div className="flex items-center justify-between mb-4 flex-row-reverse">
                                    <span className="text-sm font-medium opacity-80 uppercase tracking-widest">Loyalty Points</span>
                                    <Gem className="h-6 w-6 opacity-80" />
                                </div>
                                <div className="text-4xl font-black mb-1">{user?.loyaltyPoints || "0"}</div>
                                <p className="text-xs opacity-70">Ready to Redeem</p>
                            </div>
                            <div className="p-4 bg-gray-50 flex items-center justify-between">
                                <span className="text-xs text-gray-500 font-medium flex items-center">
                                    <TrendingUp size={14} className="mr-1 text-green-500" /> Earning 10% cash-back
                                </span>
                                <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-bold uppercase">Gold Member</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* History Section */}
                <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center uppercase tracking-widest">
                    <History size={18} className="mr-2 text-blue-600" /> Wash History
                </h3>

                <div className="space-y-4">
                    {bookings.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                            <div className="bg-gray-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Clock size={24} className="text-gray-300" />
                            </div>
                            <p className="text-gray-400 font-medium">No wash history yet</p>
                            <Button onClick={() => navigate("/contact")} variant="link" className="text-blue-600 font-bold mt-2">Book Your First Wash</Button>
                        </div>
                    ) : (
                        bookings.map((booking, idx) => (
                            <Card key={booking._id} className="border-none shadow-sm hover:shadow-md transition cursor-pointer overflow-hidden animate-in slide-in-from-bottom duration-500" style={{ animationDelay: `${idx * 50}ms` }}>
                                <CardContent className="p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-3">
                                            <div className="bg-gray-100 p-2 rounded-xl">
                                                <Truck size={20} className="text-gray-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 leading-tight">{booking.serviceType}</h4>
                                                <p className="text-[10px] text-gray-400 uppercase font-black">Order #{booking._id.slice(-6)}</p>
                                            </div>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm ${getStatusColor(booking.status)}`}>
                                            {booking.status.replace(/_/g, ' ')}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                                        <div className="text-xs text-gray-500">
                                            {new Date(booking.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </div>
                                        <div className="text-lg font-black text-gray-900">₹{booking.amount || 0}</div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}
