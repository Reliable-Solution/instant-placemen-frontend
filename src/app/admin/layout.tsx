"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loadUserFromStorage, logout, verifyRoleFromToken } from "@/store/slices/authSlice";
import {
  LayoutDashboard,
  Briefcase,
  Building2,
  Users,
  FileText,
  Layers,
  CreditCard,
  ArrowLeft,
  LogOut,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  GitBranch,
  HelpCircle,
  Settings,
  MessageSquare,
  Bot,
  UserPlus,
  Receipt,
  PhoneCall,
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [validated, setValidated] = useState(false);
  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({
    "/admin/taxonomies": true,
  });

  const toggleSubMenu = (href: string) => {
    setOpenSubMenus((prev) => ({
      ...prev,
      [href]: !prev[href],
    }));
  };

  useEffect(() => {
    setMounted(true);
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (mounted && !isLoginPage) {
      const savedUserStr = localStorage.getItem("ip_user");
      const savedToken = localStorage.getItem("ip_token");
      if (!savedUserStr || !savedToken) {
        router.push("/admin/login");
        return;
      }
      try {
        const u = JSON.parse(savedUserStr);
        if (u.role !== "ADMIN" && u.role !== "RECRUITER") {
          router.push("/admin/login");
          return;
        }
        const tokenOk =
          verifyRoleFromToken(savedToken, "ADMIN") ||
          verifyRoleFromToken(savedToken, "RECRUITER");
        if (!tokenOk) {
          // Token missing, expired, or role mismatch — force re-login
          router.push("/admin/login");
          return;
        }
        setValidated(true);
      } catch {
        router.push("/admin/login");
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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-600 text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  interface NavItem {
    label: string;
    href: string;
    icon: any;
    badge?: string;
    subItems?: Array<{ label: string; href: string }>;
  }

  interface NavSection {
    title: string;
    items: NavItem[];
  }

  const navSections: NavSection[] = [
    {
      title: "Core",
      items: [
        { label: "Dashboard Overview", href: "/admin", icon: LayoutDashboard },
      ],
    },
    {
      title: "Recruitment & ATS",
      items: [
        { label: "Jobs Moderation", href: "/admin/jobs", icon: Briefcase },
        { label: "Candidates Database", href: "/admin/candidates", icon: Users },
        {
          label: "Add Candidates",
          href: "/admin/candidates/add",
          icon: UserPlus,
          badge: "Importer",
        },
        { label: "ATS Applications", href: "/admin/applications", icon: FileText },
        { label: "Operations Pipeline", href: "/admin/pipeline", icon: GitBranch },
      ],
    },
    {
      title: "Employers & Revenue",
      items: [
        { label: "Employers Directory", href: "/admin/employers", icon: Building2 },
        { label: "Plans Management", href: "/admin/plans", icon: CreditCard },
        { label: "Subscriptions", href: "/admin/subscriptions", icon: Receipt },
      ],
    },
    {
      title: "Communication & CRM",
      items: [
        { label: "WhatsApp & Templates", href: "/admin/whatsapp", icon: MessageSquare },
        { label: "WhatsApp Leads", href: "/admin/leads", icon: PhoneCall },
      ],
    },
    {
      title: "Platform & Settings",
      items: [
        {
          label: "Categories & Cities",
          href: "/admin/taxonomies",
          icon: Layers,
          subItems: [
            { label: "Job Categories", href: "/admin/taxonomies?tab=categories" },
            { label: "Hiring Hub Cities", href: "/admin/taxonomies?tab=cities" },
          ],
        },
        { label: "FAQ Management", href: "/admin/faqs", icon: HelpCircle },
        { label: "AI Resume Parser", href: "/admin/aiparser", icon: Bot },
        { label: "Site Settings", href: "/admin/settings", icon: Settings },
      ],
    },
  ];

  const renderNavSection = (section: NavSection, isMobile: boolean = false) => (
    <div key={section.title} className="space-y-0.5 mb-3.5 last:mb-1">
      <div className="px-3 pt-2 pb-1 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
        {section.title}
      </div>
      {section.items.map((item) => {
        const Icon = item.icon;
        const hasSubItems = item.subItems && item.subItems.length > 0;
        const isParentActive =
          item.href === "/admin"
            ? pathname === "/admin"
            : hasSubItems
            ? pathname === item.href || pathname.startsWith(item.href)
            : pathname === item.href;
        const isOpen = !!openSubMenus[item.href];

        return (
          <div key={item.href} className="space-y-0.5">
            {hasSubItems ? (
              <button
                type="button"
                onClick={() => toggleSubMenu(item.href)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isParentActive
                    ? "bg-blue-600 text-white font-bold shadow-sm shadow-blue-600/20"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isParentActive ? "text-white" : "text-slate-500"}`} />
                  <span>{item.label}</span>
                </div>
                {isOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                )}
              </button>
            ) : (
              <Link
                href={item.href}
                onClick={isMobile ? () => setSidebarOpen(false) : undefined}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isParentActive
                    ? "bg-blue-600 text-white font-bold shadow-sm shadow-blue-600/20"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isParentActive ? "text-white" : "text-slate-500"}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {item.badge && !isParentActive && (
                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800">
                      {item.badge}
                    </span>
                  )}
                  {isParentActive && <ChevronRight className="w-3.5 h-3.5" />}
                </div>
              </Link>
            )}

            {/* Sub-menu accordion */}
            {hasSubItems && isOpen && item.subItems && (
              <div className="ml-5 pl-2.5 border-l-2 border-slate-200 dark:border-slate-800 space-y-1 my-1">
                {item.subItems.map((sub: any) => (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    onClick={isMobile ? () => setSidebarOpen(false) : undefined}
                    className="block px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50/60 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
                  >
                    {sub.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );


  const handleLogout = () => {
    dispatch(logout());
    router.push("/admin/login");
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
          <span className="text-xs text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
            Admin
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
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-sm">
                  <Briefcase className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <span className="text-sm font-extrabold text-slate-900 tracking-tight">
                    Instant<span className="text-blue-600">Placement</span>
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-1 py-0.5 rounded border border-amber-200 block mt-0.5">
                    Super Admin
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User info */}
            <div className="p-3 mx-3 my-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0 border border-blue-200">
                SA
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.name || "System Admin"}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email || "admin@example.com"}</p>
              </div>
            </div>

            {/* Nav links */}
            <nav className="flex-1 px-3 py-2 overflow-y-auto">
              {navSections.map((section) => renderNavSection(section, true))}
            </nav>

            {/* Footer */}
            <div className="p-3 border-t border-slate-100 space-y-1 bg-slate-50/50 mt-auto">
              <Link
                href="/"
                className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Public Candidate Site</span>
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
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
              Admin
            </span>
          </div>

          {/* User Card */}
          <div className="p-3 mx-3 my-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0 border border-blue-200">
              SA
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-900 truncate">{user?.name || "System Admin"}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email || "admin@example.com"}</p>
            </div>
          </div>

          {/* Nav Links: Scrolls independently only if window height is smaller than menu */}
          <nav className="flex-1 px-3 py-2 overflow-y-auto min-h-0">
            {navSections.map((section) => renderNavSection(section, false))}
          </nav>

          {/* Footer Actions: Always docked at bottom */}
          <div className="p-3 border-t border-slate-100 space-y-1 bg-slate-50/50 mt-auto shrink-0">
            <Link
              href="/"
              className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Public Candidate Site</span>
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
      <div className="md:pl-64 flex flex-col flex-1 min-w-0 min-h-screen bg-slate-50 dark:bg-slate-950">
        <main id="main-content" className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
