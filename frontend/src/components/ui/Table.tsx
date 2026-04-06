"use client";

import React from "react";

interface TableProps {
  headers: string[];
  children: React.ReactNode;
  className?: string;
}

const Table = ({ headers, children, className }: TableProps) => {
  return (
    <div className={`w-full overflow-x-auto ${className || ""}`}>
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr className="border-b border-[#e5e7eb] bg-[#f9fafb]">
            {headers.map((header, index) => (
              <th 
                key={index} 
                className="px-6 py-4 text-xs font-semibold text-[#6b7280] uppercase tracking-wider font-sans"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e5e7eb]">
          {children}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
