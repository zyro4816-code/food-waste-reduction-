// client/src/components/food/RequestModal.tsx
import React, { useState } from 'react';
import { FoodListing } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import confetti from 'canvas-confetti';
import { X, CheckCircle2, Clock, MapPin, AlertCircle, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RequestModalProps {
  listing: FoodListing | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const RequestModal: React.FC<RequestModalProps> = ({ listing, onClose, onSuccess }) => {
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();

  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState<string | null>(null);

  if (!listing) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please log in or register to request food.');
      return;
    }

    if (quantity <= 0 || quantity > listing.remaining_quantity) {
      toast.error(`Please enter a quantity between 1 and ${listing.remaining_quantity}.`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.createRequest({
        listing_id: listing.id,
        requested_quantity: quantity,
        recipient_notes: notes.trim()
      });

      if (res.success) {
        setConfirmationCode(res.verificationCode);
        toast.success('Food request submitted! The donor has been notified.');
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
        onSuccess();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-saveplate-deep border border-saveplate-border shadow-2xl p-6 sm:p-8 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-saveplate-muted hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {!confirmationCode ? (
          <div>
            <div className="mb-6">
              <span className="text-[10px] font-mono uppercase tracking-widest text-saveplate-neon">
                Surplus Food Request
              </span>
              <h3 className="text-2xl font-display font-bold text-white mt-1">
                {listing.title}
              </h3>
              <p className="text-xs text-saveplate-muted mt-1">
                Offered by <span className="text-saveplate-cream font-medium">{listing.organization_name || listing.donor_name}</span>
              </p>
            </div>

            {/* Food Info Overview */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-2 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-saveplate-muted">Available Stock:</span>
                <span className="font-bold text-saveplate-neon text-sm">
                  {listing.remaining_quantity} {listing.unit}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-saveplate-muted">Storage Specs:</span>
                <span className="text-white font-medium">{listing.storage_instructions}</span>
              </div>
              <div className="flex items-center gap-1.5 text-saveplate-muted pt-1">
                <MapPin className="w-4 h-4 text-saveplate-neon shrink-0" />
                <span className="truncate">{listing.pickup_address}, {listing.city}</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-300/90 pt-1">
                <Clock className="w-4 h-4 shrink-0" />
                <span>Pickup Deadline: {new Date(listing.pickup_deadline).toLocaleString()}</span>
              </div>
            </div>

            {!isAuthenticated ? (
              <div className="text-center p-6 rounded-2xl bg-saveplate-forest/30 border border-white/10">
                <ShieldAlert className="w-8 h-8 text-saveplate-neon mx-auto mb-2" />
                <h4 className="text-base font-bold text-white mb-1">Authentication Required</h4>
                <p className="text-xs text-saveplate-muted mb-4">
                  Sign in or create a free recipient account to reserve this surplus food.
                </p>
                <div className="flex justify-center gap-3">
                  <Link
                    to="/login"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 text-white hover:bg-white/20 transition-all"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-saveplate-neon text-black hover:bg-[#32e012] transition-all shadow-neon"
                  >
                    Register
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Quantity Selection */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold text-saveplate-cream">
                      Requested Quantity ({listing.unit})
                    </label>
                    <span className="text-xs text-saveplate-muted">
                      Max: {listing.remaining_quantity} {listing.unit}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={1}
                      max={listing.remaining_quantity}
                      step={1}
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="flex-1 accent-saveplate-neon cursor-pointer h-2 bg-white/10 rounded-lg"
                    />
                    <input
                      type="number"
                      min={1}
                      max={listing.remaining_quantity}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.min(listing.remaining_quantity, Math.max(1, Number(e.target.value))))}
                      className="w-20 px-3 py-2 rounded-xl bg-saveplate-card border border-white/20 text-white font-mono text-center font-bold text-sm focus:outline-none focus:border-saveplate-neon"
                    />
                  </div>
                </div>

                {/* Recipient Notes */}
                <div>
                  <label className="block text-xs font-semibold text-saveplate-cream mb-1.5">
                    Notes for Donor (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="E.g., Number of people we are feeding, vehicle type, estimated pickup arrival..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-saveplate-card border border-white/20 text-white text-xs placeholder:text-saveplate-muted/60 focus:outline-none focus:border-saveplate-neon resize-none"
                  />
                </div>

                {/* Safety declaration */}
                <p className="text-[11px] text-saveplate-muted leading-relaxed">
                  By requesting, you agree to inspect the food at handover, maintain proper cold-chain transport, and adhere to local food recovery hygiene guidelines.
                </p>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-4 rounded-xl font-display font-bold text-sm bg-saveplate-neon text-black hover:bg-[#32e012] transition-all shadow-neon disabled:opacity-50"
                >
                  {submitting ? 'Submitting Request...' : `Confirm Request (${quantity} ${listing.unit})`}
                </button>
              </form>
            )}
          </div>
        ) : (
          /* Confirmation State */
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-full bg-saveplate-neon/20 border border-saveplate-neon mx-auto flex items-center justify-center text-saveplate-neon">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-display font-bold text-white">
              Food Request Confirmed!
            </h3>

            <p className="text-xs text-saveplate-muted max-w-sm mx-auto">
              Your pickup request for <span className="text-white font-semibold">{quantity} {listing.unit}</span> has been transmitted to the donor.
            </p>

            {/* Verification Code Box */}
            <div className="p-4 rounded-2xl bg-saveplate-forest/40 border border-saveplate-neon/40 inline-block w-full max-w-xs">
              <div className="text-[10px] uppercase font-mono tracking-widest text-saveplate-muted mb-1">
                Your Handover Verification Code
              </div>
              <div className="text-3xl font-mono font-black text-saveplate-neon tracking-wider">
                {confirmationCode}
              </div>
              <p className="text-[10px] text-saveplate-muted mt-1">
                Present this code or QR code at pickup to verify receipt.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all"
              >
                Close & View My Requests
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

