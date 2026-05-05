'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Send, Zap, Check, Loader2, ExternalLink } from 'lucide-react';
import type { ChatMessage, OnboardingState } from '@/lib/types';

/* ── Conversation script ──────────────────────────────────── */
type Option = { label: string; value: string };

type Step = {
  key: keyof OnboardingState | null;
  question: string | ((name: string) => string);
  options?: Option[];
  validate?: (v: string) => string | null;
};

const STEPS: Step[] = [
  {
    key: 'full_name',
    question: "Hey! I'm Fox 🦊 — your AI learning companion. Before I connect you to Telegram, I'd love to know a bit about you. What's your name?",
    validate: (v) => v.trim().length < 2 ? 'Please enter at least 2 characters.' : null,
  },
  {
    key: 'goal',
    question: (name: string) =>
      `Nice to meet you, ${name}! What skill or topic do you want to master? (e.g. "Python programming", "English grammar", "Digital marketing")`,
    validate: (v) => v.trim().length < 3 ? 'Tell me a bit more about your goal.' : null,
  },
  {
    key: 'level',
    question: "Great choice! What's your current level with this topic?",
    options: [
      { label: '🌱 Complete beginner', value: 'beginner' },
      { label: '📚 Intermediate',      value: 'intermediate' },
      { label: '🚀 Advanced',          value: 'advanced' },
    ],
  },
  {
    key: 'daily_time',
    question: 'How many minutes can you commit to learning each day?',
    options: [
      { label: '⚡ 5 min — light',    value: '5' },
      { label: '🔥 10 min — optimal', value: '10' },
      { label: '💪 20 min — serious', value: '20' },
      { label: '🏋️ 30 min — max',    value: '30' },
    ],
  },
];

// Total data-collection steps (excludes the synthetic "done" state)
const DATA_STEP_COUNT = STEPS.length;

/* ── Typing indicator ─────────────────────────────────────── */
function TypingDots() {
  return (
    <div className="flex gap-1.5 items-center px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-indigo-400"
          animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 0.8, delay: i * 0.18, repeat: Infinity }}
        />
      ))}
    </div>
  );
}

