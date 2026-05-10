import React, { useEffect, useRef, useState } from 'react';
import { businessInfo } from '../mockData';

const GoogleMap = ({ height = '450px', zoom = 16, className = '' }) => {
    const mapRef = useRef(null);
    const [mapLoaded, setMapLoaded] = useState(false);

    useEffect(() => {
        const initMap = () => {
            if (!mapRef.current || !window.google) return;

            const position = {
                lat: businessInfo.coordinates.lat,
                lng: businessInfo.coordinates.lng
            };

            const map = new window.google.maps.Map(mapRef.current, {
                center: position,
                zoom: zoom,
                styles: [
                    {
                        featureType: 'poi',
                        elementType: 'labels',
                        stylers: [{ visibility: 'simplified' }]
                    },
                    {
                        featureType: 'water',
                        elementType: 'geometry.fill',
                        stylers: [{ color: '#c8e0f8' }]
                    }
                ],
                mapTypeControl: true,
                streetViewControl: true,
                fullscreenControl: true,
                zoomControl: true,
            });

            const marker = new window.google.maps.Marker({
                position: position,
                map: map,
                title: businessInfo.name,
                animation: window.google.maps.Animation.DROP,
                icon: {
                    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="50" viewBox="0 0 40 50">
                            <path d="M20 0C8.954 0 0 8.954 0 20c0 14 20 30 20 30s20-16 20-30C40 8.954 31.046 0 20 0z" fill="#2563eb"/>
                            <circle cx="20" cy="18" r="9" fill="white"/>
                            <text x="20" y="22" text-anchor="middle" font-size="12" font-weight="bold" fill="#2563eb">LK</text>
                        </svg>
                    `),
                    scaledSize: new window.google.maps.Size(40, 50),
                    anchor: new window.google.maps.Point(20, 50)
                }
            });

            const infoContent = `
                <div style="padding: 12px; max-width: 280px; font-family: 'Inter', sans-serif;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                        <img src="/logo.png" alt="Logo" style="height: 32px; width: auto; border-radius: 4px;" onerror="this.style.display='none'" />
                        <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: #1f2937;">${businessInfo.name}</h3>
                    </div>
                    <p style="margin: 0 0 6px 0; font-size: 13px; color: #6b7280;">
                        ${businessInfo.address.street}, ${businessInfo.address.area}<br/>
                        ${businessInfo.address.city}, ${businessInfo.address.state} ${businessInfo.address.pincode}
                    </p>
                    <div style="display: flex; gap: 12px; margin-top: 8px;">
                        <a href="tel:${businessInfo.phone}" style="font-size: 13px; color: #2563eb; text-decoration: none; font-weight: 500;">
                            📞 ${businessInfo.phone}
                        </a>
                    </div>
                    <div style="margin-top: 8px;">
                        <a href="https://www.google.com/maps/dir/?api=1&destination=${businessInfo.coordinates.lat},${businessInfo.coordinates.lng}" 
                           target="_blank" 
                           style="display: inline-block; padding: 6px 14px; background: #2563eb; color: white; border-radius: 6px; font-size: 12px; text-decoration: none; font-weight: 600;">
                            🧭 Get Directions
                        </a>
                    </div>
                </div>
            `;

            const infoWindow = new window.google.maps.InfoWindow({
                content: infoContent
            });

            marker.addListener('click', () => {
                infoWindow.open(map, marker);
            });

            // Auto-open info window
            infoWindow.open(map, marker);

            setMapLoaded(true);
        };

        // Check if Google Maps is already loaded
        if (window.google && window.google.maps) {
            initMap();
        } else {
            // Wait for the script to load
            const checkGoogle = setInterval(() => {
                if (window.google && window.google.maps) {
                    clearInterval(checkGoogle);
                    initMap();
                }
            }, 100);

            // Cleanup interval after 10 seconds
            setTimeout(() => clearInterval(checkGoogle), 10000);
        }
    }, [zoom]);

    return (
        <div className={`relative rounded-xl overflow-hidden shadow-lg ${className}`} style={{ height }}>
            <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
            {!mapLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"></div>
                        <p className="text-gray-500 text-sm">Loading map...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GoogleMap;
