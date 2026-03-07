"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Switch } from "@repo/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { getApiIntents, postApiIntents, putApiIntentsById, deleteApiIntentsById } from "@klariti/api-client";
import { NextPage } from "next";

type Goal = "FOCUS" | "WORK" | "STUDY" | "CASUAL";

interface Intent {
  id: string;
  name: string;
  goal: Goal;
  is_active: boolean;
  ends_at: string | null;
  created_at: string;
}

const goalMeta: Record<Goal, { label: string; description: string }> = {
  FOCUS: { label: "Focus", description: "Deep concentration, no distractions" },
  WORK: { label: "Work", description: "Professional tasks and productivity" },
  STUDY: { label: "Study", description: "Learning and knowledge retention" },
  CASUAL: { label: "Casual", description: "Light browsing, relaxed mode" },
};

const DashboardPage: NextPage = () => {
  const { user } = useAuth();

  const [intents, setIntents] = useState<Intent[]>([]);
  const [editingIntent, setEditingIntent] = useState<Intent | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formGoal, setFormGoal] = useState<Goal>("FOCUS");
  const [formIsActive, setFormIsActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openCreate = () => {
    setEditingIntent(null);
    setFormName("");
    setFormGoal("FOCUS");
    setFormIsActive(false);
    setError(null);
    setShowForm(true);
  };

  const openEdit = (intent: Intent) => {
    setEditingIntent(intent);
    setFormName(intent.name);
    setFormGoal(intent.goal);
    setFormIsActive(intent.is_active);
    setError(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingIntent(null);
    setConfirmDelete(false);
  };

  const handleDelete = async () => {
    if (!editingIntent) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setIsDeleting(true);
    const { error: apiError } = await deleteApiIntentsById({ path: { id: editingIntent.id } });
    if (apiError) {
      setError("Failed to delete intent. Please try again.");
    } else {
      setIntents((prev) => prev.filter((i) => i.id !== editingIntent.id));
      closeForm();
    }
    setIsDeleting(false);
  };

  useEffect(() => {
    getApiIntents().then(({ data }) => {
      if (data) setIntents(data as Intent[]);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formName.trim()) return;
    setIsSubmitting(true);
    setError(null);

    if (editingIntent) {
      const { data, error: apiError } = await putApiIntentsById({
        path: { id: editingIntent.id },
        body: { name: formName.trim(), goal: formGoal, is_active: formIsActive },
      });
      if (apiError || !data) {
        setError("Failed to update intent. Please try again.");
      } else {
        setIntents((prev) => prev.map((i) => (i.id === editingIntent.id ? (data as Intent) : i)));
        closeForm();
      }
    } else {
      const { data, error: apiError } = await postApiIntents({
        body: { name: formName.trim(), goal: formGoal, is_active: formIsActive },
      });
      if (apiError || !data) {
        setError("Failed to create intent. Please try again.");
      } else {
        setIntents((prev) => [data as Intent, ...prev]);
        closeForm();
      }
    }

    setIsSubmitting(false);
  };

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-content px-6 pb-32 pt-32">
        <header className="mb-12">
          <p className="mb-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Dashboard
          </p>
          <h1
            className="mb-2 font-serif text-3xl font-light tracking-tight text-foreground"
            style={{ textWrap: "balance" }}
          >
            Welcome back{user ? `, ${user.name}` : ""}
          </h1>
          <p className="max-w-md text-sm text-muted-foreground leading-relaxed">
            Manage your intents and track your digital wellness progress.
          </p>
        </header>

        {/* Create Intent Modal */}
        {showForm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 px-6 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && closeForm()}
          >
            <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-serif text-xl text-foreground">
                  {editingIntent ? "Edit Intent" : "New Intent"}
                </h2>
                <button
                  type="button"
                  onClick={closeForm}
                  className="focus-ring rounded-full p-1 text-muted-foreground hover:text-foreground"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. No social media after 9pm"
                    className="focus-ring w-full rounded-lg border border-border bg-background px-4 py-2.5 font-mono text-sm text-foreground placeholder:text-muted-foreground/50"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    Goal
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(goalMeta) as Goal[]).map((goal) => (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => setFormGoal(goal)}
                        className={`focus-ring rounded-xl border p-3 text-left transition-colors ${
                          formGoal === goal
                            ? "border-primary bg-primary/5 text-foreground"
                            : "border-border text-muted-foreground hover:border-foreground/40"
                        }`}
                      >
                        <p className="mb-0.5 font-mono text-xs font-medium uppercase tracking-wide">
                          {goalMeta[goal].label}
                        </p>
                        <p className="text-[11px] leading-relaxed">
                          {goalMeta[goal].description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-border p-3">
                  <div>
                    <p className="font-mono text-xs font-medium uppercase tracking-wide text-foreground">Active</p>
                    <p className="text-[11px] text-muted-foreground">Enable this intent now</p>
                  </div>
                  <Switch checked={formIsActive} onCheckedChange={setFormIsActive} />
                </div>

                {error && (
                  <p className="text-xs text-[var(--destructive)]">{error}</p>
                )}

                {editingIntent && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="focus-ring w-full rounded-full border border-[var(--destructive)]/30 py-2 font-mono text-xs uppercase tracking-wide text-[var(--destructive)] transition-colors hover:border-[var(--destructive)] hover:bg-[var(--destructive)]/5 disabled:opacity-40"
                    >
                      {isDeleting ? "Deleting…" : confirmDelete ? "Confirm Delete" : "Delete Intent"}
                    </button>
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="focus-ring flex-1 rounded-full border border-border py-2 font-mono text-xs uppercase tracking-wide text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !formName.trim()}
                    className="focus-ring flex-1 rounded-full border border-primary bg-primary py-2 font-mono text-xs uppercase tracking-wide text-primary-foreground transition-opacity hover:opacity-80 disabled:opacity-40"
                  >
                    {isSubmitting ? "Saving…" : editingIntent ? "Save" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-serif text-xl text-foreground">Intents</h2>
            <button
              type="button"
              onClick={openCreate}
              className="focus-ring rounded-full border border-primary bg-primary px-4 py-1.5 font-mono text-[11px] uppercase tracking-wide text-primary-foreground transition-opacity hover:opacity-80"
            >
              + New Intent
            </button>
          </div>

          {intents.length === 0 ? (
            <div className="flex items-center justify-center rounded-xl border border-dashed border-border py-10">
              <p className="text-sm text-muted-foreground">No intents yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {intents.map((intent) => (
                <button
                  key={intent.id}
                  type="button"
                  onClick={() => openEdit(intent)}
                  className="focus-ring flex w-full flex-col gap-2 rounded-xl border border-border p-4 text-left transition-colors hover:border-foreground/40 sm:flex-row sm:items-center sm:justify-between"
                >
                  <p className="text-sm text-foreground">{intent.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-border px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      {goalMeta[intent.goal].label}
                    </span>
                    {intent.is_active && (
                      <span className="rounded-full bg-[var(--success)]/10 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-[var(--success)]">
                        Active
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </ProtectedRoute>
  );
};

export default DashboardPage;
