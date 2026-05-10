import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Lock, ArrowRight, Smartphone } from "lucide-react";
import { Button } from "../components/ui/Button.jsx";
import { Input } from "../components/ui/Input.jsx";
import { Card, CardContent } from "../components/ui/Card.jsx";
import { Label } from "../components/ui/Label.jsx";
import API_URL from "../api";

export default function CustomerLogin() {
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch(`${API_URL}/api/user/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone, password }),
            });

            const data = await res.json();
            if (res.ok) {
                localStorage.setItem("userToken", data.token);
                localStorage.setItem("userData", JSON.stringify(data.user));
                navigate("/dashboard");
            } else {
                setError(data.error || "Login failed");
            }
        } catch (err) {
            setError("Server error. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-700">
            <Card className="max-w-md w-full p-8 shadow-xl border-none">
                <div className="text-center">
                    <img src="/logo.png" alt="LK Smart Wash" className="h-20 w-auto mx-auto mb-6 rounded-2xl shadow-lg" />
                    <h2 className="text-3xl font-extrabold text-gray-900">Welcome Back</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Sign in to access your wallet and wash history
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="phone">Phone Number</Label>
                            <div className="relative mt-1">
                                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input
                                    id="phone"
                                    type="tel"
                                    required
                                    className="pl-10 h-12"
                                    placeholder="09030347111"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="password">Password</Label>
                            <div className="relative mt-1">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    className="pl-10 h-12"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg shadow-lg"
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : "Sign In"}
                        {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
                    </Button>

                    <div className="text-center text-sm">
                        <span className="text-gray-500">Don't have an account?</span>{" "}
                        <Link to="/register" className="font-bold text-blue-600 hover:underline">
                            Register Now
                        </Link>
                    </div>
                </form>
            </Card>
        </div>
    );
}
