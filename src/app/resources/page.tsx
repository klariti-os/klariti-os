import PillButton from "@/components/PillButton";
import { Metadata, NextPage } from "next";
import Head from "next/head";

export const metadata: Metadata = {
  title: "Solutions — Klariti OS",
};

const ToolsPage: NextPage = () => {
  return (
    <>
      <div className="px-6">
        <main className="w-full max-w-2xl mx-auto mt-10 mb-20">
          <h1 className="text-xl font-medium">Solutions</h1>
          <p className="mt-4 ">How we do it</p>

            <div className="flex flex-col max-w-3xl space-y-2">
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: 0,
                  paddingTop: "56.25%",
                  paddingBottom: 0,
                  boxShadow: "0 2px 20px 20px rgba(137, 156, 173, 0.16)",
                  marginTop: "1.6em",
                  marginBottom: "0.9em",
                  overflow: "hidden",
                  borderRadius: "8px",
                  willChange: "transform",
                }}
              >
                <iframe
                  loading="lazy"
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    top: 0,
                    left: 0,
                    border: "none",
                    padding: 0,
                    margin: 0,
                  }}
                  src="https://www.canva.com/design/DAGk-4Dlif8/d-FbWZC_cKLN1-9J_DwhZQ/view?embed"
                  allowFullScreen
                  allow="fullscreen"
                ></iframe>
              </div>
              <a
                href="https:&#x2F;&#x2F;www.canva.com&#x2F;design&#x2F;DAGk-4Dlif8&#x2F;d-FbWZC_cKLN1-9J_DwhZQ&#x2F;view?utm_content=DAGk-4Dlif8&amp;utm_campaign=designshare&amp;utm_medium=embeds&amp;utm_source=link"
                target="_blank"
                rel="noopener"
              >
                <PillButton>View in canva</PillButton>
              </a>{" "}
          </div>
        </main>
      </div>
    </>
  );
};

export default ToolsPage;

