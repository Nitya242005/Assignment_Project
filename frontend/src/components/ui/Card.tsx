"use client";

import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

const Card = ({ children, className, title }: CardProps) => {
  const baseStyles = "bg-white border border-[#e5e7eb] rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-[2px] transition-all duration-300 overflow-hidden";

  return (
    <div className={`${baseStyles} ${className || ""}`}>
      {title && (
        <div className="px-6 py-4 border-b border-[#e5e7eb] bg-white">
          <h3 className="text-lg font-bold text-[#111827]">{title}</h3>
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};

export default Card;
