import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
    Search, 
    CheckCircle, 
    LogOut, 
    Package, 
    RefreshCw, 
    User, 
    Clock, 
    Navigation,
    Loader2,
    ShieldCheck
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import API_URL from "../api";

export default function StaffTerminal() {
    const [bookings, setBookings] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(null);
    const navigate = useNavigate();
    const token = localStorage.getItem("staffToken");
    const staffName = localStorage.getItem("staffName");

    useEffect(() => {
        if (!token) {
            navigate("/staff-login");
            return;
        }
        loadBookings();
    }, [token]);

    const loadBookings = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/staff/bookings`, {
                headers: { "Authorization": token }
            });
            if (res.ok) {
                const data = await res.json();
                setBookings(data);
            } else {
                localStorage.removeItem("staffToken");
                navigate("/staff-login");
            }
        } catch (err) {
            console.error("Load failure", err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        setUpdating(id);
        try {
            const res = await fetch(`${API_URL}/api/staff/bookings/${id}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token
                },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                loadBookings();
            }
        } catch (err) {
            alert("Error: Status could not be updated.");
        } finally {
            setUpdating(null);
        }
    };

    const logout = () => {
        localStorage.removeItem("staffToken");
        navigate("/staff-login");
    };

    const filtered = useMemo(() => {
        return bookings.filter(b => 
            b.name.toLowerCase().includes(search.toLowerCase()) || 
            b.phone.includes(search)
        );
    }, [bookings, search]);

    if (loading && bookings.length === 0) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <Loader2 className="animate-spin h-10 w-10 text-slate-900" />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 pb-12 font-sans selection:bg-slate-900 selection:text-white">
            {/* Staff Header */}
            <header className="bg-slate-900 text-white px-8 py-10 shadow-2xl sticky top-0 z-50 overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                    <ShieldCheck size={120} />
                </div>
                
                <div className="max-w-6xl mx-auto flex items-center justify-between relative z-10">
                    <div>
                        <div className="flex items-center space-x-2 text-slate-400 font-black uppercase text-[10px] tracking-widest mb-2">
                             <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></div>
                             <span>Secure Terminal | {staffName}</span>
                        </div>
                        <h1 className="text-3xl font-black uppercase tracking-tight leading-none italic">LK SMART WASH</h1>
                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Operational Support Desk</p>
                    </div>
                    <button onClick={logout} className="p-4 bg-white/10 text-white rounded-2xl hover:bg-red-600 transition-all border border-white/10 group">
                        <LogOut size={20} className="group-hover:scale-110 transition" />
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-8 -mt-8">
                {/* Search Bar */}
                <Card className="border-none shadow-xl rounded-3xl overflow-hidden mb-12">
                    <CardContent className="p-0">
                        <div className="relative">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-300" />
                            <Input 
                                placeholder="Search by Customer Name or Phone Number..." 
                                className="h-20 pl-16 border-none text-lg font-bold placeholder:text-slate-200 focus:ring-0"
                                value={search}
                                onChange={(e)=>setSearch(e.target.value)}
                            />
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                                <span className="bg-slate-100 px-4 py-2 rounded-xl text-[10px] font-black uppercase text-slate-400">
                                    {filtered.length} Orders
                                </span>
                                <Button onClick={loadBookings} variant="ghost" size="sm" className="text-slate-400 hover:text-slate-900">
                                    <RefreshCw size={16} />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((booking) => (
                        <Card key={booking._id} className="border-none shadow-md rounded-3xl overflow-hidden animate-in slide-in-from-bottom duration-500">
                            <div className="bg-slate-900 px-6 py-2 flex items-center justify-between text-white">
                                <span className="text-[10px] font-black uppercase tracking-widest flex items-center">
                                    <Clock size={10} className="mr-1" /> {new Date(booking.createdAt).toLocaleDateString()}
                                </span>
                                <span className="text-[10px] font-black uppercase bg-white/20 px-2 py-0.5 rounded tracking-tighter">
                                    {booking.serviceType}
                                </span>
                            </div>
                            
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-slate-900 group">{booking.name}</h3>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{booking.phone}</p>
                                </div>
                                
                                <div className="flex items-start space-x-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <Navigation size={18} className="text-slate-400 mt-0.5" />
                                    <p className="text-[11px] text-slate-600 font-medium leading-relaxed italic">{booking.address}</p>
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest pl-1">Live Operation Status</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { label: "Picked Up", status: "received", color: "blue" },
                                            { label: "Cleaning", status: "processing", color: "indigo" },
                                            { label: "Ready", status: "ready_for_pickup", color: "orange" },
                                            { label: "Done", status: "completed", color: "green" }
                                        ].map((cfg) => (
                                            <button
                                                key={cfg.status}
                                                disabled={updating === booking._id}
                                                onClick={() => updateStatus(booking._id, cfg.status)}
                                                className={`py-3 px-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center space-x-1 ${
                                                    booking.status === cfg.status 
                                                    ? "bg-slate-900 text-white shadow-lg" 
                                                    : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                                                }`}
                                            >
                                                {booking.status === cfg.status && <CheckCircle size={10} className="mr-1" />}
                                                <span>{cfg.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                
                {filtered.length === 0 && (
                    <div className="text-center py-40">
                         <Package size={48} className="mx-auto text-slate-200 mb-4" />
                         <h3 className="text-2xl font-black text-slate-300 uppercase tracking-tight">No Matches Found</h3>
                         <p className="text-slate-200 font-bold text-sm mt-1">Try searching by phone number instead</p>
                    </div>
                )}
            </main>
        </div>
    );
}
