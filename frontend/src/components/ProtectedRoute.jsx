import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isAuthenticated, clearSession } from "../utils/auth";
import { Shield } from "lucide-react";

export default function ProtectedRoute({ children }) {
  const [isAuth, setIsAuth] = useState(null); // null means checking
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      const valid = isAuthenticated();
      if (!valid) {
        // If token exists but is invalid/expired, clear it
        if (localStorage.getItem("bugshield_token")) {
          clearSession();
        }
      }
      setIsAuth(valid);
    };
    checkAuth();
  }, [location.pathname]); // Re-check on navigation

  // Show loading state to prevent UI flicker while validating
  if (isAuth === null) {
    return (
      <div className="min-h-screen bg-[#080d1a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center">
            <Shield size={24} className="text-blue-500" />
          </div>
          <p className="text-sm text-slate-500 font-semibold uppercase tracking-widest">
            Authenticating...
          </p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  // Render children or nested routes
  return children ? children : <Outlet />;
}
