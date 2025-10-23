"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Kline from "@/components/kline";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8081";

export default function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const router = useRouter();

  // Check if user is logged in by verifying token in localStorage
  const checkIsLoggedIn = useCallback(() => {
    const token = localStorage.getItem("access_token");
    return !!token;
  }, []);

 
    if (checkIsLoggedIn()) {
      console.log("User is logged in, redirecting after brief delay");
      const timer = setTimeout(() => {
        router.push("/playground");
      }, 500);

      return () => clearTimeout(timer);
    }


  console.log(checkIsLoggedIn());

  const handleLogin = async (username: string, password: string) => {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        username: username,
        password: password,
      }),
    });

    console.log("Login response:", res.status);

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Login failed");
    }

    const data = await res.json();
    localStorage.setItem("access_token", data.access_token);
    console.log("Login successful, token stored");
    router.push("/playground");
  };

  const handleRegister = async (username: string, password: string) => {
    const res = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || err.message || "Registration failed");
    }

    console.log("Registration successful");
    // Auto-login after registration
    await handleLogin(username, password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (mode === "signin") {
        await handleLogin(username, password);
      } else {
        // Validate passwords match
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }
        // Validate password length
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters long");
        }
        await handleRegister(username, password);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === "signin" ? "signup" : "signin");
    setError("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="px-6">
      <main className="w-full max-w-md mx-auto mt-44">
        <div
          className={`bg-white/50 backdrop-blur-sm rounded-lg p-8 shadow-lg border-2 transition-colors ${
            profile ? "border-green-500" : "border-transparent"
          }`}
        >
          <h1 className="italic font-bold text-zinc-800 font-mono text-2xl mb-2">
            {mode === "signin" ? "Welcome back to" : "Join"}{" "}
            <Kline>Klariti OS</Kline>
          </h1>
          <p className="text-slate-600 font-mono text-sm mb-8">
            {mode === "signin"
              ? "Sign in to access your dashboard"
              : "Create an account to get started"}
          </p>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 font-mono text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-slate-700 font-mono mb-2"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent font-mono text-sm"
                placeholder="Enter your username"
                disabled={isLoading || !!profile}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 font-mono mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={mode === "signup" ? 6 : undefined}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent font-mono text-sm"
                placeholder={
                  mode === "signup"
                    ? "At least 6 characters"
                    : "Enter your password"
                }
                disabled={isLoading || !!profile}
              />
            </div>

            {mode === "signup" && (
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-slate-700 font-mono mb-2"
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent font-mono text-sm"
                  placeholder="Re-enter your password"
                  disabled={isLoading || !!profile}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !!profile}
              className="w-full bg-zinc-800 text-white font-mono py-3 rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading
                ? mode === "signin"
                  ? "Signing in..."
                  : "Creating account..."
                : mode === "signin"
                ? "Sign In"
                : "Sign Up"}
            </button>
          </form>

          {!profile && (
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600 font-mono">
                {mode === "signin" ? (
                  <>
                    Don&apos;t have an account?{" "}
                    <button
                      onClick={toggleMode}
                      className="text-zinc-800 font-bold hover:underline"
                      disabled={isLoading}
                    >
                      Sign Up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      onClick={toggleMode}
                      className="text-zinc-800 font-bold hover:underline"
                      disabled={isLoading}
                    >
                      Sign In
                    </button>
                  </>
                )}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
