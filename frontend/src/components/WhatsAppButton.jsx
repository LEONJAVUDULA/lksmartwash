import React from 'react';
import { MessageCircle } from 'lucide-react';
import { businessInfo } from '../mockData';

export const WhatsAppButton = () => {
    const whatsappUrl = `https://wa.me/${businessInfo.whatsapp}?text=Hi, I need laundry service.`;

    return (
        <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
            aria-label="Contact us on WhatsApp"
        >
            <MessageCircle className="h-6 w-6" />
            <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-3 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                Chat with us
            </span>
        </a>
    );
};

export default WhatsAppButton;
