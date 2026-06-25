"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import MatrixBackground from "@/components/MatrixBackground";

gsap.registerPlugin(ScrollTrigger);

// ==========================================
// TYPES
// ==========================================
type QuestStatus = 'todo' | 'inprogress' | 'done';
type Quest = { id: number; title: string; xp: number; status: QuestStatus; locked: boolean; };
type PlayerClass = 'Hacker' | 'Designer' | 'Strategist' | 'Architect' | 'Ghost';
type AccentColor = { name: string; hex: string; glow: string; };
type PlayerProfile = {
  username: string;
  playerClass: PlayerClass;
  accent: AccentColor;
  guild: string;
  bio: string;
};

// ==========================================
// CONSTANTS
// ==========================================
const ACCENT_COLORS: AccentColor[] = [
  { name: 'Neon Green',  hex: '#00ff41', glow: 'rgba(0,255,65,0.4)' },
  { name: 'Cyber Blue',  hex: '#00cfff', glow: 'rgba(0,207,255,0.4)' },
  { name: 'Hot Magenta', hex: '#ff00cc', glow: 'rgba(255,0,204,0.4)' },
  { name: 'Toxic Yellow',hex: '#ffff00', glow: 'rgba(255,255,0,0.4)' },
  { name: 'Blood Red',   hex: '#ff003c', glow: 'rgba(255,0,60,0.4)' },
  { name: 'Solar',       hex: '#ff8800', glow: 'rgba(255,136,0,0.4)' },
];

const CLASS_DESCRIPTIONS: Record<PlayerClass, { emoji: string; desc: string; bonus: string }> = {
  Hacker:     { emoji: '💻', desc: 'Master of systems, breaker of rules.', bonus: '+20% XP on Deep Work' },
  Designer:   { emoji: '🎨', desc: 'Shapes the world through visual craft.', bonus: '+15% XP on creative quests' },
  Strategist: { emoji: '♟️', desc: 'Plans 10 moves ahead. Always.', bonus: '+10% Day Score bonus' },
  Architect:  { emoji: '🏗️', desc: 'Builds systems that outlast their creator.', bonus: '+25% XP on routines' },
  Ghost:      { emoji: '👻', desc: 'Silent. Efficient. Untraceable.', bonus: 'Double streak multiplier' },
};

const DEFAULT_PROFILE: PlayerProfile = {
  username: 'Player_01',
  playerClass: 'Hacker',
  accent: ACCENT_COLORS[0],
  guild: 'NONE',
  bio: '',
};

const INITIAL_MORNING_ROUTINE = [
  { id: 'm1', label: 'Power off phone for 1 hour', duration: '60 min' },
  { id: 'm2', label: 'Drink 500ml water + cold shower', duration: '5 min' },
  { id: 'm3', label: 'Physical warmup (20 push-ups)', duration: '5 min' },
  { id: 'm4', label: "Confirm today's top 3 missions", duration: '5 min' },
];

const INITIAL_QUESTS: Quest[] = [
  { id: 1, title: 'Finish the landing page workshop', xp: 500, status: 'todo', locked: false },
  { id: 2, title: 'Complete morning routine', xp: 300, status: 'todo', locked: true },
  { id: 3, title: 'Log 1 Deep Work session (25 min)', xp: 200, status: 'todo', locked: true },
  { id: 4, title: 'Ship one feature to production', xp: 400, status: 'todo', locked: true },
];

const DEEP_WORK_DURATION = 25 * 60;
const BREAK_DURATION = 5 * 60;

// ==========================================
// UTILS
// ==========================================
function getDayScore(morningDone: boolean, quests: Quest[], deepWorkSessions: number): number {
  let score = 0;
  if (morningDone) score += 30;
  const doneQuests = quests.filter(q => q.status === 'done').length;
  if (doneQuests >= 1) score += 20;
  if (doneQuests >= 3) score += 10;
  if (deepWorkSessions >= 1) score += 20;
  if (doneQuests === quests.length && quests.length > 0) score += 20;
  return Math.min(score, 100);
}

