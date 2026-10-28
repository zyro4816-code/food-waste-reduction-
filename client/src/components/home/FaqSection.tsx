// client/src/components/home/FaqSection.tsx
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FaqItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

export const FaqSection: React.FC = () => {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [openId, setOpenId] = useState<number | null>(1);

  useEffect(() => {
    api.getFaqs()
      .then((res) => {
        if (res.success && res.faqs) {
          setFaqs(res.faqs);
        }
      })
      .catch(() => {
        // Fallback default FAQs
        setFaqs([
          {
            id: 1,
            question: 'How does SavePlate verify the safety and freshness of surplus food?',
            answer: 'Every registered business donor goes through an accreditation check. Listings mandate clear preparation timestamps, refrigeration status, allergen disclosures, and strict pickup deadlines that prevent food spoilage.',
            category: 'Safety'
          },
          {
            id: 2,
            question: 'Who can register as a food donor?',
            answer: 'We welcome licensed restaurants, bakeries, supermarkets, corporate dining facilities, catering event organizers, certified farms, and community gardens with surplus food.',
            category: 'Donors'
          },
          {
            id: 3,
            question: 'Are food donations protected under Good Samaritan laws?',
            answer: 'Yes. In the United States, the Bill Emerson Good Samaritan Food Donation Act protects donors and non-profit organizations from civil and criminal liability when donating apparently wholesome food in good faith.',
            category: 'Legal'
          },
          {
            id: 4,
            question: 'How quickly does food need to be picked up?',
            answer: 'Donors set explicit pickup deadlines (typically 2 to 24 hours for perishable meals, up to 48 hours for fresh produce). Our automated notification system alerts nearby NGOs the moment a listing is created.',
            category: 'Logistics'
          }
        ]);
      });
  }, []);

  return (
    <section className="py-24 bg-saveplate-darkest relative border-t border-white/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-saveplate-forest/60 border border-saveplate-neon/30 text-saveplate-neon text-xs font-semibold uppercase tracking-wider mb-4">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-saveplate-muted">
            Everything you need to know about safety, liability, pickup logistics, and administrative verification.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="rounded-2xl bg-saveplate-deep/70 border border-white/10 hover:border-saveplate-neon/30 backdrop-blur-xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4"
                >
                  <span className="font-display font-bold text-sm sm:text-base text-white">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-saveplate-neon shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 text-xs sm:text-sm text-saveplate-muted leading-relaxed border-t border-white/5 pt-3">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

