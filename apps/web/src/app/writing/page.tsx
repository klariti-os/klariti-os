import { Metadata, NextPage } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Thoughts on digital wellness, focus, and building Klariti.",
};

const WritingPage: NextPage = () => {
  return (
    <div className="mx-auto max-w-content px-6 pb-32 pt-12">
      <p className="mb-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
        Blog
      </p>
      <h1 className="mb-4 font-serif text-3xl font-light tracking-tight text-foreground">
        Writing
      </h1>
      <p className="text-sm text-muted-foreground">
        Coming soon&mdash;99 reasons why we are building Klariti.
      </p>
    </div>
  );
};

export default WritingPage;
