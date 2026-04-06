"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { IUser, Role } from "@/types";

interface AuthContextType {
  user: IUser | null;
  token: string | null;
  login: (userData: IUser, token: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Normalize backend role mappings universally ("ROLE_ADMIN" -> "ADMIN")
  const normalizeUser = (u: IUser | { id: number; name: string; email: string; role: string }): IUser => {
    const rawRole = u.role && u.role.startsWith("ROLE_") ? u.role.replace("ROLE_", "") : u.role;
    return { ...u, role: rawRole as Role };
  };

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 500); // Fallback: never hang forever
    try {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(normalizeUser(JSON.parse(storedUser)));
      }
    } catch {
      // Clear corrupted storage silently
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  }, []);

  const login = (userData: IUser, token: string) => {
    const normalized = normalizeUser(userData);
    setUser(normalized);
    setToken(token);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(normalized));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/auth/login";
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
