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

// ==========================================
// UTILS
// ==========================================
function getDayScore(morningDone: boolean, quests: Quest[], deepWorkSessions: number): number {
  let score = 0;
  if (morningDone) score += 30;
  const doneQuests = quests.filter(q => q.status === 'done').length;
  if (doneQuests >= 1) score += 20;
  if (doneQuests >= 3) score += 10; // bonus
  if (deepWorkSessions >= 1) score += 20;
  if (doneQuests === quests.length && quests.length > 0) score += 20; // all done bonus
  return Math.min(score, 100);
}

function ScoreRing({ score }: { score: number }) {
  const radius = 46;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? '#00ff41' : score >= 50 ? '#fb923c' : score > 0 ? '#FF4444' : '#1a1a1a';
  return (
    <div className="relative w-[116px] h-[116px] flex-shrink-0">
      <svg width="116" height="116" viewBox="0 0 116 116" style={{ filter: `drop-shadow(0 0 12px ${color}60)` }}>
        <circle cx="58" cy="58" r={radius} fill="none" stroke="#1a1a1a" strokeWidth="7" />
        <circle cx="58" cy="58" r={radius} fill="none" stroke={color} strokeWidth="7"
          strokeLinecap="square"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease, stroke 0.5s ease', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold tabular-nums" style={{ color, fontFamily: 'var(--font-vt323)' }}>{score}%</span>
        <span className="text-[9px] opacity-50 font-mono uppercase tracking-widest">SCORE</span>
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
              className="bg-[#050505] border-2 border-primary p-8 max-w-lg w-full relative shadow-[0_0_30px_rgba(0,255,65,0.2)]">
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
                    <p className="text-destructive">{">"} ERROR: INSUFFICIENT FUNDS. PLEASE GRIND MORE IRL.</p>
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
          <div className="animate-pulse flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            STATUS: ONLINE
          </div>
        </div>

        {/* Hero */}
        <section className="mb-24">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold uppercase tracking-tighter leading-none" style={{ fontFamily: 'var(--font-vt323)' }}>
            Your life is <br/>already a <span className="text-background bg-primary px-2">grind.</span>
          </h1>
          <p className="text-xl md:text-2xl mt-6 opacity-80 max-w-2xl font-mono border-l-2 border-primary pl-4">
            Might as well level up. GRIND is the first personal OS that turns your extreme productivity into a literal RPG.
          </p>
          <div className="mt-12 flex flex-wrap gap-6 items-center">
            <motion.button onClick={() => handleOpenModal("init")} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="bg-primary text-background px-8 py-4 font-bold uppercase tracking-widest text-lg border-2 border-primary hover:bg-background hover:text-primary transition-colors cursor-pointer">
              {">"} Initialize OS
            </motion.button>
            <a href="#features" className="uppercase tracking-widest hover:underline underline-offset-4 opacity-70 hover:opacity-100 transition-opacity font-mono">[ View Manual ]</a>
          </div>
          <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-primary/30 pt-8 backdrop-blur-sm bg-background/50">
            {[{ label: "EXP MULTIPLIER", val: "x2.5" }, { label: "ACTIVE QUESTS", val: "14" }, { label: "GUILD MEMBERS", val: "1,042" }, { label: "BOSS DEFEATED", val: "89" }]
              .map((stat, i) => (
                <div key={i} className="flex flex-col border border-primary/20 p-4 hover:bg-primary/10 transition-colors">
                  <span className="text-xs opacity-60 mb-2 font-mono">{stat.label}</span>
                  <span className="text-2xl font-bold font-mono" style={{ fontFamily: 'var(--font-vt323)' }}>{stat.val}</span>
                </div>
              ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" ref={featuresRef} className="py-24 border-t border-primary/30 backdrop-blur-sm bg-background/30">
          <h2 className="text-4xl md:text-5xl font-bold uppercase mb-12" style={{ fontFamily: 'var(--font-vt323)' }}>[01] Daily Quests & Boss Fights</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="border border-primary/30 p-8 bg-background/80 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-30 font-mono text-6xl group-hover:opacity-100 transition-opacity">!</div>
              <h3 className="text-2xl font-bold mb-4 font-mono uppercase">Track your habits as Quests</h3>
              <p className="opacity-80 font-mono text-sm leading-relaxed mb-6">Stop using boring checklists. Every deadline is a Boss. Every habit is a daily quest. Earn XP, unlock cosmetics for your HUD, and climb the global leaderboard of productivity.</p>
              <ul className="space-y-2 font-mono text-sm opacity-70">
                <li>{">"} Deploy code to prod (+500 XP)</li>
                <li>{">"} Drink 2L of water (+50 XP)</li>
                <li>{">"} 1 hour Deep Work (+200 XP)</li>
              </ul>
            </div>
            <div className="border border-primary/30 p-8 bg-primary/20 text-primary relative overflow-hidden group">
              <img src="/assets/boss.png" alt="Raid Boss" className="absolute -bottom-8 -right-8 w-64 h-64 opacity-60 group-hover:opacity-100 transition-opacity mix-blend-screen" />
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-4 font-mono uppercase text-background bg-primary inline-block px-2">Boss Fights</h3>
                <p className="opacity-90 font-mono text-sm leading-relaxed mb-6 bg-background/80 p-2 border border-primary/30 backdrop-blur-md">A project due in 3 days? That's a raid boss. Team up with your Guild or face it solo. If you miss the deadline, you lose HP.</p>
                <div className="mt-4 border-2 border-primary p-4 bg-background/80 backdrop-blur-sm">
                  <div className="flex justify-between mb-2 font-bold font-mono text-sm uppercase">
                    <span>Raid: Launch MVP</span>
                    <span className="text-destructive animate-pulse">HP: 15%</span>
                  </div>
                  <div className="w-full h-4 bg-primary/20 overflow-hidden">
                    <motion.div initial={{ width: "100%" }} whileInView={{ width: "15%" }} transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }} className="h-full bg-destructive" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Guilds */}
        <section ref={guildsRef} className="py-24 border-t border-primary/30 backdrop-blur-sm bg-background/30">
          <h2 className="text-4xl md:text-5xl font-bold uppercase mb-12" style={{ fontFamily: 'var(--font-vt323)' }}>[02] Guilds & Multiplayer</h2>
          <div className="flex flex-col md:flex-row gap-8 items-center border border-primary/30 p-8 bg-background/80">
            <div className="flex-1">
              <p className="text-xl font-mono mb-6">Grinding alone is tough. Form a Guild with your coworkers or friends. Share passive XP buffs, coordinate on Team Quests.</p>
              <motion.button onClick={() => handleOpenModal("init")} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="border border-primary px-6 py-3 font-mono hover:bg-primary hover:text-background transition-colors uppercase text-sm">
                [ Search Guilds ]
              </motion.button>
            </div>
            <div className="w-full md:w-1/3 flex flex-col gap-2 font-mono text-sm">
              {["NIGHT OWLS [LVL 42]", "CODE_MONKEYS [LVL 18]", "THE 5AM CLUB [LVL 99]"].map((guild, i) => (
                <div key={i} className="flex justify-between border-b border-primary/20 pb-2">
                  <span>{guild}</span>
                  <span className="opacity-50">[{3 - i}/5]</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Leaderboard */}
        <section ref={leaderboardRef} className="py-24 border-t border-primary/30 backdrop-blur-sm bg-background/30">
          <h2 className="text-4xl md:text-5xl font-bold uppercase mb-12 text-center" style={{ fontFamily: 'var(--font-vt323)' }}>[03] Global Rankings</h2>
          <div className="max-w-3xl mx-auto border border-primary/30 bg-background/80">
            <div className="grid grid-cols-4 font-mono text-xs uppercase opacity-50 p-4 border-b border-primary/30">
              <div>Rank</div><div className="col-span-2">Player / Class</div><div className="text-right">XP</div>
            </div>
            {[{ rank: 1, name: "ZeroCool", class: "Hacker", xp: "842,000", hue: "0deg" }, { rank: 2, name: "AcidBurn", class: "Designer", xp: "790,500", hue: "90deg" }, { rank: 3, name: "LordNikon", class: "Marketer", xp: "788,100", hue: "180deg" }, { rank: 4, name: "CerealKiller", class: "Hustler", xp: "650,200", hue: "270deg" }, { rank: 5, name: "Joey", class: "Noob", xp: "12,000", hue: "45deg" }]
              .map((player, i) => (
                <div key={i} className={`grid grid-cols-4 font-mono p-4 border-b border-primary/10 hover:bg-primary/5 transition-colors ${i === 0 ? 'bg-primary/10 text-primary font-bold' : ''}`}>
                  <div className="flex items-center">#{player.rank}</div>
                  <div className="col-span-2 flex items-center gap-3">
                    <img src="/assets/avatar.png" alt={player.name} className="w-10 h-10 rounded-full border border-primary/50 mix-blend-screen" style={{ filter: `hue-rotate(${player.hue})` }} />
                    <div className="flex flex-col"><span>{player.name}</span><span className="text-xs opacity-50">{player.class}</span></div>
                  </div>
                  <div className="text-right flex items-center justify-end">{player.xp}</div>
                </div>
              ))}
          </div>
        </section>

        {/* Pricing */}
        <section ref={pricingRef} className="py-24 border-t border-primary/30 backdrop-blur-sm bg-background/30 mb-24">
          <h2 className="text-4xl md:text-5xl font-bold uppercase mb-12 text-center" style={{ fontFamily: 'var(--font-vt323)' }}>[ INSERT COIN TO CONTINUE ]</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="border border-primary/30 p-8 flex flex-col bg-background/80">
              <h3 className="text-2xl font-bold mb-2 font-mono uppercase text-center">F2P (Free)</h3>
              <div className="text-4xl font-bold text-center mb-8" style={{ fontFamily: 'var(--font-vt323)' }}>$0</div>
              <ul className="space-y-4 font-mono text-sm opacity-80 flex-1"><li>{">"} Basic Quests</li><li>{">"} 1 Guild max</li><li>{">"} Standard HUD</li></ul>
              <button onClick={() => handleOpenModal("init")} className="w-full border border-primary py-3 mt-8 hover:bg-primary hover:text-background transition-colors font-mono uppercase text-sm">Select</button>
            </div>
            <div className="border-2 border-primary p-8 flex flex-col bg-primary/10 relative transform md:-translate-y-4">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-background px-4 py-1 text-xs font-bold uppercase font-mono">Most Popular</div>
              <h3 className="text-2xl font-bold mb-2 font-mono uppercase text-center text-primary">Battle Pass</h3>
              <div className="text-4xl font-bold text-center mb-8" style={{ fontFamily: 'var(--font-vt323)' }}>$12<span className="text-sm opacity-50">/mo</span></div>
              <ul className="space-y-4 font-mono text-sm opacity-90 flex-1"><li>{">"} Unlimited Boss Fights</li><li>{">"} Create 5 Guilds</li><li>{">"} Custom Neon HUDs</li><li>{">"} IRL Merch Rewards</li></ul>
              <button onClick={() => handleOpenModal("upgrade")} className="w-full bg-primary text-background py-3 mt-8 font-bold font-mono uppercase text-sm shadow-[0_0_15px_rgba(0,255,65,0.5)] hover:opacity-90 transition-opacity">Upgrade</button>
            </div>
            <div className="border border-primary/30 p-8 flex flex-col bg-background/80">
              <h3 className="text-2xl font-bold mb-2 font-mono uppercase text-center opacity-70">God Mode</h3>
              <div className="text-4xl font-bold text-center mb-8 opacity-70" style={{ fontFamily: 'var(--font-vt323)' }}>$99<span className="text-sm opacity-50">/mo</span></div>
              <ul className="space-y-4 font-mono text-sm opacity-60 flex-1"><li>{">"} Enterprise API</li><li>{">"} Dedicated Server</li><li>{">"} Custom AI Agent</li></ul>
              <button onClick={() => handleOpenModal("upgrade")} className="w-full border border-primary/30 py-3 mt-8 hover:border-primary transition-colors font-mono uppercase text-sm opacity-70">Contact Sales</button>
            </div>
          </div>
        </section>

        <footer className="border-t border-primary/30 pt-8 pb-12 font-mono text-sm opacity-50 flex justify-between uppercase">
          <span>GRIND OS © 2026</span>
          <span>CONNECTION SECURE</span>
        </footer>
      </motion.div>
    </div>
  );
}

// ==========================================
// DASHBOARD VIEW (THE REAL OS)
// ==========================================
const MORNING_ROUTINE = [
  { id: 'm1', label: 'Power off phone for 1 hour', duration: '60 min' },
  { id: 'm2', label: 'Drink 500ml water + cold shower', duration: '5 min' },
  { id: 'm3', label: 'Physical warmup (20 push-ups)', duration: '5 min' },
  { id: 'm4', label: 'Confirm today\'s top 3 missions', duration: '5 min' },
];

const INITIAL_QUESTS: Quest[] = [
  { id: 1, title: 'Finish the landing page workshop', xp: 500, status: 'todo', locked: false },
  { id: 2, title: 'Complete morning routine', xp: 300, status: 'todo', locked: true },
  { id: 3, title: 'Log 1 Deep Work session (25 min)', xp: 200, status: 'todo', locked: true },
  { id: 4, title: 'Ship one feature to production', xp: 400, status: 'todo', locked: true },
];

const DEEP_WORK_DURATION = 25 * 60; // 25 min pomodoro
const BREAK_DURATION = 5 * 60;

type DashTab = 'hud' | 'quests' | 'deepwork';

function DashboardView({ onLogout }: { onLogout: () => void }) {
  // Player State
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [bossHp, setBossHp] = useState(100);
  const [streak, setStreak] = useState(3);
  const [logs, setLogs] = useState<string[]>([
    '[BOOT] GRIND OS v1.0.0 INITIALIZED.',
    '[SYSTEM] NEURAL LINK ESTABLISHED.',
    '[QUEST] 4 active missions detected.',
  ]);
  
  // Morning Routine State
  const [morningChecked, setMorningChecked] = useState<string[]>([]);
  const morningDone = morningChecked.length === MORNING_ROUTINE.length;
  
  // Quests State
  const [quests, setQuests] = useState<Quest[]>(INITIAL_QUESTS);
  
  // Deep Work State (Pomodoro)
  const [dwRunning, setDwRunning] = useState(false);
  const [dwTimeLeft, setDwTimeLeft] = useState(DEEP_WORK_DURATION);
  const [dwOnBreak, setDwOnBreak] = useState(false);
  const [dwSessions, setDwSessions] = useState(0);
  const dwInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const bossRef = useRef<HTMLImageElement>(null);
  
  // Navigation
  const [tab, setTab] = useState<DashTab>('hud');

  const addLog = useCallback((msg: string) => setLogs(prev => [...prev.slice(-20), msg]), []);

  const dayScore = getDayScore(morningDone, quests, dwSessions);

  // Unlock quests sequentially after morning done
  useEffect(() => {
    setQuests(prev => prev.map((q, i) => ({ ...q, locked: i === 0 ? false : !morningDone && i > 0 })));
  }, [morningDone]);

  // Deep Work timer
  useEffect(() => {
    if (dwRunning) {
      dwInterval.current = setInterval(() => {
        setDwTimeLeft(prev => {
          if (prev <= 1) {
            if (!dwOnBreak) {
              const sessions = dwSessions + 1;
              setDwSessions(sessions);
              setDwOnBreak(true);
              addLog(`[DEEP WORK] Session complete! +200 XP earned.`);
              gainXp(200);
              return BREAK_DURATION;
            } else {
              setDwOnBreak(false);
              addLog(`[BREAK] Break over. Back to the grind.`);
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
  }, [dwRunning, dwOnBreak]);

  const gainXp = useCallback((amount: number) => {
    setXp(prev => {
      let next = prev + amount;
      let newLevel = level;
      if (next >= 1000) {
        next -= 1000;
        newLevel += 1;
        setLevel(newLevel);
        addLog(`[⬆ LEVEL UP] You reached Level ${newLevel}! New power unlocked.`);
      }
      return next;
    });
  }, [level, addLog]);

  const handleMorningCheck = (id: string) => {
    const idx = MORNING_ROUTINE.findIndex(r => r.id === id);
    // Sequential unlock
    if (idx > 0 && !morningChecked.includes(MORNING_ROUTINE[idx - 1].id)) return;
    if (morningChecked.includes(id)) return;
    const next = [...morningChecked, id];
    setMorningChecked(next);
    gainXp(75);
    addLog(`[ROUTINE] "${MORNING_ROUTINE[idx].label}" +75 XP`);
    if (next.length === MORNING_ROUTINE.length) {
      addLog(`[🌅 MORNING COMPLETE] Streak: ${streak + 1} days! All quests unlocked.`);
      setStreak(s => s + 1);
    }
  };

  const handleQuestCycle = (id: number) => {
    const quest = quests.find(q => q.id === id);
    if (!quest || quest.locked) return;
    const cycle: QuestStatus[] = ['todo', 'inprogress', 'done'];
    const nextStatus = cycle[(cycle.indexOf(quest.status) + 1) % cycle.length];
    if (nextStatus === 'done' && quest.status !== 'done') {
      gainXp(quest.xp);
      const dmg = Math.min(25, quest.xp / 20);
      setBossHp(prev => Math.max(0, prev - dmg));
      addLog(`[QUEST ✓] "${quest.title}" +${quest.xp} XP | Boss -${dmg.toFixed(0)}HP`);
      if (bossRef.current) {
        gsap.fromTo(bossRef.current, { x: -8 }, { x: 8, duration: 0.08, yoyo: true, repeat: 6, onComplete: () => gsap.set(bossRef.current, { x: 0 }) });
      }
    } else if (nextStatus === 'inprogress') {
      addLog(`[QUEST ⚡] "${quest.title}" status → IN PROGRESS`);
    }
    setQuests(prev => prev.map(q => q.id === id ? { ...q, status: nextStatus } : q));
  };

  const dwFormatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const dwProgress = dwOnBreak ? (1 - dwTimeLeft / BREAK_DURATION) : (1 - dwTimeLeft / DEEP_WORK_DURATION);

  const statusBadge: Record<QuestStatus, string> = {
    todo: 'opacity-60',
    inprogress: 'text-[#fb923c] border-[#fb923c]/40 bg-[#fb923c]/10',
    done: 'text-primary border-primary/40 bg-primary/10',
  };
  const statusLabel: Record<QuestStatus, string> = { todo: 'TODO', inprogress: '⚡ IN PROGRESS', done: '✓ DONE' };

  return (
    <div className="relative z-10 w-full max-w-5xl mx-auto mt-4 flex flex-col h-full font-mono">
      {/* Top HUD Bar */}
      <div className="border border-primary/30 bg-background/80 backdrop-blur-sm p-4 mb-4 flex items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <img src="/assets/avatar.png" className="w-12 h-12 rounded-full border-2 border-primary mix-blend-screen flex-shrink-0" />
          <div>
            <div className="text-lg font-bold uppercase tracking-widest text-primary" style={{ fontFamily: 'var(--font-vt323)' }}>Player_01</div>
            <div className="text-xs opacity-50 uppercase">Class: Hacker | Streak: {streak}🔥</div>
          </div>
        </div>

        <div className="flex-1 max-w-xs hidden md:block">
          <div className="flex justify-between text-xs mb-1 opacity-60"><span>LVL {level}</span><span>{xp} / 1000 XP</span></div>
          <div className="w-full h-3 bg-background border border-primary/30">
            <motion.div className="h-full bg-primary" animate={{ width: `${(xp / 1000) * 100}%` }} transition={{ type: "spring", bounce: 0 }} />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ScoreRing score={dayScore} />
          <button onClick={onLogout} className="border border-primary/30 px-3 py-1 text-xs uppercase hover:border-primary hover:text-primary transition-colors opacity-50 hover:opacity-100">
            [QUIT]
          </button>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-primary/30 mb-6">
        {([['hud', '[ HUD ]'], ['quests', '[ QUESTS ]'], ['deepwork', '[ DEEP WORK ]']] as [DashTab, string][]).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`px-6 py-3 text-sm uppercase tracking-widest font-mono transition-all border-b-2 ${tab === id ? 'border-primary text-primary' : 'border-transparent opacity-50 hover:opacity-80'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {tab === 'hud' && (
          <motion.div key="hud" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid lg:grid-cols-2 gap-6">
            {/* Morning Routine */}
            <div className="border border-primary/30 bg-background/60 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl uppercase font-bold" style={{ fontFamily: 'var(--font-vt323)', fontSize: '1.8rem' }}>☀ Morning Routine</h3>
                <span className={`text-xs px-3 py-1 border font-bold uppercase ${morningDone ? 'border-primary/40 text-primary bg-primary/10' : 'border-primary/20 opacity-50'}`}>
                  {morningChecked.length}/{MORNING_ROUTINE.length}
                </span>
              </div>
              <div className="h-1.5 bg-primary/10 mb-6 overflow-hidden">
                <motion.div className="h-full bg-primary" animate={{ width: `${(morningChecked.length / MORNING_ROUTINE.length) * 100}%` }} transition={{ type: "spring", bounce: 0 }} />
              </div>
              <div className="space-y-3">
                {MORNING_ROUTINE.map((item, idx) => {
                  const done = morningChecked.includes(item.id);
                  const isNext = !done && (idx === 0 || morningChecked.includes(MORNING_ROUTINE[idx - 1].id));
                  const locked = !done && !isNext;
                  return (
                    <button key={item.id} onClick={() => handleMorningCheck(item.id)} disabled={locked || done}
                      className={`w-full flex items-center gap-3 p-3 border text-left transition-all ${done ? 'border-primary/20 opacity-40 cursor-default' : isNext ? 'border-primary/40 hover:bg-primary/10 bg-primary/5 cursor-pointer' : 'border-primary/10 opacity-20 cursor-not-allowed'}`}>
                      <div className={`w-6 h-6 flex-shrink-0 border-2 flex items-center justify-center ${done ? 'bg-primary border-primary' : 'border-primary/40'}`}>
                        {done && <span className="text-background text-xs font-bold">✓</span>}
                        {!done && isNext && <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-2 h-2 bg-primary" />}
                      </div>
                      <div className="flex-1">
                        <div className={`text-sm font-medium ${done ? 'line-through' : ''}`}>{item.label}</div>
                        <div className="text-xs opacity-50 mt-0.5">{item.duration} · +75 XP</div>
                      </div>
                      {isNext && !done && <span className="text-[10px] border border-primary/40 px-2 py-0.5 text-primary uppercase">Next</span>}
                    </button>
                  );
                })}
              </div>
              {morningDone && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 border border-primary/40 bg-primary/10 p-4 text-center">
                  <div className="text-primary font-bold uppercase text-sm">Morning Protocol Complete 🌅</div>
                  <div className="text-xs opacity-60 mt-1">All quests unlocked. Let's grind.</div>
                </motion.div>
              )}
            </div>

            {/* Boss + Terminal */}
            <div className="flex flex-col gap-4">
              {/* Boss Panel */}
              <div className="border border-primary/30 bg-background/60 p-6 relative overflow-hidden flex-1">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xl uppercase font-bold text-destructive" style={{ fontFamily: 'var(--font-vt323)', fontSize: '1.8rem' }}>🔴 Boss: Deadline</h3>
                  <span className="text-destructive text-xs font-bold font-mono">{bossHp.toFixed(0)}% HP</span>
                </div>
                <div className="h-4 bg-background border-2 border-destructive p-0.5 mb-4">
                  <motion.div className="h-full bg-destructive" animate={{ width: `${bossHp}%` }} transition={{ type: "spring", bounce: 0 }} />
                </div>
                {bossHp > 0 ? (
                  <img ref={bossRef} src="/assets/boss.png" alt="Boss" className="w-full max-h-40 object-contain mix-blend-screen opacity-70" />
                ) : (
                  <div className="text-center py-8">
                    <div className="text-5xl mb-2">💀</div>
                    <div className="text-primary font-bold uppercase" style={{ fontFamily: 'var(--font-vt323)' }}>BOSS DEFEATED</div>
                  </div>
                )}
              </div>

              {/* Terminal */}
              <div className="border border-primary/30 bg-[#050505] p-4 h-48 flex flex-col shadow-[inset_0_0_10px_rgba(0,255,65,0.04)]">
                <div className="text-[10px] uppercase opacity-30 border-b border-primary/20 pb-2 mb-2 tracking-widest">// TERMINAL OUTPUT</div>
                <div className="flex-1 overflow-y-auto space-y-1.5 text-xs scrollbar-none">
                  {logs.map((log, i) => (
                    <div key={i} className={
                      log.includes('ERROR') || log.includes('BOSS') ? 'text-destructive' :
                      log.includes('LEVEL UP') || log.includes('COMPLETE') ? 'text-[#ff00ff]' :
                      log.includes('DEEP WORK') || log.includes('BREAK') ? 'text-[#fb923c]' :
                      'text-primary/70'
                    }>
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {tab === 'quests' && (
          <motion.div key="quests" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="border border-primary/30 bg-background/60 p-6">
            <div className="flex justify-between items-center mb-8">
              <h3 style={{ fontFamily: 'var(--font-vt323)', fontSize: '2.5rem' }} className="uppercase">Active Missions</h3>
              <div className="text-xs border border-primary/30 px-3 py-1 uppercase font-bold">
                {quests.filter(q => q.status === 'done').length}/{quests.length} completed
              </div>
            </div>

            {!morningDone && (
              <div className="border border-[#fb923c]/30 bg-[#fb923c]/5 p-4 mb-6 text-[#fb923c] text-sm font-mono">
                ⚠ Complete morning routine first to unlock all quests.
              </div>
            )}

            <div className="space-y-3">
              {quests.map(q => (
                <button key={q.id} onClick={() => handleQuestCycle(q.id)} disabled={q.locked}
                  className={`w-full flex items-center gap-4 p-4 border text-left transition-all ${q.locked ? 'border-primary/10 opacity-20 cursor-not-allowed' : q.status === 'done' ? 'border-primary/20 opacity-50 cursor-default' : 'border-primary/30 hover:bg-primary/5 bg-primary/[0.02] cursor-pointer hover:border-primary/60'}`}>
                  
                  <div className={`w-7 h-7 flex-shrink-0 border-2 flex items-center justify-center ${q.status === 'done' ? 'bg-primary border-primary' : q.status === 'inprogress' ? 'border-[#fb923c]' : 'border-primary/30'}`}>
                    {q.status === 'done' && <span className="text-background text-sm font-bold">✓</span>}
                    {q.status === 'inprogress' && <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-2 h-2 bg-[#fb923c]" />}
                  </div>

                  <div className="flex-1">
                    <div className={`text-sm font-semibold ${q.status === 'done' ? 'line-through opacity-50' : ''}`}>{q.title}</div>
                    <div className="text-xs opacity-50 mt-1">Reward: +{q.xp} XP | Click to cycle status</div>
                  </div>

                  <span className={`text-[10px] px-2 py-1 border font-bold uppercase flex-shrink-0 ${statusBadge[q.status]}`}>
                    {statusLabel[q.status]}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {tab === 'deepwork' && (
          <motion.div key="deepwork" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="border border-primary/30 bg-background/60 p-6 flex flex-col items-center gap-8">
            <h3 style={{ fontFamily: 'var(--font-vt323)', fontSize: '2.5rem' }} className="uppercase self-start">Deep Work Timer</h3>

            {/* Sessions count */}
            <div className="flex gap-6 self-start">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className={`w-4 h-8 border-2 ${i < dwSessions ? 'bg-primary border-primary' : 'border-primary/20'}`} />
              ))}
              <span className="text-xs opacity-50 self-end font-mono">{dwSessions} session{dwSessions !== 1 ? 's' : ''} today</span>
            </div>

            {/* Timer Ring */}
            <div className="relative w-64 h-64 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 256 256">
                <circle cx="128" cy="128" r="112" fill="none" stroke="#1a1a1a" strokeWidth="12" />
                <motion.circle cx="128" cy="128" r="112" fill="none" stroke={dwOnBreak ? '#fb923c' : '#00ff41'} strokeWidth="12"
                  strokeLinecap="square"
                  strokeDasharray={2 * Math.PI * 112}
                  animate={{ strokeDashoffset: (1 - dwProgress) * 2 * Math.PI * 112 }}
                  transition={{ duration: 0.5 }}
                  style={{ filter: `drop-shadow(0 0 12px ${dwOnBreak ? '#fb923c' : '#00ff41'}80)` }}
                />
              </svg>
              <div className="text-center z-10">
                <div className="text-5xl font-bold tabular-nums" style={{ fontFamily: 'var(--font-vt323)', color: dwOnBreak ? '#fb923c' : '#00ff41' }}>
                  {dwFormatTime(dwTimeLeft)}
                </div>
                <div className="text-xs opacity-50 uppercase mt-2 font-mono">{dwOnBreak ? '🟠 BREAK TIME' : '🟢 FOCUS'}</div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-4">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => { setDwRunning(!dwRunning); if (!dwRunning) addLog('[DEEP WORK] Session started. No distractions.'); }}
                className={`px-8 py-4 border-2 font-bold uppercase text-sm tracking-widest transition-colors ${dwRunning ? 'border-[#fb923c] text-[#fb923c] hover:bg-[#fb923c]/10' : 'border-primary bg-primary text-background hover:bg-transparent hover:text-primary'}`}>
                {dwRunning ? '[ PAUSE ]' : '[ START ]'}
              </motion.button>
              <button onClick={() => { setDwRunning(false); setDwTimeLeft(DEEP_WORK_DURATION); setDwOnBreak(false); }}
                className="px-6 py-4 border border-primary/30 text-sm uppercase hover:border-primary transition-colors opacity-50 hover:opacity-100">
                RESET
              </button>
            </div>

            <div className="self-start border border-primary/20 p-4 bg-primary/5 text-xs font-mono opacity-70 space-y-1">
              <div>{">"} 25 min FOCUS → 5 min BREAK = 1 session = +200 XP</div>
              <div>{">"} 4 sessions completed today = Boss -100 HP</div>
            </div>
          </motion.div>
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
    <main className="min-h-screen bg-background text-primary flex flex-col p-4 md:p-8 lg:p-12 overflow-x-hidden relative selection:bg-primary selection:text-background">
      {!booting && <MatrixBackground />}
      {booting ? (
        <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col justify-center flex-1">
          <div className="font-mono text-sm md:text-xl flex flex-col gap-2">
            {terminalLines.map((line, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.5 }}>
                {">"} {line}
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
