import { createContext, useContext, useEffect, useState } from "react";
import { api, clearSession, getToken, getUser, setSession } from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getUser());
  const [loading, setLoading] = useState(true);

  // Initialize session state on mount
  useEffect(() => {
    async function initAuth() {
      try {
        const token = getToken();
        if (token) {
          try {
            const me = await api("/auth/me");
            setUser(me);
          } catch {
            // Token expired or invalid
            clearSession();
            setUser(null);
          }
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  // Standard JWT Login
  const login = async (email, password) => {
    const res = await api("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: email.trim(), password }),
    });
    setSession(res.token, res.user);
    setUser(res.user);
    return res.user;
  };

  // Standard JWT Register
  const register = async (name, email, password) => {
    const res = await api("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
    });
    setSession(res.token, res.user);
    setUser(res.user);
    return res.user;
  };

  const signOut = () => {
    clearSession();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        signOut,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
