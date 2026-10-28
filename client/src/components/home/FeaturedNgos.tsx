// client/src/components/home/FeaturedNgos.tsx
import React from 'react';
import { ShieldCheck, MapPin, Heart } from 'lucide-react';

export const FeaturedNgos: React.FC = () => {
  const ngos = [
    {
      name: 'Community Table Food Bank',
      type: 'Regional Food Bank & Shelter',
      city: 'San Francisco, CA',
      servedMeals: '50,000+ meals/yr',
      verified: true,
      bio: 'Providing daily breakfast and warm dinner services to over 500 sheltered residents and single-parent households.'
    },
    {
      name: 'Urban Harvest Food Rescue',
      type: 'Perishable Grocery Logistics',
      city: 'Oakland, CA',
      servedMeals: '35,000+ meals/yr',
      verified: true,
      bio: 'Mobile cold-chain fleet picking up farm vegetables and chilled restaurant surplus within 2 hours of listing.'
    },
    {
      name: 'Family Care Outreach',
      type: 'Community Pantry & Outreach',
      city: 'San Francisco, CA',
      servedMeals: '22,000+ meals/yr',
      verified: true,
      bio: 'Neighborhood mutual aid network distributing grocery staples and cooked meals directly to low-income senior residences.'
    },
    {
      name: 'Campus Student Food Pantry',
      type: 'Collegiate Food Security',
      city: 'Berkeley, CA',
      servedMeals: '18,000+ meals/yr',
      verified: true,
      bio: 'Fighting collegiate nutritional insecurity by supplying healthy pantry supplies and artisan bread to students.'
    }
  ];

  return (
    <section className="py-24 bg-saveplate-black relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-saveplate-neon">
            Verified Frontline Partners
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white mt-2 mb-4">
            Featured NGOs & Community Kitchens
          </h2>
          <p className="text-sm text-saveplate-muted">
            All participating charity organizations undergo strict 501(c)(3) verification and food safety compliance review by platform administrators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ngos.map((ngo, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-saveplate-deep/70 border border-white/10 hover:border-saveplate-neon/40 backdrop-blur-xl flex flex-col justify-between group transition-all hover:shadow-neon"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-saveplate-forest/80 border border-saveplate-neon/30 flex items-center justify-center text-saveplate-neon">
                    <Heart className="w-5 h-5" />
                  </div>
                  {ngo.verified && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-saveplate-neon bg-saveplate-neon/10 border border-saveplate-neon/30 px-2 py-0.5 rounded-full">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified
                    </span>
                  )}
                </div>

                <h3 className="font-display font-bold text-base text-white group-hover:text-saveplate-neon transition-colors mb-1">
                  {ngo.name}
                </h3>
                <div className="text-xs text-saveplate-neon font-medium mb-3">{ngo.type}</div>
                <p className="text-xs text-saveplate-muted leading-relaxed mb-4">{ngo.bio}</p>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-saveplate-muted">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-saveplate-neon" />
                  {ngo.city}
                </span>
                <span className="font-semibold text-white">{ngo.servedMeals}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

