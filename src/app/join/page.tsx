import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join",
  description: "Join the Klariti community and be part of the digital wellness movement.",
};

const JoinPage = () => {
  return (
    <div className="mx-auto max-w-content px-6 pb-32 pt-12">
      <p className="mb-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
        Join Us
      </p>
      <h1 className="mb-8 font-editorial text-3xl font-light tracking-tight text-foreground">
        Be Part of the Movement
      </h1>

      <div className="overflow-hidden rounded-xl border border-border">
        <iframe
          className="h-[900px] w-full"
          src="https://tally.so/r/nrq5eL"
          allowFullScreen
          title="Join Klariti waitlist form"
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default JoinPage;
