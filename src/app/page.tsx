import type { Metadata, NextPage } from "next";
import Head from "next/head";
import Image from "next/image";

const heroImage = "/images/pc-land2.png";
import clsx from "clsx";
import { Card } from "@/components/Card";
import PillButton from "@/components/PillButton";
import Kline from "@/components/kline";
import Footer from "@/components/layout/Footer";

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

            <div className="relative z-10 w-full max-w-5xl mx-auto px-6 text-center pt-20 pb-32">
            <div className="mb-8 animate-fade-in-up">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 dark:text-gray-100 font-sans mb-4">
                The new standard <br />
                <span className="font-serif italic font-light">in digital wellness</span>
                </h1>
            </div>

            <div className="max-w-2xl mx-auto mb-10 animate-fade-in-up delay-100">
                <p className="text-lg md:text-xl text-gray-700 dark:text-gray-200 font-medium leading-relaxed">
                We&apos;re building a powerful suite of tools to empower our generation to enjoy the benefits of technology while fostering a <span className="italic font-serif">balanced, healthy relationship</span> with it.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-200">
                <PillButton
                href="/join"
                className="bg-gray-900 text-white hover:bg-gray-800 px-8 py-3 text-lg font-medium rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                Get started
                </PillButton>
                <PillButton
                href="/manifesto"
                className="bg-white/50 backdrop-blur-sm text-gray-900 hover:bg-white/80 px-8 py-3 text-lg font-medium rounded-full transition-all duration-300 border border-gray-200/50"
                >
                Read manifesto
                </PillButton>
            </div>
            </div>
        </div>

        {/* Content Below Hero */}
        <div className="relative z-10 bg-[#fdfbf7] dark:bg-zinc-900 w-full">
            
            {/* Trusted By Section */}
            <section className="py-12 border-b border-gray-200/50 dark:border-gray-800/50">
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

            {/* Stats Section */}
            <section className="py-24">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                        <div>
                            <div className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-2 font-sans">10.6x</div>
                            <div className="text-sm font-mono text-gray-500 uppercase tracking-wider">Better Focus</div>
                        </div>
                        <div>
                            <div className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-2 font-sans">37%</div>
                            <div className="text-sm font-mono text-gray-500 uppercase tracking-wider">Less Screen Time</div>
                        </div>
                        <div>
                            <div className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-2 font-sans">4.8x</div>
                            <div className="text-sm font-mono text-gray-500 uppercase tracking-wider">Productivity Boost</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-white/50 dark:bg-black/20">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="mb-16 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Designed to reclaim your attention.</h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400">Built to scale with your digital habits.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {/* Feature 1 */}
                        <div className="group p-6 rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-300 dark:hover:bg-zinc-800">
                            <div className="w-12 h-12 bg-gray-100 dark:bg-zinc-700 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-6 h-6 text-gray-700 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Deep Work</h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                                Eliminate distractions and enter a flow state effortlessly. Our tools block interruptions so you can focus on what matters.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="group p-6 rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-300 dark:hover:bg-zinc-800">
                            <div className="w-12 h-12 bg-gray-100 dark:bg-zinc-700 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-6 h-6 text-gray-700 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Privacy First</h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                                Your data stays yours. We believe in transparency and security, ensuring your digital footprint remains under your control.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="group p-6 rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-300 dark:hover:bg-zinc-800">
                            <div className="w-12 h-12 bg-gray-100 dark:bg-zinc-700 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-6 h-6 text-gray-700 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Habit Building</h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                                Track your progress and build lasting habits. Visual insights help you understand your usage patterns and improve over time.
                            </p>
                        </div>
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
