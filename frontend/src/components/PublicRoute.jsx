import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";
import { Shield } from "lucide-react";

export default function PublicRoute({ children }) {
  const [isAuth, setIsAuth] = useState(null); // null means checking
  const location = useLocation();

  useEffect(() => {
    // Check authentication status
    setIsAuth(isAuthenticated());
  }, [location.pathname]);

  // Show loading state to prevent UI flicker while validating
  if (isAuth === null) {
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

  // If authenticated, prevent access to public routes (like login/register) and redirect to dashboard
  if (isAuth) {
    return <Navigate to="/dashboard" replace />;
  }

  // Render public components
  return children ? children : <Outlet />;
}
