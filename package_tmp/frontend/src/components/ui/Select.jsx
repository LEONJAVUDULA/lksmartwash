import React from "react";

export function Select({ children, value, onValueChange, required }) {
    return (
        <select
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            required={required}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
        >
            {children}
        </select>
    );
}

export function SelectTrigger({ children, className }) {
    return <>{children}</>;
}

export function SelectValue({ placeholder }) {
    return <option value="" disabled>{placeholder}</option>;
}

export function SelectContent({ children }) {
    return <>{children}</>;
}

export function SelectItem({ value, children }) {
    return <option value={value}>{children}</option>;
}
