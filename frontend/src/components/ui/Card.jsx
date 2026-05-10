import React from "react";

export function Card({ children, className = "" }) {
    return (
        <div
            className={`bg-white rounded-xl shadow-md overflow-hidden ${className}`}
        >
            {children}
        </div>
    );
}

export function CardContent({ children, className = "" }) {
    return (
        <div className={`p-6 ${className}`}>
            {children}
        </div>
    );
}

export function CardHeader({ children, className = "" }) {
    return (
        <div className={`p-6 border-b ${className}`}>
            {children}
        </div>
    );
}

export function CardTitle({ children, className = "" }) {
    return (
        <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>
            {children}
        </h3>
    );
}
