// client/src/components/home/RecentListings.tsx
import React, { useState, useEffect } from 'react';
import { FoodListing } from '../../types';
import { api } from '../../services/api';
import { FoodCard } from '../food/FoodCard';
import { RequestModal } from '../food/RequestModal';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const RecentListings: React.FC = () => {
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<FoodListing | null>(null);

  const fetchListings = () => {
    api.getListings({ status: 'available' })
      .then((res) => {
        if (res.success && res.listings) {
          setListings(res.listings.slice(0, 6));
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchListings();
  }, []);

  return (
    <section className="py-24 bg-saveplate-darkest relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-saveplate-forest/60 border border-saveplate-neon/30 text-saveplate-neon text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Surplus Food Ready For Rescue</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white">
              Recently Listed Surplus Food
            </h2>
            <p className="text-sm text-saveplate-muted mt-2 max-w-xl">
              Fresh produce, wholesome prepared conference meals, and artisan baked goods available right now for pickup.
            </p>
          </div>

          <Link
            to="/browse"
            className="mt-4 md:mt-0 inline-flex items-center gap-2 text-sm font-semibold text-saveplate-neon hover:underline"
          >
            <span>Browse All Available Food</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 rounded-3xl bg-white/5 animate-pulse border border-white/10" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-16 bg-saveplate-deep/40 rounded-3xl border border-white/10 p-8">
            <p className="text-saveplate-muted text-sm">All surplus food for today has been successfully claimed!</p>
            <Link
              to="/donate"
              className="mt-4 inline-block px-6 py-2.5 rounded-xl bg-saveplate-neon text-black font-bold text-xs"
            >
              Post a Food Donation
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <FoodCard
                  listing={item}
                  onRequest={(listing) => setSelectedListing(listing)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Food Request Modal */}
      <RequestModal
        listing={selectedListing}
        onClose={() => setSelectedListing(null)}
        onSuccess={() => {
          fetchListings();
        }}
      />
    </section>
  );
};

