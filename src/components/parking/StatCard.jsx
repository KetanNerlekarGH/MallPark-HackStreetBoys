import React from "react";

export default function StatCard({ label, value, sub, icon: Icon, accent = "text-foreground" }) {
  return (
    <div className="rounded-3xl border bg-card p-6 transition-shadow hover:shadow-lg">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
        {Icon && <Icon className={`w-4 h-4 ${accent}`} />}
      </div>
      <p className={`mt-3 text-4xl font-semibold tracking-tight ${accent}`}>{value}</p>
      {sub && <p className="mt-1 text-sm text-muted-foreground">{sub}</p>}
    </div>
  );
}