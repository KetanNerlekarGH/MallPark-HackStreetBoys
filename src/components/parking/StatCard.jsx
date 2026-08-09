import React from "react";

export default function StatCard({ label, value, sub, icon: Icon, accent = "text-foreground dark:text-purple-200" }) {
  return (
    <div className="rounded-2xl border border-border/80 dark:border-purple-900/40 bg-card/80 dark:bg-[#0d081c]/80 p-5 backdrop-blur-xl transition-all duration-300 hover:border-purple-500/50 hover:shadow-lg dark:hover:shadow-[0_0_35px_rgba(168,85,247,0.25)] hover:-translate-y-1 group relative overflow-hidden animate-fade-in-up">
      <div className="flex items-center justify-between">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground dark:text-purple-300/70 group-hover:text-foreground dark:group-hover:text-purple-200 transition-colors">{label}</p>
        {Icon && <Icon className={`w-4 h-4 ${accent} opacity-90 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-6`} />}
      </div>
      <p className={`mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight ${accent} transition-transform duration-300 group-hover:translate-x-1`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground/80 dark:text-purple-300/50 font-mono">{sub}</p>}
    </div>
  );
}