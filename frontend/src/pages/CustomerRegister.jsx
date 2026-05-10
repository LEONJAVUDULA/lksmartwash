import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Lock, ArrowRight, Smartphone, Sparkles } from "lucide-react";
import { Button } from "../components/ui/Button.jsx";
import { Input } from "../components/ui/Input.jsx";
import { Card, CardContent } from "../components/ui/Card.jsx";
import { Label } from "../components/ui/Label.jsx";
import API_URL from "../api";

export default function CustomerRegister() {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [referralCode, setReferralCode] = useState("");
    const [referralCheck, setReferralCheck] = useState({ loading: false, valid: false, name: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    React.useEffect(() => {
        if (referralCode.length >= 4) {
            const timeoutId = setTimeout(() => validateReferral(referralCode), 500);
            return () => clearTimeout(timeoutId);
        } else {
            setReferralCheck({ loading: false, valid: false, name: "" });
        }
    }, [referralCode]);

    const validateReferral = async (code) => {
        setReferralCheck(prev => ({ ...prev, loading: true }));
        try {
            const res = await fetch(`${API_URL}/api/user/check-referral/${code}`);
            const data = await res.json();
            setReferralCheck({ loading: false, valid: data.valid, name: data.name || "" });
        } catch (err) {
            setReferralCheck({ loading: false, valid: false, name: "" });
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch(`${API_URL}/api/user/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, phone, password, referralCode }),
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
                    <img src="/logo.png" alt="LK Smart Wash" className="h-24 w-auto mx-auto mb-6 rounded-3xl shadow-2xl border-4 border-white transform hover:scale-105 transition-transform" />
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
                            <div>
                            <Label htmlFor="referralCode">Referral Code (Optional)</Label>
                            <div className="relative mt-1">
                                <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-500 animate-pulse" />
                                <Input
                                    id="referralCode"
                                    type="text"
                                    className="pl-10 h-12 uppercase"
                                    placeholder="LEON1234"
                                    value={referralCode}
                                    onChange={(e) => setReferralCode(e.target.value)}
                                />
                                {referralCheck.valid && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                        <div className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 flex items-center animate-in zoom-in">
                                            VERIFIED: {referralCheck.name.split(' ')[0]}
                                        </div>
                                    </div>
                                )}
                            </div>
                            {!referralCheck.valid && referralCode.length >= 4 && !referralCheck.loading && (
                                <p className="text-[10px] text-red-400 mt-1 font-bold animate-in slide-in-from-top-1">Invalid referral code</p>
                            )}
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
