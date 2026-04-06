"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", { email, password });
      const { token, id, name, role } = response.data;
      login({ id, name, email, role }, token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Invalid login credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#eef2ff] p-4 font-sans">
      <div className="w-full max-w-lg p-8 sm:p-10 bg-white rounded-2xl shadow-xl border border-[#e5e7eb] animate-in slide-in-from-bottom-4 duration-500 fade-in">
        <div className="text-center mb-10">
          <div className="flex justify-center items-center gap-2 mb-4">
            <svg className="w-10 h-10 text-[#4f46e5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#111827]">
              Ticket<span className="text-[#4f46e5]">Flow</span>
            </h1>
          </div>
          <h2 className="text-2xl font-bold text-[#111827]">Sign in to your account</h2>
          <p className="text-sm text-[#6b7280] font-medium mt-2">Welcome back to your enterprise ticketing portal.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-xl flex items-center gap-3 shadow-sm">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Corporate Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@company.com"
          />
          
          <Input
            label="Secure Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />

          <div className="pt-2">
            <Button 
              type="submit" 
              disabled={loading} 
              size="lg" 
              className="w-full text-base py-3 shadow-[0_4px_10px_rgba(79,70,229,0.3)] hover:shadow-[0_6px_15px_rgba(79,70,229,0.4)] transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Authenticating...
                </>
              ) : (
                "Access Dashboard"
              )}
            </Button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-[#e5e7eb] text-center">
          <p className="text-sm font-medium text-[#6b7280]">
            Don't have an enterprise account?{" "}
            <Link href="/auth/register" className="text-[#4f46e5] hover:text-[#7c3aed] transition-colors font-bold hover:underline">
              Request access
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
