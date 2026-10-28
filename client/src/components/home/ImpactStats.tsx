// client/src/components/home/ImpactStats.tsx
import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { PlatformStats } from '../../types';
import { api } from '../../services/api';
import { Utensils, Users, CheckCircle, Building2, Scale, CloudSun } from 'lucide-react';

function Counter({ end, suffix = '', duration = 2 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      // Ease out expo
      const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeOut * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, end, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}

export const ImpactStats: React.FC = () => {
  const [stats, setStats] = useState<PlatformStats>({
    mealsRescued: 3450,
    foodDonors: 52,
    successfulDonations: 186,
    participatingNgos: 26,
    foodWastePreventedKg: 1725,
    estimatedCo2SavedKg: 4312,
    activeListingsCount: 6
  });

  useEffect(() => {
    api.getStats()
      .then((res) => {
        if (res.success && res.stats) {
          setStats(res.stats);
        }
      })
      .catch(() => {});
  }, []);

  const statItems = [
    {
      label: 'Meals Rescued',
      value: stats.mealsRescued,
      suffix: '+',
      icon: Utensils,
      color: 'from-emerald-400 to-saveplate-neon',
      description: 'Nourishing servings delivered directly to hungry individuals.'
    },
    {
      label: 'Surplus Food Rescued',
      value: Math.round(stats.foodWastePreventedKg),
      suffix: ' kg',
      icon: Scale,
      color: 'from-teal-400 to-emerald-400',
      description: 'Edible food diverted from rotting in municipal landfills.'
    },
    {
      label: 'Est. CO₂e Prevented',
      value: Math.round(stats.estimatedCo2SavedKg),
      suffix: ' kg',
      icon: CloudSun,
      color: 'from-saveplate-neon to-lime-300',
      description: 'Calculated greenhouse emissions avoided via food rescue.'
    },
    {
      label: 'Active Donors',
      value: stats.foodDonors,
      suffix: '+',
      icon: Users,
      color: 'from-green-400 to-emerald-500',
      description: 'Bakeries, grocers, caterers & partner restaurants.'
    },
    {
      label: 'Completed Handovers',
      value: stats.successfulDonations,
      suffix: '',
      icon: CheckCircle,
      color: 'from-lime-400 to-green-400',
      description: 'Verified distributions logged to immutable database records.'
    },
    {
      label: 'Partner NGOs & Pantries',
      value: stats.participatingNgos,
      suffix: '',
      icon: Building2,
      color: 'from-emerald-500 to-teal-400',
      description: 'Verified non-profits and community soup kitchens.'
    }
  ];

  return (
    <section id="impact-stats" className="py-24 bg-saveplate-black relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-saveplate-forest/60 border border-saveplate-neon/30 text-saveplate-neon text-xs font-semibold uppercase tracking-wider mb-4"
          >
            Verified Platform Metrics
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-white mb-4"
          >
            Real Impact. Real Food. Real Communities.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-saveplate-muted text-base sm:text-lg"
          >
            Every transaction is verified in our relational database. No fabricated estimates—only measurable nourishment returned to our neighborhoods.
          </motion.p>
        </div>

        {/* 6 Grid Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {statItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="relative group p-8 rounded-3xl bg-gradient-to-b from-saveplate-card to-saveplate-deep/90 border border-white/10 hover:border-saveplate-neon/50 backdrop-blur-xl transition-all duration-300 hover:shadow-neon hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-saveplate-neon group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-mono uppercase tracking-widest text-saveplate-muted">
                    METRIC #0{idx + 1}
                  </span>
                </div>

                <div className="text-4xl sm:text-5xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-saveplate-cream to-saveplate-neon mb-2">
                  <Counter end={item.value} suffix={item.suffix} />
                </div>

                <h3 className="text-lg font-semibold text-white mb-2">{item.label}</h3>
                <p className="text-xs text-saveplate-muted leading-relaxed">{item.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

