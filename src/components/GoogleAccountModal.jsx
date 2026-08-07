import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import GoogleIcon from "@/components/GoogleIcon";
import { User, Mail, ArrowRight } from "lucide-react";

export default function GoogleAccountModal({ open, onClose, onSelectAccount }) {
  const [customEmail, setCustomEmail] = useState("");
  const [customName, setCustomName] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customEmail.trim()) return;
    const name = customName.trim() || customEmail.split("@")[0];
    onSelectAccount({
      email: customEmail.trim(),
      full_name: name,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(customEmail)}`
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-2xl p-6 bg-card border-border">
        <DialogHeader className="items-center text-center pb-2">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-2">
            <GoogleIcon className="w-6 h-6" />
          </div>
          <DialogTitle className="text-xl font-semibold">Sign in with Google</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Choose a Google Account to continue to SmartPark
          </DialogDescription>
        </DialogHeader>

        {!showCustomInput ? (
          <div className="space-y-4 py-2">
            <button
              type="button"
              onClick={() => setShowCustomInput(true)}
              className="w-full flex items-center gap-3.5 p-3.5 rounded-xl border border-border hover:bg-muted/70 transition-colors text-left group"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                <User className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Sign in with your Email</p>
                <p className="text-xs text-muted-foreground truncate">Enter your own Google address</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleCustomSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="google-email" className="text-xs font-medium">Your Gmail / Google Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="google-email"
                  type="email"
                  placeholder="your.email@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="pl-10 h-11"
                  autoFocus
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="google-name" className="text-xs font-medium">Your Name (Optional)</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="google-name"
                  type="text"
                  placeholder="John Doe"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowCustomInput(false)} className="flex-1 h-11">
                Back
              </Button>
              <Button type="submit" className="flex-1 h-11 font-medium">
                Continue
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
