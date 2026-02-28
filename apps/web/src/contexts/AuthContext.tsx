"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  client,
  getApiMe,
  postApiSignIn,
  postApiSignUp,
} from "@klariti/api-client";

// Configure the shared client to provide the stored Bearer token
// for all authenticated requests (e.g. getApiMe).
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
  signOut: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("access_token");
    if (token) {
      const { data } = await getApiMe();
      if (data?.id && data?.name && data?.email) {
        setUser({
          id: data.id,
          name: data.name,
          email: data.email,
          emailVerified: data.emailVerified ?? false,
        });
      } else {
        localStorage.removeItem("access_token");
      }
    }
    setIsLoading(false);
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await postApiSignIn({ body: { email, password } });
    if (error) {
      throw new Error(error.error ?? "Invalid email or password");
    }
    if (!data?.token || !data?.user?.id) {
      throw new Error("Sign in failed");
    }
    localStorage.setItem("access_token", data.token);
    setUser({
      id: data.user.id,
      name: data.user.name ?? "",
      email: data.user.email ?? "",
      emailVerified: data.user.emailVerified ?? false,
    });
  };

  const signUp = async (name: string, email: string, password: string) => {
    const { data, error } = await postApiSignUp({
      body: { name, email, password },
    });
    if (error) {
      throw new Error(error.error ?? "Registration failed");
    }
    if (data?.token && data?.user?.id) {
      localStorage.setItem("access_token", data.token);
      setUser({
        id: data.user.id,
        name: data.user.name ?? "",
        email: data.user.email ?? "",
        emailVerified: data.user.emailVerified ?? false,
      });
    } else {
      await signIn(email, password);
    }
  };

  const signOut = () => {
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
