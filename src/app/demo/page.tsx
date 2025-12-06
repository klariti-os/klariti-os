import EmbedSection from "@/components/EmbedSection";
import { Metadata, NextPage } from "next";
import Head from "next/head";

export const metadata: Metadata = {
  title: "Demo — Klariti OS",
};

const ToolsPage: NextPage = () => {
  return (
    <>
      <div className="px-6 pt-12">
        <main className="w-full max-w-2xl mx-auto mt-10 mb-20">
          {/* <EmbedSection
            title="Pitch Video"
            description="watch our pitch video"
            embedSrc="https://player.vimeo.com/video/1120696066?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479"
            buttonHref="https://player.vimeo.com/video/1120696066?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479"
            buttonText="Full Preview"
            allowAttributes="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          /> */}
          <EmbedSection
            title="Pitch Deck"
            description="view our pitch deck"
            embedSrc="https://www.canva.com/design/DAG6Sd_uD6U/iSLUSfKDkV3qLFW0He-4mA/view?embed"
            buttonHref="https://www.canva.com/design/DAG6Sd_uD6U/sZAn3cJ-HLrwtUjMMEpd1w/view"
            buttonText="View in canva"
            allowAttributes="fullscreen"
          />
        </main>
      </div>
    </>
  );
};

export default ToolsPage;

