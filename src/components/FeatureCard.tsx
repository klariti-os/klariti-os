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
    <div className="group text-left p-8 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
      <div className="mb-6 text-gray-900 group-hover:scale-110 transition-transform duration-300 inline-block">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900 mb-3 font-pp-editorial">
        {title}
      </h3>
      <p className="text-gray-500 leading-relaxed text-sm mb-6 flex-grow">{description}</p>
      {kpi && (
        <div className="pt-4 border-t border-gray-100">
          <p className="text-xs font-mono font-medium text-gray-400 uppercase tracking-wider">{kpi}</p>
        </div>
      )}
    </div>
  );
};