/* ── Bubble ───────────────────────────────────────────────── */
function Bubble({ msg }: { msg: ChatMessage }) {
  const isAI = msg.role === 'ai';
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={`flex ${isAI ? 'justify-start' : 'justify-end'} mb-4`}
    >
      {isAI && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mr-3 flex-shrink-0 mt-1">
          <Zap className="w-4 h-4 text-white" />
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-5 py-3 text-sm leading-relaxed ${
          isAI
            ? 'bg-indigo-500/15 border border-indigo-500/25 text-white/90 rounded-tl-sm'
            : 'bg-white/10 border border-white/10 text-white/80 rounded-tr-sm'
        }`}
      >
        {msg.text}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
export default function OnboardingPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput]       = useState('');
  const [step, setStep]         = useState(0);
  const [typing, setTyping]     = useState(false);
  const [done, setDone]         = useState(false);
  const [loading, setLoading]   = useState(false);
  const [userId, setUserId]     = useState<string | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const [collected, setCollected] = useState<OnboardingState>({
    step: 0, full_name: '', goal: '', level: '', daily_time: '',
  });

  const endRef   = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollDown = () => endRef.current?.scrollIntoView({ behavior: 'smooth' });

  // Show first AI message on mount
  useEffect(() => {
    showAIMessage(STEPS[0].question as string);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { scrollDown(); }, [messages, typing]);

  function showAIMessage(text: string) {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { role: 'ai', text }]);
      inputRef.current?.focus();
    }, 900 + Math.random() * 400);
  }

  // Called for both free-text input and option chip selections.
  // `displayText` is what appears in the chat bubble.
  // `storedValue` is what gets saved to state (the clean DB value).
  async function handleUserInput(displayText: string, storedValue: string) {
    if (!displayText.trim() || typing || loading) return;
    setError(null);

    const currentStep = STEPS[step];

    // Validate free-text steps only
    if (currentStep.validate) {
      const err = currentStep.validate(displayText);
      if (err) { setError(err); return; }
    }

    // Append user bubble with the display text
    setMessages((m) => [...m, { role: 'user', text: displayText }]);
    setInput('');

    // Store the clean value
    const key = currentStep.key!;
    const newCollected: OnboardingState = { ...collected, [key]: storedValue };
    setCollected(newCollected);

    const nextStepIndex = step + 1;
    setStep(nextStepIndex);

    // All data steps complete — call API
    if (nextStepIndex >= DATA_STEP_COUNT) {
      setLoading(true);
      let savedId: string | null = null;

      try {
        const res = await fetch('/api/onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            full_name:  newCollected.full_name,
            goal:       newCollected.goal,
            level:      newCollected.level,
            daily_time: parseInt(newCollected.daily_time, 10),
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Failed to save profile.');
        savedId = data.user_id;
        setUserId(savedId);
      } catch (e: any) {
        setError(e.message);
        setLoading(false);
        // Do NOT set done=true on failure — stop here so the user sees the error
        return;
      }

      setLoading(false);

      // Only reach here on success
      showAIMessage(
        `You're all set, ${newCollected.full_name}! 🎉 Click the button below to open your personal Fox bot on Telegram. Your first lesson will arrive within 60 seconds!`
      );
      // Delay setting done so the Telegram button appears after the AI bubble animates in
      setTimeout(() => setDone(true), 1400);
      return;
    }

    // Show next question
    const nextStep = STEPS[nextStepIndex];
    const question = typeof nextStep.question === 'function'
      ? nextStep.question(newCollected.full_name)
      : nextStep.question;
    showAIMessage(question);
  }

  // Option chip click: display label in bubble, store clean value to DB
  function handleOption(opt: Option) {
    handleUserInput(opt.label, opt.value);
  }

  const currentStep = STEPS[step] ?? STEPS[DATA_STEP_COUNT - 1];
  const progress    = Math.min(100, (step / DATA_STEP_COUNT) * 100);

  // Build Telegram link at render time so it always picks up the env var
  const botUsername  = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || '';
  const telegramHref = botUsername && userId
    ? `https://t.me/${botUsername}?start=${userId}`
    : null;

  return (
    <div className="min-h-screen bg-[#050510] flex flex-col items-center justify-center px-4 py-12">
      {/* Background glow */}
      <div className="fixed inset-0 hero-mesh pointer-events-none" />

      {/* Header */}
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

      {/* Chat window */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-lg glass-strong rounded-3xl overflow-hidden shadow-card"
      >
        {/* Progress bar */}
        <div className="h-1 bg-white/5">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Title bar */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-semibold text-sm">Fox AI</p>
            <p className="text-xs text-green-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block animate-pulse" />
              Online · Onboarding
            </p>
          </div>
          <div className="ml-auto text-xs text-white/30">
            {Math.round(progress)}% complete
          </div>
        </div>

        {/* Messages */}
        <div className="h-96 overflow-y-auto px-5 py-5 space-y-1 scroll-smooth">
          {messages.map((m, i) => <Bubble key={i} msg={m} />)}

          {/* Typing indicator */}
          {typing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start mb-4"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mr-3 flex-shrink-0">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div className="bg-indigo-500/15 border border-indigo-500/25 rounded-2xl rounded-tl-sm">
                <TypingDots />
              </div>
            </motion.div>
          )}

          {/* Option chips — hidden while typing or after flow completes */}
          {!typing && !done && step < DATA_STEP_COUNT && currentStep.options && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-wrap gap-2 justify-end mt-2"
            >
              {currentStep.options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleOption(opt)}
                  disabled={loading}
                  className="glass rounded-xl px-4 py-2 text-sm text-white/80 hover:text-white hover:border-indigo-500/50 transition-all duration-200 hover:shadow-neon disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {opt.label}
                </button>
              ))}
            </motion.div>
          )}

          {/* Loading spinner */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center py-3"
            >
              <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
            </motion.div>
          )}

          {/* Telegram CTA — only shown on full success */}
          {done && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-4 flex justify-center"
            >
              {telegramHref ? (
                <a
                  href={telegramHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary flex items-center gap-2 text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Fox on Telegram
                </a>
              ) : (
                // Fallback if bot username env var is not set in Vercel dashboard
                <p className="text-white/50 text-sm text-center">
                  Open Telegram and search for your Fox bot to start learning!
                </p>
              )}
            </motion.div>
          )}

          <div ref={endRef} />
        </div>

        {/* Error bar — only shown when not done */}
        <AnimatePresence>
          {error && !done && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-red-400 text-xs px-6 py-2 bg-red-500/10 border-t border-red-500/20"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Text input — hidden for option steps and after done */}
        {!done && step < DATA_STEP_COUNT && !currentStep.options && (
          <div className="px-4 py-4 border-t border-white/10">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUserInput(input.trim(), input.trim());
              }}
              className="flex gap-3"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={typing || loading}
                placeholder="Type your answer…"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 transition-all"
              />
              <button
                type="submit"
                disabled={!input.trim() || typing || loading}
                className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-neon transition-all"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </form>
          </div>
        )}

        {/* Success footer — only shown on done */}
        {done && (
          <div className="px-6 py-5 border-t border-white/10 flex items-center gap-2 text-green-400 text-sm">
            <Check className="w-4 h-4" />
            Profile saved — waiting for you on Telegram!
          </div>
        )}
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
