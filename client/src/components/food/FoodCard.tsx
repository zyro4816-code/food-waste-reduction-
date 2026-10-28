// client/src/components/food/FoodCard.tsx
import React from 'react';
import { FoodListing } from '../../types';
import { MapPin, Clock, ShieldCheck, AlertTriangle, Utensils, Box, Info } from 'lucide-react';

interface FoodCardProps {
  listing: FoodListing;
  onRequest: (listing: FoodListing) => void;
  onViewDetails?: (listing: FoodListing) => void;
}

export const FoodCard: React.FC<FoodCardProps> = ({ listing, onRequest, onViewDetails }) => {
  // Calculate remaining time until pickup deadline
  const calculateTimeLeft = (deadline: string) => {
    const diff = new Date(deadline).getTime() - Date.now();
    if (diff <= 0) return { text: 'Expired', urgent: true, isExpired: true };
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours < 3) {
      return { text: `${hours}h ${mins}m left`, urgent: true, isExpired: false };
    }
    if (hours < 24) {
      return { text: `${hours} hours left`, urgent: false, isExpired: false };
    }
    const days = Math.floor(hours / 24);
    return { text: `${days} days left`, urgent: false, isExpired: false };
  };

  const timeLeft = calculateTimeLeft(listing.pickup_deadline);

  const fallbackImage = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80';

  const isAvailable = listing.status === 'available' || listing.status === 'partially_claimed';

  return (
    <div className="group rounded-3xl bg-saveplate-deep/80 border border-white/10 hover:border-saveplate-neon/40 backdrop-blur-xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-neon hover:-translate-y-1">
      {/* Food Image & Badges */}
      <div className="relative h-52 w-full overflow-hidden bg-saveplate-black">
        <img
          src={listing.primary_image_url || fallbackImage}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = fallbackImage;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-saveplate-deep via-transparent to-black/40" />

        {/* Category Badge */}
        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-saveplate-forest/90 border border-saveplate-neon/30 backdrop-blur-md text-xs font-semibold text-saveplate-neon flex items-center gap-1.5 shadow-sm">
          <Utensils className="w-3.5 h-3.5" />
          <span>{listing.category_name || 'Surplus Meal'}</span>
        </div>

        {/* Pickup Deadline Badge */}
        <div
          className={`absolute top-3 right-3 px-3 py-1 rounded-full backdrop-blur-md text-xs font-bold flex items-center gap-1.5 shadow-sm ${
            timeLeft.urgent
              ? 'bg-red-950/80 text-red-300 border border-red-500/40 animate-pulse'
              : 'bg-saveplate-deep/80 text-saveplate-cream border border-white/20'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-saveplate-neon" />
          <span>{timeLeft.text}</span>
        </div>

        {/* Servings counter pill */}
        {listing.estimated_servings > 0 && (
          <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/15 text-[11px] font-medium text-white flex items-center gap-1">
            <span className="text-saveplate-neon font-bold">~{listing.estimated_servings}</span> servings
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Donor & Org Name */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-saveplate-muted truncate">
              {listing.organization_name || listing.donor_name}
            </span>
            {listing.org_verified === 1 && (
              <span title="Verified Partner" className="flex items-center text-saveplate-neon">
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-display font-bold text-lg text-white group-hover:text-saveplate-neon transition-colors line-clamp-1 mb-2">
            {listing.title}
          </h3>

          {/* Description snippet */}
          <p className="text-xs text-saveplate-muted line-clamp-2 mb-4 leading-relaxed">
            {listing.description}
          </p>

          {/* Key Metadata Grid */}
          <div className="space-y-2 text-xs py-3 border-y border-white/10 my-3">
            <div className="flex items-center justify-between">
              <span className="text-saveplate-muted">Available Quantity:</span>
              <span className="font-bold text-saveplate-neon text-sm">
                {listing.remaining_quantity} {listing.unit}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-saveplate-muted">Storage:</span>
              <span className="text-saveplate-cream truncate max-w-[170px]" title={listing.storage_instructions}>
                {listing.storage_instructions}
              </span>
            </div>

            {listing.allergens && listing.allergens !== 'None' && (
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-amber-400/90 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Allergens:
                </span>
                <span className="text-saveplate-cream truncate max-w-[170px]" title={listing.allergens}>
                  {listing.allergens}
                </span>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-saveplate-muted pt-1">
              <MapPin className="w-3.5 h-3.5 text-saveplate-neon shrink-0" />
              <span className="truncate">{listing.pickup_address}, {listing.city}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          {isAvailable && !timeLeft.isExpired ? (
            <button
              onClick={() => onRequest(listing)}
              data-cursor-text="REQUEST"
              className="w-full py-3 px-4 rounded-xl font-display font-bold text-sm tracking-wide bg-saveplate-neon text-black hover:bg-[#32e012] transition-all shadow-neon hover:shadow-neon-strong active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Request This Food</span>
            </button>
          ) : (
            <button
              disabled
              className="w-full py-3 px-4 rounded-xl font-display font-medium text-xs bg-white/5 text-saveplate-muted cursor-not-allowed border border-white/10"
            >
              {timeLeft.isExpired ? 'Pickup Window Closed' : 'Claimed Out'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

