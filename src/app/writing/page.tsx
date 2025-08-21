import { Card } from "@/components/Card";
import { Metadata, NextPage } from "next";

export const metadata: Metadata = {
  title: "Blog — Klariti OS",
};

const WritingPage: NextPage = () => {
  return (
    <>
      <div className="px-6">
        <main className="w-full max-w-2xl mx-auto mt-10 mb-20">
          <h1 className="text-xl font-medium">Blog</h1>
          <p className="mt-4 ">99 reasons why we are building Klariti OS</p>

          
        </main>
      </div>
    </>
  );
};

export default WritingPage;
