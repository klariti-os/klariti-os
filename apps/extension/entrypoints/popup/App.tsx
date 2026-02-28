import { useEffect, useState } from "react";
import "./style.css";

const API_URL = "http://localhost:4200";
const WEB_URL = "http://localhost:3001";

interface User {
  id: string;
  name: string;
  email: string;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/auth/get-session`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user?.id) setUser(data.user);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const openSignIn = () => {
    browser.tabs.create({ url: `${WEB_URL}/auth` });
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
        <img src="/logo.svg" alt="Klariti" className="logo" />
        <h1 className="brand">Klariti</h1>
        <p className="subtitle">Sign in to view your profile</p>
        <button className="btn-primary" onClick={openSignIn}>
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <img src="/logo.svg" alt="Klariti" className="logo-sm" />
        <span className="brand-sm">Klariti</span>
      </div>
      <div className="profile">
        <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>
        <div className="user-name">{user.name}</div>
        <div className="user-email">{user.email}</div>
      </div>
    </div>
  );
}
