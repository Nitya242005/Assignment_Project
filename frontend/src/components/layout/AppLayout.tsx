"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAuthRoute = pathname?.startsWith("/auth");

  useEffect(() => {
    if (!loading && !user && !isAuthRoute) {
      router.replace("/auth/login");
    }
  }, [loading, user, isAuthRoute, router]);

  // Show spinner only during initial localStorage check (very fast, < 500ms)
  if (loading) {
    return (
      <div className="min-h-screen bg-[#eef2ff] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="w-10 h-10 text-[#4f46e5] animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <div className="text-[#4f46e5] font-bold text-sm tracking-wide">TicketFlow</div>
        </div>
      </div>
    );
  }

  if (isAuthRoute) {
    return <div className="min-h-screen bg-[#eef2ff] text-[#111827]">{children}</div>;
  }

  // Not logged in and not on auth route — redirect handled by useEffect, render nothing
  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#eef2ff] text-[#111827] flex">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col transition-all duration-300 md:ml-64">
        <Topbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="mt-16 p-4 sm:p-6 lg:p-8 min-h-screen w-full">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
