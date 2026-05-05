'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import {
  Brain, Zap, Target, TrendingUp, MessageSquare,
  Shield, ChevronRight, Star, ArrowRight,
} from 'lucide-react';
import Navbar from '@/components/ui/Navbar';

// Lazy-load heavy 3D canvas — no SSR
const HeroScene = dynamic(() => import('@/components/scene/HeroScene'), {
  ssr: false,
  loading: () => <div className="w-full h-full" />,
});

/* ── Scroll-aware value ──────────────────────────────────── */
function useScrollY() {
  const scrollY = useRef(0);
  useEffect(() => {
    const handler = () => { scrollY.current = window.scrollY; };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);
  return scrollY;
}

/* ── Fade-in section wrapper ─────────────────────────────── */
function FadeIn({ children, delay = 0, className = '' }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Feature card ─────────────────────────────────────────── */
function FeatureCard({ icon: Icon, title, desc, delay }: {
  icon: React.ElementType; title: string; desc: string; delay: number;
}) {
  return (
    <FadeIn delay={delay}>
      <div className="glass rounded-2xl p-6 h-full hover:border-indigo-500/40 transition-all duration-300 group cursor-default">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-6 h-6 text-indigo-400" />
        </div>
        <h3 className="font-display font-semibold text-lg mb-2 text-white">{title}</h3>
        <p className="text-white/55 text-sm leading-relaxed">{desc}</p>
      </div>
    </FadeIn>
  );
}

/* ── Step card ────────────────────────────────────────────── */
function StepCard({ num, title, desc, delay }: {
  num: string; title: string; desc: string; delay: number;
}) {
  return (
    <FadeIn delay={delay} className="flex gap-5">
      <div className="flex-shrink-0 w-12 h-12 rounded-full neon-border flex items-center justify-center text-lg font-bold gradient-text">
        {num}
      </div>
      <div>
        <h3 className="font-display font-semibold text-lg mb-1 text-white">{title}</h3>
        <p className="text-white/55 text-sm leading-relaxed">{desc}</p>
      </div>
    </FadeIn>
  );
}

/* ── Testimonial card ─────────────────────────────────────── */
function Testimonial({ quote, name, role, delay }: {
  quote: string; name: string; role: string; delay: number;
}) {
  return (
    <FadeIn delay={delay}>
      <div className="glass rounded-2xl p-6">
        <div className="flex gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          ))}
        </div>
        <p className="text-white/70 text-sm leading-relaxed mb-5">"{quote}"</p>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold">
            {name[0]}
          </div>
          <div>
            <p className="font-medium text-sm text-white">{name}</p>
            <p className="text-white/40 text-xs">{role}</p>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}

/* ═══════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const scrollY = useScrollY();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  // Parallax for hero subtitle
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -60]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);

  const features = [
    { icon: Brain,        title: 'AI-Powered Lessons',   desc: 'Gemini crafts micro-lessons tailored to your exact skill level and goal every single day.' },
    { icon: Zap,          title: 'Bite-Sized Learning',   desc: '5–10 minute daily sessions that fit any schedule. Consistency over marathon sessions.' },
    { icon: Target,       title: 'Goal-Driven Path',      desc: 'Set your target. Fox builds a personalised curriculum and tracks every step forward.' },
    { icon: TrendingUp,   title: 'Progress Analytics',    desc: 'See your improvement over time. Mistakes become data; data becomes mastery.' },
    { icon: MessageSquare,'title': 'Telegram Native',     desc: 'No apps to install. Lessons arrive in Telegram — the messenger you already use.' },
    { icon: Shield,       title: 'Rate-Limit Shield',     desc: "Gemini's free tier handled gracefully with a smart message queue. Zero dropped lessons." },
  ];

  const steps = [
    { num: '01', title: 'Tell Fox your goal', desc: 'Complete a 60-second chat onboarding on this page. Fox learns your topic, level, and how much time you have daily.' },
    { num: '02', title: 'Connect on Telegram', desc: 'You\'re redirected to your personal Telegram bot with deep-link magic. No code. No friction.' },
    { num: '03', title: 'Learn every day', desc: 'Receive a sharp micro-lesson each day. Answer questions, make mistakes, get smarter.' },
  ];

  const testimonials = [
    { quote: 'I spent months trying to learn Python with YouTube tutorials. Fox got me writing real scripts in 3 weeks — 10 minutes a day.', name: 'Sara K.', role: 'Marketing Manager' },
    { quote: 'The lessons feel like they were written just for me. Because they were. Absolutely wild how good the AI is.', name: 'Ahmed R.', role: 'University Student' },
    { quote: 'Our whole team is using Fox for onboarding new hires. It cut our ramp-up time by 40%.', name: 'Lin T.', role: 'Engineering Lead' },
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-[#050510] text-white overflow-hidden">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center hero-mesh">
        {/* 3D Canvas — fills right half on desktop */}
        <div className="absolute inset-0 z-0">
          <div className="absolute right-0 top-0 w-full md:w-1/2 h-full opacity-90">
            <HeroScene scrollY={scrollY} />
          </div>
          {/* Left fade-out gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#050510] via-[#050510]/70 to-transparent pointer-events-none" />
        </div>

        {/* Hero text */}
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-20"
        >
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-sm text-indigo-300 mb-8 border border-indigo-500/30"
            >
              <Zap className="w-3.5 h-3.5" />
              Powered by Gemini 1.5 Flash · Free to start
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="section-title text-5xl md:text-7xl leading-[1.1] mb-6"
            >
              Learn anything.<br />
              <span className="gradient-text">10 minutes</span><br />
              a day.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-white/60 text-lg md:text-xl leading-relaxed mb-10 max-w-xl"
            >
              Fox is an AI micro-learning bot that delivers hyper-personalised lessons
              directly to your Telegram. No apps. No subscriptions. Just daily progress.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="flex flex-wrap gap-4"
            >
              <Link href="/onboarding" className="btn-primary flex items-center gap-2 text-base">
                Start for free <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#how-it-works"
                className="glass px-7 py-3 rounded-xl font-semibold text-white/80 hover:text-white border border-white/10 hover:border-indigo-500/40 transition-all"
              >
                See how it works
              </a>
            </motion.div>

            {/* Social proof strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.7 }}
              className="mt-12 flex items-center gap-4 text-sm text-white/40"
            >
              <div className="flex -space-x-2">
                {['A','B','C','D'].map((l) => (
                  <div key={l} className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-[#050510] flex items-center justify-center text-xs font-bold text-white">
                    {l}
                  </div>
                ))}
              </div>
              <span>Joined by <strong className="text-white/70">2,400+</strong> learners this month</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 text-xs"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.6 }}
            className="w-5 h-8 border border-white/20 rounded-full flex justify-center pt-2"
          >
            <div className="w-1 h-1.5 bg-white/40 rounded-full" />
          </motion.div>
          scroll
        </motion.div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────── */}
      <section id="features" className="py-32 max-w-7xl mx-auto px-6">
        <FadeIn className="text-center mb-16">
          <p className="text-indigo-400 font-medium text-sm uppercase tracking-widest mb-3">Features</p>
          <h2 className="section-title text-4xl md:text-5xl mb-4">
            Everything you need to <span className="gradient-text">actually improve</span>
          </h2>
          <p className="text-white/50 max-w-xl mx-auto">
            Fox combines AI intelligence with Telegram convenience so that learning fits
            into your real life — not the other way around.
          </p>
        </FadeIn>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <FeatureCard key={f.title} {...f} delay={i * 0.08} />
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section id="how-it-works" className="py-32 relative">
        <div className="absolute inset-0 hero-mesh opacity-40 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <FadeIn>
                <p className="text-indigo-400 font-medium text-sm uppercase tracking-widest mb-3">How it works</p>
                <h2 className="section-title text-4xl md:text-5xl mb-4">
                  Up and learning in <span className="gradient-text">under 2 minutes</span>
                </h2>
                <p className="text-white/50 mb-12">
                  No course platforms, no video libraries, no overwhelm.
                  Just a short chat and you're on your way.
                </p>
              </FadeIn>

              <div className="flex flex-col gap-10">
                {steps.map((s, i) => <StepCard key={s.num} {...s} delay={i * 0.12} />)}
              </div>

              <FadeIn delay={0.4} className="mt-12">
                <Link href="/onboarding" className="btn-primary inline-flex items-center gap-2">
                  Try it now <ChevronRight className="w-4 h-4" />
                </Link>
              </FadeIn>
            </div>

            {/* Decorative phone mockup */}
            <FadeIn delay={0.2}>
              <div className="relative flex justify-center">
                <div className="relative w-72 glass-strong rounded-3xl p-5 shadow-card">
                  {/* Phone top bar */}
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Fox AI</p>
                      <p className="text-xs text-green-400">● online</p>
                    </div>
                  </div>
                  {/* Messages */}
                  {[
                    { who: 'bot', text: "Good morning, Sara! Today's lesson: Python list comprehensions." },
                    { who: 'bot', text: 'What does `[x*2 for x in range(5)]` return?' },
                    { who: 'user', text: '[0, 2, 4, 6, 8]' },
                    { who: 'bot', text: '✅ Perfect! You scored 100% today. See you tomorrow!' },
                  ].map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: msg.who === 'bot' ? -15 : 15 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 + i * 0.15 }}
                      className={`mb-3 flex ${msg.who === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        msg.who === 'bot'
                          ? 'bg-indigo-500/20 border border-indigo-500/30 text-white/90 rounded-tl-sm'
                          : 'bg-white/10 text-white/80 rounded-tr-sm'
                      }`}>
                        {msg.text}
                      </div>
                    </motion.div>
                  ))}
                </div>
                {/* Glow behind card */}
                <div className="absolute inset-0 blur-3xl bg-indigo-500/15 rounded-full scale-75 -z-10" />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────── */}
      <section className="py-32 max-w-7xl mx-auto px-6">
        <FadeIn className="text-center mb-16">
          <p className="text-indigo-400 font-medium text-sm uppercase tracking-widest mb-3">Testimonials</p>
          <h2 className="section-title text-4xl md:text-5xl">
            Real people. <span className="gradient-text">Real progress.</span>
          </h2>
        </FadeIn>
        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <Testimonial key={t.name} {...t} delay={i * 0.1} />
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section id="pricing" className="py-32 px-6">
        <FadeIn>
          <div className="max-w-3xl mx-auto glass-strong rounded-3xl p-12 text-center neon-border relative overflow-hidden">
            <div className="absolute inset-0 hero-mesh opacity-60 pointer-events-none" />
            <div className="relative z-10">
              <p className="text-indigo-400 font-medium text-sm uppercase tracking-widest mb-4">Get started today</p>
              <h2 className="section-title text-4xl md:text-5xl mb-5">
                Start learning for <span className="gradient-text">free</span>
              </h2>
              <p className="text-white/55 mb-10 max-w-xl mx-auto">
                No credit card. No download. Just a 60-second onboarding and you're
                receiving your first AI lesson on Telegram today.
              </p>
              <Link href="/onboarding" className="btn-primary inline-flex items-center gap-2 text-base px-10 py-4">
                Start free onboarding <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-white/30 text-sm">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-500" />
            <span className="font-semibold text-white/50">Fox</span>
          </div>
          <p>© {new Date().getFullYear()} Fox Micro-Learning. All rights reserved.</p>
          <Link href="/admin" className="hover:text-white/60 transition-colors">
            Admin Portal
          </Link>
        </div>
      </footer>
    </div>
  );
}
