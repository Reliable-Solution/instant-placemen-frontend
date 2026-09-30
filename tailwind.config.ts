import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    // Feature components (JobCard, JobListings, FilterSidebar, ...) ship their
    // own markup and would otherwise be missing every utility they use.
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        brand: {
          primary: "#2563eb",
          primaryDark: "#1d4ed8",
          navy: "#0f172a",
          accent: "#4f46e5",
          success: "#059669",
          successSoft: "#ecfdf5",
          warning: "#d97706",
          warningSoft: "#fffbeb",
          danger: "#e11d48",
          dangerSoft: "#fff1f2",
          whatsapp: "#25D366",
          // legacy aliases (do not use in new code)
          blue: "#2563eb",
          emerald: "#10b981",
          amber: "#f59e0b",
          indigo: "#4f46e5",
          purple: "#7c3aed",
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        card: "0 2px 8px -2px rgba(0,0,0,0.06), 0 8px 24px -4px rgba(0,0,0,0.08)",
        "card-hover": "0 12px 32px -4px rgba(37,99,235,0.12), 0 4px 12px -2px rgba(0,0,0,0.06)",
        badge: "0 1px 3px rgba(0,0,0,0.1)",
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
