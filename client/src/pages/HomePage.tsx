// client/src/pages/HomePage.tsx
import React from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { ImpactStats } from '../components/home/ImpactStats';
import { RecentListings } from '../components/home/RecentListings';
import { HowItWorks } from '../components/home/HowItWorks';
import { FoodWasteCalculator } from '../components/home/FoodWasteCalculator';
import { FeaturedNgos } from '../components/home/FeaturedNgos';
import { FaqSection } from '../components/home/FaqSection';

export const HomePage: React.FC = () => {
  return (
    <div className="w-full">
      <HeroSection />
      <ImpactStats />
      <RecentListings />
      <HowItWorks />
      <FoodWasteCalculator />
      <FeaturedNgos />
      <FaqSection />
    </div>
  );
};

