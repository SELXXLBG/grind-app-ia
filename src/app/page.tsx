"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Home() {
  const [booting, setBooting] = useState(true);

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
    <main className="min-h-screen bg-background text-primary flex flex-col p-8 md:p-24 overflow-x-hidden relative selection:bg-primary selection:text-background">
      
      {/* Background Grid */}
      <div className="fixed inset-0 z-0 opacity-10 pointer-events-none" style={{
        backgroundImage: `linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)`,
        backgroundSize: '40px 40px'
      }}></div>

      <div className="relative z-10 w-full max-w-5xl mx-auto">
        {/* Boot Sequence */}
        {booting ? (
          <div className="font-mono text-sm md:text-xl flex flex-col gap-2 mt-24">
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
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col gap-12 mt-12"
          >
            {/* Header HUD */}
            <div className="flex justify-between items-center border-b border-primary/30 pb-4 mb-8 font-mono text-sm uppercase tracking-widest">
              <div>[SYSTEM: GRIND]</div>
              <div className="animate-pulse flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                STATUS: ONLINE
              </div>
            </div>

            {/* Hero Section */}
            <section className="mb-24">
              <h1 className="text-6xl md:text-8xl font-bold uppercase tracking-tighter leading-none" style={{ fontFamily: 'var(--font-vt323)' }}>
                Your life is <br/> 
                already a <span className="text-background bg-primary px-2">grind.</span>
              </h1>
              
              <p className="text-xl md:text-2xl mt-6 opacity-80 max-w-2xl font-mono border-l-2 border-primary pl-4">
                Might as well level up. GRIND is the first personal OS that turns your extreme productivity into a literal RPG.
              </p>

              <div className="mt-12 flex flex-wrap gap-6 items-center">
                <motion.button 
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
              <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-primary/30 pt-8">
                {[
                  { label: "EXP MULTIPLIER", val: "x2.5" },
                  { label: "ACTIVE QUESTS", val: "14" },
                  { label: "GUILD MEMBERS", val: "1,042" },
                  { label: "BOSS DEFEATED", val: "89" }
                ].map((stat, i) => (
                  <div key={i} className="flex flex-col border border-primary/20 p-4 bg-primary/5 hover:bg-primary/10 transition-colors">
                    <span className="text-xs opacity-60 mb-2 font-mono">{stat.label}</span>
                    <span className="text-2xl font-bold font-mono" style={{ fontFamily: 'var(--font-vt323)' }}>{stat.val}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Features / Quests Section */}
            <section id="features" className="py-24 border-t border-primary/30">
              <h2 className="text-4xl md:text-5xl font-bold uppercase mb-12" style={{ fontFamily: 'var(--font-vt323)' }}>
                [01] Daily Quests & Boss Fights
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="border border-primary/30 p-8 bg-background relative overflow-hidden group">
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

                <div className="border border-primary/30 p-8 bg-primary text-background relative overflow-hidden group">
                  <h3 className="text-2xl font-bold mb-4 font-mono uppercase">Boss Fights: Deadlines</h3>
                  <p className="opacity-80 font-mono text-sm leading-relaxed mb-6">
                    A project due in 3 days? That's a raid boss. Team up with your Guild or face it solo. If you miss the deadline, you lose HP and your streak resets. High risk, high reward.
                  </p>
                  <div className="mt-4 border-2 border-background p-4">
                    <div className="flex justify-between mb-2 font-bold font-mono text-sm uppercase">
                      <span>Raid: Launch MVP</span>
                      <span>HP: 15%</span>
                    </div>
                    <div className="w-full h-4 bg-background/20 rounded-none overflow-hidden">
                      <motion.div 
                        initial={{ width: "100%" }}
                        whileInView={{ width: "15%" }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-destructive"
                      ></motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Guilds Section */}
            <section className="py-24 border-t border-primary/30">
              <h2 className="text-4xl md:text-5xl font-bold uppercase mb-12" style={{ fontFamily: 'var(--font-vt323)' }}>
                [02] Guilds & Multiplayer
              </h2>
              
              <div className="flex flex-col md:flex-row gap-8 items-center border border-primary/30 p-8">
                <div className="flex-1">
                  <p className="text-xl font-mono mb-6">
                    Grinding alone is tough. Form a Guild with your coworkers or friends. Share passive XP buffs, coordinate on Team Quests, and compete in weekly PvP productivity sprints.
                  </p>
                  <motion.button 
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

            {/* Footer */}
            <footer className="border-t border-primary/30 pt-8 pb-12 mt-12 text-center font-mono text-sm opacity-50 flex justify-between uppercase">
              <span>GRIND OS © 2026</span>
              <span>CONNECTION SECURE</span>
            </footer>

          </motion.div>
        )}
      </div>
    </main>
  );
}
