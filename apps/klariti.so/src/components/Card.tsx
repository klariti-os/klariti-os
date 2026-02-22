import Link from "next/link";
import clsx from "clsx";

export function Card({
  as: Component = "div",
  className,
  children,
}: {
  as?: React.ElementType;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Component
      className={clsx(
        "group relative flex flex-col items-start rounded-xl border border-border bg-card p-6 transition-colors hover:bg-muted",
        className
      )}
    >
      {children}
    </Component>
  );
}

Card.Link = function CardLink({
  children,
  ...props
}: { children: React.ReactNode } & React.ComponentProps<typeof Link>) {
  return (
    <Link {...props}>
      <span className="absolute inset-0 z-20 rounded-xl" />
      <span className="relative z-10">{children}</span>
    </Link>
  );
};

Card.Title = function CardTitle({
  as: Component = "h2",
  href,
  children,
}: {
  as?: React.ElementType;
  href?: string;
  children: React.ReactNode;
}) {
  return (
    <Component className="font-serif text-base font-normal text-foreground">
      {href ? <Card.Link href={href}>{children}</Card.Link> : children}
    </Component>
  );
};

Card.Description = function CardDescription({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <p className="relative z-10 mt-2 text-sm leading-relaxed text-muted-foreground">
      {children}
    </p>
  );
};

Card.Cta = function CardCta({ children }: { children: React.ReactNode }) {
  return (
    <div
      aria-hidden="true"
      className="relative z-10 mt-4 flex items-center font-mono text-xs text-foreground"
    >
      {children}
      <svg
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
        className="ml-1 h-4 w-4 stroke-current"
      >
        <path
          d="M6.75 5.75 9.25 8l-2.5 2.25"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

Card.Eyebrow = function CardEyebrow({
  as: Component = "p",
  className,
  children,
  ...props
}: {
  as?: React.ElementType;
  className?: string;
  children: React.ReactNode;
  [key: string]: any;
}) {
  return (
    <Component
      className={clsx(
        "relative z-10 order-first mb-3 font-mono text-xs text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};
