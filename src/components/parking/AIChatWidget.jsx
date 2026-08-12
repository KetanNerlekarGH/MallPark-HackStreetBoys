import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Bot, X, Send, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SUGGESTIONS = [
  "How do I cancel my reservation?",
  "Where are the EV charging slots?",
  "How are parking fees calculated?",
  "Can I extend my parking time?",
];

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hi! I'm Parky 🚗 — your parking assistant. Ask me anything about reservations, fees, EV charging, or finding a spot." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const ask = async (q) => {
    const question = q || input;
    if (!question.trim() || loading) return;
    setMessages((m) => [...m, { role: "user", text: question }]);
    setInput("");
    setLoading(true);
    try {
      const res = await base44.functions.invoke("parkingAssistant", { question });
      setMessages((m) => [...m, { role: "bot", text: res.data.answer || res.data.error || "Sorry, I couldn't help with that." }]);
    } catch {
      setMessages((m) => [...m, { role: "bot", text: "Something went wrong reaching the assistant. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-[min(92vw,22rem)] rounded-3xl border bg-card shadow-2xl overflow-hidden"
          >
            <div className="p-4 flex items-center gap-2 text-white" style={{ background: "linear-gradient(135deg,#0b1f3a,#1d5fb0)" }}>
              <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm leading-none">Parky</p>
                <p className="text-[11px] text-sky-100/80 mt-0.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Reservation assistant
                </p>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-full hover:bg-white/15">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div ref={scrollRef} className="h-72 overflow-y-auto p-4 space-y-3 bg-muted/30">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm whitespace-pre-line ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-card border rounded-bl-md"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="px-4 py-3 rounded-2xl bg-card border">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0.15s" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0.3s" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {messages.length <= 2 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => ask(s)}
                    className="text-[11px] px-2.5 py-1.5 rounded-full border text-muted-foreground hover:bg-muted transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div className="p-3 border-t flex items-center gap-2 bg-card">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && ask()}
                placeholder="Ask Parky…"
                className="flex-1 h-10 px-4 rounded-full bg-muted/50 text-sm outline-none focus:ring-2 ring-sky-500/40"
              />
              <button
                onClick={() => ask()}
                disabled={loading}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,#0b1f3a,#1d5fb0)" }}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl hover:scale-105 transition-transform"
        style={{ background: "linear-gradient(135deg,#0b1f3a,#1d5fb0)" }}
        aria-label="Open assistant"
      >
        {open ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
      </button>
    </>
  );
}