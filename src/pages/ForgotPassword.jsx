import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await base44.auth.resetPasswordRequest(email);
        } catch {
            // Always show success regardless
        } finally {
            setLoading(false);
            setSent(true);
        }
    };

    return (
        <AuthLayout
            heroTitle="Reset."
            heroSubtitle="Password."
            footer={
                <Link to="/login" className="text-purple-400 font-semibold hover:underline">
                    <ArrowLeft className="w-3 h-3 inline mr-1" />Back to log in
                </Link>
            }
        >
            {sent ? (
                <p className="text-xs text-purple-200/90 text-center leading-relaxed">
                    If an account exists with that email, you'll receive a password reset link shortly.
                </p>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-xs font-mono uppercase tracking-wider text-purple-200/80 pl-2">Email address</Label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400/60" aria-hidden="true" />
                            <Input
                                id="email"
                                type="email"
                                autoComplete="email"
                                autoFocus
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-11 pr-4 h-12 rounded-full border border-purple-500/40 bg-purple-950/40 text-white placeholder:text-purple-300/40 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all text-sm"
                                required
                            />
                        </div>
                    </div>
                    <Button
                        type="submit"
                        className="w-full h-12 font-semibold text-sm rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white shadow-[0_0_25px_rgba(168,85,247,0.45)] hover:shadow-[0_0_35px_rgba(192,132,252,0.65)] transition-all transform hover:scale-[1.01] active:scale-[0.99]"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            "Send reset link"
                        )}
                    </Button>
                </form>
            )}
        </AuthLayout>
    );
}
