'use client';

import React, { useState } from 'react';
import { InteractiveRobotSpline } from '@/components/ui/interactive-3d-robot';
import { CustomCursor } from '@/components/ui/custom-cursor';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Sparkle, MousePointer2, Layers } from 'lucide-react';

export function WhobeeDemo() { 
  const ROBOT_SCENE_URL = "https://prod.spline.design/PyzDhpQ9E5f1E3MT/scene.splinecode";
  const [isHovered, setIsHovered] = useState(false);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, 50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -30]);

  return (
    <>
      <CustomCursor />
      <div className="relative min-h-screen bg-stone-50 overflow-hidden cursor-none">
      
      {/* Hero Landscape Background - Full bleed */}
      <div className="fixed inset-0 z-0">
        <motion.div 
          style={{ y: y1 }}
          className="absolute inset-0"
        >
          <div 
            className="w-full h-[120vh] bg-cover bg-center"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2400&q=90')",
              filter: 'brightness(0.85) contrast(1.1)',
            }}
          />
          {/* Subtle gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-stone-900/20 via-transparent to-stone-50" />
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        
        {/* Navigation */}
        <nav className="absolute top-0 left-0 right-0 z-50 px-6 py-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-center gap-2"
            >
              <div className="w-2 h-2 rounded-full bg-amber-600" />
              <span className="font-playfair text-xl text-stone-900 tracking-tight">Whobee</span>
            </motion.div>
            
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="px-5 py-2.5 text-sm font-medium text-stone-700 hover:text-stone-900 transition-colors"
            >
              Explore
            </motion.button>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center">
          <div className="max-w-7xl mx-auto px-6 py-32 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              
              {/* Left Column - Text Content */}
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="lg:col-span-5 space-y-8"
              >
                {/* Eyebrow */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-stone-200 shadow-sm">
                  <Sparkle className="w-3.5 h-3.5 text-amber-600" strokeWidth={2} />
                  <span className="text-xs font-medium text-stone-700 tracking-wide uppercase">Interactive Experience</span>
                </div>

                {/* Main Heading */}
                <h1 className="font-playfair text-6xl lg:text-7xl text-stone-900 leading-[0.95] tracking-tight">
                  Meet your
                  <br />
                  <span className="italic text-stone-700">digital companion</span>
                </h1>

                {/* Description */}
                <p className="text-lg text-stone-600 leading-relaxed max-w-md font-light">
                  Whobee is a playful 3D character that responds to your every move. 
                  Click, drag, and watch as it comes alive on your screen.
                </p>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button 
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className="group px-8 py-4 bg-stone-900 text-white rounded-full font-medium text-sm hover:bg-stone-800 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <span>Start Exploring</span>
                    <ArrowRight 
                      className={`w-4 h-4 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} 
                      strokeWidth={2}
                    />
                  </button>
                  
                  <button className="px-8 py-4 bg-white/80 backdrop-blur-sm text-stone-900 rounded-full font-medium text-sm hover:bg-white transition-all duration-300 border border-stone-200 shadow-sm hover:shadow-md">
                    Learn More
                  </button>
                </div>

                {/* Features List */}
                <div className="pt-8 space-y-3">
                  {[
                    { icon: MousePointer2, text: 'Fully interactive 3D model' },
                    { icon: Layers, text: 'Smooth 60fps animations' },
                    { icon: Sparkle, text: 'Physics-based movements' },
                  ].map((feature, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.8 + i * 0.1 }}
                      className="flex items-center gap-3 text-stone-600"
                    >
                      <feature.icon className="w-4 h-4 text-amber-600" strokeWidth={2} />
                      <span className="text-sm font-light">{feature.text}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Right Column - 3D Robot */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.6 }}
                className="lg:col-span-7 relative"
              >
                <div className="relative aspect-square lg:aspect-[4/3] rounded-3xl overflow-hidden bg-gradient-to-br from-stone-100 to-stone-200 shadow-2xl border border-stone-200">
                  <InteractiveRobotSpline
                    scene={ROBOT_SCENE_URL}
                    className="w-full h-full" 
                  />
                  
                  {/* Decorative corner accent */}
                  <div className="absolute top-6 right-6 w-16 h-16 border-t-2 border-r-2 border-amber-600/30 rounded-tr-2xl" />
                  <div className="absolute bottom-6 left-6 w-16 h-16 border-b-2 border-l-2 border-amber-600/30 rounded-bl-2xl" />
                </div>

                {/* Floating info card */}
                <motion.div
                  style={{ y: y2 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1.2 }}
                  className="absolute -bottom-8 -left-8 bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-stone-200 max-w-xs"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0">
                      <Sparkle className="w-6 h-6 text-white" strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className="font-medium text-stone-900 mb-1">Try it yourself</h3>
                      <p className="text-sm text-stone-600 font-light leading-relaxed">
                        Click and drag Whobee around. Watch how it responds to your interactions.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* Bottom Section - Specs */}
        <section className="relative bg-white/60 backdrop-blur-md border-t border-stone-200">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: '60', unit: 'FPS', label: 'Smooth performance' },
                { value: '<2', unit: 'MB', label: 'Lightweight load' },
                { value: '100', unit: '%', label: 'Interactive' },
                { value: '3D', unit: '', label: 'Real-time rendering' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="font-playfair text-4xl md:text-5xl text-stone-900 mb-1">
                    {stat.value}
                    <span className="text-2xl text-amber-600">{stat.unit}</span>
                  </div>
                  <div className="text-sm text-stone-500 font-light">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </div>
    </>
  );
}
