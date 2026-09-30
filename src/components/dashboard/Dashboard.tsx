import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function DashboardHeader({
  badge,
  badgeColor = "text-blue-700 bg-blue-50 border-blue-200",
  title,
  subtitle,
  live = false,
  actionHref,
  actionLabel,
  extra,
}: {
  badge: string;
  badgeColor?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  live?: boolean;
  actionHref?: string;
  actionLabel?: React.ReactNode;
  extra?: React.ReactNode;
}) {
  return (
    <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeColor}`}>
            {badge}
          </span>
          {live && (
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {extra}
        {actionHref && (
          <Link
            href={actionHref}
            className="btn-primary inline-flex items-center gap-2 h-11 px-5 rounded-xl text-xs"
          >
            {actionLabel}
          </Link>
        )}
      </div>
    </div>
  );
}

export function StatCard({
  title,
  value,
  sub,
  icon: Icon,
  color,
  href,
}: {
  title: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="bg-white hover:bg-slate-50/70 border border-slate-200 hover:border-slate-300 rounded-3xl p-5 transition-all shadow-sm group"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2.5 rounded-2xl border shadow-sm ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-blue-600 transition-colors" />
      </div>
      <p className="text-xs font-semibold text-slate-500">{title}</p>
      <p className="text-2xl font-black text-slate-900 mt-1 tracking-tight">{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </Link>
  );
}

export function ContentCard({
  title,
  subtitle,
  actionHref,
  actionLabel = "View All",
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  actionHref?: string;
  actionLabel?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`bg-white border border-slate-200 rounded-3xl p-6 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div className="min-w-0">
          <h2 className="text-base font-extrabold text-slate-900">{title}</h2>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {actionHref && (
          <Link
            href={actionHref}
            className="text-xs h-8 px-3 inline-flex items-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold shrink-0"
          >
            {actionLabel}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
