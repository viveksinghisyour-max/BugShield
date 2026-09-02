import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";
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
          } catch (e) {
            // Token expired or invalid
            clearSession();
            setUser(null);
          }
        } else {
          // Check Supabase session fallback
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user?.email) {
            const synced = await api("/auth/supabase-sync", {
              method: "POST",
              body: JSON.stringify({ email: session.user.email })
            });
            setSession(synced.token, synced.user);
            setUser(synced.user);
          }
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        setLoading(false);
      }
    }

    initAuth();

    // Listen to Supabase auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user?.email) {
        try {
          const synced = await api("/auth/supabase-sync", {
            method: "POST",
            body: JSON.stringify({ email: session.user.email })
          });
          setSession(synced.token, synced.user);
          setUser(synced.user);
        } catch (e) {
          console.error("Failed to sync Supabase user:", e);
        }
      } else if (event === "SIGNED_OUT") {
        clearSession();
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Send OTP (Tries Supabase Auth first, falls back to FastAPI OTP endpoint)
  const sendOtp = async (email) => {
    let supabaseSuccess = false;
    let supabaseErrMessage = "";

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      });

      if (!error) {
        supabaseSuccess = true;
      } else {
        supabaseErrMessage = error.message;
      }
    } catch (e) {
      supabaseErrMessage = e.message;
    }

    if (supabaseSuccess) {
      return {
        mode: "supabase",
        message: `Verification code sent to ${email}`,
        email,
      };
    }

    // Fallback to FastAPI OTP Engine
    const result = await api("/auth/send-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    return {
      mode: "backend",
      ...result,
      warning: supabaseErrMessage ? `Using local OTP service (${supabaseErrMessage})` : undefined,
    };
  };

  // Verify OTP (Tries Supabase first across type options, falls back to FastAPI OTP endpoint)
  const verifyOtp = async (email, code, name = "") => {
    try {
      let res = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "email",
      });

      if (res.error) {
        res = await supabase.auth.verifyOtp({
          email,
          token: code,
          type: "signup",
        });
      }

      if (res.error) {
        res = await supabase.auth.verifyOtp({
          email,
          token: code,
          type: "magiclink",
        });
      }

      if (!res.error && res.data?.session?.user) {
        const synced = await api("/auth/supabase-sync", {
          method: "POST",
          body: JSON.stringify({ email, name }),
        });
        setSession(synced.token, synced.user);
        setUser(synced.user);
        return synced;
      }
    } catch (e) {
      console.warn("Supabase verify OTP skipped/fallback:", e.message);
    }

    // Fallback / standard verify via FastAPI OTP Engine (with 3 max attempt limit enforcement)
    const synced = await api("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ email, code, name }),
    });

    setSession(synced.token, synced.user);
    setUser(synced.user);
    return synced;
  };


  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // Ignore
    }
    clearSession();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        sendOtp,
        verifyOtp,
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
