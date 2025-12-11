import type { Metadata, NextPage } from "next";
import Head from "next/head";
import Image from "next/image";

const heroImage = "/images/klariti-dusk.jpg";

import clsx from "clsx";
import { Card } from "@/components/Card";
import PillButton from "@/components/PillButton";
import Kline from "@/components/kline";
import Footer from "@/components/layout/Footer";
import { FeatureCard } from "@/components/FeatureCard";

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
      <main className="relative min-h-screen flex flex-col overflow-x-hidden">
        {/* Hero Section */}
        <div className="relative w-full min-h-screen flex flex-col justify-center items-center">
             {/* Hero Background - Fixed to stay behind content or absolute to scroll with it? 
                User wants "scrollable", usually hero bg scrolls away or has parallax. 
                Let's make it absolute to the hero section so it scrolls away. 
             */}
            <div className="absolute inset-0 z-0">
            <Image
                src={heroImage}
                alt="Klariti Landscape"
                fill
                className="object-cover object-center opacity-90"
                priority
                quality={100}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/20 to-white/60 dark:from-black/10 dark:via-black/20 dark:to-black/60 mix-blend-overlay" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#fdfbf7] via-transparent to-transparent" />
            </div>

            <div className="relative z-10 w-full max-w-5xl mx-auto px-6 text-center pt-32 pb-32">
            <div className="mb-8 animate-fade-in-up">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-pp-editorial tracking-tight text-gray-100 mb-4">
                The new standard <br />
                <span className="italic font-light">in digital wellness</span>
                </h1>
            </div>

            <div className="max-w-2xl mx-auto mb-10 animate-fade-in-up delay-100">
                <p className="text-lg md:text-xl text-gray-200  font-medium leading-relaxed">
                We&apos;re building a powerful suite of tools to empower our generation to enjoy the benefits of technology while fostering a <span className="italic font-serif">balanced, healthy relationship</span> with it.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-200">
                <PillButton
                href="/auth"
                className="bg-gray-900 text-white hover:bg-gray-800 px-8 py-3 text-lg font-medium rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                Get started
                </PillButton>
                <PillButton
              href="/manifesto"
              className="bg-white/50 backdrop-blur-sm text-gray-900 hover:bg-white/80 px-8 py-3 text-lg font-medium rounded-full transition-all duration-300 border border-gray-200/50 font-pp-editorial"
            >
              Read manifesto
            </PillButton>
            </div>
            </div>
        </div>

        {/* Content Below Hero */}
        <div className="relative z-10 bg-[#fdfbf7]   w-full">
            
            {/* Trusted By Section */}
            <section className="py-12  dark:border-gray-800/50">
                <div className="max-w-5xl mx-auto px-6 text-center">
                    <p className="text-sm font-mono text-gray-500 uppercase tracking-widest mb-8">Built for those who value their time</p>
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Placeholders for logos - using text for now as per plan */}
                        <span className="text-xl font-bold font-serif text-gray-400">FOCUS</span>
                        <span className="text-xl font-bold font-serif text-gray-400">BALANCE</span>
                        <span className="text-xl font-bold font-serif text-gray-400">CLARITY</span>
                        <span className="text-xl font-bold font-serif text-gray-400">MINDFUL</span>
                        <span className="text-xl font-bold font-serif text-gray-400">ZEN</span>
                    </div>
                </div>
            </section>

                      <div className="my-4 h-px bg-gradient-to-r from-transparent via-slate-300/50 to-transparent"></div>



            {/* Stats Section */}
            <section className="py-24 ">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                        <div>
                            <div className="text-5xl md:text-6xl font-bold  text-gray-400 mb-2 font-sans">10.6x</div>
                            <div className="text-sm font-mono text-gray-500 uppercase tracking-wider">Better Focus</div>
                        </div>
                        <div>
                            <div className="text-5xl md:text-6xl font-bold  text-gray-400 mb-2 font-sans">37%</div>
                            <div className="text-sm font-mono text-gray-500 uppercase tracking-wider">Less Screen Time</div>
                        </div>
                        <div>
                            <div className="text-5xl md:text-6xl font-bold  text-gray-400 mb-2 font-sans">4.8x</div>
                            <div className="text-sm font-mono text-gray-500 uppercase tracking-wider">Productivity Boost</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-[#fdfbf7]">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="mb-20 text-left">
                        <h2 className="text-4xl md:text-5xl font-pp-editorial text-gray-900 mb-6 tracking-tight">Designed to improve outcomes. <br/>Built to scale across campuses.</h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400">A privacy-safe attention layer for learning and wellbeing.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-12">
                        <FeatureCard
                            title="Improve learning outcomes"
                            description="Klariti “tap-in” focus sessions and LMS-aware nudges increase time-on-task and participation—without locking devices."
                            kpi="+18% time-on-task (pilot)"
                            icon={
                                <svg className="w-8 h-8 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            }
                        />
                        <FeatureCard
                            title="Privacy by design"
                            description="Local processing, least-privilege scopes, aggregate dashboards. SOC 2/ISO roadmap; FERPA/HITRUST-aligned where needed."
                            kpi="Aggregate-only • No ad-tech"
                            icon={
                                <svg className="w-8 h-8 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            }
                        />
                        <FeatureCard
                            title="Peer networks amplify results"
                            description="Focus groups, class challenges, and streaks turn healthy tech use into a shared norm. As more classes join, network effects boost adoption."
                            kpi="+25% weekly retention in groups"
                            icon={
                                <svg className="w-8 h-8 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            }
                        />
                    </div>
                </div>
            </section>

            <Footer />
        </div>
      </main>
    </>
  );
};

export default HomePage;
