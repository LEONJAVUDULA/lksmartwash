import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Lock, ArrowRight, Smartphone, Sparkles } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { Label } from "../components/ui/label";
import API_URL from "../api";

export default function CustomerRegister() {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch(`${API_URL}/api/user/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, phone, password }),
            });

            const data = await res.json();
            if (res.ok) {
                localStorage.setItem("userToken", data.token);
                localStorage.setItem("userData", JSON.stringify(data.user));
                navigate("/dashboard");
            } else {
                setError(data.error || "Registration failed");
            }
        } catch (err) {
            setError("Server error. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 mt-10 animate-in fade-in duration-700">
            <Card className="max-w-md w-full p-8 shadow-xl border-none">
                <div className="text-center">
                    <div className="bg-blue-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Sparkles className="h-8 w-8 text-blue-600" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900">Join the Program</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Earn 10% Cash-Back on every wash when you register
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleRegister}>
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="name">Full Name</Label>
                            <div className="relative mt-1">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    className="pl-10 h-12"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        </div>

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
                            <Label htmlFor="password">Create Password</Label>
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
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg shadow-lg font-bold"
                        disabled={loading}
                    >
                        {loading ? "Creating Account..." : "Register Now"}
                        {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
                    </Button>

                    <div className="text-center text-sm">
                        <span className="text-gray-500">Already a member?</span>{" "}
                        <Link to="/login" className="font-bold text-blue-600 hover:underline">
                            Login Here
                        </Link>
                    </div>
                </form>
            </Card>
        </div>
    );
}
