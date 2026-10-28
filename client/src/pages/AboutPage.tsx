// client/src/pages/AboutPage.tsx
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Scale, CloudSun, Droplets, ShieldCheck, BookOpen, Heart, ArrowRight } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const [articles, setArticles] = useState<any[]>([]);

  useEffect(() => {
    api.getArticles()
      .then((res) => {
        if (res.success && res.articles) setArticles(res.articles);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen pt-32 pb-24 bg-saveplate-black px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-mono uppercase tracking-widest text-saveplate-neon">
          Environmental Science & Logistics
        </span>
        <h1 className="text-4xl sm:text-6xl font-display font-extrabold text-white mt-2 mb-4 leading-tight">
          The Hidden Cost of Food Waste
        </h1>
        <p className="text-base sm:text-lg text-saveplate-muted leading-relaxed">
          Globally, one-third of all food produced is never eaten. Understanding the chain of surplus food turns waste into nutritional abundance.
        </p>
      </div>

      {/* 3 Core Impact Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        <div className="p-8 rounded-3xl bg-saveplate-deep/80 border border-white/10 hover:border-saveplate-neon/40 backdrop-blur-xl transition-all shadow-glass">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mb-6">
            <CloudSun className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-display font-bold text-white mb-2">Potent Methane Emissions</h3>
          <p className="text-xs sm:text-sm text-saveplate-muted leading-relaxed">
            When organic matter decays anaerobically in landfills, it creates methane gas—a greenhouse agent over 28 times more heat-trapping than CO₂ over a 100-year timescale.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-saveplate-deep/80 border border-white/10 hover:border-saveplate-neon/40 backdrop-blur-xl transition-all shadow-glass">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-6">
            <Droplets className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-display font-bold text-white mb-2">Squandered Fresh Water</h3>
          <p className="text-xs sm:text-sm text-saveplate-muted leading-relaxed">
            Agriculture consumes 70% of freshwater withdrawals globally. Throwing away 1 kilogram of beef wastes 15,000 liters of water; wasting 1 loaf of bread squanders 1,000 liters.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-saveplate-deep/80 border border-white/10 hover:border-saveplate-neon/40 backdrop-blur-xl transition-all shadow-glass">
          <div className="w-12 h-12 rounded-2xl bg-saveplate-neon/10 text-saveplate-neon flex items-center justify-center mb-6">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-display font-bold text-white mb-2">The Nutritional Paradox</h3>
          <p className="text-xs sm:text-sm text-saveplate-muted leading-relaxed">
            While supermarkets and caterers discard excess trays, 1 in 8 families face nutritional insecurity. SavePlate closes this gap with zero-latency logistics.
          </p>
        </div>
      </div>

      {/* Legal & Best Practices Guide */}
      <div className="p-8 sm:p-12 rounded-3xl bg-saveplate-forest/30 border border-saveplate-border backdrop-blur-2xl shadow-glass mb-20">
        <div className="max-w-3xl">
          <span className="text-xs font-mono uppercase tracking-widest text-saveplate-neon">
            Legal Safety Standard
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mt-1 mb-4">
            The Bill Emerson Good Samaritan Food Donation Act
          </h2>
          <p className="text-xs sm:text-sm text-saveplate-cream/80 leading-relaxed mb-6">
            Passed by the US Federal Government to encourage food donation, the Act protects businesses and non-profits from civil and criminal liability when donating wholesome food in good faith. Donors are safeguarded against liability unless gross negligence or intentional misconduct is proven.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-saveplate-deep/80 border border-white/10 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-saveplate-neon shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block mb-0.5">Strict Temperature Logging</span>
                <span className="text-saveplate-muted">Hot foods maintained &gt;60°C or chilled to &lt;4°C within 2 hours.</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-saveplate-deep/80 border border-white/10 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-saveplate-neon shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block mb-0.5">Clear Allergen Labeling</span>
                <span className="text-saveplate-muted">Disclosing common allergens: gluten, dairy, peanuts, shellfish.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Educational Articles from Database */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
              Educational Articles & Guides
            </h2>
            <p className="text-xs text-saveplate-muted mt-1">Deep dives curated by SavePlate sustainability coordinators.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {articles.map((article) => (
            <div
              key={article.id}
              className="rounded-3xl bg-saveplate-deep/80 border border-white/10 hover:border-saveplate-neon/40 overflow-hidden flex flex-col justify-between group transition-all"
            >
              <div className="h-48 w-full overflow-hidden bg-saveplate-black relative">
                <img
                  src={article.image_url || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1000&q=80'}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-[11px] font-medium text-saveplate-neon border border-white/10">
                  {article.read_time || '4 min read'}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-display font-bold text-lg text-white group-hover:text-saveplate-neon transition-colors mb-2">
                    {article.title}
                  </h3>
                  <p className="text-xs text-saveplate-muted leading-relaxed line-clamp-3 mb-4">
                    {article.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-saveplate-muted">
                  <span>By {article.author_name}</span>
                  <span className="text-saveplate-neon font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Read Article <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

