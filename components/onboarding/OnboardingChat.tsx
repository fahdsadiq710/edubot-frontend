'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Check, ArrowRight, RotateCcw } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────
interface UserData {
  goal:       string;
  level:      string;
  dailyMins:  string;
}

interface Stage {
  id:       keyof UserData;
  question: string;
  options:  { label: string; value: string; emoji: string }[];
}

// ─── Conversation script ──────────────────────────────────────
const STAGES: Stage[] = [
  {
    id:       'goal',
    question: "What is your main learning goal?",
    options: [
      { label: 'Security+ Certification', value: 'Security+', emoji: '🛡️' },
      { label: 'Custom Skill',            value: 'Custom',    emoji: '🎯' },
    ],
  },
  {
    id:       'level',
    question: "What is your current level?",
    options: [
      { label: 'Beginner',     value: 'beginner',     emoji: '🌱' },
      { label: 'Intermediate', value: 'intermediate', emoji: '📚' },
      { label: 'Advanced',     value: 'advanced',     emoji: '🚀' },
    ],
  },
  {
    id:       'dailyMins',
    question: "How many minutes can you commit daily?",
    options: [
      { label: '15 min — light',   value: '15', emoji: '⚡' },
      { label: '30 min — optimal', value: '30', emoji: '🔥' },
      { label: '60 min — serious', value: '60', emoji: '💪' },
    ],
  },
];

const SUMMARY_LABELS: Record<keyof UserData, string> = {
  goal:      'Goal',
  level:     'Level',
  dailyMins: 'Daily time',
};

// ─── Sub-components ───────────────────────────────────────────

function BotAvatar() {
  return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
      <Zap className="w-4 h-4 text-white" />
    </div>
  );
}

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

interface BubbleProps {
  role:  'bot' | 'user';
  text:  string;
}

function Bubble({ role, text }: BubbleProps) {
  const isBot = role === 'bot';
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.96 }}
      animate={{ opacity: 1, y: 0,  scale: 1     }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex items-end gap-2 ${isBot ? 'justify-start' : 'justify-end'} mb-3`}
    >
      {isBot && <BotAvatar />}
      <div
        className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isBot
            ? 'bg-indigo-500/15 border border-indigo-500/25 text-white/90 rounded-bl-sm'
            : 'bg-white/10  border border-white/10  text-white/80 rounded-br-sm'
        }`}
      >
        {text}
      </div>
    </motion.div>
  );
}

interface OptionChipsProps {
  options:  Stage['options'];
  onSelect: (label: string, value: string) => void;
  disabled: boolean;
}

function OptionChips({ options, onSelect, disabled }: OptionChipsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0  }}
      transition={{ delay: 0.15 }}
      className="flex flex-wrap gap-2 justify-end mt-1 mb-3 pr-1"
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onSelect(opt.label, opt.value)}
          disabled={disabled}
          className="
            flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium
            backdrop-blur-xl border border-white/10 bg-white/5
            text-white/80 hover:text-white hover:border-indigo-500/50
            hover:bg-indigo-500/10 hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]
            transition-all duration-200
            disabled:opacity-40 disabled:cursor-not-allowed
          "
        >
          <span>{opt.emoji}</span> {opt.label}
        </button>
      ))}
    </motion.div>
  );
}

// ─── Summary card ─────────────────────────────────────────────

interface SummaryProps {
  userData:    UserData;
  onStart:     () => void;
  onReset:     () => void;
}

function Summary({ userData, onStart, onReset }: SummaryProps) {
  const rows: { label: string; value: string; emoji: string }[] = [
    { label: 'Goal',       value: userData.goal,      emoji: '🎯' },
    { label: 'Level',      value: userData.level,     emoji: '📊' },
    { label: 'Daily time', value: `${userData.dailyMins} min`, emoji: '⏱' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0  }}
      transition={{ duration: 0.4 }}
      className="mx-3 mb-3 rounded-2xl p-5 backdrop-blur-xl border border-indigo-500/30 bg-indigo-500/8"
    >
      <p className="text-xs text-indigo-300 font-semibold uppercase tracking-widest mb-4">
        Your Study Plan
      </p>

      <div className="flex flex-col gap-2.5 mb-5">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between">
            <span className="text-white/50 text-sm flex items-center gap-1.5">
              {r.emoji} {r.label}
            </span>
            <span className="text-white font-medium text-sm capitalize">{r.value}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={onReset}
          className="
            flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm
            border border-white/10 bg-white/5 text-white/50 hover:text-white
            transition-all duration-200
          "
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
        <button
          onClick={onStart}
          className="
            flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
            text-sm font-semibold text-white
            bg-gradient-to-r from-indigo-500 to-purple-600
            hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]
            hover:-translate-y-px transition-all duration-200
          "
        >
          Start Journey <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────

