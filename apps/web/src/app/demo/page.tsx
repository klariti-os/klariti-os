import EmbedSection from "@/components/EmbedSection";
import { Metadata, NextPage } from "next";

export const metadata: Metadata = {
  title: "Demo",
  description: "See Klariti in action.",
};

const DemoPage: NextPage = () => {
  return (
    <div className="mx-auto max-w-content px-6 pb-32 pt-20">
      <p className="mb-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
        Demo
      </p>
      <h1 className="mb-12 font-serif text-3xl font-light tracking-tight text-foreground">
        See Klariti in Action
      </h1>

      <EmbedSection
        title="Pitch Deck"
        description="View our latest pitch deck."
        embedSrc="https://www.canva.com/design/DAG6Sd_uD6U/iSLUSfKDkV3qLFW0He-4mA/view?embed"
        buttonHref="https://www.canva.com/design/DAG6Sd_uD6U/sZAn3cJ-HLrwtUjMMEpd1w/view"
        buttonText="View in Canva"
        allowAttributes="fullscreen"
      />
    </div>
  );
};

export default DemoPage;
