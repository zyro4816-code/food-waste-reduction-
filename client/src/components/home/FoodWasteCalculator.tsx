// client/src/components/home/FoodWasteCalculator.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Utensils, CloudSun, Droplets, Trees } from 'lucide-react';

export const FoodWasteCalculator: React.FC = () => {
  const [kgPerWeek, setKgPerWeek] = useState<number>(50);

  // Calculations based on EPA and FAO food waste conversion factors
  const mealsProvided = Math.round(kgPerWeek * 2.1);
  const co2SavedKg = Math.round(kgPerWeek * 2.5);
  const waterSavedLiters = Math.round(kgPerWeek * 850);
  const treesEquivalent = (co2SavedKg / 22).toFixed(1); // 1 mature tree absorbs ~22kg CO2/year

  return (
    <section className="py-24 bg-saveplate-darkest relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Explainer */}
          <div className="lg:col-span-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-saveplate-forest/60 border border-saveplate-neon/30 text-saveplate-neon text-xs font-semibold uppercase tracking-wider mb-4">
              <Calculator className="w-3.5 h-3.5" />
              <span>Interactive Sustainability Estimator</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white mb-4">
              Calculate Your Organization's Waste Prevention Impact
            </h2>
            <p className="text-sm text-saveplate-muted leading-relaxed mb-6">
              When food is discarded, all the water, energy, and labor used to produce it are wasted, while generating harmful methane in landfills.
              Slide to see how redirecting your weekly surplus transforms hunger and heals our climate.
            </p>

            <div className="p-4 rounded-2xl bg-saveplate-deep/70 border border-white/10 text-xs text-saveplate-cream/80 space-y-2">
              <div className="font-semibold text-white">Verified Methodology:</div>
              <p>Derived from United Nations FAO and EPA Waste Reduction Model (WARM) greenhouse gas metrics.</p>
            </div>
          </div>

          {/* Right Column: Calculator Card */}
          <div className="lg:col-span-7 p-6 sm:p-10 rounded-3xl bg-saveplate-deep/90 border border-saveplate-border backdrop-blur-2xl shadow-glass">
            {/* Slider */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-saveplate-muted">
                  Estimated Surplus Food
                </span>
                <span className="text-2xl font-mono font-bold text-saveplate-neon">
                  {kgPerWeek} kg <span className="text-xs text-white/50 font-sans font-normal">/ week</span>
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={500}
                step={5}
                value={kgPerWeek}
                onChange={(e) => setKgPerWeek(Number(e.target.value))}
                className="w-full accent-saveplate-neon cursor-pointer h-2.5 bg-white/10 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-saveplate-muted font-mono mt-1">
                <span>5 kg (Small Cafe)</span>
                <span>200 kg (Restaurant)</span>
                <span>500 kg (Supermarket)</span>
              </div>
            </div>

            {/* 4 Impact Metric Tiles */}
            <div className="grid grid-cols-2 gap-4">
              {/* Meals Provided */}
              <div className="p-5 rounded-2xl bg-saveplate-card border border-white/10">
                <div className="w-8 h-8 rounded-xl bg-saveplate-neon/10 text-saveplate-neon flex items-center justify-center mb-2">
                  <Utensils className="w-4 h-4" />
                </div>
                <div className="text-2xl sm:text-3xl font-display font-black text-white mb-1">
                  {mealsProvided.toLocaleString()}
                </div>
                <div className="text-xs font-semibold text-saveplate-cream">Nutritious Meals</div>
                <div className="text-[10px] text-saveplate-muted mt-0.5">Distributed to families</div>
              </div>

              {/* CO2 Emissions Saved */}
              <div className="p-5 rounded-2xl bg-saveplate-card border border-white/10">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2">
                  <CloudSun className="w-4 h-4" />
                </div>
                <div className="text-2xl sm:text-3xl font-display font-black text-white mb-1">
                  {co2SavedKg.toLocaleString()} kg
                </div>
                <div className="text-xs font-semibold text-saveplate-cream">CO₂e Prevented</div>
                <div className="text-[10px] text-saveplate-muted mt-0.5">Methane avoided</div>
              </div>

              {/* Embedded Water Conserved */}
              <div className="p-5 rounded-2xl bg-saveplate-card border border-white/10">
                <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-2">
                  <Droplets className="w-4 h-4" />
                </div>
                <div className="text-2xl sm:text-3xl font-display font-black text-white mb-1">
                  {waterSavedLiters.toLocaleString()} L
                </div>
                <div className="text-xs font-semibold text-saveplate-cream">Water Conserved</div>
                <div className="text-[10px] text-saveplate-muted mt-0.5">Embedded agricultural water</div>
              </div>

              {/* Tree Absorption Equivalent */}
              <div className="p-5 rounded-2xl bg-saveplate-card border border-white/10">
                <div className="w-8 h-8 rounded-xl bg-lime-500/10 text-lime-400 flex items-center justify-center mb-2">
                  <Trees className="w-4 h-4" />
                </div>
                <div className="text-2xl sm:text-3xl font-display font-black text-white mb-1">
                  ~{treesEquivalent}
                </div>
                <div className="text-xs font-semibold text-saveplate-cream">Tree Years</div>
                <div className="text-[10px] text-saveplate-muted mt-0.5">Equivalent carbon capture</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

