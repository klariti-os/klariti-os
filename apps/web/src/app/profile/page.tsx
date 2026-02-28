'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from "@/components/Card";
import PillButton from "@/components/PillButton";
import { getProfile, updateProfile } from "../../services/profile";

export default function ProfilePage() {
  const [profile, setProfile] = useState({ username: '', password: '' });
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await getProfile();
        setProfile(data);
        setForm({ username: data.username, password: '' });
      } catch (err) {
        setError('Failed to load profile');
      }
    }
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = () => setEditing(true);
  const handleCancel = () => {
    setEditing(false);
    setForm({ username: profile.username, password: '' });
    setError('');
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      await updateProfile(form);
      setProfile({ ...profile, username: form.username });
      setEditing(false);
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-10 p-6">
      <h2 className="text-2xl font-bold mb-4">Profile</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <div className="mb-4">
        <label className="block font-medium mb-1">Username</label>
        <input
          name="username"
          value={form.username}
          onChange={handleChange}
          disabled={!editing}
          className="focus-ring w-full px-4 py-3 border border-border bg-muted rounded-xl text-foreground placeholder-muted-foreground font-mono text-sm"
        />
      </div>
      <div className="mb-4">
        <label className="block font-medium mb-1">Password</label>
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          disabled={!editing}
          placeholder={editing ? "Enter new password" : "********"}
          className="focus-ring w-full px-4 py-3 border border-border bg-muted rounded-xl text-foreground placeholder-muted-foreground font-mono text-sm"
        />
      </div>
      <div className="flex gap-2">
        {!editing ? (
          <button
            type="button"
            onClick={handleEdit}
            className="focus-ring inline-flex items-center gap-2 rounded-full px-5 py-2 font-mono text-xs transition-colors bg-primary text-primary-foreground hover:opacity-80"
          >
            Edit
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="focus-ring inline-flex items-center gap-2 rounded-full px-5 py-2 font-mono text-xs transition-colors bg-primary text-primary-foreground hover:opacity-80"
            >
              {loading ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="focus-ring inline-flex items-center gap-2 rounded-full px-5 py-2 font-mono text-xs transition-colors border border-border text-muted-foreground hover:border-foreground hover:text-foreground"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </Card>
  );
}
