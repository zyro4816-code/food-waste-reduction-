// client/src/components/home/HeroSection.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, HeartHandshake, ShieldCheck, ChevronDown } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Word-by-word headline reveal
  const headlineWords = ['Good', 'Food', 'Deserves', 'a', 'Second', 'Chance.'];

  // Wordmark letters for SAVEPLATE
  const wordmarkLetters = ['S', 'A', 'V', 'E', 'P', 'L', 'A', 'T', 'E'];

  return (
    <section className="relative min-h-screen w-full flex flex-col justify-between items-center overflow-hidden bg-saveplate-black pt-28 pb-8 px-4 sm:px-6 lg:px-8">
      {/* 1. CINEMATIC FOOD-RELATED BACKGROUND VIDEO & REALISTIC FALLBACK */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* High quality food video (vegetables harvest, wholesome meal prep, artisan bread) */}
        <video
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={() => setVideoLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 scale-105 ${
            videoLoaded ? 'opacity-35' : 'opacity-0'
          }`}
          poster="https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=2000&q=80"
        >
          {/* Public domain food sustainability & culinary footage */}
          <source
            src="https://assets.mixkit.co/videos/preview/mixkit-hands-cutting-fresh-vegetables-in-a-kitchen-41480-large.mp4"
            type="video/mp4"
          />
        </video>

        {/* Fallback & Image Layer: realistic food photography */}
        <div
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
            videoLoaded ? 'opacity-20' : 'opacity-40'
          }`}
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=2000&q=80")'
          }}
        />

        {/* Dark Cinematic Gradient Overlays for optimal readability and depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-saveplate-black/85 via-saveplate-deep/75 to-saveplate-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-saveplate-forest/30 via-transparent to-saveplate-black/90" />

        {/* Subtle animated floating particles */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute top-1/4 left-1/5 w-72 h-72 rounded-full bg-saveplate-neon/10 blur-[100px] animate-float" />
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full bg-emerald-900/20 blur-[120px] animate-float" style={{ animationDelay: '2s' }} />
        </div>
      </div>

      {/* 2. HERO CONTENT CONTAINER */}
      <div className="relative z-10 max-w-5xl mx-auto w-full flex flex-col items-center text-center my-auto">
        {/* Live Status Indicator Pill */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-saveplate-deep/80 border border-saveplate-neon/30 backdrop-blur-xl mb-6 shadow-neon"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-saveplate-neon opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-saveplate-neon"></span>
          </span>
          <span className="text-xs font-semibold uppercase tracking-widest text-saveplate-neon">
            Live Surplus Recovery Network Active
          </span>
          <span className="text-white/30">|</span>
          <span className="text-xs text-saveplate-cream/80 font-medium hidden sm:inline">
            1,720+ kg Food Rescued This Week
          </span>
        </motion.div>

        {/* Masked Word-By-Word Dramatic Headline Reveal */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-extrabold tracking-tight text-white leading-[1.08] max-w-4xl mb-6 flex flex-wrap justify-center gap-x-3 sm:gap-x-4">
          {headlineWords.map((word, index) => (
            <span key={index} className="overflow-hidden inline-block py-1">
              <motion.span
                initial={{ y: '120%', filter: 'blur(8px)', opacity: 0 }}
                animate={{ y: '0%', filter: 'blur(0px)', opacity: 1 }}
                transition={{
                  duration: 0.9,
                  delay: 0.15 + index * 0.1,
                  ease: [0.16, 1, 0.3, 1]
                }}
                className={`inline-block ${
                  word === 'Second' || word === 'Chance.'
                    ? 'text-saveplate-neon drop-shadow-[0_0_25px_rgba(57,255,20,0.35)]'
                    : 'text-saveplate-cream'
                }`}
              >
                {word}
              </motion.span>
            </span>
          ))}
        </h1>

        {/* Animated Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: 'easeOut' }}
          className="text-lg sm:text-xl text-saveplate-muted max-w-2xl font-normal leading-relaxed mb-10"
        >
          Rescue surplus food. Reduce waste. Feed communities. Create a sustainable future.
        </motion.p>

        {/* Action Buttons with magnetic and glowing effects */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          {/* Primary CTA: Donate Surplus Food */}
          <Link
            to="/donate"
            data-cursor-donate="true"
            data-cursor-text="DONATE"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-saveplate-neon text-black font-display font-bold text-base tracking-wide flex items-center justify-center gap-3 transition-all duration-300 shadow-neon hover:shadow-neon-strong hover:scale-[1.03] active:scale-[0.98] group"
          >
            <span>Donate Surplus Food</span>
            <ArrowRight className="w-5 h-5 text-black group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Secondary CTA: Find Available Food */}
          <Link
            to="/browse"
            data-cursor-text="EXPLORE"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-saveplate-forest/40 hover:bg-saveplate-forest/70 text-saveplate-cream hover:text-white font-display font-semibold text-base border border-saveplate-neon/30 hover:border-saveplate-neon backdrop-blur-xl transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-saveplate-neon" />
            <span>Find Available Food</span>
          </Link>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.8 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-saveplate-muted/90"
        >
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-saveplate-neon" />
            <span>Good Samaritan Protected</span>
          </div>
          <span className="hidden sm:inline text-white/20">•</span>
          <div className="flex items-center gap-1.5">
            <HeartHandshake className="w-4 h-4 text-saveplate-neon" />
            <span>Strict Cold-Chain Temperature Verified</span>
          </div>
          <span className="hidden sm:inline text-white/20">•</span>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-saveplate-neon" />
            <span>Zero Platform Fees</span>
          </div>
        </motion.div>
      </div>

      {/* 3. GIANT ANIMATED WORDMARK: "SAVEPLATE" */}
      <div className="relative z-10 w-full max-w-7xl mx-auto pt-10 select-none overflow-hidden border-t border-white/5">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-widest text-saveplate-muted mb-2 px-2 font-mono">
          <span>Surplus Redistribution Platform</span>
          <span>EST. 2026 // MISSION ZERO WASTE</span>
        </div>

        <div className="flex justify-between items-center w-full overflow-hidden">
          {wordmarkLetters.map((char, index) => (
            <motion.span
              key={index}
              initial={{ x: -40, opacity: 0, filter: 'blur(12px)' }}
              animate={{ x: 0, opacity: 1, filter: 'blur(0px)' }}
              transition={{
                duration: 1.2,
                delay: 0.6 + index * 0.08,
                ease: [0.16, 1, 0.3, 1]
              }}
              className="text-[12vw] font-display font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white/30 via-saveplate-cream/15 to-transparent hover:text-saveplate-neon/40 transition-colors"
            >
              {char}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <div className="relative z-10 pt-2 flex justify-center">
        <a
          href="#impact-stats"
          className="flex flex-col items-center gap-1 text-[10px] tracking-widest uppercase text-saveplate-muted hover:text-saveplate-neon transition-colors"
        >
          <span>Explore Platform</span>
          <ChevronDown className="w-4 h-4 animate-bounce text-saveplate-neon" />
        </a>
      </div>
    </section>
  );
};

