import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import API_URL from "../api";
import {
    BarChart as RBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer,
    PieChart as RPieChart, Pie, Cell, Legend as RLegend, AreaChart as RAreaChart, Area
} from "recharts";
import { saveAs } from "file-saver";
import {
    LogOut,
    Search,
    Download,
    Trash2,
    CheckCircle,
    FileText,
    Shield,
    User,
    Settings,
    Lock,
    LayoutDashboard,
    Clock,
    CheckCircle2,
    Package,
    MessageSquare,
    Star,
    Reply,
    BarChart3,
    TrendingUp,
    Calendar,
    CreditCard,
    RefreshCw
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export default function Admin() {
    const [bookings, setBookings] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [search, setSearch] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [activeTab, setActiveTab] = useState("bookings");
    const [replyText, setReplyText] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [systemLogs, setSystemLogs] = useState([]);
    const [serverAnalytics, setServerAnalytics] = useState({
        revenueByTime: [],
        serviceMarketShare: [],
        peakTimeData: [],
        retentionRate: 0
    });
    const [analyticsRange, setAnalyticsRange] = useState("monthly");
    const [analyticsLoading, setAnalyticsLoading] = useState(false);
    const navigate = useNavigate();

    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) {
            navigate("/admin-login");
            return;
        }
        loadBookings();
        loadReviews();
        loadSystemLogs();
        loadAnalytics();
    }, [token, analyticsRange]);

    const loadAnalytics = async () => {
        setAnalyticsLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/admin/analytics/detailed?range=${analyticsRange}`, {
                headers: { Authorization: token }
            });
            if (res.ok) {
                const data = await res.json();
                setServerAnalytics(data);
            }
        } catch (err) {
            console.error("Analytics failure", err);
        } finally {
            setAnalyticsLoading(false);
        }
    };

    const loadSystemLogs = async () => {
        try {
            const res = await fetch(`${API_URL}/api/system-logs`, {
                headers: {
                    Authorization: token,
                },
            });
            if (res.ok) {
                const data = await res.json();
                setSystemLogs(data);
            } else if (res.status === 401 || res.status === 403) {
                navigate("/admin-login");
            }
        } catch (e) {
            console.error("Failed to load logs", e);
            setError("Connectivity issue: Could not load system logs.");
        }
    };

    const loadReviews = async () => {
        try {
            const res = await fetch(`${API_URL}/api/reviews`);
            const data = await res.json();
            if (Array.isArray(data)) setReviews(data);
        } catch (err) {
            console.error("Failed to load reviews");
            setError("Failed to load reviews.");
        }
    };

    const loadBookings = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/bookings`, {
                headers: {
                    Authorization: token,
                },
            });

            const data = await res.json();
            if (Array.isArray(data)) {
                setBookings(data);
            } else {
                setBookings([]);
            }
        } catch (err) {
            console.error("Failed to load bookings");
            setError("Failed to load bookings.");
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, status, amount = null) => {
        try {
            const body = { status };
            if (amount !== null) body.amount = amount;

            const response = await fetch(`${API_URL}/api/bookings/${id}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                },
                body: JSON.stringify(body),
            });
            if (response.ok) {
                loadBookings();
            } else {
                alert("Failed to update status.");
            }
        } catch (error) {
            console.error("Failed to update status", error);
            alert("Error: Could not update status.");
        }
    };

    const updatePayment = async (id, status) => {
        try {
            const response = await fetch(`${API_URL}/api/bookings/${id}/payment`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                },
                body: JSON.stringify({ paymentStatus: status }),
            });
            if (response.ok) {
                loadBookings();
            } else {
                alert("Failed to update payment.");
            }
        } catch (error) {
            console.error("Failed to update payment", error);
            alert("Error: Could not update payment.");
        }
    };

    const completeBooking = async (id) => {
        try {
            const res = await fetch(`${API_URL}/api/bookings/${id}/complete`, {
                method: "PUT",
                headers: {
                    Authorization: token,
                },
            });
            if (res.ok) loadBookings();
            else alert("Failed to complete booking.");
        } catch (err) {
            console.error("Failed to complete booking", err);
            alert("Error: Could not update booking status.");
        }
    };

    const deleteBooking = async (id) => {
        if (window.confirm("Are you sure you want to delete this booking?")) {
            try {
                const res = await fetch(`${API_URL}/api/bookings/${id}`, {
                    method: "DELETE",
                    headers: {
                        Authorization: token,
                    },
                });
                if (res.ok) loadBookings();
                else alert("Failed to delete booking.");
            } catch (err) {
                console.error("Failed to delete booking", err);
                alert("Error: Could not delete booking.");
            }
        }
    };

    const filtered = useMemo(() => {
        return bookings.filter(b =>
            b.name.toLowerCase().includes(search.toLowerCase()) ||
            b.phone.includes(search)
        );
    }, [bookings, search]);

    const localStats = useMemo(() => {
        if (!bookings.length) return { monthly: [], services: [], customers: [] };

        const dailyMap = {};
        const serviceMap = {};
        const custMap = {};

        bookings.forEach(b => {
            const date = new Date(b.createdAt).toLocaleDateString();
            const amt = parseFloat(b.amount) || 0;
            dailyMap[date] = (dailyMap[date] || 0) + amt;
            serviceMap[b.serviceType] = (serviceMap[b.serviceType] || 0) + 1;

            if (!custMap[b.phone]) {
                custMap[b.phone] = { name: b.name, phone: b.phone, totalSpend: 0, visits: 0, lastVisit: b.createdAt };
            }
            custMap[b.phone].totalSpend += amt;
            custMap[b.phone].visits += 1;
            if (new Date(b.createdAt) > new Date(custMap[b.phone].lastVisit)) {
                custMap[b.phone].lastVisit = b.createdAt;
            }
        });

        const daily = Object.keys(dailyMap).map(d => ({ date: d, revenue: dailyMap[d] })).slice(-15);
        const services = Object.keys(serviceMap).map(s => ({ name: s.toUpperCase(), value: serviceMap[s] }));
        const customers = Object.values(custMap).sort((a, b) => b.totalSpend - a.totalSpend);

        return { daily, services, customers };
    }, [bookings]);

    const logout = () => {
        localStorage.removeItem("token");
        navigate("/admin-login");
    };

    const deleteReview = async (id) => {
        if (window.confirm("Delete this review?")) {
            await fetch(`${API_URL}/api/reviews/${id}`, {
                method: "DELETE",
                headers: { authorization: token },
            });
            loadReviews();
        }
    };

    const submitReply = async (id) => {
        await fetch(`${API_URL}/api/reviews/${id}/reply`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                authorization: token,
            },
            body: JSON.stringify({ reply: replyText[id] }),
        });
        setReplyText({ ...replyText, [id]: "" });
        loadReviews();
    };

    const printInvoice = (booking) => {
        const doc = new jsPDF();
        
        // --- Letterhead Header ---
        // Add Logo (Original logo from public folder)
        // Note: In a real browser environment, we'd need to ensure the image is loaded.
        // For simplicity, we'll try to add it; the onError fallback handles it if it fails.
        const logo = new Image();
        logo.src = "/logo.png";
        
        logo.onload = () => {
            // Logo on the left
            doc.addImage(logo, 'PNG', 15, 10, 30, 30);
            
            // Business Details on the right
            doc.setFontSize(22);
            doc.setTextColor(30, 58, 138); // Navy Blue
            doc.text(businessInfo.name, 50, 20);
            
            doc.setFontSize(10);
            doc.setTextColor(75, 85, 99); // Slate Gray
            doc.text(businessInfo.tagline, 50, 26);
            
            // Contact Info
            doc.setFontSize(9);
            doc.text(`${businessInfo.address.street}, ${businessInfo.address.area}`, 50, 32);
            doc.text(`${businessInfo.address.city}, ${businessInfo.address.state} - ${businessInfo.address.pincode}`, 50, 36);
            doc.text(`${businessInfo.phone} | ${businessInfo.email}`, 50, 40);
            
            // Header Line
            doc.setDrawColor(30, 58, 138);
            doc.setLineWidth(0.5);
            doc.line(15, 45, 195, 45);
            
            // --- Invoice Body ---
            doc.setFontSize(16);
            doc.setTextColor(0);
            doc.text("SERVICE INVOICE", 15, 60);
            
            // Invoice Metadata
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Invoice ID: #INV-${booking._id.slice(-6).toUpperCase()}`, 140, 60);
            doc.text(`Date: ${new Date(booking.createdAt).toLocaleDateString()}`, 140, 65);
            
            // Table-like structure for body
            doc.setFillColor(243, 244, 246);
            doc.rect(15, 75, 180, 10, 'F');
            
            doc.setTextColor(0);
            doc.setFontSize(11);
            doc.text("CUSTOMER DETAILS", 20, 82);
            
            doc.setFontSize(10);
            doc.text(`Name:`, 20, 95);
            doc.text(`${booking.name}`, 60, 95);
            
            doc.text(`Phone:`, 20, 105);
            doc.text(`${booking.phone}`, 60, 105);
            
            doc.text(`Address:`, 20, 115);
            doc.text(`${booking.address}`, 60, 115);
            
            // Service Section
            doc.setFillColor(243, 244, 246);
            doc.rect(15, 130, 180, 10, 'F');
            doc.text("SERVICE DETAILS", 20, 137);
            
            doc.text(`Service Type:`, 20, 150);
            doc.setFontSize(11);
            doc.text(`${booking.serviceType}`, 60, 150);
            
            doc.setFontSize(10);
            doc.text(`Current Status:`, 20, 160);
            doc.text(`${booking.status.toUpperCase()}`, 60, 160);
            
            // Totals / Footer
            doc.setDrawColor(229, 231, 235);
            doc.line(15, 180, 195, 180);
            
            doc.setFontSize(12);
            doc.setTextColor(30, 58, 138);
            doc.text("Thank you for choosing LK Smart Wash!", 60, 200);
            
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text("This is a computer-generated invoice. No signature required.", 70, 280);
            
            doc.save(`Invoice_${booking.name}_${booking._id.slice(-6)}.pdf`);
        };

        // Fallback
        logo.onerror = () => {
            doc.text(businessInfo.name, 20, 20);
            doc.save(`Invoice_${booking.name}_${booking._id.slice(-6)}.pdf`);
        };
    };

    const downloadFullReportExcel = () => {
        const data = bookings.map(b => ({
            "Order ID": b._id,
            "Customer": b.name,
            "Phone": b.phone,
            "Address": b.address,
            "Service": b.serviceType,
            "Amount": b.amount || 0,
            "Status": b.status,
            "Payment": b.paymentStatus,
            "Date": new Date(b.createdAt).toLocaleDateString()
        }));
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Full Bookings Report");
        XLSX.writeFile(workbook, `LK_Smart_Wash_Complete_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const downloadAnalyticsPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.setTextColor(30, 58, 138);
        doc.text("LK SMART WASH - GROWTH SUMMARY", 105, 20, { align: "center" });
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 30, { align: "center" });

        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text("Operational KPIs", 20, 50);
        doc.setFontSize(11);
        doc.text(`- Monthly Revenue Target: ${serverAnalytics.revenueByTime.reduce((s, r)=>s+r.value, 0).toLocaleString()}`, 25, 60);
        doc.text(`- Customer Retention: ${serverAnalytics.retentionRate}%`, 25, 70);
        doc.text(`- Total Orders Period: ${bookings.length}`, 25, 80);

        doc.setFontSize(14);
        doc.text("Service Performance Breakdown", 20, 100);
        serverAnalytics.serviceMarketShare.forEach((item, i) => {
            doc.text(`${item.name}: Rs ${item.value.toLocaleString()}`, 25, 110 + (i * 10));
        });

        doc.save("LK_Growth_Performance.pdf");
    };

    const changePassword = async (e) => {
        e.preventDefault();
        const res = await fetch(`${API_URL}/api/admin/change-password`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                authorization: token,
            },
            body: JSON.stringify({
                oldPassword,
                newPassword,
            }),
        });

        const data = await res.json();
        alert(data.message);
        setOldPassword("");
        setNewPassword("");
    };


    const stats = {
        total: bookings.length,
        received: bookings.filter((b) => b?.status === "received").length,
        pending: bookings.filter((b) => b?.status === "pending").length,
        inProgress: bookings.filter((b) => ["processing", "cleaning"].includes(b?.status)).length,
        completed: bookings.filter((b) => ["completed", "delivered", "ready_for_pickup"].includes(b?.status)).length,
    };

    const ANALYTICS_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

    const trendData = useMemo(() => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayBookings = bookings.filter(b => {
                if (!b.createdAt) return false;
                const bDate = typeof b.createdAt === 'string' ? b.createdAt : new Date(b.createdAt).toISOString();
                return bDate.startsWith(dateStr);
            });
            days.push({
                date: date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }),
                bookings: dayBookings.length,
                completed: dayBookings.filter(b => b.status === 'completed' || b.status === 'delivered').length
            });
        }
        return days;
    }, [bookings]);

    const serviceData = useMemo(() => {
        const counts = {};
        bookings.forEach(b => {
            const type = b.serviceType || 'Unknown';
            counts[type] = (counts[type] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [bookings]);

    const analyticsStatusData = useMemo(() => {
        const statusLabels = { 
            pending: 'Pending', 
            received: 'Received', 
            processing: 'Processing', 
            cleaning: 'Cleaning',
            ready_for_pickup: 'Ready',
            delivered: 'Delivered',
            completed: 'Completed' 
        };
        const statusColors = { 
            pending: '#f59e0b', 
            received: '#3b82f6', 
            processing: '#8b5cf6', 
            cleaning: '#a855f7',
            ready_for_pickup: '#10b981',
            delivered: '#059669',
            completed: '#10b981' 
        };
        const counts = {};
        bookings.forEach(b => {
            const s = b.status || 'pending';
            counts[s] = (counts[s] || 0) + 1;
        });
        return Object.entries(counts).map(([key, value]) => ({
            name: statusLabels[key] || key,
            value,
            color: statusColors[key] || '#6b7280'
        }));
    }, [bookings]);

    const monthlyData = useMemo(() => {
        const months = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthStr = date.toISOString().substring(0, 7);
            const monthBookings = bookings.filter(b => {
                if (!b.createdAt) return false;
                const bDate = typeof b.createdAt === 'string' ? b.createdAt : new Date(b.createdAt).toISOString();
                return bDate.startsWith(monthStr);
            });
            months.push({
                month: date.toLocaleDateString('en-IN', { month: 'short' }),
                total: monthBookings.length,
                completed: monthBookings.filter(b => b.status === 'completed' || b.status === 'delivered').length
            });
        }
        return months;
    }, [bookings]);

    const completionRate = bookings.length > 0
        ? Math.round((bookings.filter(b => b.status === 'completed' || b.status === 'delivered').length / bookings.length) * 100)
        : 0;

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <div className="w-64 bg-gray-900 text-white hidden md:flex flex-col">
                <div className="p-4 flex items-center space-x-3 border-b border-gray-800">
                    <img src="/logo.png" alt="Logo" className="h-10 w-auto rounded shadow-sm" onError={(e) => e.target.style.display = 'none'} />
                    <span className="font-bold text-xl tracking-tight">Admin Panel</span>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <button
                        onClick={() => setActiveTab("bookings")}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${activeTab === "bookings" ? "bg-blue-600" : "hover:bg-gray-800"}`}
                    >
                        <LayoutDashboard size={20} />
                        <span>Bookings</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("reviews")}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${activeTab === "reviews" ? "bg-blue-600" : "hover:bg-gray-800"}`}
                    >
                        <MessageSquare size={20} />
                        <span>Reviews</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("analytics")}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${activeTab === "analytics" ? "bg-blue-600" : "hover:bg-gray-800"}`}
                    >
                        <BarChart3 size={20} />
                        <span>Analytics</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("customers")}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${activeTab === "customers" ? "bg-blue-600" : "hover:bg-gray-800"}`}
                    >
                        <User size={20} />
                        <span>Customers</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("settings")}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${activeTab === "settings" ? "bg-blue-600" : "hover:bg-gray-800"}`}
                    >
                        <Settings size={20} />
                        <span>Settings</span>
                    </button>
                    <button
                        onClick={() => { setActiveTab("system-logs"); loadSystemLogs(); }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${activeTab === "system-logs" ? "bg-blue-600" : "hover:bg-gray-800"}`}
                    >
                        <MessageSquare size={20} />
                        <span>System Logs</span>
                    </button>
                </nav>
                <div className="p-4 border-t border-gray-800">
                    <button
                        onClick={logout}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-600 transition text-red-400 hover:text-white"
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Header */}
                <header className="bg-white border-b h-16 flex items-center justify-between px-8">
                    <h2 className="text-xl font-bold text-gray-800">
                        {activeTab === "bookings" ? "Manage Bookings" : "Account Settings"}
                    </h2>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-500">Welcome, Admin</span>
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">A</div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8 content-area">
                    {/* Bug Fix: Global Error Banner */}
                    {error && (
                        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-center justify-between animate-in slide-in-from-top duration-300">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700 font-medium">{error}</p>
                                </div>
                            </div>
                            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 text-xs font-bold uppercase tracking-widest">Dismiss</button>
                        </div>
                    )}

                    {/* BOOKINGS TAB */}
                    {activeTab === "bookings" && (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Manage Bookings</h2>
                                <div className="flex flex-wrap gap-2">
                                    <Button onClick={exportExcel} variant="outline" className="flex items-center gap-2">
                                        <Download size={16} /> Export Excel
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                {Object.entries(stats).map(([key, val]) => (
                                    <Card key={key} className="bg-white border-none shadow-sm">
                                        <CardContent className="p-4">
                                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">{key}</p>
                                            <p className="text-2xl font-black text-gray-900">{val}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            <div className="relative mt-6">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <Input 
                                    className="pl-10 h-12 bg-white border-none shadow-sm"
                                    placeholder="Search name, phone or address..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>

                            <Card className="border-none shadow-xl overflow-hidden rounded-xl bg-white">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 border-b border-gray-100">
                                            <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                <th className="px-6 py-4">Customer</th>
                                                <th className="px-6 py-4">Status & Service</th>
                                                <th className="px-6 py-4">Payment</th>
                                                <th className="px-6 py-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {loading ? (
                                                <tr><td colSpan="4" className="p-20 text-center text-gray-400">Fetching live data...</td></tr>
                                            ) : filtered.length === 0 ? (
                                                <tr><td colSpan="4" className="p-20 text-center text-gray-400">No results found for "{search}"</td></tr>
                                            ) : (
                                                filtered.map((b) => (
                                                    <tr key={b._id} className="hover:bg-blue-50/30 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="font-bold text-gray-900">{b.name}</div>
                                                            <div className="text-xs text-blue-600 font-mono tracking-tighter">{b.phone}</div>
                                                            <div className="text-[10px] text-gray-400 mt-1 max-w-[200px] truncate">{b.address}</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <select 
                                                                 value={b.status}
                                                                 onChange={(e) => updateStatus(b._id, e.target.value)}
                                                                 className={`text-[10px] font-bold rounded-full px-3 py-1 border-none focus:ring-2 focus:ring-blue-500 cursor-pointer mb-2 block ${
                                                                     b.status === 'pending' ? 'bg-orange-100 text-orange-700' : 
                                                                     b.status === 'ready_for_pickup' ? 'bg-blue-600 text-white animate-pulse' :
                                                                     ['completed', 'delivered'].includes(b.status) ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                                                 }`}
                                                            >
                                                                <option value="pending">Pending</option>
                                                                <option value="received">Received</option>
                                                                <option value="processing">Processing</option>
                                                                <option value="cleaning">Cleaning</option>
                                                                <option value="ready_for_pickup">Ready</option>
                                                                <option value="delivered">Delivered</option>
                                                                <option value="completed">Completed</option>
                                                            </select>
                                                            <div className="text-xs font-bold text-gray-700">{b.serviceType}</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <button 
                                                                onClick={() => updatePayment(b._id, b.paymentStatus === 'paid' ? 'pending' : 'paid')}
                                                                className={`text-[10px] font-bold px-3 py-1 rounded-full ${b.paymentStatus === 'paid' ? 'bg-green-500 text-white' : 'bg-red-50 text-red-600 border border-red-100'}`}
                                                            >
                                                                {b.paymentStatus.toUpperCase()}
                                                            </button>
                                                            <div className="text-[10px] text-gray-400 mt-1">₹{b.amount || 0} ({b.orderType})</div>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Button size="sm" variant="ghost" onClick={() => printInvoice(b)} className="text-blue-600">
                                                                    <FileText size={16} />
                                                                </Button>
                                                                <Button size="sm" variant="ghost" onClick={() => {
                                                                    const amt = prompt("Update billing amount:", b.amount || 0);
                                                                    if(amt) updateStatus(b._id, b.status, parseFloat(amt));
                                                                }} className="text-slate-600">
                                                                    <CreditCard size={16} />
                                                                </Button>
                                                                <Button size="sm" variant="ghost" onClick={() => deleteBooking(b._id)} className="text-red-500">
                                                                    <Trash2 size={16} />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* REVIEWS TAB */}
                    {activeTab === "reviews" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                            {reviews.map((r) => (
                                <Card key={r._id} className="bg-white border-none shadow-lg">
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="font-bold text-gray-900">{r.name}</h4>
                                                <div className="flex text-yellow-400 mt-1">
                                                    {[...Array(r.rating)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" onClick={() => deleteReview(r._id)} className="text-red-400 hover:text-red-600">
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                        <p className="text-gray-600 text-sm italic mb-6">"{r.comment}"</p>
                                        
                                        {r.reply ? (
                                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                                <p className="text-xs font-bold text-blue-800 mb-1 flex items-center gap-1">
                                                    <Shield size={12} /> LK Smart Wash Reply:
                                                </p>
                                                <p className="text-xs text-blue-700">{r.reply}</p>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2">
                                                <Input 
                                                    placeholder="Write public reply..." 
                                                    className="text-xs h-10"
                                                    value={replyText[r._id] || ""}
                                                    onChange={(e) => setReplyText({...replyText, [r._id]: e.target.value})}
                                                />
                                                <Button size="sm" onClick={() => submitReply(r._id)}><Reply size={16}/></Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* ANALYTICS TAB */}
                    {activeTab === "analytics" && (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <Card className="bg-white border-none shadow-lg border-l-4 border-l-blue-500">
                                    <CardContent className="p-6">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Lifetime Value</p>
                                        <p className="text-3xl font-black text-slate-900">₹{(localStats.customers?.reduce((sum, c) => sum + c.totalSpend, 0) || 0).toLocaleString()}</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-white border-none shadow-lg border-l-4 border-l-green-500">
                                    <CardContent className="p-6">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Collected Cash</p>
                                        <p className="text-3xl font-black text-green-600">₹{(bookings.filter(b => b.paymentStatus === 'paid').reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0)).toLocaleString()}</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-white border-none shadow-lg border-l-4 border-l-orange-500">
                                    <CardContent className="p-6">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Retention Rate</p>
                                        <p className="text-3xl font-black text-orange-600">{serverAnalytics.retentionRate}%</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-white border-none shadow-lg border-l-4 border-l-purple-500">
                                    <CardContent className="p-6">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Client Base</p>
                                        <p className="text-3xl font-black text-purple-600">{localStats.customers.length}</p>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                                <div className="flex bg-gray-100 p-1 rounded-xl">
                                    {["daily", "weekly", "monthly"].map((r) => (
                                        <button
                                            key={r}
                                            onClick={() => setAnalyticsRange(r)}
                                            className={`px-4 py-2 text-[10px] font-bold uppercase rounded-lg transition ${analyticsRange === r ? "bg-white text-blue-600 shadow-sm" : "text-gray-400"}`}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex space-x-2">
                                    <Button onClick={downloadFullReportExcel} variant="outline" className="text-green-600 border-green-100 bg-green-50 font-bold text-xs">
                                        <Download size={14} className="mr-2" /> Excel
                                    </Button>
                                    <Button onClick={downloadAnalyticsPDF} variant="outline" className="text-red-600 border-red-100 bg-red-50 font-bold text-xs">
                                        <FileText size={14} className="mr-2" /> PDF Report
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <Card className="bg-white border-none shadow-xl rounded-3xl overflow-hidden">
                                    <CardContent className="p-8">
                                        <h3 className="text-sm font-black text-gray-900 mb-8 uppercase tracking-widest flex items-center gap-2">
                                            <TrendingUp size={16} className="text-blue-500" /> Revenue Trend ({analyticsRange})
                                        </h3>
                                        <div className="h-[300px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <RAreaChart data={serverAnalytics.revenueByTime}>
                                                    <defs>
                                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b', fontWeight: 700}} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b', fontWeight: 700}} />
                                                    <RTooltip contentStyle={{borderRadius:'16px', border:'none', boxShadow:'0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold'}} />
                                                    <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                                                </RAreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-white border-none shadow-xl rounded-3xl overflow-hidden">
                                    <CardContent className="p-8">
                                        <h3 className="text-sm font-black text-gray-900 mb-8 uppercase tracking-widest flex items-center gap-2">
                                            <Package size={16} className="text-purple-500" /> Service Split
                                        </h3>
                                        <div className="h-[300px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <RPieChart>
                                                    <Pie data={serverAnalytics.serviceMarketShare} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={8} dataKey="value">
                                                        {serverAnalytics.serviceMarketShare.map((e, i) => <Cell key={i} fill={['#3b82f6','#a855f7','#f59e0b','#ec4899'][i%4]} stroke="none" />)}
                                                    </Pie>
                                                    <RTooltip contentStyle={{borderRadius:'16px', border:'none', boxShadow:'0 20px 25px -5px rgb(0 0 0 / 0.1)'}} />
                                                    <RLegend iconType="circle" />
                                                </RPieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-white border-none shadow-xl rounded-3xl overflow-hidden lg:col-span-2">
                                    <CardContent className="p-8">
                                        <h3 className="text-sm font-black text-gray-900 mb-8 uppercase tracking-widest flex items-center gap-2">
                                            <Clock size={16} className="text-orange-500" /> Hourly Booking Volume
                                        </h3>
                                        <div className="h-[250px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <RBarChart data={serverAnalytics.peakTimeData}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#94a3b8'}} />
                                                    <YAxis hide />
                                                    <RTooltip contentStyle={{borderRadius:'12px', border:'none'}} cursor={{fill: '#f8fafc'}} />
                                                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                                                </RBarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}

                    {/* CUSTOMERS TAB */}
                    {activeTab === "customers" && (
                        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                             <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Customer Directory</h2>
                                    <p className="text-sm text-gray-400">Total Unique Clients: {localStats.customers.length}</p>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><User size={24}/></div>
                            </div>
                            <Card className="bg-white border-none shadow-xl overflow-hidden rounded-2xl">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 border-b border-gray-100">
                                            <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                <th className="px-8 py-5">Identity</th>
                                                <th className="px-8 py-5 text-center">Interactions</th>
                                                <th className="px-8 py-5 text-center">Lifetime Value</th>
                                                <th className="px-8 py-5 text-right">Last Visit</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {localStats.customers.map((c) => (
                                                <tr key={c.phone} className="hover:bg-blue-50/50 transition-colors group">
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 uppercase">{c.name.charAt(0)}</div>
                                                            <div>
                                                                <div className="font-bold text-gray-900">{c.name}</div>
                                                                <div className="text-xs text-gray-400 font-mono tracking-tighter">{c.phone}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-center">
                                                        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">{c.visits} Orders</span>
                                                    </td>
                                                    <td className="px-8 py-6 text-center">
                                                        <div className="text-lg font-black text-slate-900">₹{c.totalSpend.toLocaleString()}</div>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <div className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-lg inline-block">
                                                            {new Date(c.lastVisit).toLocaleDateString(undefined, {day:'numeric', month:'short', year:'numeric'})}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* SETTINGS TAB */}
                    {activeTab === "settings" && (
                        <div className="max-w-md mx-auto py-10 animate-in zoom-in-95 duration-500">
                            <Card className="border-none shadow-2xl">
                                <CardContent className="p-10">
                                    <div className="flex flex-col items-center mb-8">
                                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4"><Lock size={32}/></div>
                                        <h3 className="text-2xl font-black text-gray-900">Security Access</h3>
                                        <p className="text-sm text-gray-400">Regularly update your admin password.</p>
                                    </div>
                                    <form onSubmit={changePassword} className="space-y-6">
                                        <div>
                                            <Label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest pl-1 mb-2 block">Current Key</Label>
                                            <Input 
                                                type="password" 
                                                placeholder="Enter current password" 
                                                value={oldPassword} 
                                                onChange={(e)=>setOldPassword(e.target.value)} 
                                                className="h-12 border-slate-200"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest pl-1 mb-2 block">New Secure Key</Label>
                                            <Input 
                                                type="password" 
                                                placeholder="Create strong password" 
                                                value={newPassword} 
                                                onChange={(e)=>setNewPassword(e.target.value)} 
                                                className="h-12 border-slate-200"
                                            />
                                        </div>
                                        <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
                                            Apply New Security Settings
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* SYSTEM LOGS TAB */}
                    {activeTab === "system-logs" && (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            <Card className="bg-slate-950 border-none shadow-2xl overflow-hidden rounded-2xl">
                                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5 backdrop-blur-md">
                                    <div>
                                        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                            <span>Mock Notification Engine</span>
                                        </h2>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Live simulation logs</p>
                                    </div>
                                    <Button variant="outline" onClick={loadSystemLogs} className="text-white border-white/10 hover:bg-white/10">
                                        <RefreshCw size={16} className="mr-2" /> Refresh
                                    </Button>
                                </div>
                                <div className="p-8 space-y-4 max-h-[600px] overflow-y-auto font-mono text-sm custom-scrollbar bg-black/20">
                                    {systemLogs.length === 0 ? (
                                        <div className="text-center py-20 text-gray-700 font-bold opacity-30 italic">NO ACTIVE LOGS IN SESSION</div>
                                    ) : (
                                        systemLogs.map((log) => (
                                            <div key={log.id} className="p-4 bg-white/5 rounded-xl border border-white/5 flex flex-col gap-2 hover:bg-white/10 transition group">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-blue-400 font-black text-[10px] uppercase">{log.to}</span>
                                                    <span className="text-gray-600 text-[9px]">{log.timestamp}</span>
                                                </div>
                                                <div className="text-gray-400 text-xs italic tracking-tight">"{log.message}"</div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </Card>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
