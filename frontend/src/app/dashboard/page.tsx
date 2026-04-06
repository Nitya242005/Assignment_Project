"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import UserDashboard from "@/components/dashboard/UserDashboard";
import AgentDashboard from "@/components/dashboard/AgentDashboard";
import AdminDashboard from "@/components/dashboard/AdminDashboard";

export default function DashboardDispatcher() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [loading, user, router]);

  // Still loading from localStorage — AppLayout shows the spinner
  if (loading || !user) return null;

  switch (user.role) {
    case "USER":
      return <UserDashboard />;
    case "AGENT":
      return <AgentDashboard />;
    case "ADMIN":
      return <AdminDashboard />;
    default:
      return (
        <div className="flex items-center justify-center p-20 flex-col gap-4">
          <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="text-xl font-extrabold text-[#111827]">Unauthorized Role</div>
          <div className="text-sm text-[#6b7280]">Your account has an unrecognized role. Please contact support.</div>
        </div>
      );
  }
}
