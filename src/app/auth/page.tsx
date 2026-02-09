"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user, login, register, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  const handleLogin = async () => {
    await login(username, password);
    router.push("/dashboard");
  };

  const handleRegister = async () => {
    await register(username, password);
    await login(username, password);
    router.push("/dashboard");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (mode === "signin") {
        await handleLogin();
      } else {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters");
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
    <div className="mx-auto max-w-sm px-6 pt-24 pb-32 md:pt-32">
      <h1 className="mb-2 font-editorial text-2xl font-light text-foreground">
        {mode === "signin" ? "Welcome Back" : "Create Account"}
      </h1>
      <p className="mb-8 text-sm text-muted-foreground">
        {mode === "signin"
          ? "Sign in to access your dashboard."
          : "Create an account to get started."}
      </p>

      {error && (
        <div
          className="mb-6 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="username"
            className="mb-1.5 block font-mono text-xs text-muted-foreground"
          >
            Username
          </label>
          <input
            id="username"
            type="text"
            name="username"
            autoComplete={mode === "signin" ? "username" : "username"}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            spellCheck={false}
            placeholder="Enter your username\u2026"
            disabled={isLoading || authLoading}
            className="focus-ring w-full rounded-lg border border-border bg-background px-4 py-2.5 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 disabled:opacity-50"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block font-mono text-xs text-muted-foreground"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            name="password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={mode === "signup" ? 6 : undefined}
            placeholder={
              mode === "signup"
                ? "At least 6 characters\u2026"
                : "Enter your password\u2026"
            }
            disabled={isLoading || authLoading}
            className="focus-ring w-full rounded-lg border border-border bg-background px-4 py-2.5 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 disabled:opacity-50"
          />
        </div>

        {mode === "signup" && (
          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1.5 block font-mono text-xs text-muted-foreground"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Re-enter your password\u2026"
              disabled={isLoading || authLoading}
              className="focus-ring w-full rounded-lg border border-border bg-background px-4 py-2.5 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 disabled:opacity-50"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || authLoading}
          className="focus-ring w-full rounded-lg bg-primary py-2.5 font-mono text-sm text-primary-foreground transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading
            ? mode === "signin"
              ? "Signing In\u2026"
              : "Creating Account\u2026"
            : mode === "signin"
              ? "Sign In"
              : "Create Account"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        {mode === "signin" ? (
          <>
            Don&apos;t have an account?{" "}
            <button
              onClick={toggleMode}
              disabled={isLoading}
              className="focus-ring rounded text-foreground underline underline-offset-4 hover:no-underline"
            >
              Create Account
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              onClick={toggleMode}
              disabled={isLoading}
              className="focus-ring rounded text-foreground underline underline-offset-4 hover:no-underline"
            >
              Sign In
            </button>
          </>
        )}
      </p>
    </div>
  );
}
