import React, { useState } from "react";
import { Link } from "react-router-dom";
import { loginUser } from "@/api/authApi";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, User, Lock, Loader2, Info } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { safeReturnTo } from "@/lib/authReturnTo";

const LOGIN_AUTH_PHRASES = [
    "Spot Found. Stress Gone.",
    "No More Parking Hunt.",
    "Stop Circling. Start Shopping.",
    "Your Spot is Waiting.",
    "One App. One Spot. Zero Hassle.",
    "Pull In. Park Smart.",
    "Find Your Spot. Own Your Time.",
    "Parking? Sorted.",
];

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const returnTo = safeReturnTo();

    const handleFillDemo = (demoUsername, demoPassword) => {
        setUsername(demoUsername);
        setPassword(demoPassword);
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const data = await loginUser({ username, password });
            login(data, data.accessToken);
            window.location.href = "/select-location";
        } catch (err) {
            setError(err.message || "Invalid username or password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            phrases={LOGIN_AUTH_PHRASES}
            footer={
                <span className="text-purple-300/70 text-xs">
                    Don't have an account?{" "}
                    <Link
                        to={"/register" + (returnTo !== "/" ? "?returnTo=" + encodeURIComponent(returnTo) : "")}
                        className="text-purple-400 font-semibold hover:underline"
                    >
                        Register
                    </Link>
                </span>
            }
        >
            {error && (
                <div className="mb-4 p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-medium">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                    <Label htmlFor="username" className="text-xs font-mono uppercase tracking-wider text-purple-200/80 pl-2">Username</Label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400/60" aria-hidden="true" />
                        <Input
                            id="username"
                            type="text"
                            autoComplete="username"
                            autoFocus
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="pl-11 pr-4 h-12 rounded-full border border-purple-500/40 bg-purple-950/40 text-white placeholder:text-purple-300/40 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all text-sm"
                            required
                        />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-xs font-mono uppercase tracking-wider text-purple-200/80 pl-2">Password</Label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400/60" aria-hidden="true" />
                        <Input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-11 pr-4 h-12 rounded-full border border-purple-500/40 bg-purple-950/40 text-white placeholder:text-purple-300/40 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all text-sm"
                            required
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between text-xs text-purple-300/70 px-2 py-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded bg-purple-950/50 border-purple-500/40 text-purple-500 focus:ring-purple-500" />
                        <span>Remember me</span>
                    </label>
                    <Link to="/forgot-password" className="hover:text-purple-300 transition-colors">Forgot Password?</Link>
                </div>

                <Button
                    type="submit"
                    className="w-full h-12 font-semibold text-sm rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white shadow-[0_0_25px_rgba(168,85,247,0.45)] hover:shadow-[0_0_35px_rgba(192,132,252,0.65)] transition-all transform hover:scale-[1.01] active:scale-[0.99] mt-2"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Logging in...
                        </>
                    ) : (
                        "Log in"
                    )}
                </Button>
            </form>
        </AuthLayout>
    );
}