// ==========================================
// SCORE RING COMPONENT
// ==========================================
function ScoreRing({ score, color }: { score: number; color: string }) {
  const radius = 46;
  const circ = 2 * Math.PI * radius;
  const ringColor = score >= 80 ? color : score >= 50 ? '#fb923c' : score > 0 ? '#FF4444' : '#1a1a1a';
  return (
    <div className="relative w-[116px] h-[116px] flex-shrink-0">
      <svg width="116" height="116" viewBox="0 0 116 116" style={{ filter: `drop-shadow(0 0 14px ${ringColor}70)` }}>
        <circle cx="58" cy="58" r={radius} fill="none" stroke="#111" strokeWidth="7" />
        <circle cx="58" cy="58" r={radius} fill="none" stroke={ringColor} strokeWidth="7"
          strokeLinecap="square" strokeDasharray={circ}
          strokeDashoffset={circ - (score / 100) * circ}
          style={{ transition: 'stroke-dashoffset 1s ease, stroke 0.5s ease', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold tabular-nums" style={{ color: ringColor, fontFamily: 'var(--font-vt323)' }}>{score}%</span>
        <span className="text-[9px] opacity-40 font-mono uppercase tracking-widest mt-0.5">DAY SCORE</span>
      </div>
    </div>
  );
}

// ==========================================
// LANDING VIEW
// ==========================================
function LandingView({ onLogin }: { onLogin: () => void }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"init" | "upgrade" | null>(null);
  const featuresRef = useRef(null);
  const guildsRef = useRef(null);
  const leaderboardRef = useRef(null);
  const pricingRef = useRef(null);

  useEffect(() => {
    const sections = [featuresRef, guildsRef, leaderboardRef, pricingRef];
    sections.forEach((secRef) => {
      if (secRef.current) {
        gsap.fromTo(secRef.current, { opacity: 0, y: 50 }, {
          opacity: 1, y: 0, duration: 1, ease: "power3.out",
          scrollTrigger: { trigger: secRef.current, start: "top 80%", toggleActions: "play none none reverse" },
        });
      }
    });
  }, []);

  const handleOpenModal = (type: "init" | "upgrade") => { setModalType(type); setModalOpen(true); };
  const handleConfirmLogin = () => { setModalOpen(false); onLogin(); };

  return (
    <div className="relative z-10 w-full max-w-5xl mx-auto">
      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-[#050505] border-2 border-primary p-8 max-w-lg w-full relative neon-border">
              <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 opacity-50 hover:opacity-100 font-mono text-xl">[X]</button>
              {modalType === "init" ? (
                <>
                  <h3 className="text-3xl font-bold font-mono uppercase mb-4 text-primary">System Initialization</h3>
                  <div className="space-y-4 font-mono text-sm opacity-80 mb-8 border border-primary/30 p-4 bg-primary/5">
                    <p>{">"} CONNECTING TO NEURAL LINK...</p>
                    <p className="animate-pulse">{">"} WAITING FOR USER AUTHENTICATION...</p>
                  </div>
                  <button onClick={handleConfirmLogin} className="w-full bg-primary text-background py-3 font-bold font-mono uppercase hover:bg-background hover:text-primary border-2 border-primary transition-colors">
                    Confirm Neural Link
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-3xl font-bold font-mono uppercase mb-4 text-primary">Unlock Battle Pass</h3>
                  <div className="space-y-4 font-mono text-sm opacity-80 mb-8 border border-primary/30 p-4 bg-primary/5">
                    <p>{">"} PROCESSING CRYPTO PAYMENT...</p>
                    <p>TOTAL: 0.0042 ETH</p>
                    <p className="text-destructive">{">"} ERROR: INSUFFICIENT FUNDS. GRIND MORE IRL.</p>
                  </div>
                  <button onClick={() => setModalOpen(false)} className="w-full border-2 border-primary py-3 font-bold font-mono uppercase hover:bg-primary hover:text-background transition-colors">
                    Acknowledge Defeat
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="flex flex-col gap-12 mt-12">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-primary/30 pb-4 mb-8 font-mono text-sm uppercase tracking-widest">
          <img src="/icon.png" alt="GRIND Logo" className="h-16 md:h-24 mix-blend-screen" />
          <div className="animate-pulse flex items-center gap-2 text-xs">
            <div className="w-2 h-2 bg-primary rounded-full shadow-[0_0_8px_#00ff41]"></div>
            STATUS: ONLINE
          </div>
        </div>

        {/* Hero with glitch */}
        <section className="mb-24">
          <h1
            className="text-6xl md:text-8xl lg:text-9xl font-bold uppercase tracking-tighter leading-none glitch-text crt-flicker"
            data-text="Your life is already a grind."
            style={{ fontFamily: 'var(--font-vt323)' }}
          >
            Your life is <br/>
            already a <span className="text-background bg-primary px-2 shadow-[0_0_20px_rgba(0,255,65,0.5)]">grind.</span>
          </h1>

          <p className="text-xl md:text-2xl mt-6 opacity-80 max-w-2xl font-mono border-l-4 border-primary pl-4" style={{ borderColor: '#00ff41', boxShadow: '4px 0 12px rgba(0,255,65,0.2)' }}>
            Might as well level up. GRIND is the first personal OS that turns your extreme productivity into a literal RPG.
          </p>

          <div className="mt-12 flex flex-wrap gap-6 items-center">
            <motion.button onClick={() => handleOpenModal("init")} whileHover={{ scale: 1.03, boxShadow: '0 0 25px rgba(0,255,65,0.5)' }} whileTap={{ scale: 0.97 }}
              className="bg-primary text-background px-8 py-4 font-bold uppercase tracking-widest text-lg border-2 border-primary hover:bg-background hover:text-primary transition-all cursor-pointer">
              {">"} Initialize OS
            </motion.button>
            <a href="#features" className="uppercase tracking-widest hover:underline underline-offset-4 opacity-60 hover:opacity-100 transition-opacity font-mono text-sm">
              [ View Manual ]
            </a>
          </div>

          {/* Stats HUD */}
          <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-1 border border-primary/20 bg-background/60 backdrop-blur-sm neon-border-subtle">
            {[
              { label: "EXP MULTIPLIER", val: "x2.5" },
              { label: "ACTIVE QUESTS", val: "14" },
              { label: "GUILD MEMBERS", val: "1,042" },
              { label: "BOSS DEFEATED", val: "89" }
            ].map((stat, i) => (
              <div key={i} className={`flex flex-col p-5 hover:bg-primary/10 transition-colors ${i < 3 ? 'border-r border-primary/10' : ''}`}>
                <span className="text-[10px] opacity-40 mb-2 font-mono uppercase tracking-widest">{stat.label}</span>
                <span className="text-3xl font-bold" style={{ fontFamily: 'var(--font-vt323)', color: '#00ff41', textShadow: '0 0 20px rgba(0,255,65,0.5)' }}>{stat.val}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" ref={featuresRef} className="py-24 border-t border-primary/20">
          <h2 className="text-4xl md:text-5xl font-bold uppercase mb-12" style={{ fontFamily: 'var(--font-vt323)' }}>
            <span className="opacity-40 mr-3">[01]</span>Daily Quests & Boss Fights
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-primary/20 p-8 bg-[#070707] relative overflow-hidden group neon-border-subtle hover:neon-border transition-all duration-300">
              <div className="absolute top-4 right-4 opacity-10 font-mono text-8xl select-none group-hover:opacity-20 transition-opacity" style={{ fontFamily: 'var(--font-vt323)' }}>!</div>
              <h3 className="text-2xl font-bold mb-4 font-mono uppercase">Track Habits as Quests</h3>
              <p className="opacity-70 font-mono text-sm leading-relaxed mb-6">Stop using boring checklists. Every deadline is a Boss. Every habit is a daily quest. Earn XP, unlock cosmetics, climb the global leaderboard.</p>
              <ul className="space-y-3 font-mono text-sm">
                {['Deploy code to prod (+500 XP)', 'Drink 2L of water (+50 XP)', '1 hour Deep Work (+200 XP)'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 opacity-70">
                    <span className="text-primary">{">"}</span>{item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="border border-primary/20 p-8 bg-[#070707] relative overflow-hidden group neon-border-subtle hover:neon-border transition-all duration-300">
              <img src="/assets/boss.png" alt="Boss" className="absolute -bottom-6 -right-6 w-56 h-56 mix-blend-screen opacity-30 group-hover:opacity-60 transition-opacity duration-500 group-hover:scale-105 transition-transform" />
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-4 font-mono uppercase">Boss Fights: Deadlines</h3>
                <p className="opacity-70 font-mono text-sm leading-relaxed mb-6">A project due in 3 days? That's a raid boss. Miss the deadline — lose HP. Defeat it — claim rare loot.</p>
                <div className="border border-destructive/50 p-4 bg-destructive/5">
                  <div className="flex justify-between mb-2 font-bold font-mono text-xs uppercase">
                    <span>⚔ Raid: Launch MVP</span>
                    <span className="text-destructive animate-pulse">HP: 15%</span>
                  </div>
                  <div className="w-full h-3 bg-black/50 overflow-hidden">
                    <motion.div initial={{ width: "100%" }} whileInView={{ width: "15%" }} transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                      className="h-full bg-destructive" style={{ boxShadow: '0 0 8px rgba(255,0,60,0.7)' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Guilds */}
        <section ref={guildsRef} className="py-24 border-t border-primary/20">
          <h2 className="text-4xl md:text-5xl font-bold uppercase mb-12" style={{ fontFamily: 'var(--font-vt323)' }}>
            <span className="opacity-40 mr-3">[02]</span>Guilds & Multiplayer
          </h2>
          <div className="flex flex-col md:flex-row gap-8 border border-primary/20 p-8 bg-[#070707] neon-border-subtle">
            <div className="flex-1">
              <p className="text-lg font-mono mb-6 opacity-80">Form a Guild with your crew. Share passive XP buffs, coordinate Team Quests, compete in weekly PvP productivity sprints.</p>
              <motion.button onClick={() => handleOpenModal("init")} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="border border-primary px-6 py-3 font-mono hover:bg-primary hover:text-background transition-colors uppercase text-sm">
                [ Search Guilds ]
              </motion.button>
            </div>
            <div className="w-full md:w-72 flex flex-col gap-3 font-mono text-sm">
              {[
                { name: "NIGHT OWLS", lvl: 42, members: "3/5", active: true },
                { name: "CODE_MONKEYS", lvl: 18, members: "5/5", active: false },
                { name: "THE 5AM CLUB", lvl: 99, members: "2/5", active: true },
              ].map((guild, i) => (
                <div key={i} className={`flex justify-between items-center p-3 border ${guild.active ? 'border-primary/20 bg-primary/5' : 'border-primary/10 opacity-50'}`}>
                  <div>
                    <div className="font-bold">{guild.name}</div>
                    <div className="text-xs opacity-50">LVL {guild.lvl}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs ${guild.active ? 'text-primary' : 'opacity-40'}`}>{guild.members}</div>
                    {guild.active && <div className="text-[10px] text-primary opacity-60">RECRUITING</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Leaderboard */}
        <section ref={leaderboardRef} className="py-24 border-t border-primary/20">
          <h2 className="text-4xl md:text-5xl font-bold uppercase mb-12 text-center" style={{ fontFamily: 'var(--font-vt323)' }}>
            <span className="opacity-40 mr-3">[03]</span>Global Rankings
          </h2>
          <div className="max-w-3xl mx-auto border border-primary/20 bg-[#070707] neon-border-subtle">
            <div className="grid grid-cols-4 font-mono text-[10px] uppercase opacity-30 px-4 py-3 border-b border-primary/10 tracking-widest">
              <div>Rank</div><div className="col-span-2">Player</div><div className="text-right">XP</div>
            </div>
            {[
              { rank: 1, name: "ZeroCool", class: "Hacker", xp: "842,000", hue: "0deg", crown: '👑' },
              { rank: 2, name: "AcidBurn", class: "Designer", xp: "790,500", hue: "90deg", crown: '' },
              { rank: 3, name: "LordNikon", class: "Marketer", xp: "788,100", hue: "180deg", crown: '' },
              { rank: 4, name: "CerealKiller", class: "Hustler", xp: "650,200", hue: "270deg", crown: '' },
              { rank: 5, name: "Joey", class: "Noob", xp: "12,000", hue: "45deg", crown: '' },
            ].map((player, i) => (
              <div key={i} className={`grid grid-cols-4 font-mono px-4 py-3 border-b border-primary/5 transition-colors hover:bg-primary/5 ${i === 0 ? 'bg-primary/10' : ''}`}>
                <div className="flex items-center text-sm font-bold" style={{ color: i === 0 ? '#00ff41' : undefined }}>
                  {player.crown || `#${player.rank}`}
                </div>
                <div className="col-span-2 flex items-center gap-3">
                  <img src="/assets/avatar.png" alt="" className="w-8 h-8 rounded-full mix-blend-screen border border-primary/30 flex-shrink-0" style={{ filter: `hue-rotate(${player.hue}) brightness(${i === 0 ? 1.2 : 0.8})` }} />
                  <div>
                    <div className="text-sm font-semibold">{player.name}</div>
                    <div className="text-[10px] opacity-40">{player.class}</div>
                  </div>
                </div>
                <div className="text-right flex items-center justify-end text-sm font-mono" style={{ color: i === 0 ? '#00ff41' : undefined }}>{player.xp}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section ref={pricingRef} className="py-24 border-t border-primary/20 mb-24">
          <h2 className="text-4xl md:text-5xl font-bold uppercase mb-2 text-center" style={{ fontFamily: 'var(--font-vt323)' }}>[ INSERT COIN TO CONTINUE ]</h2>
          <p className="text-center font-mono text-sm opacity-40 mb-12">Choose your loadout</p>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { name: 'F2P', sub: 'Free', price: '$0', priceNote: '', items: ['Basic Quests', '1 Guild max', 'Standard HUD'], cta: 'Select', style: 'default' as const },
              { name: 'BATTLE PASS', sub: 'Most Popular', price: '$12', priceNote: '/mo', items: ['Unlimited Boss Fights', 'Create 5 Guilds', 'Custom Neon HUDs', 'IRL Merch Rewards'], cta: 'Upgrade', style: 'featured' as const },
              { name: 'GOD MODE', sub: '', price: '$99', priceNote: '/mo', items: ['Enterprise API', 'Dedicated Server', 'Custom AI Agent'], cta: 'Contact Sales', style: 'default' as const },
            ].map((plan, i) => (
              <div key={i} className={`p-8 flex flex-col relative ${plan.style === 'featured' ? 'border-2 border-primary neon-border md:-translate-y-4' : 'border border-primary/20 bg-[#070707]'}`}>
                {plan.sub && <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 text-[10px] font-bold uppercase font-mono ${plan.style === 'featured' ? 'bg-primary text-background' : 'bg-[#111] border border-primary/30 text-primary'}`}>{plan.sub}</div>}
                <h3 className="text-xl font-bold font-mono uppercase text-center mb-2" style={{ color: plan.style === 'featured' ? '#00ff41' : undefined }}>{plan.name}</h3>
                <div className="text-center mb-8" style={{ fontFamily: 'var(--font-vt323)' }}>
                  <span className="text-5xl font-bold" style={{ color: plan.style === 'featured' ? '#00ff41' : undefined }}>{plan.price}</span>
                  <span className="text-sm opacity-40">{plan.priceNote}</span>
                </div>
                <ul className="space-y-3 font-mono text-sm flex-1 mb-8">
                  {plan.items.map((item, j) => <li key={j} className="flex items-center gap-2 opacity-70"><span style={{ color: '#00ff41' }}>{">"}</span>{item}</li>)}
                </ul>
                <button onClick={() => handleOpenModal(plan.style === 'featured' ? 'upgrade' : 'init')}
                  className={`w-full py-3 font-bold font-mono uppercase text-sm transition-all ${plan.style === 'featured' ? 'bg-primary text-background hover:opacity-90 shadow-[0_0_20px_rgba(0,255,65,0.4)]' : 'border border-primary/30 hover:border-primary hover:bg-primary/10'}`}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </section>

        <footer className="border-t border-primary/20 pt-6 pb-16 font-mono text-xs opacity-30 flex justify-between uppercase tracking-widest">
          <span>GRIND OS © 2026</span>
          <span>ALL SYSTEMS OPERATIONAL</span>
        </footer>
      </motion.div>
    </div>
  );
}

// ==========================================
// DASHBOARD — PROFILE TAB
// ==========================================
function ProfileTab({ profile, setProfile }: { profile: PlayerProfile; setProfile: (p: PlayerProfile) => void }) {
  const [draft, setDraft] = useState<PlayerProfile>(profile);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setProfile(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="grid md:grid-cols-2 gap-6">

      {/* Left : Identity */}
      <div className="border border-primary/20 bg-[#070707] p-6 space-y-6 neon-border-subtle">
        <h3 className="uppercase font-bold tracking-widest text-sm opacity-50">// Identity</h3>

        {/* Avatar Preview */}
        <div className="flex items-center gap-5">
          <div className="relative">
            <img src="/assets/avatar.png" className="w-20 h-20 rounded-full mix-blend-screen border-2"
              style={{ borderColor: draft.accent.hex, filter: `hue-rotate(${ACCENT_COLORS.indexOf(draft.accent) * 60}deg)`, boxShadow: `0 0 20px ${draft.accent.glow}` }} />
            <div className="absolute -bottom-1 -right-1 text-lg">{CLASS_DESCRIPTIONS[draft.playerClass].emoji}</div>
          </div>
          <div>
            <div className="text-2xl font-bold" style={{ fontFamily: 'var(--font-vt323)', color: draft.accent.hex, textShadow: `0 0 10px ${draft.accent.glow}` }}>
              {draft.username || 'UNNAMED'}
            </div>
            <div className="text-xs opacity-50 font-mono uppercase">{draft.playerClass} · {draft.guild || 'No Guild'}</div>
          </div>
        </div>

        {/* Username */}
        <div>
          <label className="block text-[10px] uppercase tracking-widest opacity-40 mb-2 font-mono">Username</label>
          <input value={draft.username} onChange={e => setDraft({ ...draft, username: e.target.value })} maxLength={16}
            className="w-full bg-black/50 border border-primary/20 px-4 py-2 font-mono text-sm outline-none focus:border-primary transition-colors"
            style={{ color: draft.accent.hex }} placeholder="Enter username..." />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-[10px] uppercase tracking-widest opacity-40 mb-2 font-mono">Bio <span className="opacity-30">(optional)</span></label>
          <textarea value={draft.bio} onChange={e => setDraft({ ...draft, bio: e.target.value })} maxLength={80} rows={2}
            className="w-full bg-black/50 border border-primary/20 px-4 py-2 font-mono text-sm outline-none focus:border-primary transition-colors resize-none"
            placeholder="Your battle cry..." />
        </div>

        {/* Guild */}
        <div>
          <label className="block text-[10px] uppercase tracking-widest opacity-40 mb-2 font-mono">Guild Tag</label>
          <input value={draft.guild} onChange={e => setDraft({ ...draft, guild: e.target.value.toUpperCase() })} maxLength={12}
            className="w-full bg-black/50 border border-primary/20 px-4 py-2 font-mono text-sm outline-none focus:border-primary transition-colors uppercase"
            placeholder="NONE" />
        </div>
      </div>

      {/* Right : Class + Accent */}
      <div className="space-y-4">
        {/* Class selection */}
        <div className="border border-primary/20 bg-[#070707] p-6 neon-border-subtle">
          <h3 className="uppercase font-bold tracking-widest text-sm opacity-50 mb-4">// Class</h3>
          <div className="space-y-2">
            {(Object.keys(CLASS_DESCRIPTIONS) as PlayerClass[]).map(cls => {
              const info = CLASS_DESCRIPTIONS[cls];
              const active = draft.playerClass === cls;
              return (
                <button key={cls} onClick={() => setDraft({ ...draft, playerClass: cls })}
                  className={`w-full flex items-center gap-3 p-3 border text-left transition-all ${active ? 'border-primary/50 bg-primary/10' : 'border-primary/10 hover:border-primary/30 hover:bg-primary/5'}`}>
                  <span className="text-xl w-7 text-center flex-shrink-0">{info.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-mono font-bold text-sm uppercase" style={{ color: active ? draft.accent.hex : undefined }}>{cls}</div>
                    <div className="text-[10px] opacity-50 font-mono mt-0.5">{info.bonus}</div>
                  </div>
                  {active && <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: draft.accent.hex, boxShadow: `0 0 6px ${draft.accent.hex}` }} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Accent color */}
        <div className="border border-primary/20 bg-[#070707] p-6 neon-border-subtle">
          <h3 className="uppercase font-bold tracking-widest text-sm opacity-50 mb-4">// Accent Color</h3>
          <div className="grid grid-cols-3 gap-2">
            {ACCENT_COLORS.map(color => {
              const active = draft.accent.hex === color.hex;
              return (
                <button key={color.hex} onClick={() => setDraft({ ...draft, accent: color })}
                  className={`flex items-center gap-2 p-2.5 border text-left transition-all ${active ? 'border-white/30 bg-white/5' : 'border-primary/10 hover:border-primary/30'}`}>
                  <div className="w-4 h-4 rounded-sm flex-shrink-0 border border-white/20" style={{ background: color.hex, boxShadow: active ? `0 0 8px ${color.hex}` : 'none' }} />
                  <span className="text-[10px] font-mono opacity-70">{color.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Save button */}
        <motion.button onClick={handleSave} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className="w-full py-4 border-2 font-bold font-mono uppercase text-sm tracking-widest transition-all"
          style={{
            borderColor: saved ? '#00ff41' : draft.accent.hex,
            color: saved ? '#00ff41' : draft.accent.hex,
            background: saved ? 'rgba(0,255,65,0.1)' : 'transparent',
            boxShadow: saved ? '0 0 20px rgba(0,255,65,0.3)' : `0 0 12px ${draft.accent.glow}`,
          }}>
          {saved ? '✓ Profile Saved!' : '[ Save Profile ]'}
        </motion.button>
      </div>
    </motion.div>
  );
}

// ==========================================
// AUDIO & FX SYSTEM
// ==========================================
const playSound = (type: 'xp' | 'hit' | 'levelup') => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'xp') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'hit') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'levelup') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(554.37, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.2);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.6);
    }
  } catch(e) {
    console.error("Audio block: ", e);
  }
};

type Particle = { id: number; x: number; y: number; text: string; color: string; };

// ==========================================
// DASHBOARD VIEW
// ==========================================
type DashTab = 'hud' | 'quests' | 'deepwork' | 'profile';

function DashboardView({ onLogout }: { onLogout: () => void }) {
  const [profile, setProfile] = useState<PlayerProfile>(DEFAULT_PROFILE);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [bossHp, setBossHp] = useState(100);
  const [streak, setStreak] = useState(3);
  const [logs, setLogs] = useState<string[]>([
    '[BOOT] GRIND OS v1.0.0 INITIALIZED.',
    '[SYSTEM] NEURAL LINK ESTABLISHED.',
    '[QUEST] 4 active missions detected.',
  ]);
  const [morningChecked, setMorningChecked] = useState<string[]>([]);
  const [routine, setRoutine] = useState(INITIAL_MORNING_ROUTINE);
  const [quests, setQuests] = useState<Quest[]>(INITIAL_QUESTS);
  
  const [newRoutine, setNewRoutine] = useState('');
  const [newQuest, setNewQuest] = useState('');
  const [dwRunning, setDwRunning] = useState(false);
  const [dwTimeLeft, setDwTimeLeft] = useState(DEEP_WORK_DURATION);
  const [dwOnBreak, setDwOnBreak] = useState(false);
  const [dwSessions, setDwSessions] = useState(0);
  const [tab, setTab] = useState<DashTab>('hud');
  const [levelUpFlash, setLevelUpFlash] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  const spawnParticle = (e: React.MouseEvent, text: string, color: string) => {
    const newP = { id: Date.now() + Math.random(), x: e.clientX, y: e.clientY, text, color };
    setParticles(prev => [...prev, newP]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== newP.id));
    }, 1000);
  };

  const dwInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const bossRef = useRef<HTMLImageElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const morningDone = routine.length > 0 && morningChecked.length === routine.length;
  const dayScore = getDayScore(morningDone, quests, dwSessions);
  const accent = profile.accent;

  const addLog = useCallback((msg: string) => setLogs(prev => [...prev.slice(-30), msg]), []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    // Quests are no longer locked by morning routine
    setQuests(prev => prev.map((q) => ({ ...q, locked: false })));
  }, [morningDone]);

  const gainXp = useCallback((amount: number) => {
    setXp(prev => {
      let next = prev + amount;
      let newLevel = level;
      if (next >= 1000) {
        next -= 1000;
        newLevel += 1;
        setLevel(newLevel);
        setLevelUpFlash(true);
        playSound('levelup');
        setTimeout(() => setLevelUpFlash(false), 2000);
        addLog(`[⬆ LEVEL UP] You reached Level ${newLevel}!`);
      }
      return next;
    });
  }, [level, addLog]);

  useEffect(() => {
    if (dwRunning) {
      dwInterval.current = setInterval(() => {
        setDwTimeLeft(prev => {
          if (prev <= 1) {
            if (!dwOnBreak) {
              setDwSessions(s => s + 1);
              setDwOnBreak(true);
              addLog(`[DEEP WORK] Session complete! +200 XP.`);
              gainXp(200);
              return BREAK_DURATION;
            } else {
              setDwOnBreak(false);
              addLog(`[BREAK] Rest over. Focus up.`);
              return DEEP_WORK_DURATION;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (dwInterval.current) clearInterval(dwInterval.current);
    }
    return () => { if (dwInterval.current) clearInterval(dwInterval.current); };
  }, [dwRunning, dwOnBreak, gainXp]);

  const handleMorningCheck = (id: string, e: React.MouseEvent) => {
    const idx = routine.findIndex(r => r.id === id);
    if (idx > 0 && !morningChecked.includes(routine[idx - 1].id)) return;
    if (morningChecked.includes(id)) return;
    const next = [...morningChecked, id];
    setMorningChecked(next);
    gainXp(75);
    playSound('xp');
    setTimeout(() => playSound('hit'), 100);
    spawnParticle(e, '+75 XP', accent.hex);
    
    const dmg = 10;
    setBossHp(prev => Math.max(0, parseFloat((prev - dmg).toFixed(1))));
    
    addLog(`[ROUTINE] "${routine[idx].label}" +75 XP | Boss -${dmg}HP`);
    if (bossRef.current) {
      gsap.fromTo(bossRef.current, { x: -15, y: 5 }, { x: 15, y: -5, duration: 0.05, yoyo: true, repeat: 9, onComplete: () => gsap.set(bossRef.current, { x: 0, y: 0 }) });
    }

    if (next.length === routine.length) {
      addLog(`[🌅 MORNING DONE] Streak: ${streak + 1}🔥 All quests unlocked.`);
      setStreak(s => s + 1);
    }
  };

  const handleAddRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoutine.trim()) return;
    setRoutine(prev => [...prev, { id: 'm' + Date.now(), label: newRoutine.trim(), duration: 'N/A' }]);
    setNewRoutine('');
  };

  const handleAddQuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuest.trim()) return;
    setQuests(prev => [...prev, { id: Date.now(), title: newQuest.trim(), xp: 100, status: 'todo', locked: false }]);
    setNewQuest('');
  };

  const handleQuestCycle = (id: number, e: React.MouseEvent) => {
    const quest = quests.find(q => q.id === id);
    if (!quest || quest.locked) return;
    const cycle: QuestStatus[] = ['todo', 'inprogress', 'done'];
    const nextStatus = cycle[(cycle.indexOf(quest.status) + 1) % cycle.length];
    if (nextStatus === 'done' && quest.status !== 'done') {
      gainXp(quest.xp);
      playSound('xp');
      setTimeout(() => playSound('hit'), 150);
      spawnParticle(e, `+${quest.xp} XP`, accent.hex);
      
      const dmg = Math.min(30, quest.xp / 16);
      setBossHp(prev => Math.max(0, parseFloat((prev - dmg).toFixed(1))));
      addLog(`[QUEST ✓] "${quest.title}" +${quest.xp} XP | Boss -${dmg.toFixed(0)}HP`);
      if (bossRef.current) {
        gsap.fromTo(bossRef.current, { x: -10 }, { x: 10, duration: 0.08, yoyo: true, repeat: 7, onComplete: () => gsap.set(bossRef.current, { x: 0 }) });
      }
    } else if (nextStatus === 'inprogress') {
      addLog(`[QUEST ⚡] "${quest.title}" → IN PROGRESS`);
    }
    setQuests(prev => prev.map(q => q.id === id ? { ...q, status: nextStatus } : q));
  };

  const dwFormatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const dwProgress = dwOnBreak ? (1 - dwTimeLeft / BREAK_DURATION) : (1 - dwTimeLeft / DEEP_WORK_DURATION);

  const TABS: { id: DashTab; label: string }[] = [
    { id: 'hud', label: '[ HUD ]' },
    { id: 'quests', label: '[ QUESTS ]' },
    { id: 'deepwork', label: '[ DEEP WORK ]' },
    { id: 'profile', label: '[ PROFILE ]' },
  ];

  return (
    <div className="relative z-10 w-full max-w-5xl mx-auto mt-4 flex flex-col font-mono">
      {/* Floating Particles */}
      <AnimatePresence>
        {particles.map(p => (
          <motion.div key={p.id}
            initial={{ opacity: 1, y: p.y, x: p.x - 20, scale: 0.5 }}
            animate={{ opacity: 0, y: p.y - 80, scale: 1.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="fixed pointer-events-none z-[100] font-bold font-mono text-2xl"
            style={{ color: p.color, textShadow: `0 0 15px ${p.color}` }}>
            {p.text}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Level Up Flash */}
      <AnimatePresence>
        {levelUpFlash && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="border-4 px-12 py-8 text-center" style={{ borderColor: accent.hex, background: `${accent.hex}15`, boxShadow: `0 0 60px ${accent.glow}` }}>
              <div className="text-6xl font-bold uppercase" style={{ fontFamily: 'var(--font-vt323)', color: accent.hex, textShadow: `0 0 30px ${accent.hex}` }}>LEVEL UP!</div>
              <div className="font-mono text-sm mt-2 opacity-70">You are now Level {level}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top HUD Bar */}
      <div className="border border-primary/20 bg-[#070707] p-4 mb-4 flex items-center gap-4 justify-between neon-border-subtle">
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <img src="/assets/avatar.png" className="w-12 h-12 rounded-full mix-blend-screen border-2"
              style={{ borderColor: accent.hex, filter: `hue-rotate(${ACCENT_COLORS.indexOf(accent) * 60}deg)`, boxShadow: `0 0 14px ${accent.glow}` }} />
            <div className="absolute -bottom-1 -right-1 text-sm">{CLASS_DESCRIPTIONS[profile.playerClass].emoji}</div>
          </div>
          <div>
            <div className="text-lg font-bold uppercase tracking-widest" style={{ fontFamily: 'var(--font-vt323)', color: accent.hex, textShadow: `0 0 10px ${accent.glow}` }}>
              {profile.username}
            </div>
            <div className="text-[10px] opacity-40 uppercase">{profile.playerClass} · Streak: {streak}🔥</div>
          </div>
        </div>

        <div className="flex-1 max-w-xs hidden md:block">
          <div className="flex justify-between text-[10px] mb-1 opacity-40 uppercase tracking-widest">
            <span>LVL {level}</span><span>{xp} / 1000 XP</span>
          </div>
          <div className="w-full h-2 bg-black/50 border border-primary/20 p-[1px]">
            <motion.div className="h-full" style={{ background: accent.hex, boxShadow: `0 0 8px ${accent.glow}` }}
              animate={{ width: `${(xp / 1000) * 100}%` }} transition={{ type: "spring", bounce: 0 }} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ScoreRing score={dayScore} color={accent.hex} />
          <button onClick={onLogout} className="border border-primary/20 px-3 py-1 text-xs uppercase hover:border-primary/60 transition-colors opacity-30 hover:opacity-80 hidden md:block">
            [QUIT]
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex border-b border-primary/20 mb-5">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 md:px-6 py-3 text-xs md:text-sm uppercase tracking-widest font-mono transition-all border-b-2 ${tab === t.id ? 'border-b-2 text-primary' : 'border-transparent opacity-30 hover:opacity-60'}`}
            style={{ borderColor: tab === t.id ? accent.hex : 'transparent', color: tab === t.id ? accent.hex : undefined }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {/* ── HUD & QUESTS SHARED LAYOUT ── */}
        {(tab === 'hud' || tab === 'quests') && (
          <motion.div key="hud-quests" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="grid lg:grid-cols-2 gap-5">
            
            {/* ── LEFT COLUMN ── */}
            <div className="flex flex-col gap-5">
              
              {/* MORNING ROUTINE */}
              {tab === 'hud' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border border-primary/20 bg-[#070707] p-5 neon-border-subtle">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="uppercase font-bold tracking-widest" style={{ fontFamily: 'var(--font-vt323)', fontSize: '1.6rem' }}>☀ Morning Routine</h3>
                    <span className="text-xs px-3 py-1 border font-bold uppercase" style={{
                      borderColor: morningDone ? `${accent.hex}60` : 'rgba(255,255,255,0.1)',
                      color: morningDone ? accent.hex : undefined,
                      background: morningDone ? `${accent.hex}10` : 'transparent',
                    }}>
                      {morningChecked.length}/{routine.length}
                    </span>
                  </div>
                  <div className="h-1 bg-black/50 mb-5 overflow-hidden">
                    <motion.div className="h-full" style={{ background: accent.hex, boxShadow: `0 0 8px ${accent.glow}` }}
                      animate={{ width: `${(morningChecked.length / Math.max(1, routine.length)) * 100}%` }}
                      transition={{ type: "spring", bounce: 0 }} />
                  </div>
                  <div className="space-y-2">
                    {routine.map((item, idx) => {
                      const done = morningChecked.includes(item.id);
                      const isNext = !done && (idx === 0 || morningChecked.includes(routine[idx - 1].id));
                      const locked = !done && !isNext;
                      return (
                        <button key={item.id} onClick={(e) => handleMorningCheck(item.id, e)} disabled={locked || done}
                          className={`w-full flex items-center gap-3 p-3 border text-left transition-all duration-200 ${done ? 'border-primary/10 opacity-30 cursor-default' : isNext ? 'cursor-pointer hover:bg-primary/5' : 'border-primary/5 opacity-15 cursor-not-allowed'}`}
                          style={{ borderColor: done ? undefined : isNext ? `${accent.hex}30` : undefined }}>
                          <div className="w-5 h-5 flex-shrink-0 border flex items-center justify-center transition-all" style={{ borderColor: done ? accent.hex : isNext ? `${accent.hex}60` : 'rgba(255,255,255,0.15)', background: done ? accent.hex : 'transparent' }}>
                            {done && <span className="text-background text-[10px] font-black">✓</span>}
                            {isNext && !done && <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2 }} className="w-1.5 h-1.5" style={{ background: accent.hex }} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`text-sm ${done ? 'line-through opacity-40' : ''}`}>{item.label}</div>
                            <div className="text-[10px] opacity-40 mt-0.5">{item.duration} · +75 XP · ⚔ -10 HP</div>
                          </div>
                          {isNext && <span className="text-[9px] border px-2 py-0.5 uppercase flex-shrink-0 font-bold" style={{ borderColor: `${accent.hex}40`, color: accent.hex }}>Next</span>}
                        </button>
                      );
                    })}
                  </div>
                  <form onSubmit={handleAddRoutine} className="mt-4 flex gap-2">
                    <input value={newRoutine} onChange={e => setNewRoutine(e.target.value)}
                      placeholder="Add routine item..." maxLength={40}
                      className="flex-1 bg-black/50 border border-primary/20 px-3 py-2 text-xs font-mono outline-none focus:border-primary transition-colors" />
                    <button type="submit" className="border border-primary/20 px-3 py-2 text-xs font-mono hover:bg-primary/10 transition-colors">+</button>
                  </form>
                  
                  {morningDone && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                      className="mt-4 border p-3 text-center text-sm font-bold"
                      style={{ borderColor: `${accent.hex}40`, background: `${accent.hex}08`, color: accent.hex }}>
                      ✓ Morning Protocol Complete
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* QUESTS LIST */}
              {tab === 'quests' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border border-primary/20 bg-[#070707] p-6 neon-border-subtle">
                  <div className="flex justify-between items-center mb-6">
                    <h3 style={{ fontFamily: 'var(--font-vt323)', fontSize: '2rem' }} className="uppercase">Active Missions</h3>
                    <div className="flex items-center gap-3">
                      <div className="text-xs border border-primary/20 px-3 py-1 uppercase font-bold opacity-60">
                        {quests.filter(q => q.status === 'done').length}/{quests.length} done
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {quests.map(q => {
                      const bgColors: Record<QuestStatus, string> = { todo: 'transparent', inprogress: 'rgba(251,146,60,0.05)', done: `${accent.hex}08` };
                      const borderColors: Record<QuestStatus, string> = { todo: 'rgba(255,255,255,0.06)', inprogress: 'rgba(251,146,60,0.3)', done: `${accent.hex}25` };

                      return (
                        <button key={q.id} onClick={(e) => handleQuestCycle(q.id, e)} disabled={q.locked}
                          className={`w-full flex items-center gap-4 p-4 border text-left transition-all duration-200 ${q.locked ? 'opacity-10 cursor-not-allowed' : q.status === 'done' ? 'cursor-default' : 'cursor-pointer hover:brightness-125'}`}
                          style={{ borderColor: q.locked ? 'rgba(255,255,255,0.04)' : borderColors[q.status], background: bgColors[q.status] }}>

                          <div className="w-6 h-6 flex-shrink-0 border-2 flex items-center justify-center transition-all"
                            style={{ borderColor: q.status === 'done' ? accent.hex : q.status === 'inprogress' ? '#fb923c' : 'rgba(255,255,255,0.15)', background: q.status === 'done' ? accent.hex : 'transparent' }}>
                            {q.status === 'done' && <span className="text-background text-[10px] font-black">✓</span>}
                            {q.status === 'inprogress' && <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 0.7 }} className="w-2 h-2 bg-[#fb923c]" />}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className={`text-sm font-semibold ${q.status === 'done' ? 'line-through opacity-40' : ''}`}>{q.title}</div>
                            <div className="text-[10px] opacity-40 mt-0.5">+{q.xp} XP · Click to advance status</div>
                          </div>

                          <div className="flex-shrink-0 text-[10px] border px-2 py-1 font-bold uppercase"
                            style={{
                              borderColor: q.status === 'done' ? `${accent.hex}30` : q.status === 'inprogress' ? 'rgba(251,146,60,0.3)' : 'rgba(255,255,255,0.1)',
                              color: q.status === 'done' ? accent.hex : q.status === 'inprogress' ? '#fb923c' : undefined,
                              background: q.status === 'done' ? `${accent.hex}08` : q.status === 'inprogress' ? 'rgba(251,146,60,0.08)' : 'transparent',
                            }}>
                            {q.status === 'done' ? '✓ DONE' : q.status === 'inprogress' ? '⚡ IN PROGRESS' : 'TODO'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  
                  <form onSubmit={handleAddQuest} className="mt-4 flex gap-2">
                    <input value={newQuest} onChange={e => setNewQuest(e.target.value)}
                      placeholder="Add new quest..." maxLength={60}
                      className="flex-1 bg-black/50 border border-primary/20 px-3 py-3 text-sm font-mono outline-none focus:border-primary transition-colors" />
                    <button type="submit" className="border border-primary/20 px-4 py-3 text-sm font-mono hover:bg-primary/10 transition-colors uppercase tracking-widest font-bold">Add</button>
                  </form>
                </motion.div>
              )}
            </div>

            {/* ── RIGHT COLUMN: BOSS & TERMINAL ── */}
            <div className="flex flex-col gap-4">
              {/* Boss */}
              <div className="border border-destructive/30 bg-[#070707] p-5 flex-1 relative overflow-hidden" style={{ boxShadow: `inset 0 0 20px rgba(255,0,60,0.05)` }}>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="uppercase font-bold text-destructive tracking-widest" style={{ fontFamily: 'var(--font-vt323)', fontSize: '1.6rem' }}>🔴 Boss: Deadline</h3>
                  <span className="text-destructive text-xs font-bold">{bossHp.toFixed(0)}% HP</span>
                </div>
                <div className="h-3 bg-black/50 border border-destructive/40 p-[1px] mb-3">
                  <motion.div className="h-full bg-destructive" animate={{ width: `${bossHp}%` }}
                    transition={{ type: "spring", bounce: 0 }} style={{ boxShadow: '0 0 8px rgba(255,0,60,0.7)' }} />
                </div>
                {bossHp > 0 ? (
                  <img ref={bossRef} src="/assets/boss.png" alt="Boss" className="w-full max-h-48 object-contain mix-blend-screen opacity-70 hover:opacity-100 transition-opacity" />
                ) : (
                  <div className="text-center py-6">
                    <div className="text-5xl mb-2">💀</div>
                    <div className="font-bold uppercase tracking-widest" style={{ color: accent.hex, fontFamily: 'var(--font-vt323)' }}>BOSS DEFEATED</div>
                  </div>
                )}
              </div>

              {/* Terminal */}
              <div className="border border-primary/20 bg-[#030303] p-4 h-52 flex flex-col" style={{ boxShadow: 'inset 0 0 20px rgba(0,255,65,0.03)' }}>
                <div className="text-[9px] uppercase opacity-20 border-b border-primary/10 pb-2 mb-2 tracking-[0.3em]">// TERMINAL OUTPUT</div>
                <div className="flex-1 overflow-y-auto space-y-1.5 text-[11px] pr-1">
                  {logs.map((log, i) => (
                    <div key={i} className={
                      log.includes('LEVEL UP') ? 'font-bold' :
                      log.includes('ERROR') ? '' : ''
                    } style={{
                      color: log.includes('ERROR') || log.includes('BOSS') || log.includes('HP') ? '#ff003c' :
                             log.includes('LEVEL UP') || log.includes('DONE') || log.includes('MORNING') ? '#ff00cc' :
                             log.includes('DEEP WORK') || log.includes('BREAK') ? '#fb923c' :
                             `${accent.hex}90`
                    }}>
                      {log}
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── DEEP WORK TAB ── */}
        {tab === 'deepwork' && (
          <motion.div key="deepwork" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
            className="border border-primary/20 bg-[#070707] p-6 neon-border-subtle flex flex-col items-center gap-8">
            <div className="w-full flex justify-between items-center">
              <h3 style={{ fontFamily: 'var(--font-vt323)', fontSize: '2rem' }} className="uppercase">Deep Work Timer</h3>
              <div className="flex gap-2">
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className="w-3 h-6 border transition-all" style={{
                    borderColor: i < dwSessions ? accent.hex : 'rgba(255,255,255,0.1)',
                    background: i < dwSessions ? accent.hex : 'transparent',
                    boxShadow: i < dwSessions ? `0 0 6px ${accent.glow}` : 'none',
                  }} />
                ))}
                <span className="text-xs opacity-40 self-end ml-1 font-mono">{dwSessions} today</span>
              </div>
            </div>

            {/* Timer */}
            <div className="relative w-64 h-64 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 256 256">
                <circle cx="128" cy="128" r="112" fill="none" stroke="#111" strokeWidth="10" />
                <circle cx="128" cy="128" r="96" fill="none" stroke="#0a0a0a" strokeWidth="1" />
                <motion.circle cx="128" cy="128" r="112" fill="none"
                  stroke={dwOnBreak ? '#fb923c' : accent.hex} strokeWidth="10" strokeLinecap="square"
                  strokeDasharray={2 * Math.PI * 112}
                  animate={{ strokeDashoffset: (1 - dwProgress) * 2 * Math.PI * 112 }}
                  transition={{ duration: 0.5 }}
                  style={{ filter: `drop-shadow(0 0 14px ${dwOnBreak ? 'rgba(251,146,60,0.6)' : accent.glow})` }}
                />
              </svg>
              <div className="text-center z-10">
                <div className="text-6xl font-bold tabular-nums" style={{ fontFamily: 'var(--font-vt323)', color: dwOnBreak ? '#fb923c' : accent.hex, textShadow: `0 0 20px ${dwOnBreak ? 'rgba(251,146,60,0.6)' : accent.glow}` }}>
                  {dwFormatTime(dwTimeLeft)}
                </div>
                <div className="text-xs opacity-40 uppercase mt-2 font-mono tracking-widest">{dwOnBreak ? '🟠 BREAK' : '🟢 FOCUS'}</div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-4">
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={() => { setDwRunning(!dwRunning); if (!dwRunning) addLog('[DEEP WORK] Session started. No distractions.'); }}
                className="px-8 py-4 border-2 font-bold uppercase text-sm tracking-widest transition-all"
                style={{
                  borderColor: dwRunning ? '#fb923c' : accent.hex,
                  color: dwRunning ? '#fb923c' : accent.hex,
                  background: dwRunning ? 'rgba(251,146,60,0.1)' : `${accent.hex}15`,
                  boxShadow: dwRunning ? '0 0 16px rgba(251,146,60,0.3)' : `0 0 16px ${accent.glow}`,
                }}>
                {dwRunning ? '[ PAUSE ]' : '[ START ]'}
              </motion.button>
              <button onClick={() => { setDwRunning(false); setDwTimeLeft(DEEP_WORK_DURATION); setDwOnBreak(false); }}
                className="px-6 py-4 border border-primary/20 text-sm uppercase hover:border-primary/50 transition-colors opacity-40 hover:opacity-80">
                RESET
              </button>
            </div>

            <div className="self-start border border-primary/10 p-4 bg-primary/[0.02] text-[11px] font-mono opacity-50 space-y-1.5 w-full max-w-sm">
              <div>{">"} 25 min FOCUS → 5 min BREAK = 1 session</div>
              <div>{">"} Complete 1 session → +200 XP</div>
              <div>{">"} Complete 4 sessions → Boss -100% HP</div>
            </div>
          </motion.div>
        )}

        {/* ── PROFILE TAB ── */}
        {tab === 'profile' && (
          <ProfileTab key="profile" profile={profile} setProfile={setProfile} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ==========================================
// MAIN
// ==========================================
export default function Home() {
  const [booting, setBooting] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 2500);
    return () => clearTimeout(t);
  }, []);

  const terminalLines = [
    "INITIALIZING GRIND OS v1.0.0...",
    "LOADING NEURAL INTERFACE...",
    "BYPASSING DOPAMINE RECEPTORS...",
    "SYSTEM READY."
  ];

  return (
    <main className="min-h-screen bg-background text-primary flex flex-col p-4 md:p-8 lg:p-12 overflow-x-hidden relative selection:bg-primary selection:text-background scanlines">
      {!booting && <MatrixBackground />}
      {booting ? (
        <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col justify-center flex-1">
          <div className="font-mono text-sm md:text-xl flex flex-col gap-2">
            {terminalLines.map((line, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.5 }}>
                <span className="opacity-40">{">"}</span> {line}
              </motion.div>
            ))}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }} transition={{ delay: 2, repeat: Infinity, duration: 0.8 }} className="mt-2">_</motion.div>
          </div>
        </div>
      ) : isLoggedIn ? (
        <DashboardView onLogout={() => setIsLoggedIn(false)} />
      ) : (
        <LandingView onLogin={() => setIsLoggedIn(true)} />
      )}
    </main>
  );
}
