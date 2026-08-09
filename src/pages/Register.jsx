import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signUpUser } from "@/api/authApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, User, Mail, Lock, Loader2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { toast } from "@/components/ui/use-toast";
import { safeReturnTo } from "@/lib/authReturnTo";

export default function Register() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const returnTo = safeReturnTo();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            await signUpUser({
                firstName,
                lastName,
                email,
                username,
                password,
            });

            toast({
                title: "Account Created Successfully!",
                description: `Welcome ${firstName}! Please log in with your username and password.`,
            });

            const loginUrl = "/login?returnTo=" + encodeURIComponent("/select-location");
            navigate(loginUrl);
        } catch (err) {
            setError(err.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            heroTitle="Join Us."
            heroSubtitle="Start Parking."
            footer={
                <span className="text-purple-300/70 text-xs">
                    Already have an account?{" "}
                    <Link
                        to={"/login" + (returnTo !== "/" ? "?returnTo=" + encodeURIComponent(returnTo) : "")}
                        className="text-purple-400 font-semibold hover:underline"
                    >
                        Log in
                    </Link>
                </span>
            }
        >
            {error && (
                <div className="mb-4 p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-medium">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                        <Label htmlFor="firstName" className="text-[11px] font-mono uppercase tracking-wider text-purple-200/80 pl-2">First Name</Label>
                        <Input
                            id="firstName"
                            type="text"
                            placeholder="John"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="h-10 px-4 rounded-full border border-purple-500/40 bg-purple-950/40 text-white placeholder:text-purple-300/40 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all text-xs"
                            required
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="lastName" className="text-[11px] font-mono uppercase tracking-wider text-purple-200/80 pl-2">Last Name</Label>
                        <Input
                            id="lastName"
                            type="text"
                            placeholder="Doe"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="h-10 px-4 rounded-full border border-purple-500/40 bg-purple-950/40 text-white placeholder:text-purple-300/40 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all text-xs"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <Label htmlFor="email" className="text-[11px] font-mono uppercase tracking-wider text-purple-200/80 pl-2">Email</Label>
                    <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-purple-400/60" aria-hidden="true" />
                        <Input
                            id="email"
                            type="email"
                            autoComplete="email"
                            placeholder="john.doe@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10 pr-4 h-10 rounded-full border border-purple-500/40 bg-purple-950/40 text-white placeholder:text-purple-300/40 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all text-xs"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <Label htmlFor="username" className="text-[11px] font-mono uppercase tracking-wider text-purple-200/80 pl-2">Username</Label>
                    <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-purple-400/60" aria-hidden="true" />
                        <Input
                            id="username"
                            type="text"
                            autoComplete="username"
                            placeholder="johndoe"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="pl-10 pr-4 h-10 rounded-full border border-purple-500/40 bg-purple-950/40 text-white placeholder:text-purple-300/40 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all text-xs"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                        <Label htmlFor="password" className="text-[11px] font-mono uppercase tracking-wider text-purple-200/80 pl-2">Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-purple-400/60" aria-hidden="true" />
                            <Input
                                id="password"
                                type="password"
                                autoComplete="new-password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-9 pr-3 h-10 rounded-full border border-purple-500/40 bg-purple-950/40 text-white placeholder:text-purple-300/40 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all text-xs"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="confirmPassword" className="text-[11px] font-mono uppercase tracking-wider text-purple-200/80 pl-2">Confirm</Label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-purple-400/60" aria-hidden="true" />
                            <Input
                                id="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="pl-9 pr-3 h-10 rounded-full border border-purple-500/40 bg-purple-950/40 text-white placeholder:text-purple-300/40 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all text-xs"
                                required
                            />
                        </div>
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full h-11 font-semibold text-xs rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white shadow-[0_0_25px_rgba(168,85,247,0.45)] hover:shadow-[0_0_35px_rgba(192,132,252,0.65)] transition-all transform hover:scale-[1.01] active:scale-[0.99] mt-2"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Creating account...
                        </>
                    ) : (
                        "Create Account"
                    )}
                </Button>
            </form>
        </AuthLayout>
    );
}
