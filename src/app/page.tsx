"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import MatrixBackground from "@/components/MatrixBackground";

gsap.registerPlugin(ScrollTrigger);

// ==========================================
// LANDING PAGE COMPONENT
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
        gsap.fromTo(
          secRef.current,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: secRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    });
  }, []);

  const handleOpenModal = (type: "init" | "upgrade") => {
    setModalType(type);
    setModalOpen(true);
  };

  const handleConfirmLogin = () => {
    setModalOpen(false);
    onLogin();
  };

  return (
    <div className="relative z-10 w-full max-w-5xl mx-auto">
      {/* Interactive Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#050505] border-2 border-primary p-8 max-w-lg w-full relative shadow-[0_0_30px_rgba(0,255,65,0.2)]"
            >
              <button 
                onClick={() => setModalOpen(false)}
                className="absolute top-4 right-4 opacity-50 hover:opacity-100 font-mono text-xl"
              >
                [X]
              </button>
              
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

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="flex flex-col gap-12 mt-12"
      >
        {/* Header HUD */}
        <div className="flex justify-between items-center border-b border-primary/30 pb-4 mb-8 font-mono text-sm uppercase tracking-widest">
          <img src="/icon.png" alt="GRIND Logo" className="h-16 md:h-24 mix-blend-screen" />
          <div className="animate-pulse flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            STATUS: ONLINE
          </div>
        </div>

        {/* Hero Section */}
        <section className="mb-24">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold uppercase tracking-tighter leading-none" style={{ fontFamily: 'var(--font-vt323)' }}>
            Your life is <br/> 
            already a <span className="text-background bg-primary px-2">grind.</span>
          </h1>
          
          <p className="text-xl md:text-2xl mt-6 opacity-80 max-w-2xl font-mono border-l-2 border-primary pl-4">
            Might as well level up. GRIND is the first personal OS that turns your extreme productivity into a literal RPG.
          </p>

          <div className="mt-12 flex flex-wrap gap-6 items-center">
            <motion.button 
              onClick={() => handleOpenModal("init")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-primary text-background px-8 py-4 font-bold uppercase tracking-widest text-lg border-2 border-primary hover:bg-background hover:text-primary transition-colors cursor-pointer"
            >
              {">"} Initialize OS
            </motion.button>
            
            <a href="#features" className="uppercase tracking-widest hover:underline underline-offset-4 opacity-70 hover:opacity-100 transition-opacity font-mono">
              [ View Manual ]
            </a>
          </div>

          {/* Stats HUD */}
          <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-primary/30 pt-8 backdrop-blur-sm bg-background/50">
            {[
              { label: "EXP MULTIPLIER", val: "x2.5" },
              { label: "ACTIVE QUESTS", val: "14" },
              { label: "GUILD MEMBERS", val: "1,042" },
              { label: "BOSS DEFEATED", val: "89" }
            ].map((stat, i) => (
              <div key={i} className="flex flex-col border border-primary/20 p-4 hover:bg-primary/10 transition-colors">
                <span className="text-xs opacity-60 mb-2 font-mono">{stat.label}</span>
                <span className="text-2xl font-bold font-mono" style={{ fontFamily: 'var(--font-vt323)' }}>{stat.val}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Features / Quests Section */}
        <section id="features" ref={featuresRef} className="py-24 border-t border-primary/30 backdrop-blur-sm bg-background/30">
          <h2 className="text-4xl md:text-5xl font-bold uppercase mb-12" style={{ fontFamily: 'var(--font-vt323)' }}>
            [01] Daily Quests & Boss Fights
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="border border-primary/30 p-8 bg-background/80 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-30 font-mono text-6xl group-hover:opacity-100 transition-opacity">!</div>
              <h3 className="text-2xl font-bold mb-4 font-mono uppercase">Track your habits as Quests</h3>
              <p className="opacity-80 font-mono text-sm leading-relaxed mb-6">
                Stop using boring checklists. Every deadline is a Boss. Every habit is a daily quest. Earn XP, unlock cosmetics for your HUD, and climb the global leaderboard of productivity.
              </p>
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
                <p className="opacity-90 font-mono text-sm leading-relaxed mb-6 bg-background/80 p-2 border border-primary/30 backdrop-blur-md">
                  A project due in 3 days? That's a raid boss. Team up with your Guild or face it solo. If you miss the deadline, you lose HP and your streak resets. High risk, high reward.
                </p>
                <div className="mt-4 border-2 border-primary p-4 bg-background/80 backdrop-blur-sm">
                  <div className="flex justify-between mb-2 font-bold font-mono text-sm uppercase">
                    <span>Raid: Launch MVP</span>
                    <span className="text-destructive animate-pulse">HP: 15%</span>
                  </div>
                  <div className="w-full h-4 bg-primary/20 rounded-none overflow-hidden">
                    <motion.div 
                      initial={{ width: "100%" }}
                      whileInView={{ width: "15%" }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                      className="h-full bg-destructive"
                    ></motion.div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Guilds Section */}
        <section ref={guildsRef} className="py-24 border-t border-primary/30 backdrop-blur-sm bg-background/30">
          <h2 className="text-4xl md:text-5xl font-bold uppercase mb-12" style={{ fontFamily: 'var(--font-vt323)' }}>
            [02] Guilds & Multiplayer
          </h2>
          
          <div className="flex flex-col md:flex-row gap-8 items-center border border-primary/30 p-8 bg-background/80">
            <div className="flex-1">
              <p className="text-xl font-mono mb-6">
                Grinding alone is tough. Form a Guild with your coworkers or friends. Share passive XP buffs, coordinate on Team Quests, and compete in weekly PvP productivity sprints.
              </p>
              <motion.button 
                onClick={() => handleOpenModal("init")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border border-primary px-6 py-3 font-mono hover:bg-primary hover:text-background transition-colors uppercase text-sm"
              >
                [ Search Guilds ]
              </motion.button>
            </div>
            
            <div className="w-full md:w-1/3 flex flex-col gap-2 font-mono text-sm">
              {["NIGHT OWLS [LVL 42]", "CODE_MONKEYS [LVL 18]", "THE 5AM CLUB [LVL 99]"].map((guild, i) => (
                <div key={i} className="flex justify-between border-b border-primary/20 pb-2">
                  <span>{guild}</span>
                  <span className="opacity-50">[{3 - i}/5 Members]</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Leaderboard Section */}
        <section ref={leaderboardRef} className="py-24 border-t border-primary/30 backdrop-blur-sm bg-background/30">
          <h2 className="text-4xl md:text-5xl font-bold uppercase mb-12 text-center" style={{ fontFamily: 'var(--font-vt323)' }}>
            [03] Global Rankings
          </h2>
          
          <div className="max-w-3xl mx-auto border border-primary/30 bg-background/80">
            <div className="grid grid-cols-4 font-mono text-xs uppercase opacity-50 p-4 border-b border-primary/30">
              <div className="col-span-1">Rank</div>
              <div className="col-span-2">Player / Class</div>
              <div className="col-span-1 text-right">XP</div>
            </div>
            
            {[
              { rank: 1, name: "ZeroCool", class: "Hacker", xp: "842,000", hue: "0deg" },
              { rank: 2, name: "AcidBurn", class: "Designer", xp: "790,500", hue: "90deg" },
              { rank: 3, name: "LordNikon", class: "Marketer", xp: "788,100", hue: "180deg" },
              { rank: 4, name: "CerealKiller", class: "Hustler", xp: "650,200", hue: "270deg" },
              { rank: 5, name: "Joey", class: "Noob", xp: "12,000", hue: "45deg" }
            ].map((player, i) => (
              <div key={i} className={`grid grid-cols-4 font-mono p-4 border-b border-primary/10 hover:bg-primary/5 transition-colors ${i === 0 ? 'bg-primary/10 text-primary font-bold' : ''}`}>
                <div className="col-span-1 flex items-center">#{player.rank}</div>
                <div className="col-span-2 flex items-center gap-3">
                  <img 
                    src="/assets/avatar.png" 
                    alt={player.name}
                    className="w-10 h-10 rounded-full border border-primary/50 mix-blend-screen"
                    style={{ filter: `hue-rotate(${player.hue})` }} 
                  />
                  <div className="flex flex-col">
                    <span>{player.name}</span>
                    <span className="text-xs opacity-50">{player.class}</span>
                  </div>
                </div>
                <div className="col-span-1 text-right flex items-center justify-end">{player.xp}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing Section */}
        <section ref={pricingRef} className="py-24 border-t border-primary/30 backdrop-blur-sm bg-background/30 mb-24">
          <h2 className="text-4xl md:text-5xl font-bold uppercase mb-12 text-center" style={{ fontFamily: 'var(--font-vt323)' }}>
            [ INSERT COIN TO CONTINUE ]
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Free */}
            <div className="border border-primary/30 p-8 flex flex-col bg-background/80">
              <h3 className="text-2xl font-bold mb-2 font-mono uppercase text-center">F2P (Free)</h3>
              <div className="text-4xl font-bold text-center mb-8" style={{ fontFamily: 'var(--font-vt323)' }}>$0</div>
              <ul className="space-y-4 font-mono text-sm opacity-80 flex-1">
                <li>{">"} Basic Quests</li>
                <li>{">"} 1 Guild max</li>
                <li>{">"} Standard HUD</li>
              </ul>
              <button onClick={() => handleOpenModal("init")} className="w-full border border-primary py-3 mt-8 hover:bg-primary hover:text-background transition-colors font-mono uppercase text-sm">
                Select
              </button>
            </div>
            
            {/* Battle Pass */}
            <div className="border-2 border-primary p-8 flex flex-col bg-primary/10 relative transform md:-translate-y-4">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-background px-4 py-1 text-xs font-bold uppercase font-mono">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold mb-2 font-mono uppercase text-center text-primary">Battle Pass</h3>
              <div className="text-4xl font-bold text-center mb-8" style={{ fontFamily: 'var(--font-vt323)' }}>$12<span className="text-sm opacity-50">/mo</span></div>
              <ul className="space-y-4 font-mono text-sm opacity-90 flex-1">
                <li>{">"} Unlimited Boss Fights</li>
                <li>{">"} Create 5 Guilds</li>
                <li>{">"} Custom Neon HUDs</li>
                <li>{">"} IRL Merch Rewards</li>
              </ul>
              <button onClick={() => handleOpenModal("upgrade")} className="w-full bg-primary text-background py-3 mt-8 hover:opacity-90 transition-opacity font-bold font-mono uppercase text-sm shadow-[0_0_15px_rgba(0,255,65,0.5)]">
                Upgrade
              </button>
            </div>

            {/* God Mode */}
            <div className="border border-primary/30 p-8 flex flex-col bg-background/80">
              <h3 className="text-2xl font-bold mb-2 font-mono uppercase text-center opacity-70">God Mode</h3>
              <div className="text-4xl font-bold text-center mb-8 opacity-70" style={{ fontFamily: 'var(--font-vt323)' }}>$99<span className="text-sm opacity-50">/mo</span></div>
              <ul className="space-y-4 font-mono text-sm opacity-60 flex-1">
                <li>{">"} Enterprise API</li>
                <li>{">"} Dedicated Server</li>
                <li>{">"} Custom AI Agent</li>
              </ul>
              <button onClick={() => handleOpenModal("upgrade")} className="w-full border border-primary/30 py-3 mt-8 hover:border-primary transition-colors font-mono uppercase text-sm opacity-70">
                Contact Sales
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-primary/30 pt-8 pb-12 text-center font-mono text-sm opacity-50 flex justify-between uppercase">
          <span>GRIND OS © 2026</span>
          <span>CONNECTION SECURE</span>
        </footer>
      </motion.div>
    </div>
  );
}

// ==========================================
// DASHBOARD COMPONENT (INTERACTIVE)
// ==========================================
function DashboardView() {
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [bossHp, setBossHp] = useState(100);
  const [logs, setLogs] = useState<string[]>(["[SYSTEM] NEURAL LINK ESTABLISHED.", "[SYSTEM] WELCOME TO THE GRIND."]);
  
  const [quests, setQuests] = useState([
    { id: 1, title: "Finish Landing Page Workshop", xp: 500, done: false },
    { id: 2, title: "Drink 1L of water", xp: 50, done: false },
    { id: 3, title: "1 Hour Deep Work", xp: 200, done: false },
    { id: 4, title: "Review Pull Request", xp: 150, done: false },
  ]);

  const bossRef = useRef<HTMLImageElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, msg]);
  };

  useEffect(() => {
    // Scroll to bottom of logs
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  const handleCompleteQuest = (id: number, questXp: number, title: string) => {
    // Only process if not already done
    const quest = quests.find(q => q.id === id);
    if (quest?.done) return;

    // Mark as done
    setQuests(quests.map(q => q.id === id ? { ...q, done: true } : q));
    
    // Add XP
    let newXp = xp + questXp;
    let newLevel = level;
    if (newXp >= 1000) {
      newXp = newXp - 1000;
      newLevel += 1;
      setLevel(newLevel);
      addLog(`[LVL UP] CONGRATULATIONS! YOU REACHED LEVEL ${newLevel}!`);
    }
    setXp(newXp);

    // Damage Boss
    const damage = Math.floor((questXp / 1000) * 100); // percentage relative to 1000 XP max
    const newBossHp = Math.max(0, bossHp - damage);
    setBossHp(newBossHp);

    addLog(`[QUEST] Completed: "${title}". +${questXp} XP.`);
    addLog(`[COMBAT] Dealt ${damage} DMG to Boss!`);

    if (newBossHp === 0) {
      addLog(`[VICTORY] BOSS DEFEATED. WAITING FOR NEXT DEADLINE...`);
    }

    // Shake Boss Animation
    if (bossRef.current) {
      gsap.fromTo(bossRef.current, 
        { x: -10 }, 
        { x: 10, duration: 0.1, yoyo: true, repeat: 5, onComplete: () => gsap.set(bossRef.current, { x: 0 }) }
      );
    }
  };

  return (
    <div className="relative z-10 w-full max-w-6xl mx-auto mt-8 flex flex-col gap-6 font-mono h-full">
      
      {/* Top Bar HUD */}
      <div className="flex items-center justify-between border-b border-primary/30 pb-4">
        <div className="flex items-center gap-4">
          <img src="/assets/avatar.png" className="w-16 h-16 rounded-full border-2 border-primary mix-blend-screen" />
          <div>
            <h2 className="text-2xl font-bold uppercase text-primary tracking-widest">Player 1</h2>
            <p className="text-xs opacity-60">Class: Hacker | Guild: None</p>
          </div>
        </div>
        
        <div className="flex-1 max-w-md mx-8">
          <div className="flex justify-between text-xs mb-2">
            <span>LVL {level}</span>
            <span>{xp} / 1000 XP</span>
          </div>
          <div className="w-full h-4 bg-background border border-primary/30 p-[2px]">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${(xp / 1000) * 100}%` }}
              transition={{ type: "spring", bounce: 0 }}
            />
          </div>
        </div>

        <div className="text-right">
          <p className="animate-pulse text-xs mb-1">NEURAL LINK: ACTIVE</p>
          <button className="border border-primary px-4 py-1 text-xs hover:bg-primary hover:text-background transition-colors uppercase">
            Disconnect
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 flex-1 mt-4">
        
        {/* Left Col: Quests */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="border border-primary/30 bg-background/80 p-6 shadow-[0_0_15px_rgba(0,255,65,0.1)]">
            <h3 className="text-xl font-bold mb-6 flex justify-between items-center" style={{ fontFamily: 'var(--font-vt323)', fontSize: '2rem' }}>
              <span>Active Quests</span>
              <span className="text-xs font-mono opacity-50 bg-primary/20 px-2 py-1">{quests.filter(q=>!q.done).length} LEFT</span>
            </h3>
            
            <div className="space-y-4">
              {quests.map((q) => (
                <div 
                  key={q.id} 
                  onClick={() => handleCompleteQuest(q.id, q.xp, q.title)}
                  className={`flex items-start gap-3 p-3 border border-primary/20 transition-all cursor-pointer ${q.done ? 'opacity-30 bg-transparent' : 'hover:bg-primary/10 bg-primary/5'}`}
                >
                  <div className={`w-5 h-5 mt-0.5 border flex items-center justify-center ${q.done ? 'border-primary bg-primary' : 'border-primary'}`}>
                    {q.done && <span className="text-background text-xs font-bold">X</span>}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm ${q.done ? 'line-through' : ''}`}>{q.title}</p>
                    <p className="text-xs opacity-60 mt-1">Reward: +{q.xp} XP</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Terminal Log */}
          <div className="border border-primary/30 bg-[#050505] p-4 flex-1 h-64 shadow-[inset_0_0_10px_rgba(0,255,65,0.05)] flex flex-col">
            <h3 className="text-xs uppercase opacity-50 border-b border-primary/30 pb-2 mb-2">Terminal Output</h3>
            <div className="overflow-y-auto flex-1 text-xs space-y-2 font-mono">
              {logs.map((log, i) => (
                <div key={i} className={log.includes("ERROR") || log.includes("DMG") ? "text-destructive" : log.includes("LVL UP") || log.includes("VICTORY") ? "text-[#ff00ff]" : "text-primary/80"}>
                  {log}
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          </div>
        </div>

        {/* Right Col: Boss Fight */}
        <div className="lg:col-span-2 border border-primary/30 bg-background/50 p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-[0_0_20px_rgba(0,255,65,0.05)]">
          
          <div className="absolute top-6 left-6 right-6 z-10 flex flex-col items-center">
            <h3 className="text-2xl font-bold uppercase tracking-widest text-destructive mb-2" style={{ fontFamily: 'var(--font-vt323)' }}>
              Boss: Project Deadline
            </h3>
            
            <div className="w-full max-w-md h-6 bg-background border-2 border-destructive p-[2px]">
              <motion.div 
                className="h-full bg-destructive"
                initial={{ width: "100%" }}
                animate={{ width: `${bossHp}%` }}
                transition={{ type: "spring", bounce: 0 }}
              />
            </div>
            <p className="text-xs font-mono mt-1 text-destructive uppercase">{bossHp}% HP Remaining</p>
          </div>

          {bossHp > 0 ? (
            <img 
              ref={bossRef}
              src="/assets/boss.png" 
              alt="Raid Boss" 
              className="w-96 h-96 object-contain mix-blend-screen mt-16" 
            />
          ) : (
            <div className="mt-16 flex flex-col items-center text-center animate-pulse">
              <span className="text-8xl mb-4">💀</span>
              <h2 className="text-4xl text-[#ff00ff]" style={{ fontFamily: 'var(--font-vt323)' }}>BOSS DEFEATED</h2>
              <p className="font-mono mt-2 opacity-70">Awaiting next deployment...</p>
            </div>
          )}

          <div className="absolute bottom-6 left-6 text-xs font-mono opacity-50 uppercase">
            Tip: Complete quests to deal damage to the Boss.
          </div>
        </div>

      </div>
    </div>
  );
}


// ==========================================
// MAIN PAGE COMPONENT
// ==========================================
export default function Home() {
  const [booting, setBooting] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setBooting(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const terminalLines = [
    "INITIALIZING GRIND OS v1.0.0...",
    "LOADING NEURAL INTERFACE...",
    "BYPASSING DOPAMINE RECEPTORS...",
    "SYSTEM READY."
  ];

  return (
    <main className="min-h-screen bg-background text-primary flex flex-col p-4 md:p-8 lg:p-12 overflow-x-hidden relative selection:bg-primary selection:text-background">
      
      {/* 3D Matrix Background */}
      {!booting && <MatrixBackground />}

      {booting ? (
        <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col justify-center flex-1">
          <div className="font-mono text-sm md:text-xl flex flex-col gap-2">
            {terminalLines.map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.5 }}
              >
                {">"} {line}
              </motion.div>
            ))}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: [0, 1, 0] }} 
              transition={{ delay: 2, repeat: Infinity, duration: 0.8 }}
              className="mt-2"
            >
              _
            </motion.div>
          </div>
        </div>
      ) : isLoggedIn ? (
        <DashboardView />
      ) : (
        <LandingView onLogin={() => setIsLoggedIn(true)} />
      )}

    </main>
  );
}
