import React, { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Wallet, Info, ArrowUpCircle, Gift, Star, History } from "lucide-react";

const WalletPage = () => {
    const [token] = useState(localStorage.getItem("userToken"));
    const [wallet, setWallet] = useState(null);
    const [topupAmount, setTopupAmount] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) fetchWallet();
    }, [token]);

    const fetchWallet = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/user/wallet`, {
                headers: { Authorization: token }
            });
            setWallet(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleTopup = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/api/user/wallet/topup`, 
                { amount: Number(topupAmount) },
                { headers: { Authorization: token } }
            );
            alert("Top-up Successful!");
            setTopupAmount("");
            fetchWallet();
        } catch (err) {
            alert("Top-up Failed");
        }
    };

    const handleRedeem = async (points) => {
        if (points < 10) return alert("Minimum 10 points required");
        try {
            await axios.post(`${API_URL}/api/user/wallet/redeem`, 
                { points },
                { headers: { Authorization: token } }
            );
            alert("Points Redeemed! (100★ = ₹10)");
            fetchWallet();
        } catch (err) {
            alert("Redemption Failed");
        }
    };

    const handleBuyTier = async (tier) => {
        try {
            await axios.post(`${API_URL}/api/user/wallet/buy-tier`, 
                { tier },
                { headers: { Authorization: token } }
            );
            alert(`Succesfully upgraded to ${tier} Status! 🎊`);
            fetchWallet();
        } catch (err) {
            alert("Upgrade Failed: Check your point balance.");
        }
    };

    if (!token) return <div className="p-20 text-center font-bold">Please login to view your wallet.</div>;
    if (loading) return <div className="p-20 text-center">Loading Wealth...</div>;

    const tiers = [
        { name: "Silver", discount: "5%", cost: 0, color: "bg-slate-300" },
        { name: "Gold", discount: "10%", cost: 5000, color: "bg-amber-400" },
        { name: "Platinum", discount: "15%", cost: 10000, color: "bg-indigo-500" },
        { name: "Diamond", discount: "20%", cost: 20000, color: "bg-cyan-500" }
    ];

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Reward Vault</h1>
                        <p className="text-slate-500 font-medium">Earn 10% on every wash. 100 Points = ₹10 cash.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Wallet Balance Card */}
                    <Card className="md:col-span-2 bg-slate-900 border-none shadow-2xl overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
                        <CardContent className="p-10 relative">
                            <div className="flex justify-between items-start mb-8 text-white/40 uppercase text-[10px] font-bold tracking-[0.2em]">
                                <span>Digital Credit balance</span>
                                <Wallet size={20} />
                            </div>
                            <div className="text-6xl font-black text-white mb-2 tracking-tighter">
                                <span className="text-3xl mr-1 opacity-60 font-medium">₹</span>
                                {wallet.walletBalance.toLocaleString()}
                            </div>
                            <div className="flex items-center space-x-2 text-blue-400/70 text-xs font-bold uppercase tracking-tighter">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                <span>Blockchain Verified Wallet</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Loyalty Status Card */}
                    <Card className="bg-white border-none shadow-xl rounded-2xl overflow-hidden group">
                        <div className={`p-1 h-2 w-full ${
                            wallet.loyaltyTier === 'Diamond' ? 'bg-cyan-500' : 
                            wallet.loyaltyTier === 'Platinum' ? 'bg-indigo-500' : 
                            wallet.loyaltyTier === 'Gold' ? 'bg-amber-400' : 'bg-slate-300'
                        }`}></div>
                        <CardContent className="p-8">
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg ${
                                    wallet.loyaltyTier === 'Diamond' ? 'bg-cyan-50 text-cyan-600 shadow-cyan-100' : 
                                    wallet.loyaltyTier === 'Platinum' ? 'bg-indigo-50 text-indigo-600 shadow-indigo-100' : 
                                    wallet.loyaltyTier === 'Gold' ? 'bg-amber-50 text-amber-600 shadow-amber-100' : 'bg-slate-50 text-slate-400 shadow-slate-100'
                                }`}>
                                    <Star size={32} fill="currentColor" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900">{wallet.loyaltyTier} Tier</h3>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                                        {wallet.loyaltyTier === 'Diamond' ? '20%' : 
                                         wallet.loyaltyTier === 'Platinum' ? '15%' : 
                                         wallet.loyaltyTier === 'Gold' ? '10%' : '5%'} Flat Discount
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tier Marketplace */}
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest flex items-center">
                    <Star size={18} className="mr-2 text-amber-500" /> Status Marketplace
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {tiers.map(t => (
                        <Card key={t.name} className={`border-none shadow-md ${wallet.loyaltyTier === t.name ? 'ring-2 ring-blue-600' : ''}`}>
                            <CardContent className="p-6 text-center">
                                <div className={`w-8 h-8 rounded-lg ${t.color} mx-auto mb-3 flex items-center justify-center text-white font-bold text-xs`}>
                                    {t.name[0]}
                                </div>
                                <h4 className="font-bold text-slate-900">{t.name}</h4>
                                <p className="text-xs text-slate-500 font-medium mb-4">{t.discount} Reward Discount</p>
                                {wallet.loyaltyTier === t.name ? (
                                    <div className="text-[10px] font-black text-blue-600 uppercase">Current Status</div>
                                ) : (
                                    <Button 
                                        disabled={wallet.loyaltyPoints < t.cost || t.cost === 0}
                                        onClick={() => handleBuyTier(t.name)}
                                        className="w-full text-[10px] h-8 font-black uppercase"
                                        variant={wallet.loyaltyPoints >= t.cost ? "default" : "outline"}
                                    >
                                        {t.cost > 0 ? `Buy for ${t.cost} ★` : 'Locked'}
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Points Summary */}
                    <Card className="bg-white border-none shadow-xl rounded-3xl">
                        <CardHeader>
                            <CardTitle className="flex items-center text-slate-900">
                                <Gift size={20} className="mr-2 text-amber-500" /> Reward Points
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-0">
                            <div className="p-8 bg-amber-50/50 rounded-3xl border border-amber-100 text-center space-y-4">
                                <p className="text-xs font-black text-amber-800/60 uppercase tracking-[0.2em]">Total points accrued</p>
                                <div className="text-7xl font-black text-slate-900">
                                    {wallet.loyaltyPoints}
                                </div>
                                <div className="flex items-center justify-center space-x-2 text-xs font-bold text-amber-700 bg-white shadow-sm inline-flex px-4 py-2 rounded-full mx-auto">
                                    <Info size={14} />
                                    <span>EXCHANGE RATE: 100★ = ₹10</span>
                                </div>
                            </div>
                            
                            <Button 
                                onClick={() => handleRedeem(wallet.loyaltyPoints)}
                                disabled={wallet.loyaltyPoints < 10}
                                className={`w-full h-14 mt-6 rounded-2xl font-black uppercase tracking-widest text-sm transition-all ${
                                    wallet.loyaltyPoints >= 10 
                                    ? 'bg-slate-900 hover:bg-black shadow-xl shadow-slate-200 text-white' 
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                }`}
                            >
                                {wallet.loyaltyPoints >= 10 ? `Redeem ₹${Math.floor(wallet.loyaltyPoints / 10)} Cash-back` : 'Need min. 10 Points'}
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border-none shadow-xl rounded-3xl p-10 flex flex-col justify-center items-center text-center space-y-6">
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 shadow-inner">
                            <Star size={40} fill="currentColor" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900">Tier Intelligence</h2>
                            <p className="text-slate-500 text-sm font-medium mt-2 max-w-xs">
                                High tier status automatically applies a **{wallet.loyaltyTier === 'Diamond' ? '20%' : wallet.loyaltyTier === 'Platinum' ? '15%' : wallet.loyaltyTier === 'Gold' ? '10%' : '5%'}** discount to all bookings. Progress naturally by spending or buy status instantly with stars.
                            </p>
                        </div>
                        <div className="pt-4 grid grid-cols-2 gap-4 w-full">
                            <div className="bg-slate-50 p-4 rounded-2xl text-left">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Spend</p>
                                <p className="text-xl font-black text-slate-900">₹{wallet.totalSpent || 0}</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl text-left">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Savings Goal</p>
                                <p className="text-xl font-black text-slate-900">₹{Math.floor(wallet.totalSpent * 0.1 || 0)}</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default WalletPage;
