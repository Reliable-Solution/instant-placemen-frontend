import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSalary(min: number, max: number, type: "monthly" | "yearly" | "hourly" = "monthly"): string {
  const formatNum = (num: number) => {
    if (num >= 100000) {
      return `₹${(num / 100000).toFixed(1).replace(/\.0$/, "")} Lakh`;
    }
    return `₹${num.toLocaleString("en-IN")}`;
  };

  const period = type === "monthly" ? "/month" : type === "yearly" ? "/year" : "/hr";
  if (min === max) {
    return `${formatNum(min)} ${period}`;
  }
  return `${formatNum(min)} - ${formatNum(max)} ${period}`;
}

export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  return `${Math.floor(days / 7)}w ago`;
}
