import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
    Truck, 
    Smartphone, 
    Navigation, 
    CheckCircle2, 
    LogOut, 
    Package, 
    Clock, 
    MapPin,
    AlertCircle,
    RotateCcw,
    Camera,
    Image as ImageIcon
} from "lucide-react";
import { Button } from "../components/ui/Button.jsx";
import { Card, CardContent } from "../components/ui/Card.jsx";
import { Input } from "../components/ui/Input.jsx";
import API_URL from "../api";

export default function DriverPortal() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("pickup"); // pickup or delivery
    const navigate = useNavigate();
    const token = localStorage.getItem("driverToken");
    const driverName = localStorage.getItem("driverName");

    useEffect(() => {
        if (!token) {
            navigate("/driver-login");
            return;
        }
        fetchTasks();
    }, [token]);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/driver/tasks`, {
                headers: { "Authorization": token }
            });
            if (res.ok) {
                const data = await res.json();
                setTasks(data);
            } else {
                localStorage.removeItem("driverToken");
                navigate("/driver-login");
            }
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (id, type) => {
        try {
            const res = await fetch(`${API_URL}/api/bookings/${id}/accept-task`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token
                },
                body: JSON.stringify({ type })
            });
            if (res.ok) {
                fetchTasks();
                alert("Task Accepted! Status updated.");
            }
        } catch (err) {
            alert("Error: Could not accept task.");
        }
    };

    const handleUpdate = async (id, status) => {
        try {
            const res = await fetch(`${API_URL}/api/driver/tasks/${id}/update`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token
                },
                body: JSON.stringify({ 
                    status: task.status, // Original status (pending or ready_for_pickup)
                    photo: activeTab === 'pickup' ? task.pickupPhoto : task.deliveryPhoto 
                })
            });
            if (res.ok) {
                fetchTasks();
                alert("Status Updated Successfully!");
            }
        } catch (err) {
            alert("Error: Could not update status.");
        }
    };

    const logout = () => {
        localStorage.removeItem("driverToken");
        navigate("/driver-login");
    };

    const pickups = tasks.filter(t => t.pickupDriverId && (t.status === "pending" || t.status === "received"));
    const deliveries = tasks.filter(t => t.deliveryDriverId && (t.status === "ready_for_pickup" || t.status === "delivered"));
    const activeTasks = activeTab === "pickup" ? pickups : deliveries;

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full font-black text-blue-600"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-20 animate-in fade-in duration-700">
            {/* Staff Header */}
            <header className="bg-white px-6 py-8 border-b-2 border-gray-100 sticky top-0 z-50">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 leading-none">Hi, {driverName}</h2>
                        <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-2">Staff Terminal Mode</p>
                    </div>
                    <button onClick={logout} className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all">
                        <LogOut size={20} />
                    </button>
                </div>
                
                {/* Mobile Tabs */}
                <div className="flex bg-gray-100 p-1 rounded-2xl">
                    <button 
                        onClick={() => setActiveTab("pickup")}
                        className={`flex-1 py-3 font-black uppercase text-xs rounded-xl transition ${activeTab === "pickup" ? "bg-white text-blue-600 shadow-sm" : "text-gray-400"}`}
                    >
                        Pickups ({pickups.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab("delivery")}
                        className={`flex-1 py-3 font-black uppercase text-xs rounded-xl transition ${activeTab === "delivery" ? "bg-white text-blue-600 shadow-sm" : "text-gray-400"}`}
                    >
                        Deliveries ({deliveries.length})
                    </button>
                </div>
            </header>

            <main className="px-4 py-6 space-y-6">
                {activeTasks.length === 0 ? (
                    <div className="text-center py-20 animate-in zoom-in duration-500">
                        <div className="bg-white h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <CheckCircle2 size={40} className="text-green-500" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 uppercase">You're All Caught Up!</h3>
                        <p className="text-gray-400 text-sm mt-1 uppercase font-bold tracking-widest">No tasks pending in this tab</p>
                        <Button onClick={fetchTasks} variant="ghost" className="mt-6 text-blue-600 font-black">
                            <RotateCcw size={16} className="mr-2" /> Refresh
                        </Button>
                    </div>
                ) : (
                    activeTasks.map((task) => (
                        <Card key={task._id} className="border-none shadow-md overflow-hidden animate-in slide-in-from-bottom duration-500">
                            <CardContent className="p-0">
                                {/* Order ID Bar */}
                                <div className="bg-gray-900 text-white px-6 py-2 flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-widest">Order ID: #{task._id.slice(-6)}</span>
                                    <span className="text-[10px] bg-blue-600 px-2 py-1 rounded font-black uppercase">{task.serviceType}</span>
                                </div>
                                
                                <div className="p-6 space-y-6">
                                    <div className="flex items-start space-x-4">
                                        <div className="bg-blue-50 p-3 rounded-2xl">
                                            <MapPin size={24} className="text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-xl font-black text-gray-900">{task.name}</h4>
                                            <p className="text-xs text-gray-500 mt-1 leading-relaxed font-medium">
                                                {task.address}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Grid */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <a href={`tel:${task.phone}`} className="flex-1">
                                            <Button variant="outline" className="w-full h-14 border-2 border-gray-100 rounded-2xl flex items-center justify-center font-black uppercase text-xs text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-600">
                                                <Smartphone size={18} className="mr-2" /> Call
                                            </Button>
                                        </a>
                                        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(task.address)}`} target="_blank" rel="noopener noreferrer" className="flex-1">
                                            <Button variant="outline" className="w-full h-14 border-2 border-gray-100 rounded-2xl flex items-center justify-center font-black uppercase text-xs text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-600">
                                                <Navigation size={18} className="mr-2" /> Navigate
                                            </Button>
                                        </a>
                                    </div>

                                    {/* Status Confirm Button */}
                                    {((activeTab === 'pickup' && !task.pickupAccepted) || (activeTab === 'delivery' && !task.deliveryAccepted)) ? (
                                        <Button 
                                            onClick={() => handleAccept(task._id, activeTab)}
                                            className="w-full h-16 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black uppercase text-sm shadow-xl shadow-amber-100 transition-all active:scale-95"
                                        >
                                            <CheckCircle2 size={18} className="mr-2" />
                                            Accept {activeTab === "pickup" ? "Pickup" : "Delivery"}
                                        </Button>
                                    ) : (
                                        <div className="space-y-3">
                                            {/* Photo Upload Simulation */}
                                            <div className="p-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center space-y-2">
                                                {((activeTab === 'pickup' && task.pickupPhoto) || (activeTab === 'delivery' && task.deliveryPhoto)) ? (
                                                    <div className="text-center">
                                                        <CheckCircle2 className="text-green-500 mx-auto mb-1" size={20} />
                                                        <p className="text-[10px] font-black uppercase text-green-600">Photo Secured</p>
                                                    </div>
                                                ) : (
                                                    <Button 
                                                        variant="ghost" 
                                                        className="text-blue-600 font-black text-[10px] uppercase tracking-widest h-auto p-0"
                                                        onClick={() => {
                                                            const mockUrl = "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?q=80&w=2071&auto=format&fit=crop";
                                                            task[activeTab === 'pickup' ? 'pickupPhoto' : 'deliveryPhoto'] = mockUrl;
                                                            alert("Photo Captured! (Simulation)");
                                                            setTasks([...tasks]);
                                                        }}
                                                    >
                                                        <Camera size={20} className="mr-2" /> Capture Proof Photo
                                                    </Button>
                                                )}
                                            </div>

                                            <Button 
                                                onClick={() => handleUpdate(task._id, task.status)}
                                                className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase text-sm shadow-xl shadow-blue-100 transition-all active:scale-95"
                                            >
                                                <CheckCircle2 size={18} className="mr-2" />
                                                Confirm {activeTab === "pickup" ? "Pickup Arrival" : "Delivery Completion"}
                                            </Button>
                                        </div>
                                    )}
                                    
                                    <div className="text-center">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center justify-center">
                                            <Clock size={12} className="mr-1" /> Requested {new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </main>
        </div>
    );
}
