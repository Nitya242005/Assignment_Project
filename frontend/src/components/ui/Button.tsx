"use client";

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

const Button = ({ children, variant = "primary", size = "md", className, ...props }: ButtonProps) => {
  const baseStyles = "rounded-lg font-medium transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-center outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#4f46e5]";
  
  const variants = {
    primary: "bg-[#4f46e5] text-white hover:bg-[#4338ca] shadow-md hover:shadow-lg",
    secondary: "bg-white border border-[#e5e7eb] text-[#111827] hover:bg-[#f4f6f8] shadow-sm hover:shadow",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow",
    ghost: "text-[#4f46e5] hover:bg-[#f4f6f8]",
  };

  const sizes = {
    sm: "px-2.5 py-1.5 text-xs text-nowrap",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base text-nowrap",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className || ""}`} 
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
