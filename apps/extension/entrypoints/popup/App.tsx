import { useEffect, useState } from "react";
import { client, getApiIntents } from "@klariti/api-client";
import "./style.css";

const API_URL = "http://localhost:4200";
const WEB_URL = "http://localhost:3001";

interface User {
  id: string;
  name: string;
  email: string;
}

interface Intent {
  id: string;
  name: string;
  goal: string;
  is_active: boolean;
}

const goalLabels: Record<string, string> = {
  FOCUS: "Focus",
  WORK: "Work",
  STUDY: "Study",
  CASUAL: "Casual",
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [intents, setIntents] = useState<Intent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.setConfig({ baseUrl: API_URL });

    fetch(`${API_URL}/api/auth/get-session`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then(async (data) => {
        if (data?.user?.id) {
          setUser(data.user);
          const { data: intentData } = await getApiIntents();
          if (intentData) setIntents(intentData as Intent[]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Poll for updated intents every second
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(async () => {
      const { data } = await getApiIntents();
      if (data) setIntents(data as Intent[]);
    }, 500);
    return () => clearInterval(interval);
  }, [user]);

  const openSignIn = () => {
    browser.tabs.create({ url: `${WEB_URL}/auth` });
  };

  const openDashboard = () => {
    browser.tabs.create({ url: `${WEB_URL}/dashboard` });
  };

  if (loading) {
    return (
      <div className="container centered">
        <div className="spinner" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container centered">
        <img src="/icon/128.png" alt="Klariti" className="logo" />
        <h1 className="sign-in-brand">Klariti</h1>
        <p className="subtitle">Sign in to manage your intents</p>
        <button className="btn-primary" onClick={openSignIn}>
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <div className="header-left">
          <img src="/icon/32.png" alt="Klariti" className="logo-sm" />
          <span className="brand">Klariti</span>
        </div>
        <button className="header-link" onClick={openDashboard}>
          Dashboard →
        </button>
      </div>

      <p className="label" style={{ marginBottom: 10 }}>
        Intents
      </p>

      {intents.length === 0 ? (
        <div className="empty">
          <p>No intents yet</p>
        </div>
      ) : (
        <div className="intents-section">
          {intents.map((intent) => (
            <button
              key={intent.id}
              className="intent-item"
              onClick={openDashboard}
            >
              <span className="intent-name">{intent.name}</span>
              <div className="intent-meta">
                <span className="badge">
                  {goalLabels[intent.goal] ?? intent.goal}
                </span>
                {intent.is_active && (
                  <span className="badge badge-active">Active</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
