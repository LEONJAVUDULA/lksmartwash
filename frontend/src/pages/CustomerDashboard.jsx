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
    Smartphone,
    ArrowRight,
    Zap,
    MapPin,
    Trophy,
    Target,
    Share2,
    Copy,
    Check,
    Package,
    Sparkles
} from "lucide-react";
import { Button } from "../components/ui/Button.jsx";
import { Input } from "../components/ui/Input.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card.jsx";
import { Label } from "../components/ui/Label.jsx";
import API_URL from "../api";

export default function CustomerDashboard() {
    const [user, setUser] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [topupAmount, setTopupAmount] = useState("");
    const [isTopupLoading, setIsTopupLoading] = useState(false);
    const [leaderboard, setLeaderboard] = useState({ topReferrers: [], totalPlatformPoints: 0 });
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
            const [profileRes, statsRes, bookingsRes, leaderboardRes] = await Promise.all([
                fetch(`${API_URL}/api/user/profile`, {
                    headers: { Authorization: token },
                }),
                fetch(`${API_URL}/api/user/loyalty/stats`, {
                    headers: { Authorization: token },
                }),
                fetch(`${API_URL}/api/user/bookings`, {
                    headers: { Authorization: token },
                }),
                fetch(`${API_URL}/api/user/community/leaderboard`, {
                    headers: { Authorization: token },
                }),
            ]);

            if (profileRes.ok && statsRes.ok && bookingsRes.ok && leaderboardRes.ok) {
                const profileData = await profileRes.json();
                const statsData = await statsRes.json();
                const bookingsData = await bookingsRes.json();
                const leaderboardData = await leaderboardRes.json();
                
                setUser({ ...profileData, ...statsData });
                setBookings(bookingsData);
                setLeaderboard(leaderboardData);
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

    const handleRedeem = async (points) => {
        try {
            const res = await fetch(`${API_URL}/api/user/loyalty/redeem`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: token },
                body: JSON.stringify({ pointsToRedeem: points })
            });
            if (res.ok) {
                const data = await res.json();
                alert(data.message);
                fetchData();
            } else {
                const err = await res.json();
                alert(err.error);
            }
        } catch (err) { alert("Redemption failed"); }
    };

    const handleBuyTier = async (tier) => {
        try {
            const res = await fetch(`${API_URL}/api/user/loyalty/buy-tier`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: token },
                body: JSON.stringify({ tier })
            });
            if (res.ok) {
                const data = await res.json();
                alert(data.message);
                fetchData();
            } else {
                const err = await res.json();
                alert(err.error);
            }
        } catch (err) { alert("Upgrade failed"); }
    };

    const handleSubscribe = async (planId) => {
        try {
            const res = await fetch(`${API_URL}/api/user/subscribe`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: token },
                body: JSON.stringify({ planId })
            });
            if (res.ok) {
                const data = await res.json();
                alert(data.message);
                fetchData();
            } else {
                const err = await res.json();
                alert(err.error);
            }
        } catch (err) { alert("Subscription failed"); }
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
        const colors = {
            pending: "bg-amber-50 text-amber-600 border border-amber-100",
            received: "bg-blue-50 text-blue-600 border border-blue-100",
            processing: "bg-indigo-50 text-indigo-600 border border-indigo-100",
            ready_for_pickup: "bg-green-50 text-green-600 border border-green-100",
            delivered: "bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm",
            cancelled: "bg-red-50 text-red-600 border border-red-100"
        };
        return colors[status] || "bg-gray-50 text-gray-500";
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    <Card className="bg-white border-none shadow-md overflow-hidden animate-in slide-in-from-left duration-500">
                        <CardContent className="p-0">
                            <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                                <div className="flex items-center justify-between mb-4 relative z-10">
                                    <span className="text-sm font-medium opacity-80 uppercase tracking-widest">Smart Wallet</span>
                                    <Wallet className="h-6 w-6 opacity-80" />
                                </div>
                                <div className="text-4xl font-black mb-1 relative z-10">₹{user?.walletBalance.toLocaleString() || "0"}</div>
                                <p className="text-xs opacity-70 relative z-10">Digital Credit Balance</p>
                            </div>
                            <div className="p-4 flex flex-col space-y-3">
                                <Button onClick={() => navigate("/wallet")} variant="ghost" className="w-full h-10 text-blue-600 hover:bg-blue-50 border-none shadow-none text-[10px] font-black uppercase tracking-widest rounded-xl">
                                    Manage Funds <ArrowRight size={14} className="ml-2" />
                                </Button>
                                <div className="flex items-center space-x-2">
                                    <Input 
                                        type="number" 
                                        placeholder="Quick Top Up ₹" 
                                        value={topupAmount} 
                                        onChange={(e) => setTopupAmount(e.target.value)}
                                        className="h-10 text-xs font-bold border-slate-100 rounded-xl"
                                    />
                                    <Button onClick={handleTopup} disabled={isTopupLoading} className="h-10 bg-blue-600 text-[10px] font-bold px-4 shadow-md rounded-xl shrink-0">
                                        <PlusCircle size={14} className="mr-1" /> RECHARGE
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border-none shadow-md overflow-hidden animate-in zoom-in duration-500">
                        <CardContent className="p-0">
                            <div className="bg-gradient-to-r from-indigo-700 to-indigo-500 p-6 text-white">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm font-medium opacity-80 uppercase tracking-widest">Rewards Dashboard</span>
                                    <Trophy className="h-6 w-6 opacity-80" />
                                </div>
                                <div className="text-4xl font-black mb-1">{user?.loyaltyPoints || "0"} <span className="text-xs font-medium uppercase opacity-60">pts</span></div>
                                <p className="text-xs opacity-70">≈ ₹{Math.floor(user?.loyaltyPoints/10)} Wallet Credit</p>
                            </div>
                            <div className="p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="text-center flex-1 border-r border-slate-100">
                                        <div className="text-sm font-black text-slate-900">{user?.monthlyOrders || 0}</div>
                                        <div className="text-[8px] text-slate-400 font-bold uppercase">Monthly Orders</div>
                                    </div>
                                    <div className="text-center flex-1">
                                        <div className="text-sm font-black text-blue-600">
                                            {user?.monthlyOrders >= 20 ? '1.5x' : (user?.monthlyOrders >= 8 ? '1.2x' : '1.0x')}
                                        </div>
                                        <div className="text-[8px] text-slate-400 font-bold uppercase">Points Multiplier</div>
                                    </div>
                                </div>
                                
                                <Button 
                                    disabled={user?.loyaltyPoints < 100}
                                    onClick={() => handleRedeem(Math.floor(user.loyaltyPoints / 100) * 100)}
                                    className="w-full h-10 bg-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-100"
                                >
                                    Instant Redeem (₹{Math.floor(user?.loyaltyPoints/10)})
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border-none shadow-md overflow-hidden animate-in slide-in-from-right duration-500">
                        <CardContent className="p-0">
                            <div className="bg-slate-900 p-6 text-white text-center">
                                <div className={`text-2xl font-black uppercase italic tracking-tighter mb-1 ${
                                    user?.loyaltyTier === 'Diamond' ? 'text-cyan-400' :
                                    user?.loyaltyTier === 'Platinum' ? 'text-indigo-300' :
                                    user?.loyaltyTier === 'Gold' ? 'text-amber-400' : 'text-slate-400'
                                }`}>
                                    {user?.loyaltyTier || 'Silver'}
                                </div>
                                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mb-4 font-mono">Loyalty Status</div>
                                
                                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mb-2">
                                    <div 
                                        className="h-full bg-blue-500 transition-all duration-1000" 
                                        style={{ width: `${Math.min(100, (user?.totalSpent / user?.nextTierSpend) * 100)}%` }}
                                    ></div>
                                </div>
                                <div className="flex items-center justify-between text-[9px] font-black uppercase text-white/60">
                                    <span>₹{user?.totalSpent}</span>
                                    <span>Goal: ₹{user?.nextTierSpend}</span>
                                </div>
                            </div>
                            <div className="p-4 grid grid-cols-2 gap-2">
                                {["Gold", "Platinum", "Diamond"].map(t => (
                                    <button
                                        key={t}
                                        disabled={user?.loyaltyTier === t || (t === "Gold" && (user?.loyaltyTier === "Platinum" || user?.loyaltyTier === "Diamond")) || (t === "Platinum" && user?.loyaltyTier === "Diamond")}
                                        onClick={() => handleBuyTier(t)}
                                        className="p-2 border border-slate-100 rounded-lg text-[9px] font-black uppercase transition-all hover:bg-slate-50 disabled:opacity-20 disabled:grayscale"
                                    >
                                        Buy {t}
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
                
                {/* Referral Card */}
                <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-none shadow-2xl overflow-hidden mb-8 rounded-3xl relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <CardContent className="p-8 relative z-10">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="text-center md:text-left">
                                <h3 className="text-2xl font-black text-white mb-2 flex items-center justify-center md:justify-start uppercase tracking-tighter">
                                    <Sparkles className="text-amber-400 mr-3 animate-pulse" /> Grow the Community
                                </h3>
                                <p className="text-slate-400 text-sm max-w-sm">
                                    Invite a friend to register and earn <span className="text-white font-bold">500 Reward Points</span> (₹50) each. Your friend gets <span className="text-white font-bold">200 Points</span> (₹20) instantly!
                                </p>
                            </div>
                            
                            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-sm w-full md:w-auto text-center">
                                <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2">Your Unique Invite Code</div>
                                <div className="text-3xl font-black text-white tracking-widest mb-6 font-mono select-all">
                                    {user?.referralCode || "GETTING CODE..."}
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Button 
                                        onClick={() => {
                                            navigator.clipboard.writeText(user?.referralCode);
                                            alert("Referral code copied!");
                                        }}
                                        variant="outline" 
                                        className="bg-white/10 border-none text-white hover:bg-white/20 h-10 px-6 rounded-xl font-bold flex-1"
                                    >
                                        <Copy size={16} className="mr-2" /> COPY
                                    </Button>
                                    <Button 
                                        onClick={() => {
                                            const msg = encodeURIComponent(`Hey! Join me on LK Smart Wash and get ₹20 welcome credit using my referral code: ${user?.referralCode} 🌪️`);
                                            window.open(`https://wa.me/?text=${msg}`, "_blank");
                                        }}
                                        className="bg-green-600 hover:bg-green-700 text-white h-10 px-6 rounded-xl font-bold shadow-lg shadow-green-900/20 flex-1"
                                    >
                                        <Share2 size={16} className="mr-2" /> SHARE
                                    </Button>
                                </div>
                                <div className="mt-4 text-[10px] text-slate-500 font-bold uppercase italic">
                                    {(10 - (user?.referralCount || 0))} Invites remaining this month
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Subscription Hub */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
                    <div className="lg:col-span-12">
                        <Card className="border-none shadow-xl rounded-3xl bg-white overflow-hidden">
                            <div className="p-8 bg-blue-600 text-white flex flex-col md:flex-row items-center justify-between gap-6">
                                <div>
                                    <h3 className="text-2xl font-black uppercase tracking-tighter mb-1">Monthly Wash Packages 📦</h3>
                                    <p className="text-blue-100 text-sm opacity-80">Pre-pay for weights and save up to 20% on every wash.</p>
                                </div>
                                <div className="flex items-center space-x-2 bg-blue-700/50 p-2 rounded-2xl border border-blue-400/30">
                                    <div className="bg-white/20 p-2 rounded-xl">
                                        <Package className="text-white" size={24} />
                                    </div>
                                    <div>
                                        <div className="text-[10px] uppercase font-black opacity-60">Status</div>
                                        <div className="text-sm font-black">{user?.subscription?.planName || 'No Active Plan'}</div>
                                    </div>
                                </div>
                            </div>
                            <CardContent className="p-8">
                                {user?.subscription?.planName ? (
                                    <div className="mb-10">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-sm font-black text-slate-900 uppercase">Weight Credit Balance</span>
                                            <span className="text-sm font-black text-blue-600">{user?.subscription?.remainingWeight?.toFixed(1)} kg / {user?.subscription?.planName === 'Elite Pack' ? '60' : (user?.subscription?.planName === 'Pro Pack' ? '30' : '15')} kg</span>
                                        </div>
                                        <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden mb-2 shadow-inner">
                                            <div 
                                                className="h-full bg-blue-500 transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                                style={{ width: `${((user?.subscription?.remainingWeight || 0) / (user?.subscription?.planName === 'Elite Pack' ? 60 : (user?.subscription?.planName === 'Pro Pack' ? 30 : 15))) * 100}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase italic">Plan valid until: {new Date(user?.subscription?.expiryDate).toLocaleDateString()}</p>
                                    </div>
                                ) : null}

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {[
                                        { id: "starter", name: "Starter", price: 1500, weight: 12, color: "slate" },
                                        { id: "pro", name: "Family Pro", price: 3500, weight: 30, color: "blue" },
                                        { id: "elite", name: "Corporate Elite", price: 6000, weight: 60, color: "indigo" }
                                    ].map(plan => (
                                        <div key={plan.id} className="p-6 rounded-3xl border-2 border-slate-50 hover:border-blue-200 transition-all group">
                                            <div className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">{plan.name}</div>
                                            <div className="text-4xl font-black text-slate-900 mb-1">₹{plan.price}</div>
                                            <div className="text-[10px] font-bold text-blue-600 mb-6 bg-blue-50 inline-block px-2 py-1 rounded-lg italic">Includes {plan.weight}kg Weight Credit</div>
                                            <Button 
                                                onClick={() => handleSubscribe(plan.id)}
                                                className="w-full bg-white border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white h-10 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                                            >
                                                Subscribe
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                 {/* Community Leaderboard */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
                    <div className="lg:col-span-12">
                        <Card className="border-none shadow-xl rounded-3xl bg-white overflow-hidden border-2 border-indigo-50">
                            <div className="p-8 bg-indigo-900 text-white flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-black uppercase tracking-tighter mb-1">Top Wash Ambassadors 🏆</h3>
                                    <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest">Our most impactful community leaders</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-black text-amber-400">{leaderboard.totalPlatformPoints.toLocaleString()} ★</div>
                                    <div className="text-[9px] font-bold uppercase text-indigo-300">Total Community Points</div>
                                </div>
                            </div>
                            <CardContent className="p-0">
                                <div className="divide-y divide-slate-100">
                                    {leaderboard.topReferrers.map((ref, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-6 hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center space-x-4">
                                                <div className={`h-10 w-10 flex items-center justify-center rounded-2xl font-black ${
                                                    idx === 0 ? 'bg-amber-100 text-amber-600 border-2 border-amber-200' :
                                                    idx === 1 ? 'bg-slate-100 text-slate-600 border-2 border-slate-200' :
                                                    idx === 2 ? 'bg-orange-100 text-orange-600 border-2 border-orange-200' : 'bg-indigo-50 text-indigo-400'
                                                }`}>
                                                    {idx + 1}
                                                </div>
                                                <div>
                                                    <div className="font-black text-slate-900 text-sm flex items-center gap-2">
                                                        {ref.name} {idx === 0 && <Trophy size={14} className="text-amber-500 fill-amber-500" />}
                                                    </div>
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{ref.loyaltyTier} Tier</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-black text-slate-900">{ref.referralCount}</div>
                                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Referrals</div>
                                            </div>
                                        </div>
                                    ))}
                                    {leaderboard.topReferrers.length === 0 && (
                                        <div className="p-10 text-center text-slate-400 font-bold uppercase text-[10px]">Leaderboard resets every month. Start inviting!</div>
                                    )}
                                </div>
                                <div className="p-6 bg-slate-50 border-t border-slate-100">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase leading-relaxed italic text-center">
                                        🎁 REACH 5 REFERRALS FOR A ₹500 BONUS. REACH 10 FOR ₹1000!
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
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
