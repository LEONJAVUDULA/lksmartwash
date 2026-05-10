import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, User, ArrowRight, ShieldCheck, Truck, UserCircle2 } from "lucide-react";
import { Button } from "../components/ui/Button.jsx";
import { Input } from "../components/ui/Input.jsx";
import { Card, CardContent } from "../components/ui/Card.jsx";
import { Label } from "../components/ui/Label.jsx";
import API_URL from "../api";

export default function Login() {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch(`${API_URL}/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    identifier,
                    password,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                // Store based on role for backward compatibility with existing portals
                if (data.role === "admin") {
                    localStorage.setItem("token", data.token);
                    navigate("/admin");
                } else if (data.role === "staff") {
                    localStorage.setItem("staffToken", data.token);
                    localStorage.setItem("staffName", data.name);
                    navigate("/staff-terminal");
                } else if (data.role === "driver") {
                    localStorage.setItem("driverToken", data.token);
                    localStorage.setItem("driverName", data.name);
                    navigate("/driver");
                } else if (data.role === "customer") {
                    localStorage.setItem("userToken", data.token);
                    localStorage.setItem("user", JSON.stringify(data.user));
                    localStorage.setItem("userId", data.user.id);
                    navigate("/dashboard");
                }
            } else {
                setError(data.error || "Invalid credentials. Please try again.");
            }
        } catch (err) {
            setError("Server connection failed. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[85vh] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <Card className="max-w-md w-full border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white animate-in fade-in zoom-in duration-500">
                <div className="bg-slate-900 text-white p-10 text-center relative overflow-hidden">
                    {/* Decorative Background Icon */}
                    <div className="absolute -right-10 -top-10 opacity-10 pointer-events-none">
                         <ShieldCheck size={200} />
                    </div>
                    
                    <div className="relative z-10">
                        <div className="inline-flex items-center justify-center p-4 bg-white/10 rounded-3xl mb-6 backdrop-blur-sm border border-white/20 shadow-xl">
                            <img src="/logo.png" alt="LK" className="h-12 w-auto" />
                        </div>
                        <h2 className="text-4xl font-black uppercase tracking-tighter italic">Welcome Back</h2>
                        <p className="mt-2 text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                            LK Smart Wash | Unified Access Portal
                        </p>
                    </div>
                </div>

                <CardContent className="p-10 pb-12">
                    <form className="space-y-8" onSubmit={handleLogin}>
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl text-sm font-bold flex items-center animate-in slide-in-from-top duration-300">
                                <span className="mr-2">⚠️</span> {error}
                            </div>
                        )}

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="identifier" className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">User ID / Phone Number</Label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-300 group-focus-within:text-slate-900 transition-colors">
                                        <UserCircle2 className="h-5 w-5" />
                                    </div>
                                    <Input
                                        id="identifier"
                                        type="text"
                                        required
                                        className="h-16 pl-14 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all font-bold text-slate-900"
                                        placeholder="Enter your unique ID"
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Account Password</Label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-300 group-focus-within:text-slate-900 transition-colors">
                                        <Lock className="h-5 w-5" />
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        required
                                        className="h-16 pl-14 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all font-bold text-slate-900"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button
                                type="submit"
                                size="lg"
                                className="w-full h-16 bg-slate-900 hover:bg-black text-white rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl shadow-slate-200 hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-[0.98] group"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="flex items-center">
                                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                        Authenticating...
                                    </span>
                                ) : (
                                    <span className="flex items-center">
                                        Secure Sign In
                                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                )}
                            </Button>
                        </div>
                        <div className="pt-4 text-center">
                            <p className="text-slate-500 text-sm font-bold">
                                Don't have an account?{' '}
                                <a 
                                    href="/register" 
                                    className="text-slate-900 border-b-2 border-slate-900 hover:text-blue-600 hover:border-blue-600 transition-colors"
                                >
                                    Register here for 10% Cash-Back
                                </a>
                            </p>
                        </div>
                    </form>
                    
                    <div className="mt-10 grid grid-cols-3 gap-4">
                        <div className="flex flex-col items-center opacity-30">
                            <ShieldCheck size={20} className="mb-1" />
                            <span className="text-[8px] font-black uppercase tracking-tighter">Admin</span>
                        </div>
                        <div className="flex flex-col items-center opacity-30">
                            <Truck size={20} className="mb-1" />
                            <span className="text-[8px] font-black uppercase tracking-tighter">Driver</span>
                        </div>
                        <div className="flex flex-col items-center opacity-30">
                            <UserCircle2 size={20} className="mb-1" />
                            <span className="text-[8px] font-black uppercase tracking-tighter">Staff</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
