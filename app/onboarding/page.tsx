'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Zap } from 'lucide-react';
import OnboardingChat from '@/components/onboarding/OnboardingChat';

export default function OnboardingPage() {
  function handleComplete(userData: { goal: string; level: string; dailyMins: string }) {
    // TODO (next step): POST to /api/onboarding and redirect to Telegram deep-link
    console.log('[OnboardingPage] User data collected:', userData);
  }

  return (
    <div className="min-h-screen bg-[#050510] flex flex-col items-center justify-center px-4 py-12">
      {/* Background glow */}
      <div className="fixed inset-0 hero-mesh pointer-events-none" />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex items-center gap-2 mb-8"
      >
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-xl gradient-text">Fox</span>
        </Link>
      </motion.div>

      {/* Chat component */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-lg"
      >
        <OnboardingChat onComplete={handleComplete} />
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="relative z-10 mt-6 text-white/25 text-xs text-center"
      >
        Your data is stored securely. We never sell or share it.
      </motion.p>
    </div>
  );
}
