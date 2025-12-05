import type { Metadata, NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import localFont from 'next/font/local';

import image1 from "@/images/photos/image-1.jpg";
import image2 from "@/images/photos/image-2.jpg";
import image3 from "@/images/photos/image-3.jpg";
import image4 from "@/images/photos/image-4.jpg";
import image5 from "@/images/photos/image-5.jpg";
import clsx from "clsx";
import { Card } from "@/components/Card";
import PillButton from "@/components/PillButton";
import Kline from "@/components/kline";

// Using PP Editorial New Regular for manifesto content
const ppEditorialRegular = localFont({
  src: [
    {
      path: '../../../public/fonts/editorial-new/PPEditorialNew-Regular.otf',
      weight: '400',
      style: 'normal',
    }
  ],
  variable: '--font-pp-editorial-regular',
  display: 'swap',
});

// Using PP Editorial New Italic for emphasis
const ppEditorialItalic = localFont({
  src: [
    {
      path: '../../../public/fonts/editorial-new/PPEditorialNew-Italic.otf',
      weight: '400',
      style: 'italic',
    }
  ],
  variable: '--font-pp-editorial-italic',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Klariti OS",
  description:
    "Reklaim your time — develop a healthy relationship with technology",
  openGraph: {
    title: "Reklaim your time",
    description: "Fight digital addiction",
  },
};

const Manifesto: NextPage = () => {
  const jsonSchema = JSON.stringify([
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Klariti OS",
      url: "https://klariti.org",
    },
  ]);
  return (
    <div className={`${ppEditorialRegular.variable} ${ppEditorialItalic.variable}`}>
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
          <section className="w-full  max-w-xl mx-auto mt-12">

            <h1 className="font-pp-editorial-italic text-slate-300 text-2xl font-bold">
              Manifesto
            </h1>
            <br />
            <p className="p-4 bg-slate-100 text-gray-900 text-2xl bg-opacity-[30%] backdrop-blur-sm rounded-xl font-pp-editorial-regular flex flex-col gap-4">
              <span>
                Technology was supposed to be a tool to enhance our lives, a
                tool to help us communicate with our loved ones, a tool to help
                us learn new things, a tool to help us grow as individuals.
              </span>

              <span>
                But let&apos;s face it... Uncle Zuckerburger doesn&apos;t care
                about you, the tech-billionaires doesn&apos;t care about you!
              </span>

              <span>
                They have instead turned what was suppposed to be a a tool to
                enhance our lives, into an addictive machine optimized to keep
                us hooked!
              </span>

              <span>
                They have turned us into a product, a data point to be sold to
                the highest bidder. All these at the expense of our mental
                health and our precious time.
              </span>

              <span>
                The have invested billions of dollars into creating the most
                sophisticated algorithmic systems to make sure that we are never
                free no matter how disciplined we are!
              </span>
              <span>
                Just quitting using digital tools is almost impossible since
                they have become an essential part of our lives.
              </span>
              <span>
                So <Kline>this is our attempt to fight back</Kline>. <br /> <br /> We are
                building a suite of tools that empower our generation to enjoy
                technology&apos;s benefits while fostering a healthy
                relationship with it.
              </span>
            </p>
            <div className="uppercase mt-8 ">
              <PillButton className="mb-3 uppercase bg-gradient-to-r from-gray-800 via-pink-700 to-slate-900 text-white font-bold py-2 px-4 rounded-full shadow-[0_0_5px_rgba(255,25,25,0.9)] hover:shadow-[0_0_20px_rgba(255,255,255,1)] transition-all duration-300"  href="/join">Join US</PillButton>
            </div>
        
           
          </section>
        </div>
      </main>
    </div>
  );
};

export default Manifesto;
