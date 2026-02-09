import { Metadata, NextPage } from "next";

export const metadata: Metadata = {
  title: "Projects",
  description: "Things we have built or attempted to build.",
};

const ProjectsPage: NextPage = () => {
  return (
    <div className="mx-auto max-w-content px-6 pb-32 pt-12">
      <p className="mb-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
        Projects
      </p>
      <h1 className="mb-4 font-editorial text-3xl font-light tracking-tight text-foreground">
        Projects
      </h1>
      <p className="text-sm text-muted-foreground">
        Coming soon.
      </p>
    </div>
  );
};

export default ProjectsPage;