interface OnboardingChatProps {
  /** Called with the completed userData when the user clicks "Start Journey". */
  onComplete?: (userData: UserData) => void;
}

export default function OnboardingChat({ onComplete }: OnboardingChatProps) {
  type Message = { role: 'bot' | 'user'; text: string };

  const [messages,    setMessages]    = useState<Message[]>([]);
  const [stageIndex,  setStageIndex]  = useState(0);
  const [typing,      setTyping]      = useState(false);
  const [chipsActive, setChipsActive] = useState(false);
  const [done,        setDone]        = useState(false);
  const [userData,    setUserData]    = useState<UserData>({
    goal: '', level: '', dailyMins: '',
  });

  const endRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on every state change
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing, done]);

  // Show first bot question on mount
  useEffect(() => {
    showBotMessage(STAGES[0].question);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function showBotMessage(text: string) {
    setTyping(true);
    setChipsActive(false);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { role: 'bot', text }]);
      setChipsActive(true);
    }, 800 + Math.random() * 300);
  }

  function handleOption(label: string, value: string) {
    if (!chipsActive || typing) return;
    setChipsActive(false);

    // Append user choice as a bubble
    setMessages((m) => [...m, { role: 'user', text: `${STAGES[stageIndex].options.find(o => o.value === value)?.emoji} ${label}` }]);

    // Save to userData
    const key = STAGES[stageIndex].id;
    const newUserData = { ...userData, [key]: value };
    setUserData(newUserData);

    const nextIndex = stageIndex + 1;

    if (nextIndex < STAGES.length) {
      setStageIndex(nextIndex);
      showBotMessage(STAGES[nextIndex].question);
    } else {
      // All stages complete
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        setMessages((m) => [
          ...m,
          { role: 'bot', text: "Perfect! Here's a summary of your personalised plan. Ready to start?" },
        ]);
        setDone(true);
      }, 900);
    }
  }

  function handleStart() {
    console.log('[OnboardingChat] userData:', userData);
    onComplete?.(userData);
  }

  function handleReset() {
    setMessages([]);
    setStageIndex(0);
    setTyping(false);
    setChipsActive(false);
    setDone(false);
    setUserData({ goal: '', level: '', dailyMins: '' });
    showBotMessage(STAGES[0].question);
  }

  const currentStage  = STAGES[stageIndex];
  const totalStages   = STAGES.length;
  const progressPct   = Math.round((stageIndex / totalStages) * 100);

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-2xl border border-white/10 bg-white/[0.04]">

      {/* ── Progress bar ──────────────────────────────────────── */}
      <div className="h-1 bg-white/5">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
          animate={{ width: `${done ? 100 : progressPct}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/8">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="font-semibold text-sm text-white">Fox AI</p>
          <p className="text-xs text-green-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block animate-pulse" />
            {done ? 'Plan ready!' : `Step ${Math.min(stageIndex + 1, totalStages)} of ${totalStages}`}
          </p>
        </div>
        {done && (
          <div className="ml-auto flex items-center gap-1 text-green-400 text-xs font-medium">
            <Check className="w-3.5 h-3.5" /> Complete
          </div>
        )}
      </div>

      {/* ── Message thread ────────────────────────────────────── */}
      <div className="flex flex-col h-80 overflow-y-auto px-4 py-4 scroll-smooth">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <Bubble key={i} role={msg.role} text={msg.text} />
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {typing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-end gap-2 mb-3"
          >
            <BotAvatar />
            <div className="bg-indigo-500/15 border border-indigo-500/25 rounded-2xl rounded-bl-sm">
              <TypingDots />
            </div>
          </motion.div>
        )}

        {/* Option chips */}
        {!typing && !done && chipsActive && (
          <OptionChips
            options={currentStage.options}
            onSelect={handleOption}
            disabled={typing || !chipsActive}
          />
        )}

        <div ref={endRef} />
      </div>

      {/* ── Summary + CTA ─────────────────────────────────────── */}
      <AnimatePresence>
        {done && (
          <Summary
            userData={userData}
            onStart={handleStart}
            onReset={handleReset}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
