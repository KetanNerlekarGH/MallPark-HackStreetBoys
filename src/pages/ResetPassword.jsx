import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { updateUserPassword } from "@/api/authApi";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Loader2, AlertTriangle } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const resetToken = searchParams.get("token") || searchParams.get("code");
    const email = searchParams.get("email");

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match. Please verify.");
            return;
        }
        setLoading(true);
        try {
            const userData = await updateUserPassword({
                identifier: email,
                resetCode: resetToken,
                newPassword,
            });
            login(userData, userData.accessToken);
            window.location.href = "/select-location";
        } catch (err) {
            setError(err.message || "Failed to reset password. Link may be expired.");
        } finally {
            setLoading(false);
        }
    };

    if (!resetToken) {
        return (
            <AuthLayout
                heroTitle="Invalid"
                heroSubtitle="Reset Link"
                footer={
                    <Link to="/forgot-password" className="text-purple-400 font-semibold hover:underline">
                        Request a new link
                    </Link>
                }
            >
                <p className="text-xs text-purple-200/90 text-center leading-relaxed">
                    The link you used appears to be incomplete. Please request a new password reset email.
                </p>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout
            heroTitle="Set New"
            heroSubtitle="Password."
        >
            {error && (
                <div className="mb-4 p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-medium">
                    {error}
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-xs font-mono uppercase tracking-wider text-purple-200/80 pl-2">New Password</Label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400/60" aria-hidden="true" />
                        <Input
                            id="password"
                            type="password"
                            autoComplete="new-password"
                            autoFocus
                            placeholder="••••••••"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="pl-11 pr-4 h-12 rounded-full border border-purple-500/40 bg-purple-950/40 text-white placeholder:text-purple-300/40 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all text-sm"
                            required
                        />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="confirm" className="text-xs font-mono uppercase tracking-wider text-purple-200/80 pl-2">Confirm Password</Label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400/60" aria-hidden="true" />
                        <Input
                            id="confirm"
                            type="password"
                            autoComplete="new-password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="pl-11 pr-4 h-12 rounded-full border border-purple-500/40 bg-purple-950/40 text-white placeholder:text-purple-300/40 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all text-sm"
                            required
                        />
                    </div>
                </div>
                <Button
                    type="submit"
                    className="w-full h-12 font-semibold text-sm rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white shadow-[0_0_25px_rgba(168,85,247,0.45)] hover:shadow-[0_0_35px_rgba(192,132,252,0.65)] transition-all transform hover:scale-[1.01] active:scale-[0.99] mt-2"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Resetting...
                        </>
                    ) : (
                        "Reset password"
                    )}
                </Button>
            </form>
        </AuthLayout>
    );
}
