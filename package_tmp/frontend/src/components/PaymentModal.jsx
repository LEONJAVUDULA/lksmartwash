import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { X, CheckCircle, Smartphone, CreditCard } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { businessInfo } from '../mockData';
import API_URL from '../api';

export const PaymentModal = ({ isOpen, onClose, amount, bookingId, onPaymentSuccess }) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  // UPI Intent URL Model
  // pa: Payee VPA, pn: Payee Name, am: Amount, cu: Currency, tn: Transaction Note
  const upiId = businessInfo.upiId || "lksmartwash@okaxis";
  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent("LK Smart Wash")}&am=${amount}&cu=INR&tn=${encodeURIComponent("Laundry Service " + bookingId.slice(-6))}`;

  const handleSimulateSuccess = async () => {
    setIsSimulating(true);
    try {
      const response = await fetch(`${API_URL}/api/bookings/${bookingId}/payment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token') // Use token if available, but for public checkout we might need a separate endpoint or permissive check
        },
        body: JSON.stringify({
          paymentStatus: 'paid',
          paymentMethod: 'upi'
        })
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          onPaymentSuccess();
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error("Payment simulation failed:", error);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md bg-white overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="relative p-6 pt-10">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 border border-gray-200 rounded-full p-1"
          >
            <X size={20} />
          </button>

          {!success ? (
            <div className="space-y-6 text-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Scan to Pay</h2>
                <p className="text-gray-500 mt-1">Pay ₹{amount} via any UPI App</p>
              </div>

              <div className="flex justify-center bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-200">
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <QRCode value={upiUrl} size={200} />
                </div>
              </div>

              <div className="flex items-center justify-center space-x-6 grayscale opacity-60">
                <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="h-6" />
                <Smartphone size={24} />
                <CreditCard size={24} />
              </div>

              <div className="bg-blue-50 p-4 rounded-xl text-left border border-blue-100">
                <div className="flex items-start space-x-3 text-blue-800 text-sm">
                  <CheckCircle size={18} className="mt-0.5 shrink-0" />
                  <p>Open your GPay, PhonePe, or Paytm app to scan and complete the payment.</p>
                </div>
              </div>

              <Button 
                onClick={handleSimulateSuccess}
                disabled={isSimulating}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg"
              >
                {isSimulating ? "Verifying..." : "I've paid (Simulate Success)"}
              </Button>
            </div>
          ) : (
            <div className="py-12 text-center space-y-4 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-center">
                <div className="bg-green-100 p-4 rounded-full text-green-600">
                  <CheckCircle size={64} fill="currentColor" stroke="white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Payment Successful!</h2>
              <p className="text-gray-500">Your order is now being processed.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
