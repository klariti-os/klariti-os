import type { Metadata, NextPage } from "next";
import Head from "next/head";
import Image from "next/image";

import image1 from "@/images/photos/image-1.jpg";
import image2 from "@/images/photos/image-2.jpg";
import image3 from "@/images/photos/image-3.jpg";
import image4 from "@/images/photos/image-4.jpg";
import image5 from "@/images/photos/image-5.jpg";
import clsx from "clsx";
import { Card } from "@/components/Card";
import PillButton from "@/components/PillButton";
import Kline from "@/components/kline";

export const metadata: Metadata = {
  title: "Klariti OS",
  description:
    "Reklaim your time — Develop a healthy relationship with technology",
  openGraph: {
    title: "Klariti .ORG",
    description: "Develope a healthier relationship with technology",
    images: [
      {
        url: "public/images/pc-land2.png",
        width: 1200,
        height: 630,
        alt: "Klariti OS - Reklaim your time",
      },
    ],
  },
};

function Photos() {
  let rotations = ["rotate-2", "-rotate-2"];

  return (
    <div className="mt-16 sm:mt-20 ">
      <div className="-my-4 flex justify-center gap-5 overflow-x-scroll py-4 sm:gap-8">
        {[image1, image2, image3, image4, image5].map((image, imageIndex) => (
          <div
            key={image.src}
            className={clsx(
              "relative aspect-[9/10] w-44 flex-none overflow-hidden rounded-xl bg-zinc-100 sm:w-72 sm:rounded-2xl dark:bg-zinc-800",
              rotations[imageIndex % rotations.length]
            )}
          >
            <Image
              src={image}
              alt=""
              sizes="(min-width: 640px) 18rem, 11rem"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

const HomePage: NextPage = () => {
  const jsonSchema = JSON.stringify([
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Klariti OS",
      url: "https://klariti.org",
    },
  ]);
  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonSchema,
          }}
        />
      </Head>
      <main className="pb-32">
        <div className="px-6">
          <section className="w-full  max-w-xl mx-auto mt-20">
            <h1 className="italic font-bold text-zinc-800 font-mono text-2xl">
              Klariti OS{" "}
            </h1>
            <span className="font-mono text-slate-600">
              {" "}
              Develop a <Kline className="font-bold italic">
                healthier
              </Kline>{" "}
              relationship with technology
            </span>
            <div className="rounded-lg p-2 bg-slate-100 bg-opacity-0 backdrop-blur-sm">
              <p className="text-slate-900 mt-4 font-mono text-lg italic font-medium">
                we&apos;re building a powerful suite of tools to empower our
                generation to enjoy the benefits of technology while fostering a
                balanced, healthy relationship with it.
              </p>
              <br />
              <PillButton
                href="/join"
                className="mb-3 uppercase bg-gradient-to-r from-gray-800 via-pink-700 to-slate-900 text-white font-bold py-2 px-4 rounded-full shadow-[0_0_5px_rgba(255,25,25,0.9)] hover:shadow-[0_0_20px_rgba(255,255,255,1)] transition-all duration-300"
              >
                join us
              </PillButton>

              <br />
              <PillButton href="/manifesto" className=" uppercase">
                read our manifesto
              </PillButton>
            </div>
            <Photos />

          
          </section>
        </div>
      </main>
    </>
  );
};

export default HomePage;
