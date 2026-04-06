"use client";

import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Input = ({ label, className, ...props }: InputProps) => {
  const baseStyles = "w-full px-4 py-2.5 rounded-lg border border-[#e5e7eb] focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/30 focus:border-[#4f46e5] disabled:bg-[#f9fafb] disabled:text-[#6b7280] transition-all duration-200 shadow-sm text-[#111827] placeholder:text-[#9ca3af]";

  return (
    <div className="flex flex-col gap-1.5 w-full text-sm">
      <label className="text-sm font-semibold text-[#111827]">{label}</label>
      <input className={`${baseStyles} ${className || ""}`} {...props} />
    </div>
  );
};

export default Input;
