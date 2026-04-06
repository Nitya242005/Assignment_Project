"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

interface TopbarProps {
  onMenuToggle: () => void;
}

const Topbar = ({ onMenuToggle }: TopbarProps) => {
  const { user, logout } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-[#e5e7eb] z-50 shadow-sm flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-4">
        {user && (
          <button 
            onClick={onMenuToggle}
            className="md:hidden p-2 -ml-2 text-[#6b7280] hover:text-[#111827] hover:bg-[#eef2ff] rounded-lg transition-colors focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        )}
        <Link href="/dashboard" className="flex items-center gap-2">
          <svg className="w-8 h-8 text-[#4f46e5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
          <span className="text-xl font-extrabold tracking-tight text-[#111827]">Ticket<span className="text-[#4f46e5]">Flow</span></span>
        </Link>
      </div>

      {user && (
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center text-sm font-medium pr-4 border-r border-[#e5e7eb]">
            <div className="flex flex-col items-end mr-3">
              <span className="font-extrabold text-[#111827] text-[13px] leading-tight">{user.name}</span>
              <span className="text-[10px] font-bold text-[#4f46e5] uppercase tracking-widest leading-tight">{user.role}</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-100 to-white border border-indigo-200 flex items-center justify-center text-[#4f46e5] font-bold shadow-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
          <button onClick={logout} className="ml-1 sm:ml-2 p-2 text-[#6b7280] hover:text-[#4f46e5] hover:bg-[#eef2ff] rounded-lg transition-colors cursor-pointer" title="Log out">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </div>
      )}
    </header>
  );
};

export default Topbar;
