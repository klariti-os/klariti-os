import EmbedSection from "@/components/EmbedSection";
import { Metadata, NextPage } from "next";

export const metadata: Metadata = {
  title: "Resources",
  description: "Klariti pitch materials, videos, and documentation.",
};

const ResourcesPage: NextPage = () => {
  return (
    <div className="mx-auto max-w-content px-6 pb-32 pt-12">
      <p className="mb-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
        Resources
      </p>
      <h1 className="mb-12 font-editorial text-3xl font-light tracking-tight text-foreground">
        Learn More About Klariti
      </h1>

      <EmbedSection
        title="Pitch Video"
        description="Watch our vision for digital wellness."
        embedSrc="https://player.vimeo.com/video/1120696066?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479"
        buttonHref="https://player.vimeo.com/video/1120696066?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479"
        buttonText="Full Preview"
        allowAttributes="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />

      <EmbedSection
        title="Pitch Deck"
        description="View our pitch deck for investors and partners."
        embedSrc="https://www.canva.com/design/DAGk-4Dlif8/d-FbWZC_cKLN1-9J_DwhZQ/view?embed"
        buttonHref="https://www.canva.com/design/DAGk-4Dlif8/d-FbWZC_cKLN1-9J_DwhZQ/view?utm_content=DAGk-4Dlif8&utm_campaign=designshare&utm_medium=embeds&utm_source=link"
        buttonText="View in Canva"
        allowAttributes="fullscreen"
      />
    </div>
  );
};

export default ResourcesPage;

