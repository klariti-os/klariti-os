"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { Metadata, NextPage } from "next";
import Head from "next/head";

const ToolsPage: NextPage = () => {
  return (
    <ProtectedRoute>
      <div className="px-6">
        <main className="w-full max-w-2xl mx-auto mt-10 mb-20">
          <h1 className="text-xl font-medium">ios playground</h1>
          <p className="mt-4 ">Testing and viewing ios demos and protypes</p>

          <div className="mt-6">
            <div className="flex flex-col max-w-3xl space-y-2">
              <div
                data-snack-id="@ignasxv/klariti-os"
                data-snack-platform="web"
                data-snack-preview="true"
                data-snack-theme="light"
                style={{
                  overflow: "hidden",
                  background: "#fbfcfd",
                  border: "1px solid var(--color-border)",
                  borderRadius: "4px",
                  height: "505px",
                  width: "100%",
                }}
              ></div>
              <script async src="https://snack.expo.dev/embed.js"></script>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default ToolsPage;
