import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import API_URL from "../api";
import { businessInfo } from "../mockData";
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
    Users,
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
    RefreshCw,
    UserPlus,
    UserCheck,
    Truck,
    Bell,
    Heart,
    Zap,
    ExternalLink,
    Gem,
    Wallet,
    Sparkles,
    Trophy,
    Share2
} from "lucide-react";
import { Button } from "../components/ui/Button.jsx";
import { Card, CardContent } from "../components/ui/Card.jsx";
import { Input } from "../components/ui/Input.jsx";
import { Label } from "../components/ui/Label.jsx";
import { Select } from "../components/ui/Select.jsx";

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
    const [selectedStore, setSelectedStore] = useState("All");
    const [globalPricing, setGlobalPricing] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [newPrice, setNewPrice] = useState({ serviceName: "", price: 0 });
    const [newInv, setNewInv] = useState({ itemName: "", quantity: 0, unit: "units" });

    // Store Config States
    const [storeConfigs, setStoreConfigs] = useState([]);
    const [newConfig, setNewConfig] = useState({ 
        locationName: "Main Store", 
        dailyGoal: 2000, 
        monthlyGoal: 60000, 
        salaries: 0, 
        rent: 0,
        fuel: 0,
        chemicals: 0,
        maintenance: 0
    });

    // Expense States
    const [expenses, setExpenses] = useState([]);
    const [newExpense, setNewExpense] = useState({ category: "fuel", amount: 0, description: "", storeLocation: "Main Store" });
    
    // Team States
    const [team, setTeam] = useState({ staff: [], drivers: [] });
    const [teamSearch, setTeamSearch] = useState("");
    const [isCreatingMember, setIsCreatingMember] = useState(false);
    const [newMember, setNewMember] = useState({ role: "staff", name: "", id: "", password: "", storeLocation: "Main Store" });
    const [editingMember, setEditingMember] = useState(null); // { role, dbId, id, password }
    const [loyaltyUsers, setLoyaltyUsers] = useState([]);
    const [loyaltyStats, setLoyaltyStats] = useState({ totalPoints: 0, totalWallet: 0 });
    const [atRiskUsers, setAtRiskUsers] = useState([]);

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
        loadTeam();
        loadStoreConfigs();
        loadExpenses();
        loadGlobalPricing();
        loadInventory();
        if (activeTab === "loyalty") loadLoyaltyData();
        if (activeTab === "retention") loadAtRiskUsers();
        if (activeTab === "logs") loadSystemLogs();
    }, [token, analyticsRange, selectedStore, activeTab]);

    const loadAtRiskUsers = async () => {
        try {
            const res = await fetch(`${API_URL}/api/admin/retention/at-risk`, {
                headers: { Authorization: token }
            });
            if (res.ok) setAtRiskUsers(await res.json());
        } catch (err) { console.error(err); }
    };

    const loadLoyaltyData = async () => {
        try {
            const res = await fetch(`${API_URL}/api/admin/loyalty-stats`, {
                headers: { Authorization: token }
            });
            if (res.ok) {
                const data = await res.json();
                setLoyaltyUsers(data.users || []);
                setLoyaltyStats(data.stats || { totalPoints: 0, totalWallet: 0 });
            }
        } catch (err) { console.error(err); }
    };

    const loadGlobalPricing = async () => {
        try {
            const res = await fetch(`${API_URL}/api/admin/global-config`, {
                headers: { Authorization: token }
            });
            if (res.ok) {
                const data = await res.json();
                setGlobalPricing(data?.pricing || []);
            }
        } catch (err) { console.error(err); }
    };

    const loadInventory = async () => {
        try {
            const res = await fetch(`${API_URL}/api/admin/inventory`, {
                headers: { Authorization: token }
            });
            if (res.ok) setInventory(await res.json());
        } catch (err) { console.error(err); }
    };

    const updateGlobalPricing = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/api/admin/global-config`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: token },
                body: JSON.stringify({ pricing: globalPricing })
            });
            if (res.ok) alert("Global Pricing Updated!");
        } catch (err) { alert("Update failed"); }
    };

    const assignDriver = async (bookingId, driverDbId, type) => {
        try {
            const res = await fetch(`${API_URL}/api/bookings/${bookingId}/assign-driver`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                },
                body: JSON.stringify({ driverId: driverDbId, type }),
            });
            if (res.ok) {
                alert(`Driver assigned successfully for ${type}! Notification sent.`);
                loadBookings();
            } else {
                const data = await res.json();
                alert(data.error || "Assignment failed");
            }
        } catch (err) {
            alert("Assignment error");
        }
    };

    const updateInventory = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/api/admin/inventory`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: token },
                body: JSON.stringify(newInv)
            });
            if (res.ok) {
                alert("Inventory Updated!");
                setNewInv({ itemName: "", quantity: 0, unit: "units" });
                loadInventory();
            }
        } catch (err) { alert("Update failed"); }
    };

    const loadTeam = async () => {
        try {
            const res = await fetch(`${API_URL}/api/admin/team`, {
                headers: { Authorization: token }
            });
            if (res.ok) {
                const data = await res.json();
                setTeam(data);
            }
        } catch (err) {
            console.error("Team load failure", err);
        }
    };

    const createTeamMember = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/api/admin/team`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token
                },
                body: JSON.stringify(newMember)
            });
            if (res.ok) {
                setIsCreatingMember(false);
                setNewMember({ role: "staff", name: "", id: "", password: "" });
                loadTeam();
                alert("Member Created Successfully!");
            } else {
                const data = await res.json();
                alert(data.error || "Creation failed");
            }
        } catch (err) {
            alert("Network error");
        }
    };

    const deleteTeamMember = async (role, dbId) => {
        if (!window.confirm("Are you sure you want to remove this team member?")) return;
        try {
            const res = await fetch(`${API_URL}/api/admin/team/${role}/${dbId}`, {
                method: "DELETE",
                headers: { Authorization: token }
            });
            if (res.ok) loadTeam();
        } catch (err) {
            alert("Deletion failed");
        }
    };

    const updateTeamMember = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/api/admin/team/${editingMember.role}/${editingMember.dbId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token
                },
                body: JSON.stringify({
                    id: editingMember.id,
                    password: editingMember.password
                })
            });
            if (res.ok) {
                setEditingMember(null);
                loadTeam();
                alert("Updated successfully!");
            }
        } catch (err) {
            alert("Update failed");
        }
    };

    const loadAnalytics = async () => {
        setAnalyticsLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/admin/analytics/detailed?range=${analyticsRange}&storeLocation=${selectedStore}`, {
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

    const loadStoreConfigs = async () => {
        try {
            const res = await fetch(`${API_URL}/api/admin/store-config`, {
                headers: { Authorization: token }
            });
            if (res.ok) setStoreConfigs(await res.json());
        } catch (err) { console.error(err); }
    };

    const saveStoreConfig = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/api/admin/store-config`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: token },
                body: JSON.stringify(newConfig)
            });
            if (res.ok) {
                alert("Configuration Saved!");
                loadStoreConfigs();
                loadAnalytics();
            }
        } catch (err) { alert("Save failed"); }
    };

    const loadExpenses = async () => {
        try {
            const res = await fetch(`${API_URL}/api/admin/expenses?storeLocation=${selectedStore}`, {
                headers: { Authorization: token }
            });
            if (res.ok) setExpenses(await res.json());
        } catch (err) { console.error(err); }
    };

    const saveExpense = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/api/admin/expenses`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: token },
                body: JSON.stringify({ ...newExpense, storeLocation: newExpense.storeLocation || "Main Store" })
            });
            if (res.ok) {
                alert("Expense Logged!");
                setNewExpense({ category: "fuel", amount: 0, description: "", storeLocation: "Main Store" });
                loadExpenses();
                loadAnalytics();
            }
        } catch (err) { alert("Logging failed"); }
    };

    const deleteExpense = async (id) => {
        if (!window.confirm("Delete this expense?")) return;
        try {
            const res = await fetch(`${API_URL}/api/admin/expenses/${id}`, {
                method: "DELETE",
                headers: { Authorization: token }
            });
            if (res.ok) {
                loadExpenses();
                loadAnalytics();
            }
        } catch (err) { alert("Deletion failed"); }
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
                        onClick={() => setActiveTab("expenses")}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${activeTab === "expenses" ? "bg-blue-600" : "hover:bg-gray-800"}`}
                    >
                        <CreditCard size={20} />
                        <span>Expenses</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("store-settings")}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${activeTab === "store-settings" ? "bg-blue-600" : "hover:bg-gray-800"}`}
                    >
                        <Settings size={20} />
                        <span>Store Settings</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("customers")}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${activeTab === "customers" ? "bg-blue-600" : "hover:bg-gray-800"}`}
                    >
                        <User size={20} />
                        <span>Customers</span>
                    </button>
                    <button
                        onClick={() => { setActiveTab("team"); loadTeam(); }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${activeTab === "team" ? "bg-blue-600" : "hover:bg-gray-800"}`}
                    >
                        <Users size={20} />
                        <span>Team Management</span>
                    </button>
                    <button
                        onClick={() => { setActiveTab("system-logs"); loadSystemLogs(); }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${activeTab === "system-logs" ? "bg-blue-600" : "hover:bg-gray-800"}`}
                    >
                        <MessageSquare size={20} />
                        <span>System Logs</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("global-pricing")}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${activeTab === "global-pricing" ? "bg-blue-600" : "hover:bg-gray-800"}`}
                    >
                        <CreditCard size={20} />
                        <span>Global Pricing</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("inventory")}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${activeTab === "inventory" ? "bg-blue-600" : "hover:bg-gray-800"}`}
                    >
                        <Package size={20} />
                        <span>Inventory</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("loyalty")}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${activeTab === "loyalty" ? "bg-blue-600" : "hover:bg-gray-800"}`}
                    >
                        <Gem size={20} />
                        <span>Loyalty Hub</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("retention")}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${activeTab === "retention" ? "bg-blue-600" : "hover:bg-gray-800"}`}
                    >
                        <Heart size={20} />
                        <span>Retention</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("logs")}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${activeTab === "logs" ? "bg-blue-600" : "hover:bg-gray-800"}`}
                    >
                        <Bell size={20} />
                        <span>Notification Logs</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("engagement")}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${activeTab === "engagement" ? "bg-blue-600" : "hover:bg-gray-800"}`}
                    >
                        <Zap size={20} />
                        <span>Engagement</span>
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
                        {activeTab === "bookings" ? "Manage Bookings" : (activeTab === "loyalty" ? "Loyalty & Rewards" : "Account Settings")}
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

                    {/* LOYALTY HUB TAB */}
                    {activeTab === "loyalty" && (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Card className="bg-white border-none shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Points in System</span>
                                            <Gem className="text-indigo-500" size={16} />
                                        </div>
                                        <div className="text-3xl font-black text-slate-900 mt-2">{loyaltyStats.totalPoints.toLocaleString()} ★</div>
                                        <div className="text-[10px] text-slate-400 mt-1 uppercase font-bold">Estimated Liability: ₹{Math.floor(loyaltyStats.totalPoints/10)}</div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-white border-none shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Wallet Balance</span>
                                            <Wallet className="text-green-500" size={16} />
                                        </div>
                                        <div className="text-3xl font-black text-slate-900 mt-2">₹{loyaltyStats.totalWallet.toLocaleString()}</div>
                                        <div className="text-[10px] text-slate-400 mt-1 uppercase font-bold">Circulating Digital Currency</div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-white border-none shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Growth Engines</span>
                                            <Zap className="text-amber-500" size={16} />
                                        </div>
                                        <div className="text-[10px] font-bold text-slate-600 mt-4 leading-relaxed">
                                            Urban: Koramangala, Indiranagar (1.0x)<br/>
                                            Rural Bonus: Active for all other regions (1.5x)
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card className="border-none shadow-xl rounded-2xl bg-white overflow-hidden">
                                <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                                    <h3 className="font-black uppercase text-slate-900 text-sm tracking-tight">Customer Loyalty Ledger</h3>
                                    <div className="text-[10px] bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-black uppercase">{loyaltyUsers.length} Members</div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 border-b border-slate-100">
                                            <tr className="text-[9px] font-black uppercase text-slate-400 tracking-[0.1em]">
                                                <th className="px-6 py-4">Customer</th>
                                                <th className="px-6 py-4">Status & Points</th>
                                                <th className="px-6 py-4">Financials</th>
                                                <th className="px-6 py-4 text-right">Loyalty Growth</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {loyaltyUsers.map(user => (
                                                <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-slate-900">{user.name}</div>
                                                        <div className="text-[10px] text-slate-400 font-mono tracking-tighter">{user.phone}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`text-[9px] px-2 py-1 rounded-full font-black uppercase ${
                                                            user.loyaltyTier === 'Diamond' ? 'bg-cyan-100 text-cyan-700' :
                                                            user.loyaltyTier === 'Platinum' ? 'bg-indigo-100 text-indigo-700' :
                                                            user.loyaltyTier === 'Gold' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                                                        }`}>
                                                            {user.loyaltyTier}
                                                        </span>
                                                        <div className="text-[10px] font-black text-slate-900 mt-1">{user.loyaltyPoints} ★</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-xs font-black text-slate-900">₹{user.walletBalance}</div>
                                                        <div className="text-[9px] text-slate-400 uppercase font-bold">Wallet</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="text-xs font-black text-slate-900">₹{user.totalSpent}</div>
                                                        <div className="text-[9px] text-slate-400 uppercase font-bold">Lifetime Value</div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </div>
                    )}

                     {/* RETENTION TAB */}
                    {activeTab === "retention" && (
                        <div className="space-y-6 animate-in fade-in duration-500">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="bg-white border-none shadow-xl rounded-2xl p-8 bg-gradient-to-br from-indigo-50 to-white">
                                    <h3 className="text-xl font-black text-slate-900 mb-2 uppercase flex items-center">
                                        <Heart className="text-rose-500 mr-2" /> Churn Risk Scanner
                                    </h3>
                                    <p className="text-sm text-slate-500 mb-6 font-medium uppercase tracking-tight">Active scan for members inactive for 14+ Days</p>
                                    <div className="space-y-4">
                                        {atRiskUsers.length === 0 ? (
                                            <div className="text-center py-8 text-slate-400 font-bold uppercase text-[10px]">No high-risk members found. Excellent!</div>
                                        ) : (
                                            atRiskUsers.map(user => (
                                                <div key={user.phone} className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-indigo-50 hover:border-indigo-200 transition">
                                                    <div>
                                                        <div className="font-black text-slate-900 leading-tight">{user.name}</div>
                                                        <div className="text-[10px] font-bold text-slate-400">Last Visit: {user.lastBookingDate ? new Date(user.lastBookingDate).toLocaleDateString() : 'Never'}</div>
                                                    </div>
                                                    <Button 
                                                        onClick={() => window.open(`https://wa.me/${user.phone}?text=Hi ${user.name}, we miss you at LK Smart Wash! 🌪️ Use code WINBACK15 for 15% off your next booking.`, '_blank')}
                                                        className="bg-indigo-600 hover:bg-indigo-700 h-9 px-4 text-[10px] font-black uppercase tracking-widest text-white shadow-lg"
                                                    >
                                                        Win-back
                                                    </Button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </Card>
                                <Card className="bg-white border-none shadow-sm rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                                    <div className="h-16 w-16 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mb-4 animate-pulse">
                                        <TrendingUp size={30} />
                                    </div>
                                    <div className="text-2xl font-black text-slate-900 leading-none">{atRiskUsers.length}</div>
                                    <div className="text-[10px] font-black uppercase text-slate-400 mt-1">Customers at Risk</div>
                                </Card>
                             </div>
                        </div>
                    )}

                    {/* NOTIFICATION LOGS TAB */}
                    {activeTab === "logs" && (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            <Card className="border-none shadow-xl rounded-2xl bg-white overflow-hidden">
                                <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-slate-900 text-white">
                                    <h3 className="font-bold uppercase text-[10px] tracking-widest">Real-Time Notification Audit Board</h3>
                                    <RefreshCw className="animate-spin-slow cursor-pointer" size={16} onClick={loadSystemLogs} />
                                </div>
                                <div className="max-h-[600px] overflow-y-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 sticky top-0 z-10 border-b">
                                            <tr className="text-[9px] font-black uppercase text-slate-400">
                                                <th className="px-6 py-4">Time</th>
                                                <th className="px-6 py-4">Recipient</th>
                                                <th className="px-6 py-4">Message Feed</th>
                                                <th className="px-6 py-4 text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {systemLogs.map(log => (
                                                <tr key={log.id} className="hover:bg-blue-50/50 transition">
                                                    <td className="px-6 py-4 text-[10px] font-bold text-slate-400">{log.timestamp}</td>
                                                    <td className="px-6 py-4 text-[10px] font-black text-slate-900">{log.to}</td>
                                                    <td className="px-6 py-4 text-[11px] text-slate-600 font-medium italic">"{log.message}"</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className="text-[9px] px-2 py-1 rounded bg-emerald-100 text-emerald-700 font-black uppercase">Automated</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </div>
                    )}
                    {activeTab === "bookings" && (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Manage Bookings</h2>
                                <div className="flex flex-wrap gap-2">
                                    <Button onClick={downloadFullReportExcel} variant="outline" className="flex items-center gap-2">
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
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <div className="text-xs font-bold text-gray-700 flex items-center gap-1">
                                                                    {b.isFlashDelivery && <Zap size={12} className="text-amber-500 fill-amber-500 animate-pulse" />}
                                                                    {b.serviceType}
                                                                </div>
                                                                <div className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono font-bold uppercase border border-slate-200">
                                                                    {b.storeLocation || "Main Store"}
                                                                </div>
                                                            </div>
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
                                                                <div className="relative group">
                                                                    <Button 
                                                                        size="sm" 
                                                                        variant="ghost" 
                                                                        className={`text-amber-600 ${(['pending', 'ready_for_pickup'].includes(b.status)) ? 'animate-pulse' : 'opacity-50'}`}
                                                                        onClick={() => {
                                                                            const dId = prompt(`Available Drivers:\n${team.drivers.map(d => `${d.driverId}: ${d.name}`).join('\n')}\n\nEnter Driver ID to assign:`);
                                                                            if (dId) {
                                                                                const driver = team.drivers.find(d => d.driverId === dId);
                                                                                if (driver) assignDriver(b._id, driver._id, b.status === 'pending' ? 'pickup' : 'delivery');
                                                                                else alert("Driver not found");
                                                                            }
                                                                        }}
                                                                    >
                                                                        <Truck size={16} />
                                                                    </Button>
                                                                    {((b.pickupDriverId && !b.pickupAccepted) || (b.deliveryDriverId && !b.deliveryAccepted)) && (
                                                                        <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <Button 
                                                                    size="sm" 
                                                                    variant="ghost" 
                                                                    onClick={() => window.open(`https://wa.me/${b.phone}?text=Hi ${b.name}, your LK Smart Wash order #${b._id.toString().slice(-6)} is now ${b.status.replace(/_/g, ' ')}! 🌪️`, '_blank')}
                                                                    className="text-emerald-600 hover:bg-emerald-50"
                                                                >
                                                                    <ExternalLink size={16} />
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
                            {/* Analytics Toggle & Store Filter */}
                            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm gap-4">
                                <div className="flex bg-slate-100 p-1 rounded-xl">
                                    {['daily', 'weekly', 'monthly'].map((r) => (
                                        <button
                                            key={r}
                                            onClick={() => setAnalyticsRange(r)}
                                            className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${analyticsRange === r ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                        >
                                            {r.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex items-center gap-3">
                                    <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Focus Store:</Label>
                                    <select 
                                        value={selectedStore}
                                        onChange={(e) => setSelectedStore(e.target.value)}
                                        className="h-10 border-slate-200 rounded-lg border-2 px-3 text-xs font-bold outline-none focus:border-blue-500 bg-white"
                                    >
                                        <option value="All">All Locations (Global)</option>
                                        <option value="Main Store">Main Store</option>
                                        <option value="Downtown">Downtown Branch</option>
                                        <option value="West End">West End Branch</option>
                                        <option value="East Plaza">East Plaza Branch</option>
                                        <option value="South Mall">South Mall Branch</option>
                                    </select>
                                    <div className="flex gap-2">
                                        <Button onClick={downloadFullReportExcel} variant="ghost" size="sm" className="text-green-600 hover:bg-green-50">
                                            <Download size={18} />
                                        </Button>
                                        <Button onClick={downloadAnalyticsPDF} variant="ghost" size="sm" className="text-red-500 hover:bg-red-50">
                                            <FileText size={18} />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* PROFIT & LOSS SUMMARY CARDS */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                                <Card className="bg-white border-none shadow-lg border-l-4 border-l-blue-500">
                                    <CardContent className="p-6">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex justify-between">
                                            Gross Revenue <TrendingUp size={12} className="text-blue-500"/>
                                        </p>
                                        <p className="text-2xl font-black text-slate-900">₹{serverAnalytics.overview?.grossRevenue?.toLocaleString() || 0}</p>
                                        <p className="text-[10px] text-slate-400 mt-2">Total Service Value</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-white border-none shadow-lg border-l-4 border-l-indigo-400">
                                    <CardContent className="p-6">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex justify-between">
                                            Loyalty Discounts <Gem size={12} className="text-indigo-400"/>
                                        </p>
                                        <p className="text-2xl font-black text-indigo-600">₹{serverAnalytics.overview?.loyaltyDiscountTotal?.toLocaleString() || 0}</p>
                                        <p className="text-[10px] text-slate-400 mt-2">Points & Tier Savings</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-white border-none shadow-lg border-l-4 border-l-emerald-500">
                                    <CardContent className="p-6">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex justify-between">
                                            Net Revenue <CreditCard size={12} className="text-emerald-500"/>
                                        </p>
                                        <p className="text-2xl font-black text-emerald-600">₹{serverAnalytics.overview?.netRevenue?.toLocaleString() || 0}</p>
                                        <p className="text-[10px] text-slate-400 mt-2">Actual Cash Inflow</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-white border-none shadow-lg border-l-4 border-l-rose-500">
                                    <CardContent className="p-6">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex justify-between">
                                            Total Costs <Trash2 size={12} className="text-rose-500"/>
                                        </p>
                                        <p className="text-2xl font-black text-rose-600">₹{serverAnalytics.overview?.totalCosts?.toLocaleString() || 0}</p>
                                        <p className="text-[10px] text-slate-400 mt-2">Fixed + Operational</p>
                                    </CardContent>
                                </Card>
                                <Card className={`bg-white border-none shadow-lg border-l-4 ${serverAnalytics.overview?.monthlyTargetReached ? "border-l-green-500 shadow-green-100" : "border-l-orange-500"}`}>
                                    <CardContent className="p-6">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex justify-between">
                                            Monthly Target <Star size={12} className={serverAnalytics.overview?.monthlyTargetReached ? "text-green-500" : "text-orange-500"} fill="currentColor" />
                                        </p>
                                        <div className="flex items-end gap-1">
                                            <p className={`text-2xl font-black ${serverAnalytics.overview?.monthlyTargetReached ? "text-green-600" : "text-slate-900"}`}>
                                                {Math.round(((serverAnalytics.overview?.netRevenue || 0) / (serverAnalytics.overview?.monthlyTarget || 1)) * 100)}%
                                            </p>
                                        </div>
                                        <div className="w-full h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-1000 ${serverAnalytics.overview?.monthlyTargetReached ? "bg-green-500" : "bg-orange-500"}`}
                                                style={{ width: `${Math.min(100, ((serverAnalytics.overview?.netRevenue || 0) / (serverAnalytics.overview?.monthlyTarget || 1)) * 100)}%` }}
                                            ></div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* GROWTH KPIs */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Card className="bg-white border-none shadow-sm rounded-2xl p-6 bg-gradient-to-br from-indigo-50 to-white">
                                    <h4 className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-2 flex items-center gap-1">
                                        <Users size={12} /> Viral Coefficient
                                    </h4>
                                    <div className="text-2xl font-black text-slate-900">
                                        {(serverAnalytics.acquisitionSource?.find(s => s.name === "Referral")?.value / (serverAnalytics.acquisitionSource?.reduce((acc, s) => acc + s.value, 0) || 1)).toFixed(2)}
                                    </div>
                                    <div className="text-[9px] font-bold text-indigo-300 uppercase mt-1">New users per existing member</div>
                                </Card>
                                <Card className="bg-white border-none shadow-sm rounded-2xl p-6">
                                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 flex items-center gap-1">
                                        <Share2 size={12} className="text-emerald-500" /> Referral Revenue
                                    </h4>
                                    <div className="text-2xl font-black text-slate-900">
                                        ₹{(serverAnalytics.overview?.netRevenue * 0.24).toLocaleString()}
                                    </div>
                                    <div className="text-[9px] font-bold text-slate-400 uppercase mt-1">Est. community-driven value</div>
                                </Card>
                                <Card className="bg-white border-none shadow-sm rounded-2xl p-6 overflow-hidden relative">
                                    <div className="absolute -right-4 -bottom-4 opacity-5">
                                        <Sparkles size={100} />
                                    </div>
                                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 flex items-center gap-1">
                                        <Trophy size={12} className="text-amber-500" /> Active Ambassadors
                                    </h4>
                                    <div className="text-2xl font-black text-slate-900">
                                        {Math.floor(serverAnalytics.acquisitionSource?.find(s => s.name === "Referral")?.value / 2.5)}
                                    </div>
                                    <div className="text-[9px] font-bold text-slate-400 uppercase mt-1">High-impact referrers</div>
                                </Card>
                            </div>

                            {/* CHARTS */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <Card className="bg-white border-none shadow-xl rounded-2xl p-6">
                                    <div className="flex justify-between items-center mb-8">
                                        <div>
                                            <h3 className="text-lg font-black text-slate-800">Revenue Performance</h3>
                                            <p className="text-xs text-slate-400">Color-coded dots track against Daily Branch Goals</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                            <span className="text-[10px] font-bold text-slate-400">MEETS GOAL</span>
                                            <div className="w-3 h-3 rounded-full bg-rose-500 ml-2"></div>
                                            <span className="text-[10px] font-bold text-slate-400">BELOW TARGET</span>
                                        </div>
                                    </div>
                                    <div className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RAreaChart data={serverAnalytics.revenueByTime}>
                                                <defs>
                                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                                                <RTooltip 
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                                    itemStyle={{ fontWeight: 'bold' }}
                                                />
                                                <Area 
                                                    type="monotone" 
                                                    dataKey="value" 
                                                    stroke="#3b82f6" 
                                                    strokeWidth={4}
                                                    fillOpacity={1} 
                                                    fill="url(#colorValue)" 
                                                    dot={(props) => {
                                                        const { cx, cy, payload } = props;
                                                        const color = payload.targetReached ? "#10b981" : "#f43f5e";
                                                        return (
                                                            <circle cx={cx} cy={cy} r={4} fill={color} stroke="#fff" strokeWidth={2} />
                                                        );
                                                    }}
                                                />
                                            </RAreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Card>

                                <Card className="bg-white border-none shadow-xl rounded-2xl p-6">
                                    <h3 className="text-lg font-black text-slate-800 mb-8 flex items-center justify-between">
                                        Acquisition Growth
                                        <div className="text-[10px] font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100 uppercase">Referral vs Direct</div>
                                    </h3>
                                    <div className="h-[300px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RPieChart>
                                                <Pie
                                                    data={serverAnalytics.acquisitionSource}
                                                    innerRadius={80}
                                                    outerRadius={100}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {serverAnalytics.acquisitionSource?.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <RTooltip 
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                                    itemStyle={{ fontWeight: 'black', fontSize: '12px' }}
                                                />
                                                <RLegend verticalAlign="bottom" height={36}/>
                                            </RPieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    )}

                    {/* EXPENSES TAB */}
                    {activeTab === "expenses" && (
                        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900">Operational Expenses</h2>
                                    <p className="text-sm text-gray-400">Total Logged: ₹{expenses.reduce((s, e) => s + e.amount, 0).toLocaleString()}</p>
                                </div>
                                <div className="p-3 bg-rose-50 rounded-xl text-rose-600"><CreditCard size={24}/></div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <Card className="bg-white border-none shadow-xl lg:col-span-1">
                                    <CardContent className="p-6">
                                        <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2 uppercase text-xs tracking-widest">
                                            <TrendingUp size={14} className="text-blue-500"/> Log New Expense
                                        </h3>
                                        <form onSubmit={saveExpense} className="space-y-4">
                                            <div>
                                                <Label className="text-[10px] font-bold text-gray-400 uppercase">Category</Label>
                                                <select 
                                                    value={newExpense.category}
                                                    onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                                                    className="w-full h-11 border-slate-200 rounded-xl border-2 px-4 shadow-sm outline-none focus:border-blue-500 text-sm font-bold mt-1"
                                                >
                                                    <option value="fuel">Fuel / Petrol</option>
                                                    <option value="chemicals">Chemicals & Detergents</option>
                                                    <option value="maintenance">Machine Maintenance</option>
                                                    <option value="salaries">Staff Salaries</option>
                                                    <option value="rent">Shop Rent</option>
                                                    <option value="other">Other Misc</option>
                                                </select>
                                            </div>
                                            <div>
                                                <Label className="text-[10px] font-bold text-gray-400 uppercase">Amount (₹)</Label>
                                                <Input 
                                                    type="number" 
                                                    placeholder="Enter amount..."
                                                    value={newExpense.amount}
                                                    onChange={(e) => setNewExpense({...newExpense, amount: parseFloat(e.target.value)})}
                                                    className="h-11 rounded-xl font-bold"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-[10px] font-bold text-gray-400 uppercase">Store Location</Label>
                                                <select 
                                                    value={newExpense.storeLocation}
                                                    onChange={(e) => setNewExpense({...newExpense, storeLocation: e.target.value})}
                                                    className="w-full h-11 border-slate-200 rounded-xl border-2 px-4 shadow-sm outline-none focus:border-blue-500 text-sm font-bold mt-1"
                                                >
                                                    <option value="Main Store">Main Store</option>
                                                    <option value="Downtown">Downtown Branch</option>
                                                    <option value="West End">West End Branch</option>
                                                    <option value="East Plaza">East Plaza Branch</option>
                                                    <option value="South Mall">South Mall Branch</option>
                                                </select>
                                            </div>
                                            <div>
                                                <Label className="text-[10px] font-bold text-gray-400 uppercase">Short Description</Label>
                                                <Input 
                                                    placeholder="e.g. Petrol for delivery bike"
                                                    value={newExpense.description}
                                                    onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                                                    className="h-11 rounded-xl"
                                                />
                                            </div>
                                            <Button type="submit" className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-100">
                                                Log Expense
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>

                                <Card className="bg-white border-none shadow-xl lg:col-span-2 overflow-hidden rounded-2xl">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50 border-b border-gray-100 font-bold text-[10px] text-gray-400 uppercase tracking-widest">
                                                <tr>
                                                    <th className="px-6 py-4">Expense Details</th>
                                                    <th className="px-6 py-4 text-center">Amount</th>
                                                    <th className="px-6 py-4 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {expenses.map((e) => (
                                                    <tr key={e._id} className="hover:bg-slate-50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="font-bold text-gray-900 capitalize">{e.category}</div>
                                                            <div className="text-[10px] text-gray-400">{e.description} • {e.storeLocation}</div>
                                                            <div className="text-[9px] font-mono text-slate-300 uppercase mt-1">{new Date(e.date).toLocaleDateString()}</div>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <div className="font-black text-rose-600">₹{e.amount?.toLocaleString()}</div>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <Button size="sm" variant="ghost" onClick={() => deleteExpense(e._id)} className="text-red-400">
                                                                <Trash2 size={16} />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    )}

                    {/* STORE SETTINGS TAB */}
                    {activeTab === "store-settings" && (
                        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900">Branch Goal Configuration</h2>
                                    <p className="text-sm text-gray-400">Set daily and monthly targets per location</p>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><Settings size={24}/></div>
                            </div>

                            <Card className="bg-white border-none shadow-xl p-8">
                                <form onSubmit={saveStoreConfig} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    <div className="space-y-4">
                                        <h3 className="font-black text-xs text-slate-400 uppercase tracking-widest border-b pb-2">Select Branch</h3>
                                        <div>
                                            <Label className="text-[10px] font-bold text-gray-400 uppercase">Store Name</Label>
                                            <select 
                                                value={newConfig.locationName}
                                                onChange={(e) => setNewConfig({...newConfig, locationName: e.target.value})}
                                                className="w-full h-11 border-slate-200 rounded-xl border-2 px-4 shadow-sm outline-none focus:border-blue-500 text-sm font-bold mt-1"
                                            >
                                                <option value="Main Store">Main Store</option>
                                                <option value="Downtown">Downtown Branch</option>
                                                <option value="West End">West End Branch</option>
                                                <option value="East Plaza">East Plaza Branch</option>
                                                <option value="South Mall">South Mall Branch</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="font-black text-xs text-slate-400 uppercase tracking-widest border-b pb-2">Revenue Targets</h3>
                                        <div>
                                            <Label className="text-[10px] font-bold text-gray-400 uppercase">Daily Goal (₹)</Label>
                                            <Input 
                                                type="number"
                                                value={newConfig.dailyGoal}
                                                onChange={(e) => setNewConfig({...newConfig, dailyGoal: parseFloat(e.target.value)})}
                                                className="h-11 rounded-xl font-bold"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-[10px] font-bold text-gray-400 uppercase">Monthly Goal (₹)</Label>
                                            <Input 
                                                type="number"
                                                value={newConfig.monthlyGoal}
                                                onChange={(e) => setNewConfig({...newConfig, monthlyGoal: parseFloat(e.target.value)})}
                                                className="h-11 rounded-xl font-bold"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="font-black text-xs text-slate-400 uppercase tracking-widest border-b pb-2">Fixed Monthly Costs</h3>
                                        <div>
                                            <Label className="text-[10px] font-bold text-gray-400 uppercase">Total Salaries (₹)</Label>
                                            <Input 
                                                type="number"
                                                value={newConfig.salaries}
                                                onChange={(e) => setNewConfig({...newConfig, salaries: parseFloat(e.target.value)})}
                                                className="h-11 rounded-xl font-bold"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-[10px] font-bold text-gray-400 uppercase">Shop Rent (₹)</Label>
                                            <Input 
                                                type="number"
                                                value={newConfig.rent}
                                                onChange={(e) => setNewConfig({...newConfig, rent: parseFloat(e.target.value)})}
                                                className="h-11 rounded-xl font-bold"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-[10px] font-bold text-gray-400 uppercase">Fuel Est. (₹)</Label>
                                            <Input 
                                                type="number"
                                                value={newConfig.fuel}
                                                onChange={(e) => setNewConfig({...newConfig, fuel: parseFloat(e.target.value)})}
                                                className="h-11 rounded-xl font-bold"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-[10px] font-bold text-gray-400 uppercase">Chemicals (₹)</Label>
                                            <Input 
                                                type="number"
                                                value={newConfig.chemicals}
                                                onChange={(e) => setNewConfig({...newConfig, chemicals: parseFloat(e.target.value)})}
                                                className="h-11 rounded-xl font-bold"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-[10px] font-bold text-gray-400 uppercase">Maintenance (₹)</Label>
                                            <Input 
                                                type="number"
                                                value={newConfig.maintenance}
                                                onChange={(e) => setNewConfig({...newConfig, maintenance: parseFloat(e.target.value)})}
                                                className="h-11 rounded-xl font-bold"
                                            />
                                        </div>
                                    </div>

                                    <div className="lg:col-span-3 pt-4 border-t">
                                        <Button type="submit" className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-blue-100 rounded-2xl transition-all hover:scale-[1.01] active:scale-95">
                                            Update Store Settings & Goals
                                        </Button>
                                    </div>
                                </form>
                            </Card>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {storeConfigs.map((cfg) => (
                                    <Card key={cfg._id} className="bg-white border-slate-100 shadow-lg p-6 hover:border-blue-200 transition-all">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs">
                                                {cfg.locationName.substring(0, 2).toUpperCase()}
                                            </div>
                                            <h4 className="font-black text-slate-800 uppercase tracking-tighter">{cfg.locationName}</h4>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-slate-400">Daily Goal:</span>
                                                <span className="font-bold text-blue-600">₹{cfg.dailyGoal?.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-slate-400">Monthly Goal:</span>
                                                <span className="font-bold text-indigo-600">₹{cfg.monthlyGoal?.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-xs pt-2 border-t">
                                                <span className="text-slate-400">Fixed Cost Load:</span>
                                                <span className="font-bold text-slate-900">₹{((cfg.fixedCosts?.salaries || 0) + (cfg.fixedCosts?.rent || 0) + (cfg.fixedCosts?.fuel || 0) + (cfg.fixedCosts?.chemicals || 0) + (cfg.fixedCosts?.maintenance || 0)).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
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

                    {/* TEAM MANAGEMENT TAB */}
                    {activeTab === "team" && (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Workforce Management</h2>
                                    <p className="text-sm text-gray-400">Manage Staff and Driver credentials.</p>
                                </div>
                                <div className="flex gap-3">
                                    <Button onClick={() => setIsCreatingMember(!isCreatingMember)} className="bg-blue-600 hover:bg-blue-700">
                                        <UserPlus size={18} className="mr-2" /> {isCreatingMember ? "Cancel" : "Add Team Member"}
                                    </Button>
                                </div>
                            </div>

                            {isCreatingMember && (
                                <Card className="bg-white border-none shadow-xl rounded-2xl animate-in slide-in-from-top-4 duration-300">
                                    <CardContent className="p-8">
                                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                                            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mr-3"><UserPlus size={18}/></div>
                                            Create New workforce Account
                                        </h3>
                                        <form onSubmit={createTeamMember} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest pl-1">Role</Label>
                                                <select 
                                                    value={newMember.role}
                                                    onChange={(e) => setNewMember({...newMember, role: e.target.value})}
                                                    className="w-full h-12 border-slate-200 rounded-lg border-2 px-3 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                                                >
                                                    <option value="staff">Staff Member</option>
                                                    <option value="driver">Delivery Driver</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest pl-1">Full Name</Label>
                                                <Input 
                                                    placeholder="e.g. John Doe"
                                                    value={newMember.name}
                                                    onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                                                    className="h-12 border-slate-200"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest pl-1">Workforce ID (LoginID)</Label>
                                                <Input 
                                                    placeholder="e.g. staff_01"
                                                    value={newMember.id}
                                                    onChange={(e) => setNewMember({...newMember, id: e.target.value})}
                                                    className="h-12 border-slate-200 uppercase"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest pl-1">Store Location Assignment</Label>
                                                <select 
                                                    value={newMember.storeLocation || "Main Store"}
                                                    onChange={(e) => setNewMember({...newMember, storeLocation: e.target.value})}
                                                    className="w-full h-12 border-slate-200 rounded-lg border-2 px-3 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                                                >
                                                    <option value="Main Store">Main Store (Default)</option>
                                                    <option value="Downtown">Downtown Branch</option>
                                                    <option value="West End">West End Branch</option>
                                                    <option value="East Plaza">East Plaza Branch</option>
                                                    <option value="South Mall">South Mall Branch</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest pl-1">Login Password</Label>
                                                <Input 
                                                    type="password"
                                                    placeholder="Minimum 4 characters"
                                                    value={newMember.password}
                                                    onChange={(e) => setNewMember({...newMember, password: e.target.value})}
                                                    className="h-12 border-slate-200"
                                                    required
                                                    minLength="4"
                                                />
                                            </div>
                                            <div className="md:col-span-2 flex justify-end">
                                                <Button type="submit" className="h-12 px-8 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100">
                                                    Authorize & Create Account
                                                </Button>
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>
                            )}

                            {editingMember && (
                                <Card className="bg-blue-50 border-2 border-blue-200 shadow-xl rounded-2xl animate-in zoom-in-95 duration-300">
                                    <CardContent className="p-8">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-lg font-bold text-blue-900 flex items-center">
                                                <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center mr-3"><Lock size={18}/></div>
                                                Update Credentials: {editingMember.role.toUpperCase()}
                                            </h3>
                                            <Button variant="ghost" onClick={() => setEditingMember(null)} className="text-blue-600">Cancel</Button>
                                        </div>
                                        <form onSubmit={updateTeamMember} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] uppercase font-bold text-blue-400 tracking-widest pl-1">New ID (Optional)</Label>
                                                <Input 
                                                    placeholder="Leave blank to keep current"
                                                    value={editingMember.id}
                                                    onChange={(e) => setEditingMember({...editingMember, id: e.target.value})}
                                                    className="h-12 border-blue-200 bg-white"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] uppercase font-bold text-blue-400 tracking-widest pl-1">New Password (Optional)</Label>
                                                <Input 
                                                    type="password"
                                                    placeholder="Leave blank to keep current"
                                                    value={editingMember.password}
                                                    onChange={(e) => setEditingMember({...editingMember, password: e.target.value})}
                                                    className="h-12 border-blue-200 bg-white"
                                                />
                                            </div>
                                            <div className="md:col-span-2 flex justify-end">
                                                <Button type="submit" className="h-12 px-8 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100">
                                                    Commit Changes
                                                </Button>
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>
                            )}

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Staff List */}
                                <Card className="bg-white border-none shadow-xl overflow-hidden rounded-2xl">
                                    <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                                        <h4 className="font-bold text-gray-900 flex items-center"><UserCheck size={18} className="mr-2 text-blue-500" /> Staff Members</h4>
                                        <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold">{team.staff.length} Active</span>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50/50">
                                                <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                    <th className="px-6 py-4">Name & ID</th>
                                                    <th className="px-6 py-4 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {team.staff.map((s) => (
                                                    <tr key={s._id} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="font-bold text-gray-900">{s.name}</div>
                                                            <div className="text-[10px] text-blue-600 font-mono font-bold">{s.staffId}</div>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Button size="sm" variant="ghost" onClick={() => setEditingMember({ role: "staff", dbId: s._id, id: "", password: "" })} className="text-gray-400 hover:text-blue-600">
                                                                    <Settings size={16} />
                                                                </Button>
                                                                <Button size="sm" variant="ghost" onClick={() => deleteTeamMember("staff", s._id)} className="text-gray-400 hover:text-red-500">
                                                                    <Trash2 size={16} />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>

                                {/* Driver List */}
                                <Card className="bg-white border-none shadow-xl overflow-hidden rounded-2xl">
                                    <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                                        <h4 className="font-bold text-gray-900 flex items-center"><Truck size={18} className="mr-2 text-purple-500" /> Logistics Drivers</h4>
                                        <span className="text-xs bg-purple-50 text-purple-600 px-3 py-1 rounded-full font-bold">{team.drivers.length} Active</span>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50/50">
                                                <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                    <th className="px-6 py-4">Name & ID</th>
                                                    <th className="px-6 py-4 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {team.drivers.map((d) => (
                                                    <tr key={d._id} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="font-bold text-gray-900">{d.name}</div>
                                                            <div className="text-[10px] text-purple-600 font-mono font-bold">{d.driverId}</div>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Button size="sm" variant="ghost" onClick={() => setEditingMember({ role: "driver", dbId: d._id, id: "", password: "" })} className="text-gray-400 hover:text-blue-600">
                                                                    <Settings size={16} />
                                                                </Button>
                                                                <Button size="sm" variant="ghost" onClick={() => deleteTeamMember("driver", d._id)} className="text-gray-400 hover:text-red-500">
                                                                    <Trash2 size={16} />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    )}
                    {/* GLOBAL PRICING TAB */}
                    {activeTab === "global-pricing" && (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            <Card className="bg-white border-none shadow-xl rounded-2xl overflow-hidden">
                                <CardContent className="p-8">
                                    <div className="flex justify-between items-center mb-8">
                                        <div>
                                            <h3 className="text-2xl font-black text-gray-900">Global Pricing Manager</h3>
                                            <p className="text-sm text-gray-400 font-medium">Set unified rates for all LK Smart Wash branches.</p>
                                        </div>
                                        <Button onClick={saveGlobalConfig} className="bg-blue-600 hover:bg-blue-700 h-10 shadow-lg shadow-blue-100">
                                            Save All Price Changes
                                        </Button>
                                    </div>

                                    <div className="space-y-4">
                                        {globalPricing.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 group transition-all hover:bg-white hover:shadow-md">
                                                <div className="flex-1">
                                                    <Label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest block mb-1">Service Name</Label>
                                                    <Input 
                                                        value={item.serviceName}
                                                        onChange={(e) => {
                                                            const newP = [...globalPricing];
                                                            newP[idx].serviceName = e.target.value;
                                                            setGlobalPricing(newP);
                                                        }}
                                                        className="bg-transparent border-none font-bold text-gray-800 p-0 h-auto focus:ring-0"
                                                    />
                                                </div>
                                                <div className="w-32">
                                                    <Label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest block mb-1">Price (₹)</Label>
                                                    <Input 
                                                        type="number"
                                                        value={item.price}
                                                        onChange={(e) => {
                                                            const newP = [...globalPricing];
                                                            newP[idx].price = Number(e.target.value);
                                                            setGlobalPricing(newP);
                                                        }}
                                                        className="font-black text-blue-600 border-slate-200"
                                                    />
                                                </div>
                                                <Button 
                                                    variant="ghost" 
                                                    className="self-end text-gray-300 hover:text-red-500"
                                                    onClick={() => setGlobalPricing(globalPricing.filter((_, i) => i !== idx))}
                                                >
                                                    <Trash2 size={18} />
                                                </Button>
                                            </div>
                                        ))}

                                        <div className="flex items-center gap-4 p-6 bg-blue-50/50 rounded-2xl border-2 border-dashed border-blue-200 mt-8">
                                            <div className="flex-1">
                                                <Input 
                                                    placeholder="Enter New Service Name"
                                                    value={newPrice.serviceName}
                                                    onChange={(e) => setNewPrice({...newPrice, serviceName: e.target.value})}
                                                    className="border-blue-100"
                                                />
                                            </div>
                                            <div className="w-32">
                                                <Input 
                                                    type="number"
                                                    placeholder="Price"
                                                    value={newPrice.price}
                                                    onChange={(e) => setNewPrice({...newPrice, price: Number(e.target.value)})}
                                                    className="border-blue-100"
                                                />
                                            </div>
                                            <Button 
                                                onClick={() => {
                                                    if (!newPrice.serviceName || !newPrice.price) return;
                                                    setGlobalPricing([...globalPricing, newPrice]);
                                                    setNewPrice({ serviceName: "", price: 0 });
                                                }}
                                                className="bg-blue-600"
                                            >
                                                <Plus size={18} className="mr-2" /> Add
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* INVENTORY TAB */}
                    {activeTab === "inventory" && (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <Card className="lg:col-span-2 bg-white border-none shadow-xl rounded-2xl overflow-hidden">
                                    <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                                        <div>
                                            <h3 className="text-2xl font-black text-gray-900">Supply Chain Oversight</h3>
                                            <p className="text-sm text-gray-400">Monitor detergent and chemical stock levels.</p>
                                        </div>
                                        <Button variant="outline" onClick={loadInventory} className="text-gray-400"><RefreshCw size={16}/></Button>
                                    </div>
                                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {inventory.map((item) => (
                                            <div key={item._id} className="p-6 rounded-2xl border border-gray-100 bg-gray-50/50 flex flex-col gap-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-black text-gray-900 leading-tight">{item.itemName}</h4>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Refilled {new Date(item.lastRefill).toLocaleDateString()}</p>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${item.quantity < 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                                        {item.quantity < 5 ? 'LOW STOCK' : 'IN STOCK'}
                                                    </span>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-xs font-bold text-gray-500">
                                                        <span>{item.quantity} / 50 {item.unit}</span>
                                                        <span>{Math.round((item.quantity/50)*100)}%</span>
                                                    </div>
                                                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                                        <div 
                                                            className={`h-full transition-all duration-1000 ${
                                                                item.quantity < 5 ? 'bg-red-500' : 'bg-blue-500'
                                                            }`} 
                                                            style={{ width: `${Math.min((item.quantity/50)*100, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>

                                <Card className="bg-white border-none shadow-xl rounded-2xl overflow-hidden h-fit">
                                    <CardContent className="p-8">
                                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                                            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mr-3"><Plus size={18}/></div>
                                            Refill Supplies
                                        </h3>
                                        <form onSubmit={updateInventory} className="space-y-6">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest pl-1">Item Name</Label>
                                                <select 
                                                    value={newInv.itemName}
                                                    onChange={(e) => setNewInv({...newInv, itemName: e.target.value})}
                                                    className="w-full h-12 border-slate-200 rounded-xl border-2 px-3 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                                                >
                                                    <option value="">Select Item...</option>
                                                    {inventory.map(i => <option key={i._id} value={i.itemName}>{i.itemName}</option>)}
                                                    <option value="New Item">Add New Item...</option>
                                                </select>
                                                {newInv.itemName === "New Item" && (
                                                    <Input 
                                                        placeholder="Enter Item Name"
                                                        onChange={(e) => setNewInv({...newInv, itemName: e.target.value})}
                                                        className="h-12 border-slate-200 mt-2"
                                                    />
                                                )}
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest pl-1">Quantity</Label>
                                                    <Input 
                                                        type="number"
                                                        value={newInv.quantity}
                                                        onChange={(e) => setNewInv({...newInv, quantity: Number(e.target.value)})}
                                                        className="h-12 border-slate-200"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest pl-1">Unit</Label>
                                                    <select 
                                                        value={newInv.unit}
                                                        onChange={(e) => setNewInv({...newInv, unit: e.target.value})}
                                                        className="w-full h-12 border-slate-200 rounded-xl border-2 px-3 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                                                    >
                                                        <option value="liters">Liters</option>
                                                        <option value="units">Units</option>
                                                        <option value="kg">Kg</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100">
                                                Update Stock Level
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>
                            </div>
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
