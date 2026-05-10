import React from "react";

export function Button({
    children,
    className = "",
    variant = "default",
    size = "md",
    ...props
}) {

    let base =
        "inline-flex items-center justify-center rounded-lg font-medium transition disabled:opacity-50 disabled:pointer-events-none";

    let sizes = {
        sm: "px-3 py-2 text-sm",
        md: "px-4 py-2",
        lg: "px-6 py-3 text-lg"
    };

    let variants = {
        default: "bg-blue-600 text-white hover:bg-blue-700",
        outline:
            "border border-blue-600 text-blue-600 hover:bg-blue-50"
    };

    return (
        <button
            className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
