"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Kline from "@/components/kline";

export default function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user, login, register, isLoading: authLoading } = useAuth();


  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      console.log("User already logged in, redirecting to dashboard");
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  const handleLogin = async () => {
    try {
      await login(username, password);
      console.log("Login successful, redirecting to dashboard");
      router.push("/dashboard");
    } catch (error: any) {
      throw error;
    }
  };

  const handleRegister = async () => {
    try {
      await register(username, password);
      console.log("Registration successful, logging in...");
      // After registration, login
      await login(username, password);
      console.log("Auto-login successful, redirecting to dashboard");
      router.push("/dashboard");
    } catch (error: any) {
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (mode === "signin") {
        await handleLogin();
      } else {
        // Validate passwords match
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }
        // Validate password length
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters long");
        }
        await handleRegister();
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
          className="bg-white/50 backdrop-blur-sm rounded-lg p-8 shadow-lg border-2 border-transparent transition-colors"
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
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent font-mono text-sm text-zinc-900"
                placeholder="Enter your username"
                disabled={isLoading || authLoading}
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
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent font-mono text-sm text-zinc-900"
                placeholder={
                  mode === "signup"
                    ? "At least 6 characters"
                    : "Enter your password"
                }
                disabled={isLoading || authLoading}
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
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent font-mono text-sm text-zinc-900"
                  placeholder="Re-enter your password"
                  disabled={isLoading || authLoading}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || authLoading}
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
        </div>
      </main>
    </div>
  );
}
