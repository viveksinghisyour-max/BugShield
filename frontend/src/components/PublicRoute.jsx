import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Shield } from "lucide-react";

export default function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080d1a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center">
            <Shield size={24} className="text-blue-500" />
          </div>
          <p className="text-sm text-slate-500 font-semibold uppercase tracking-widest">
            Verifying...
          </p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children ? children : <Outlet />;
}

