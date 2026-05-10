import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Truck, Lock, User, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { Label } from "../components/ui/label";
import API_URL from "../api";

export default function DriverLogin() {
    const [driverId, setDriverId] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch(`${API_URL}/api/driver/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ driverId, password }),
            });

            const data = await res.json();
            if (res.ok) {
                localStorage.setItem("driverToken", data.token);
                localStorage.setItem("driverName", data.name);
                navigate("/driver");
            } else {
                setError(data.error || "Login failed");
            }
        } catch (err) {
            setError("Server connection issue.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-blue-600 p-4">
            <Card className="max-w-md w-full p-8 shadow-2xl border-none bg-white">
                <div className="text-center mb-8">
                    <div className="bg-blue-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Truck className="h-8 w-8 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Staff Portal</h2>
                    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">Pickups & Deliveries</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-xs font-bold uppercase">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="id" className="text-[10px] font-black uppercase text-gray-400">Driver ID</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                                <Input
                                    id="id"
                                    type="text"
                                    placeholder="driver1"
                                    className="pl-10 h-12 bg-gray-50 border-none shadow-sm focus:ring-2 focus:ring-blue-600"
                                    value={driverId}
                                    onChange={(e) => setDriverId(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="pass" className="text-[10px] font-black uppercase text-gray-400">Security PIN</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                                <Input
                                    id="pass"
                                    type="password"
                                    placeholder="••••"
                                    className="pl-10 h-12 bg-gray-50 border-none shadow-sm focus:ring-2 focus:ring-blue-600"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <Button 
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white h-14 text-lg font-black uppercase shadow-lg shadow-blue-200 transition-all hover:scale-[1.02] active:scale-95"
                    >
                        {loading ? "Verifying..." : "Enter Portal"}
                        {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
                    </Button>
                </form>
            </Card>
        </div>
    );
}
