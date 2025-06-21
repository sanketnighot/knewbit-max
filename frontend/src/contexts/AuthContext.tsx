"use client";

import { supabase } from "@/lib/supabaseClient";
import { AuthContextType, KnewbitUser } from "@/types/auth";
import { Session } from "@supabase/supabase-js";
import Cookies from "js-cookie";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [knewbitUser, setKnewbitUser] = useState<KnewbitUser | null>(null);

  // Helper function to get JWT token
  const getJwtToken = (): string | null => {
    return session?.access_token || Cookies.get("knewbit_jwt") || null;
  };

  // Fetch user profile from backend (GET first, POST if not found)
  const fetchKnewbitUser = async (jwt: string) => {
    try {
      // Try GET first
      let res = await fetch(`${BACKEND_URL}/api/user`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
      });

      let userData: KnewbitUser | null = null;
      if (res.status === 200) {
        userData = await res.json();
        setKnewbitUser(userData);
      } else if (res.status === 404 || res.status === 401) {
        // If not found or unauthorized, try POST to register
        res = await fetch(`${BACKEND_URL}/api/user`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${jwt}`,
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) throw new Error("Failed to register user");
        userData = await res.json();
        setKnewbitUser(userData);
      } else {
        throw new Error("Failed to fetch user profile");
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to fetch user details");
      setKnewbitUser(null);
    }
  };

  // After successful login, store JWT in cookie and fetch user profile
  useEffect(() => {
    if (session) {
      const jwt = session.access_token;
      Cookies.set("knewbit_jwt", jwt, { secure: true, sameSite: "strict" });
      fetchKnewbitUser(jwt);
    }
  }, [session]);

  // On app load, if JWT cookie exists but no user, fetch user profile using GET /api/user
  useEffect(() => {
    const jwt = Cookies.get("knewbit_jwt");
    if (jwt && !knewbitUser) {
      const fetchCurrentUser = async () => {
        setLoading(true);
        try {
          const res = await fetch(`${BACKEND_URL}/api/user`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${jwt}`,
              "Content-Type": "application/json",
            },
          });
          if (res.status === 200) {
            const data = await res.json();
            setKnewbitUser(data);
          } else {
            setKnewbitUser(null);
            setSession(null);
            Cookies.remove("knewbit_jwt");
          }
        } catch {
          setKnewbitUser(null);
          setSession(null);
          Cookies.remove("knewbit_jwt");
        } finally {
          setLoading(false);
        }
      };
      fetchCurrentUser();
    }
  }, [knewbitUser]);

  useEffect(() => {
    // Get initial session
    const getCurrentSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) setError(error.message);
      setSession(data.session);
      setLoading(false);
    };

    getCurrentSession();

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (!session) {
          setKnewbitUser(null);
          Cookies.remove("knewbit_jwt");
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    setError(null);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}`,
      },
    });
    if (error) setError(error.message);
    return { data, error };
  };

  const signInWithOTP = async (email: string) => {
    setError(null);
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    });
    if (error) setError(error.message);
    return { data, error };
  };

  const verifyOTP = async (email: string, token: string) => {
    setError(null);
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });
    if (error) setError(error.message);
    return { data, error };
  };

  const signOut = async () => {
    setLoading(true);
    setError(null);
    Cookies.remove("knewbit_jwt");
    setKnewbitUser(null);
    const { error } = await supabase.auth.signOut();
    if (error) setError(error.message);
    setLoading(false);
  };

  const value: AuthContextType = {
    session,
    loading,
    error,
    signOut,
    signInWithGoogle,
    signInWithOTP,
    verifyOTP,
    knewbitUser,
    setKnewbitUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
