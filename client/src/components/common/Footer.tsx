// client/src/components/common/Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UtensilsCrossed, Heart, Globe, Mail, Phone, ShieldCheck, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  const wordmarkLetters = ['S', 'A', 'V', 'E', 'P', 'L', 'A', 'T', 'E'];

  return (
    <footer className="relative bg-saveplate-black border-t border-white/10 overflow-hidden pt-20 pb-12">
      {/* Background ambient glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-64 bg-saveplate-forest/20 blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Section with Mission Statement */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-white/10">
          <div className="lg:col-span-5">
            <Link to="/" className="flex items-center gap-2.5 mb-6 group">
              <div className="w-10 h-10 rounded-xl bg-saveplate-forest border border-saveplate-neon/40 flex items-center justify-center text-saveplate-neon shadow-neon">
                <UtensilsCrossed className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </div>
              <span className="font-display font-black tracking-wider text-2xl text-white">
                SAVE<span className="text-saveplate-neon">PLATE</span>
              </span>
            </Link>

            <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-white mb-3">
              Every Meal Matters.
            </h3>
            <p className="text-base text-saveplate-neon font-medium mb-4">
              Save Food. Share Hope. Repeat.
            </p>
            <p className="text-xs sm:text-sm text-saveplate-muted leading-relaxed max-w-md">
              A high-precision surplus food redistribution network transforming commercial waste into nutritional dignity for community shelters and families.
            </p>
          </div>

          {/* Quick Links Columns */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8 text-xs">
            {/* Column 1 */}
            <div>
              <h4 className="font-mono text-xs uppercase tracking-widest text-saveplate-neon font-bold mb-4">
                Platform
              </h4>
              <ul className="space-y-2.5 text-saveplate-muted">
                <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/browse" className="hover:text-white transition-colors">Find Available Food</Link></li>
                <li><Link to="/donate" className="hover:text-white transition-colors">Donate Surplus Food</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">About Food Waste</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
              </ul>
            </div>

            {/* Column 2 */}
            <div>
              <h4 className="font-mono text-xs uppercase tracking-widest text-saveplate-neon font-bold mb-4">
                Community
              </h4>
              <ul className="space-y-2.5 text-saveplate-muted">
                <li><Link to="/about" className="hover:text-white transition-colors">Food Banks & NGOs</Link></li>
                <li><Link to="/donate" className="hover:text-white transition-colors">Restaurant Donors</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">Cold-Chain Guidelines</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">Good Samaritan Laws</Link></li>
                <li><Link to="/admin" className="hover:text-white transition-colors">Admin Portal</Link></li>
              </ul>
            </div>

            {/* Column 3 */}
            <div>
              <h4 className="font-mono text-xs uppercase tracking-widest text-saveplate-neon font-bold mb-4">
                Legal & Safety
              </h4>
              <ul className="space-y-2.5 text-saveplate-muted">
                <li><span className="hover:text-white cursor-pointer">Privacy Policy</span></li>
                <li><span className="hover:text-white cursor-pointer">Terms & Conditions</span></li>
                <li><span className="hover:text-white cursor-pointer">Food Handling Protocol</span></li>
                <li><span className="hover:text-white cursor-pointer">Audit & Compliance</span></li>
                <li><span className="text-saveplate-neon/80 font-medium">status: operational</span></li>
              </ul>
            </div>
          </div>
        </div>

        {/* GIANT ANIMATED WORDMARK IN FOOTER */}
        <div className="py-12 border-b border-white/10 select-none overflow-hidden">
          <div className="flex justify-between items-center w-full overflow-hidden">
            {wordmarkLetters.map((char, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.05,
                  ease: [0.16, 1, 0.3, 1]
                }}
                className="text-[13vw] font-display font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-t from-white/20 via-saveplate-cream/10 to-transparent hover:text-saveplate-neon/30 transition-colors"
              >
                {char}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Bottom copyright & attribution */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-saveplate-muted gap-4">
          <div>
            &copy; {new Date().getFullYear()} SAVEPLATE Inc. All rights reserved. Zero Food Waste Initiative.
          </div>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-saveplate-neon">
              <ShieldCheck className="w-4 h-4" /> Relational DB Verified
            </span>
            <span>San Francisco • Oakland • Berkeley</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

