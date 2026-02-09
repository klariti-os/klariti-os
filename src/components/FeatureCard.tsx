import React from "react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  kpi?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  kpi,
}) => {
  return (
    <article className="flex flex-col bg-card p-8">
      <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
        {icon}
      </div>
      <h3 className="mb-2 font-editorial text-lg font-normal text-foreground">
        {title}
      </h3>
      <p className="mb-6 flex-1 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      {kpi && (
        <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground/60">
          {kpi}
        </p>
      )}
    </article>
  );
};
