"use client";

import { useState, useEffect } from "react";
import { NextPage } from "next";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import type { ChallengeWithStatus, Goal } from "@klariti/api/contracts";
import { Switch } from "@repo/ui/switch";

const goalMeta: Record<Goal, { label: string; description: string }> = {
  FOCUS: { label: "Focus", description: "Deep concentration, no distractions" },
  WORK: { label: "Work", description: "Professional tasks and productivity" },
  STUDY: { label: "Study", description: "Learning and knowledge retention" },
  CASUAL: { label: "Casual", description: "Light browsing, relaxed mode" },
};

const DashboardPage: NextPage = () => {
  const { user } = useAuth();

  const [challenges, setChallenges] = useState<ChallengeWithStatus[]>([]);
  const [editing, setEditing] = useState<ChallengeWithStatus | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formGoal, setFormGoal] = useState<Goal>("FOCUS");
  const [formIsActive, setFormIsActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOwner = (c: ChallengeWithStatus | null) => !!c && c.creator_id === user?.id;
  const ownerLabel = (c: ChallengeWithStatus) => (isOwner(c) ? "You" : c.creator_name);

  const loadChallenges = async () => {
    const res = await api.challenges.list();
    if (res.status !== 200) return false;
    setChallenges(res.body as ChallengeWithStatus[]);
    return true;
  };

  const openCreate = () => {
    setEditing(null);
    setFormName("");
    setFormGoal("FOCUS");
    setFormIsActive(false);
    setConfirmDelete(false);
    setConfirmLeave(false);
    setError(null);
    setShowForm(true);
  };

  const openEdit = (c: ChallengeWithStatus) => {
    setEditing(c);
    setFormName(c.name);
    setFormGoal(c.goal);
    setFormIsActive(c.participant_status === "active");
    setConfirmDelete(false);
    setConfirmLeave(false);
    setError(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setConfirmDelete(false);
    setConfirmLeave(false);
    setError(null);
  };

  const handleDelete = async () => {
    if (!editing || !isOwner(editing)) {
      setError("Only the creator can delete this challenge.");
      return;
    }
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setIsDeleting(true);
    const res = await api.challenges.delete({ params: { id: editing.id } });
    if (res.status !== 200) {
      setError("Failed to delete challenge. Please try again.");
    } else {
      await loadChallenges();
      closeForm();
    }
    setIsDeleting(false);
  };

  const handleLeave = async () => {
    if (!editing || isOwner(editing)) {
      setError("Only participants can leave a shared challenge.");
      return;
    }
    if (!confirmLeave) { setConfirmLeave(true); return; }
    setIsLeaving(true);
    setError(null);
    const res = await api.challenges.leave({ params: { id: editing.id } });
    if (res.status !== 200) {
      setError("Failed to leave challenge. Please try again.");
    } else {
      await loadChallenges();
      closeForm();
    }
    setIsLeaving(false);
  };

  useEffect(() => { void loadChallenges(); }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formName.trim()) return;
    setIsSubmitting(true);
    setError(null);

    let challengeId: string | null = editing?.id ?? null;

    if (editing && isOwner(editing)) {
      const res = await api.challenges.update({
        params: { id: editing.id },
        body: { name: formName.trim(), goal: formGoal },
      });
      if (res.status !== 200) {
        setError("Failed to update challenge. Please try again.");
        setIsSubmitting(false);
        return;
      }
      challengeId = res.body.id;
    } else if (!editing) {
      const res = await api.challenges.create({
        body: { name: formName.trim(), goal: formGoal },
      });
      if (res.status !== 200) {
        setError("Failed to create challenge. Please try again.");
        setIsSubmitting(false);
        return;
      }
      challengeId = res.body.id;
    }

    const shouldUpdateStatus = editing
      ? (editing.participant_status === "active") !== formIsActive
      : !formIsActive;

    if (challengeId && shouldUpdateStatus) {
      const statusRes = await api.challenges.updateStatus({
        params: { id: challengeId },
        body: { status: formIsActive ? "active" : "paused" },
      });
      if (statusRes.status !== 200) {
        setError(editing
          ? "Saved details, but failed to update active state."
          : "Created challenge, but failed to update active state.");
        await loadChallenges();
        setIsSubmitting(false);
        return;
      }
    }

    await loadChallenges();
    closeForm();
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
            Manage your challenges and track your digital wellness progress.
          </p>
        </header>

        {showForm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 px-6 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && closeForm()}
          >
            <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-serif text-xl text-foreground">
                  {editing ? "Edit Challenge" : "New Challenge"}
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

              {editing && (
                <div className="mb-5 flex items-center justify-between rounded-xl border border-border bg-background/60 px-3 py-2.5">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                      Owner
                    </p>
                    <p className="text-sm text-foreground">{ownerLabel(editing)}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] ${
                      isOwner(editing)
                        ? "border border-foreground/10 bg-foreground/[0.04] text-foreground"
                        : "border border-border text-muted-foreground"
                    }`}
                  >
                    {isOwner(editing) ? "Your challenge" : "Shared"}
                  </span>
                </div>
              )}

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
                    disabled={!!editing && !isOwner(editing)}
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
                        disabled={!!editing && !isOwner(editing)}
                        className={`focus-ring rounded-xl border p-3 text-left transition-colors ${
                          formGoal === goal
                            ? "border-primary bg-primary/5 text-foreground"
                            : "border-border text-muted-foreground hover:border-foreground/40"
                        } ${editing && !isOwner(editing) ? "cursor-not-allowed opacity-50" : ""}`}
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
                    <p className="text-[11px] text-muted-foreground">Enable this challenge now</p>
                  </div>
                  <Switch checked={formIsActive} onCheckedChange={setFormIsActive} />
                </div>

                {error && (
                  <p className="text-xs text-[var(--destructive)]">{error}</p>
                )}

                {editing && !isOwner(editing) && (
                  <div className="space-y-3">
                    <p className="text-[11px] text-muted-foreground">
                      Only the creator can rename or delete this challenge. You can still toggle your own active status or leave it entirely.
                    </p>
                    <button
                      type="button"
                      onClick={handleLeave}
                      disabled={isLeaving}
                      className={`focus-ring w-full rounded-full border py-2 font-mono text-xs uppercase tracking-wide transition-colors disabled:opacity-40 ${
                        confirmLeave
                          ? "border-[var(--destructive)] bg-[var(--destructive)] text-white hover:bg-[var(--destructive)]/90"
                          : "border-[var(--destructive)]/30 text-[var(--destructive)] hover:border-[var(--destructive)] hover:bg-[var(--destructive)]/5"
                      }`}
                    >
                      {isLeaving ? "Leaving..." : confirmLeave ? "Confirm Leave" : "Leave Challenge"}
                    </button>
                  </div>
                )}

                {editing && isOwner(editing) && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className={`focus-ring w-full rounded-full border py-2 font-mono text-xs uppercase tracking-wide transition-colors disabled:opacity-40 ${
                        confirmDelete
                          ? "border-[var(--destructive)] bg-[var(--destructive)] text-white hover:bg-[var(--destructive)]/90"
                          : "border-[var(--destructive)]/30 text-[var(--destructive)] hover:border-[var(--destructive)] hover:bg-[var(--destructive)]/5"
                      }`}
                    >
                      {isDeleting ? "Deleting…" : confirmDelete ? "Confirm Delete" : "Delete Challenge"}
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
                    disabled={isSubmitting || isLeaving || !formName.trim()}
                    className="focus-ring flex-1 rounded-full border border-primary bg-primary py-2 font-mono text-xs uppercase tracking-wide text-primary-foreground transition-opacity hover:opacity-80 disabled:opacity-40"
                  >
                    {isSubmitting ? "Saving…" : editing ? (isOwner(editing) ? "Save" : "Update Status") : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-serif text-xl text-foreground">Challenges</h2>
            <button
              type="button"
              onClick={openCreate}
              className="focus-ring rounded-full border border-primary bg-primary px-4 py-1.5 font-mono text-[11px] uppercase tracking-wide text-primary-foreground transition-opacity hover:opacity-80"
            >
              + New Challenge
            </button>
          </div>

          {challenges.length === 0 ? (
            <div className="flex items-center justify-center rounded-xl border border-dashed border-border py-10">
              <p className="text-sm text-muted-foreground">No challenges yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {challenges.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => openEdit(c)}
                  className="focus-ring flex w-full flex-col gap-2 rounded-xl border border-border p-4 text-left transition-colors hover:border-foreground/40 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <p className="text-sm text-foreground">{c.name}</p>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span className="font-mono uppercase tracking-[0.18em] text-muted-foreground/70">
                        Owner
                      </span>
                      <span>{ownerLabel(c)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-border px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      {goalMeta[c.goal].label}
                    </span>
                    <span
                      className={`rounded-full px-2 py-1 font-mono text-[10px] uppercase tracking-wider ${
                        isOwner(c)
                          ? "border border-foreground/10 bg-foreground/[0.04] text-foreground"
                          : "border border-border text-muted-foreground"
                      }`}
                    >
                      {isOwner(c) ? "Owner" : "Shared"}
                    </span>
                    {c.participant_status === "active" && (
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
