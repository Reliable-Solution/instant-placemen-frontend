"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loadUserFromStorage, logout, verifyRoleFromToken } from "@/store/slices/authSlice";
import {
  LayoutDashboard,
  User,
  Upload,
  Briefcase,
  Bookmark,
  ShieldCheck,
  MessageCircle,
  ArrowLeft,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Layers,
} from "lucide-react";

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    setMounted(true);
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  const isLoginPage = pathname === "/candidate/login";

  useEffect(() => {
    if (mounted && !isLoginPage) {
      const savedUserStr = localStorage.getItem("ip_user");
      const savedToken = localStorage.getItem("ip_token");
      if (!savedUserStr || !savedToken) {
        router.replace("/candidate/login");
        return;
      }
      try {
        const u = JSON.parse(savedUserStr);
        if (u.role !== "CANDIDATE") {
          // Session belongs to ADMIN or EMPLOYER! Prevent leaking into candidate portal
          router.replace("/candidate/login?role_mismatch=true");
          return;
        }
        if (!verifyRoleFromToken(savedToken, "CANDIDATE")) {
          // Token missing, expired, or role mismatch — force re-login
          router.replace("/candidate/login");
          return;
        }
        setValidated(true);
      } catch {
        router.replace("/candidate/login");
      }
    }
  }, [mounted, isLoginPage, router]);

  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-white focus:text-slate-900 focus:px-3 focus:py-2 focus:rounded-lg focus:text-sm focus:font-bold">
          Skip to main content
        </a>
        <main id="main-content">{children}</main>
      </div>
    );
  }

  // Gate render until token + role validated (don't render children if invalid)
  if (!mounted || !validated) {
    return (
      <div suppressHydrationWarning className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-600 text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: "Overview Dashboard", href: "/candidate", icon: LayoutDashboard },
    { label: "My Profile & CV", href: "/candidate/profile", icon: User },
    { label: "Upload Resume", href: "/candidate/resume", icon: Upload },
    { label: "My Applications", href: "/candidate/applications", icon: Briefcase },
    { label: "Messages", href: "/candidate/messages", icon: MessageCircle },
    { label: "Saved Jobs", href: "/candidate/saved", icon: Bookmark },
    { label: "Privacy & Consent", href: "/candidate/privacy", icon: ShieldCheck },
  ];

  const handleLogout = () => {
    dispatch(logout());
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-white focus:text-slate-900 focus:px-3 focus:py-2 focus:rounded-lg focus:text-sm focus:font-bold">
        Skip to main content
      </a>
      {/* Mobile Topbar: Sticky at the top */}
      <header className="md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs sticky top-0 z-20">
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="Instant Placement"
            className="h-10 w-auto max-w-[190px] object-contain"
          />
          <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
            Candidate
          </span>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
          aria-label="Toggle navigation menu"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Slide-Over Drawer Navigation */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative flex flex-col w-72 max-w-[85vw] bg-white shadow-2xl z-10 h-full transform transition-transform duration-300 ease-in-out">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <Link href="/" onClick={() => setSidebarOpen(false)} className="flex items-center gap-2">
                <img
                  src="/logo.png"
                  alt="Instant Placement"
                  className="h-10 w-auto max-w-[190px] object-contain"
                />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200">
                  Candidate
                </span>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User info */}
            <div className="p-3 mx-3 my-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-xs font-black text-white shadow-xs shrink-0 overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user?.name || "Candidate"} className="w-full h-full object-cover" />
                ) : (
                  user?.name ? user.name.charAt(0).toUpperCase() : "C"
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 min-w-0">
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {user?.name || "Job Seeker"}
                  </span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                </div>
                <p className="text-xs text-slate-500 truncate">{user?.phone || "Phone not set"}</p>
              </div>
            </div>

            {/* Nav links */}
            <nav className="flex-1 px-3 space-y-1 py-2 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname === `${item.href}/`;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/25"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500"}`} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5" />}
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="p-3 border-t border-slate-100 space-y-1 bg-slate-50/50 mt-auto">
              <Link
                href="/"
                className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Home</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar: Locked permanently to the left viewport, never scrolls with page data */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30 bg-white dark:bg-slate-900 border-r border-slate-200 shadow-xs">
        <div className="flex flex-col flex-1 h-full min-h-0">
          {/* Brand Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0">
            <Link href="/" className="flex items-center">
              <img
                src="/logo.png"
                alt="Instant Placement"
                className="h-10 w-auto max-w-[190px] object-contain"
              />
            </Link>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              Candidate
            </span>
          </div>

          {/* User Card */}
          <div className="p-3.5 mx-3 my-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-xs font-black text-white shadow-xs shrink-0 overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt={user?.name || "Candidate"} className="w-full h-full object-cover" />
              ) : (
                user?.name ? user.name.charAt(0).toUpperCase() : "C"
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 min-w-0">
                <span className="text-xs font-bold text-slate-900 truncate">
                  {user?.name || "Job Seeker"}
                </span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              </div>
              <p className="text-xs text-slate-500 truncate">{user?.phone || "Phone not set"}</p>
            </div>
          </div>

          {/* Nav Links: Scrolls independently only if window height is smaller than menu */}
          <nav className="flex-1 px-3 space-y-1 py-2 overflow-y-auto min-h-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/25"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500"}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5" />}
                </Link>
              );
            })}
          </nav>

          {/* Footer Actions: Always docked at bottom */}
          <div className="p-3 border-t border-slate-100 space-y-1 bg-slate-50/50 mt-auto shrink-0">
            <Link
              href="/"
              className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area: Offset by sidebar width (md:pl-64), scrolls naturally without dragging sidebar */}
      <div className="md:pl-64 flex flex-col flex-1 min-w-0 min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 md:pb-8">
        <main id="main-content" className="flex-1 p-4 md:p-8 max-w-6xl w-full mx-auto min-w-0">
          {children}
        </main>
      </div>

      {/* ─── Mobile Fixed Bottom Navigation Bar (29MobileCandidateHome.png) ─── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
        {[
          { label: "Home", href: "/candidate", icon: LayoutDashboard },
          { label: "Find Jobs", href: "/jobs", icon: Briefcase },
          { label: "Applied", href: "/candidate/applications", icon: Layers },
          { label: "Saved", href: "/candidate/saved", icon: Bookmark },
          { label: "Profile", href: "/candidate/profile", icon: User },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative ${
                isActive ? "text-blue-600 font-bold" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-slate-500"}`} />
                {isActive && (
                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-blue-600" />
                )}
              </div>
              <span className="text-xs mt-0.5 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
