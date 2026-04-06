"use client";

import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "gray" | "amber" | "green" | "dark-gray" | "red" | "blue" | "orange";
  className?: string;
}

const Badge = ({ children, variant = "gray", className }: BadgeProps) => {
  const baseStyles = "px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-nowrap ring-1 ring-inset";

  const variants = {
    gray: "bg-gray-50 text-gray-600 ring-gray-500/10",
    blue: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
    amber: "bg-yellow-50 text-yellow-800 ring-yellow-600/20",
    orange: "bg-orange-50 text-orange-700 ring-orange-600/20",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    "dark-gray": "bg-gray-800 text-white ring-gray-900/10",
    red: "bg-red-50 text-red-700 ring-red-600/20",
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className || ""}`}>
      {children}
    </span>
  );
};

export default Badge;
