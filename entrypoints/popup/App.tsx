import { useState, useEffect, useCallback } from "react";
import { config } from "@/utils/config";
import { StateManager, StorageState } from "@/utils/storage";
import {
  Challenge,
  ChallengeStatus,
  getChallengeStatus,
  getStatusClass,
  getStatusText,
  isActive,
} from "@/utils/challenge-utils";
import "./style.css";

// Auth View Component
function AuthView({
  onLogin,
  error,
}: {
  onLogin: (username: string, password: string) => Promise<void>;
  error: string | null;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!username.trim() || !password.trim()) return;
    setLoading(true);
    try {
      await onLogin(username, password);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-section">
      <div className="input-group">
        <label htmlFor="username">Username</label>
        <input
          type="text"
          id="username"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) =>
            e.key === "Enter" && document.getElementById("password")?.focus()
          }
        />
      </div>
      <div className="input-group">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />
      </div>
      <button
        className="btn btn-primary"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Logging in..." : "Login"}
      </button>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}

// Challenge Modal Component
function ChallengeModal({
  challenge,
  onClose,
}: {
  challenge: Challenge;
  onClose: () => void;
}) {
  const status = getChallengeStatus(challenge);
  const websites = challenge.distractions || [];

  const getStatusStyles = (s: ChallengeStatus) => {
    switch (s) {
      case ChallengeStatus.ACTIVE:
        return { backgroundColor: "rgba(34, 197, 94, 0.1)", color: "#4ADE80" };
      case ChallengeStatus.PAUSED:
        return { backgroundColor: "rgba(245, 158, 11, 0.1)", color: "#FBBF24" };
      case ChallengeStatus.COMPLETED:
        return { backgroundColor: "rgba(34, 197, 94, 0.1)", color: "#4ADE80" };
      case ChallengeStatus.SCHEDULED:
        return { backgroundColor: "rgba(59, 130, 246, 0.1)", color: "#60A5FA" };
      case ChallengeStatus.EXPIRED:
        return {
          backgroundColor: "rgba(113, 113, 122, 0.1)",
          color: "#A1A1AA",
        };
      default:
        return { backgroundColor: "#27272A", color: "#A1A1AA" };
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-section">
            <h2>{challenge.name}</h2>
            <div className="modal-badges">
              <span className="modal-badge" style={getStatusStyles(status)}>
                {getStatusText(status)}
              </span>
              <span
                className="modal-badge"
                style={{
                  backgroundColor: "#27272A",
                  color: "#A1A1AA",
                  border: "1px solid #3F3F46",
                }}
              >
                {challenge.challenge_type === "time_based"
                  ? "Time Based"
                  : "Toggle"}
              </span>
              {challenge.strict_mode && (
                <span
                  className="modal-badge"
                  style={{
                    backgroundColor: "rgba(249, 115, 22, 0.1)",
                    color: "#FB923C",
                  }}
                >
                  Strict Mode
                </span>
              )}
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="modal-body">
          {challenge.description && (
            <div className="modal-section">
              <h3>Description</h3>
              <p>{challenge.description}</p>
            </div>
          )}

          {challenge.challenge_type === "time_based" &&
            challenge.time_based_details && (
              <div className="modal-section">
                <div className="time-grid">
                  <div className="time-box">
                    <span className="label">Start Date</span>
                    <span className="value">
                      {new Date(
                        challenge.time_based_details.start_date.endsWith("Z")
                          ? challenge.time_based_details.start_date
                          : `${challenge.time_based_details.start_date}Z`
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="time-box">
                    <span className="label">End Date</span>
                    <span className="value">
                      {new Date(
                        challenge.time_based_details.end_date.endsWith("Z")
                          ? challenge.time_based_details.end_date
                          : `${challenge.time_based_details.end_date}Z`
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

          {challenge.challenge_type === "toggle" &&
            challenge.toggle_details && (
              <div className="modal-section">
                <div className="toggle-box">
                  <div>
                    <span className="label">Current Status</span>
                    <p className="value-text">
                      {challenge.toggle_details.is_active
                        ? "Active"
                        : "Inactive"}
                    </p>
                  </div>
                  <div
                    className="status-indicator"
                    style={{
                      backgroundColor: challenge.toggle_details.is_active
                        ? "#22C55E"
                        : "#52525B",
                      boxShadow: challenge.toggle_details.is_active
                        ? "0 0 8px rgba(34, 197, 94, 0.5)"
                        : "none",
                    }}
                  />
                </div>
              </div>
            )}

          <div className="modal-section">
            <h3>Blocked Websites ({websites.length})</h3>
            <div className="websites-grid">
              {websites.length > 0 ? (
                websites.map((site, idx) => (
                  <div key={idx} className="website-item">
                    <div className="website-icon">
                      {site.url.charAt(0).toUpperCase()}
                    </div>
                    <div className="website-url">{site.url}</div>
                  </div>
                ))
              ) : (
                <p
                  style={{
                    fontSize: "13px",
                    color: "#71717A",
                    fontStyle: "italic",
                  }}
                >
                  No websites blocked.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Challenge List Component
function ChallengesView({
  username,
  challenges,
  connectionStatus,
  onLogout,
}: {
  username: string;
  challenges: Challenge[];
  connectionStatus: "connected" | "disconnected";
  onLogout: () => void;
}) {
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(
    null
  );
  const activeChallenges = StateManager.getActiveChallenges(challenges);
  const hasActive = activeChallenges.length > 0;

  const handleLogout = () => {
    if (hasActive) {
      alert(
        "Cannot logout while you have active challenges. Please pause or complete your challenges first."
      );
      return;
    }
    onLogout();
  };

  return (
    <div className="challenges-section">
      <div className="user-info">
        <span className="user-name">{username}</span>
        <button className="btn btn-secondary btn-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="challenges-list">
        {activeChallenges.length === 0 ? (
          <div className="no-challenges">
            No active challenges. Create one at klariti.so!
          </div>
        ) : (
          activeChallenges.map((challenge) => {
            const status = getChallengeStatus(challenge);
            const statusClass = getStatusClass(status);
            const statusText = getStatusText(status);
            const websites = challenge.distractions || [];
            const blockList =
              websites.length > 0
                ? websites.map((w) => w.name || w.url).join(", ")
                : "No websites blocked";

            return (
              <div
                key={challenge.id}
                className={`challenge-item ${
                  isActive(challenge) ? "active" : ""
                }`}
                onClick={() => setSelectedChallenge(challenge)}
              >
                <div className="challenge-name">
                  {challenge.name}
                  <span className={`status-badge ${statusClass}`}>
                    {statusText}
                  </span>
                </div>
                <div className="challenge-status">
                  {challenge.strict_mode ? "🔒 Strict Mode" : ""}
                </div>
                <div className="challenge-websites">Blocking: {blockList}</div>
              </div>
            );
          })
        )}
      </div>

      <div className={`connection-status ${connectionStatus}`}>
        {connectionStatus === "connected" ? "🟢 Connected" : "🔴 Disconnected"}
      </div>

      {selectedChallenge && (
        <ChallengeModal
          challenge={selectedChallenge}
          onClose={() => setSelectedChallenge(null)}
        />
      )}
    </div>
  );
}

// Main App Component
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "disconnected"
  >("disconnected");
  const [authError, setAuthError] = useState<string | null>(null);

  // Load initial state
  useEffect(() => {
    const loadState = async () => {
      const state = await StateManager.getState();
      if (state.access_token && state.username) {
        setIsLoggedIn(true);
        setUsername(state.username);
        setChallenges(state.challenges);
        setConnectionStatus(state.connectionStatus);
        // Request refresh from background
        browser.runtime.sendMessage({ action: "refresh_challenges" });
      }
      setIsLoading(false);
    };
    loadState();

    // Check connection status
    browser.runtime.sendMessage({ action: "check_connection" }, (response) => {
      if (response?.status) {
        setConnectionStatus(
          response.status === "connected" ? "connected" : "disconnected"
        );
      }
    });
  }, []);

  useEffect(() => {
    const handleStorageChange = (
      changes: { [key: string]: { oldValue?: unknown; newValue?: unknown } },
      area: string
    ) => {
      if (area !== "local") return;

      if (changes.challenges?.newValue) {
        setChallenges(changes.challenges.newValue as Challenge[]);
      }
      if (changes.connectionStatus?.newValue) {
        setConnectionStatus(
          changes.connectionStatus.newValue === "connected"
            ? "connected"
            : "disconnected"
        );
      }
      if (
        changes.access_token &&
        !changes.access_token.newValue &&
        changes.access_token.oldValue
      ) {
        // Session cleared
        setIsLoggedIn(false);
        setUsername("");
        setChallenges([]);
        setAuthError("Session expired. Please login again.");
      }
    };

    browser.storage.onChanged.addListener(handleStorageChange);
    return () => browser.storage.onChanged.removeListener(handleStorageChange);
  }, []);

  const handleLogin = async (usernameInput: string, password: string) => {
    setAuthError(null);
    try {
      const formData = new URLSearchParams();
      formData.append("username", usernameInput);
      formData.append("password", password);

      const response = await fetch(`${config.apiUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Login failed");
      }

      const data = await response.json();
      await StateManager.setSession(data.access_token, usernameInput);

      setIsLoggedIn(true);
      setUsername(usernameInput);

      browser.runtime.sendMessage({
        action: "user_logged_in",
        username: usernameInput,
      });
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Login failed");
    }
  };

  const handleLogout = async () => {
    await StateManager.clearSession();
    browser.runtime.sendMessage({ action: "user_logged_out" });
    setIsLoggedIn(false);
    setUsername("");
    setChallenges([]);
  };

  if (isLoading) {
    return (
      <div className="container">
        <h1>🎯 Klariti</h1>
        <div className="loading">Initializing...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>🎯 Klariti</h1>
      {isLoggedIn ? (
        <ChallengesView
          username={username}
          challenges={challenges}
          connectionStatus={connectionStatus}
          onLogout={handleLogout}
        />
      ) : (
        <AuthView onLogin={handleLogin} error={authError} />
      )}
    </div>
  );
}
