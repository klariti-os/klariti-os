import Link from "next/link";

interface PillButtonProps {
  href?: string;
  className?: string;
  children: React.ReactNode;
  target?: string;
  variant?: "primary" | "outline";
}

const PillButton: React.FC<PillButtonProps> = ({
  target,
  href,
  children,
  className = "",
  variant = "outline",
}) => {
  const base =
    "focus-ring inline-flex items-center gap-2 rounded-full px-5 py-2 font-mono text-xs transition-colors";

  const variants = {
    primary: "bg-primary text-primary-foreground hover:opacity-80",
    outline:
      "border border-border text-muted-foreground hover:border-foreground hover:text-foreground",
  };

  const classes = `${base} ${variants[variant]} ${className}`;

  if (href && target) {
    return (
      <a href={href} target={target} rel="noopener noreferrer" className={classes}>
        {children}
        <svg
          className="h-3.5 w-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
          />
        </svg>
      </a>
    );
  }

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return <span className={classes}>{children}</span>;
};

export default PillButton;
