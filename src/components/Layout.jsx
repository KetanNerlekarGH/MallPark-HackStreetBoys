import React from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { CircleParking, LayoutDashboard, BarChart3, Ticket, Building2, MapPin } from "lucide-react";
import ProfileMenu from "@/components/ProfileMenu";
import ThemeToggle from "@/components/ThemeToggle";
import AIChatWidget from "@/components/parking/AIChatWidget";
import { useLocationContext } from "@/context/LocationContext";
import LocationSelectorModal from "@/components/location/LocationSelectorModal";
import HamburgerMenuDrawer from "@/components/navigation/HamburgerMenuDrawer";

export default function Layout() {
  const location = useLocation();
  const { selectedState, selectedCity, selectedMall, openLocationModal } = useLocationContext();

  const navItems = [
    { label: "Dashboard", path: "/", icon: LayoutDashboard },
    { label: "Explore Mall", path: "/malls", icon: Building2 },
    { label: "Analytics", path: "/analytics", icon: BarChart3 },
    { label: "Reservations", path: "/reservations", icon: Ticket },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col antialiased transition-colors duration-300 relative overflow-x-hidden selection:bg-purple-600 selection:text-white">
      {/* 1. Subtle Photorealistic Smart Parking Garage Background Wallpaper */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-[0.08] dark:opacity-[0.14] pointer-events-none scale-105 filter blur-[0.5px] mix-blend-screen transition-opacity duration-500 z-0"
        style={{ backgroundImage: `url('/smart_parking_neon_bg.png')` }}
      />

      {/* 2. Ambient Top Spotlight Light Beams (Spotlight Effect) */}
      <div className="fixed -top-10 left-1/4 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-indigo-500/20 via-purple-600/15 to-transparent blur-3xl pointer-events-none z-0 opacity-40 dark:opacity-100 transition-opacity duration-300" />
      <div className="fixed -top-10 right-1/4 translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-purple-500/20 via-indigo-600/15 to-transparent blur-3xl pointer-events-none z-0 opacity-40 dark:opacity-100 transition-opacity duration-300" />

      {/* 3. Background Glowing Mesh Orbs */}
      <div className="fixed top-1/3 left-10 w-96 h-96 bg-purple-600/15 rounded-full filter blur-[140px] pointer-events-none z-0 opacity-40 dark:opacity-100 transition-opacity duration-300" />
      <div className="fixed bottom-1/4 right-10 w-96 h-96 bg-indigo-500/15 rounded-full filter blur-[140px] pointer-events-none z-0 opacity-40 dark:opacity-100 transition-opacity duration-300" />

      {/* Header Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-border/80 dark:border-purple-900/40 bg-background/80 dark:bg-[#05040a]/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 dark:supports-[backdrop-filter]:bg-[#05040a]/60 transition-colors duration-300">
        <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 relative z-10">
          <div className="flex items-center gap-3 sm:gap-5 md:gap-6">
            {/* Top-Left Hamburger Menu Drawer Trigger */}
            <HamburgerMenuDrawer />

            <Link to="/" className="flex items-center space-x-2.5 group shrink-0">
              <div className="w-9 h-9 rounded-xl overflow-hidden bg-[#170a35] border border-purple-500/50 p-1 flex items-center justify-center shadow-[0_0_18px_rgba(168,85,247,0.4)] transition-transform group-hover:scale-105">
                <img
                  src="/logo.png"
                  alt="MallPark Logo"
                  className="w-full h-full object-contain filter drop-shadow-[0_0_6px_rgba(168,85,247,0.6)]"
                />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-foreground dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-200 transition-colors hidden sm:inline">
                MallPark
              </span>
            </Link>

            {/* Location Display Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 text-xs font-mono font-medium shadow-sm max-w-[200px] sm:max-w-none truncate pointer-events-none">
              <MapPin className="w-3.5 h-3.5 text-purple-500 shrink-0" />
              <span className="truncate">
                {selectedState} · {selectedCity} · <strong className="font-semibold text-foreground dark:text-white">{selectedMall?.name}</strong>
              </span>
            </div>

            <nav className="hidden md:flex gap-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${isActive
                        ? "bg-primary/10 text-primary border border-primary/20 dark:bg-purple-600/25 dark:text-purple-200 font-semibold dark:border-purple-500/40 shadow-sm dark:shadow-[0_0_15px_rgba(168,85,247,0.25)]"
                        : "text-muted-foreground hover:text-foreground dark:text-purple-200/70 dark:hover:text-white hover:bg-muted/80 dark:hover:bg-purple-900/30"
                      }`}
                  >
                    <Icon className="w-4 h-4 opacity-80" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <ProfileMenu />
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around border-t border-border/80 dark:border-purple-900/40 py-2 px-4 bg-background/90 dark:bg-[#05040a]/90 backdrop-blur-lg">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 text-[11px] py-1 px-3 rounded-lg transition-all ${isActive
                    ? "text-primary dark:text-purple-200 font-semibold bg-primary/10 dark:bg-purple-600/25 border border-primary/20 dark:border-purple-500/30"
                    : "text-muted-foreground dark:text-purple-200/70 hover:text-foreground dark:hover:text-white"
                  }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container max-w-7xl mx-auto px-4 sm:px-6 py-8 relative z-10">
        <Outlet />
      </main>

      {/* Location Selector Modal */}
      <LocationSelectorModal />

      {/* Floating AI Assistant Widget */}
      <AIChatWidget />
    </div>
  );
}
