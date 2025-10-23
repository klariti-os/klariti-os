export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-6xl p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-neutral-50 drop-shadow-sm">Dashboard</h1>
        <p className="text-sm text-neutral-200">Profile • Blocked Sites • Challenges • Friends • Progress</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl border border-white/20 bg-slate-700/40 backdrop-blur-md p-4 shadow-lg">
          <h2 className="font-medium text-neutral-100 mb-2">Profile</h2>
          <div className="text-sm text-neutral-200/80">username, streak, total focus time</div>
        </div>
        <div className="rounded-xl border border-white/20 bg-slate-700/40 backdrop-blur-md p-4 md:col-span-2 shadow-lg">
          <h2 className="font-medium text-neutral-100 mb-2">Progress Summary</h2>
          <div className="text-sm text-neutral-200/80">distractions prevented, flashcards completed, hours focused</div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-white/20 bg-slate-700/40 backdrop-blur-md p-4 shadow-lg">
          <h2 className="font-medium text-neutral-100 mb-2">Blocked Sites</h2>
          <div className="text-sm text-neutral-200/80">add/remove domains (UI coming soon)</div>
        </div>
        <div className="rounded-xl border border-white/20 bg-slate-700/40 backdrop-blur-md p-4 shadow-lg">
          <h2 className="font-medium text-neutral-100 mb-2">Friends & Requests</h2>
          <div className="text-sm text-neutral-200/80">send/accept friend requests</div>
        </div>
      </section>

      <section className="rounded-xl border border-white/20 bg-slate-700/40 backdrop-blur-md p-4 shadow-lg">
        <h2 className="font-medium text-neutral-100 mb-2">Active Challenges</h2>
        <div className="text-sm text-neutral-200/80">list of ongoing/completed challenges</div>
      </section>
    </main>
  );
}
