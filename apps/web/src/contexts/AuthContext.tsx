"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { client } from "@klariti/api-client";

// Configure the api-client to forward the stored Bearer token on all
// protected requests (e.g. getApiMe, patchApiMe, etc.).
client.setConfig({
  auth: () =>
    typeof window !== "undefined"
      ? (localStorage.getItem("access_token") ?? undefined)
      : undefined,
});

interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function bearerHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("access_token");
    if (token) {
      const { data } = await authClient.getSession({
        fetchOptions: { headers: bearerHeaders(token) },
      });
      if (data?.user?.id) {
        setUser({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          emailVerified: data.user.emailVerified,
        });
      } else {
        localStorage.removeItem("access_token");
      }
    }
    setIsLoading(false);
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await authClient.signIn.email({
      email,
      password,
    });
    if (error) {
      throw new Error(error.message ?? "Invalid email or password");
    }
    if (!data?.token || !data?.user?.id) {
      throw new Error("Sign in failed");
    }
    localStorage.setItem("access_token", data.token);
    setUser({
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      emailVerified: data.user.emailVerified,
    });
  };

  const signUp = async (name: string, email: string, password: string) => {
    const { error } = await authClient.signUp.email({
      name,
      email,
      password,
    });
    if (error) {
      throw new Error(error.message ?? "Registration failed");
    }
    // requireEmailVerification is enabled — no session is issued until the
    // user verifies their email, so we do not auto-sign-in here.
  };

  const signOut = async () => {
    const token = localStorage.getItem("access_token");
    await authClient.signOut({
      fetchOptions: token ? { headers: bearerHeaders(token) } : undefined,
    });
    localStorage.removeItem("access_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
