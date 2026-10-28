// client/src/components/home/HowItWorks.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, Search, QrCode, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HowItWorks: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'donor' | 'recipient'>('donor');

  const donorSteps = [
    {
      num: '01',
      title: 'List Surplus in Under 60 Seconds',
      description: 'Restaurants, grocery stores, and caterers post excess food with photos, quantity, allergen labels, and pickup deadlines.',
      icon: PlusCircle
    },
    {
      num: '02',
      title: 'Instant Automated Routing',
      description: 'Nearby verified NGOs, community kitchens, and individuals receive real-time notifications based on location and capacity.',
      icon: Search
    },
    {
      num: '03',
      title: 'Verification Code Handover',
      description: 'Recipient presents a unique pickup code (or QR code). Temperature and packaging are verified at the loading bay.',
      icon: QrCode
    },
    {
      num: '04',
      title: 'Measurable Environmental Impact',
      description: 'Every kilogram saved is logged. Donors receive automated impact reports and tax-deductible receipt summaries.',
      icon: TrendingUp
    }
  ];

  const recipientSteps = [
    {
      num: '01',
      title: 'Browse Live Surplus Nearby',
      description: 'Explore wholesome meals, fresh bakery loaves, and farm vegetables filterable by distance and pickup deadline.',
      icon: Search
    },
    {
      num: '02',
      title: 'Reserve Exact Quantities',
      description: 'Select the exact portions needed for your shelter, food bank, or household with zero risk of overclaiming.',
      icon: PlusCircle
    },
    {
      num: '03',
      title: 'Collect With Verification Code',
      description: 'Receive prompt donor approval and proceed to the designated pickup location with insulated transport carriers.',
      icon: QrCode
    },
    {
      num: '04',
      title: 'Feed Families With Dignity',
      description: 'Transform surplus food into immediate nourishment, reducing hunger and keeping organic matter out of landfills.',
      icon: TrendingUp
    }
  ];

  const currentSteps = activeTab === 'donor' ? donorSteps : recipientSteps;

  return (
    <section className="py-24 bg-saveplate-black relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-mono uppercase tracking-widest text-saveplate-neon">
            Streamlined Redistribution
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-white mt-2 mb-4">
            How SAVEPLATE Works
          </h2>
          <p className="text-saveplate-muted text-sm sm:text-base">
            A technology-driven logistics bridge turning potential food waste into community abundance.
          </p>

          {/* Toggle Tabs */}
          <div className="mt-8 inline-flex p-1.5 rounded-2xl bg-saveplate-deep border border-white/10">
            <button
              onClick={() => setActiveTab('donor')}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'donor'
                  ? 'bg-saveplate-neon text-black shadow-neon'
                  : 'text-saveplate-muted hover:text-white'
              }`}
            >
              For Food Donors & Businesses
            </button>
            <button
              onClick={() => setActiveTab('recipient')}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'recipient'
                  ? 'bg-saveplate-neon text-black shadow-neon'
                  : 'text-saveplate-muted hover:text-white'
              }`}
            >
              For NGOs, Shelters & Recipients
            </button>
          </div>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {currentSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="relative p-6 sm:p-8 rounded-3xl bg-saveplate-deep/70 border border-white/10 hover:border-saveplate-neon/40 backdrop-blur-xl flex flex-col justify-between group hover:shadow-neon transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-mono text-2xl font-black text-saveplate-neon/60 group-hover:text-saveplate-neon transition-colors">
                      {step.num}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-saveplate-neon">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="font-display font-bold text-lg text-white mb-2 leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-xs text-saveplate-muted leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-white/5 flex items-center text-xs font-medium text-saveplate-neon gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Learn more</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-16 p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-saveplate-forest to-saveplate-deep border border-saveplate-neon/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-glass">
          <div>
            <h4 className="text-2xl font-display font-bold text-white mb-2">
              Ready to eliminate food waste in your organization?
            </h4>
            <p className="text-xs sm:text-sm text-saveplate-cream/80 max-w-xl">
              Join dozens of registered bakeries, grocers, and community food pantries across the network today.
            </p>
          </div>
          <Link
            to="/donate"
            className="shrink-0 px-8 py-3.5 rounded-2xl bg-saveplate-neon text-black font-display font-bold text-sm shadow-neon hover:scale-105 active:scale-95 transition-all"
          >
            Get Started Now
          </Link>
        </div>
      </div>
    </section>
  );
};

