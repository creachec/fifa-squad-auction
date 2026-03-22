import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}", "./index.html"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "#0a0e14",
        foreground: "#f1f3fc",
        primary: {
          DEFAULT: "#a4ffb9",
          foreground: "#006531",
        },
        secondary: {
          DEFAULT: "#ffd334",
          foreground: "#5b4900",
        },
        tertiary: {
          DEFAULT: "#c2d5ff",
          foreground: "#35496e",
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
        "secondary-fixed": "#ffd334",
        "on-primary-container": "#005b2c",
        "secondary-container": "#725c00",
        "on-secondary-fixed-variant": "#665200",
        "on-surface": "#f1f3fc",
        "on-secondary": "#5b4900",
        "outline": "#72757d",
        "surface": "#0a0e14",
        "primary-fixed": "#00fd86",
        "secondary-dim": "#efc524",
        "tertiary-dim": "#a5b9e4",
        "surface-container-lowest": "#000000",
        "error": "#ff716c",
        "surface-container-high": "#1b2028",
        "on-primary-fixed-variant": "#006632",
        "on-primary": "#006531",
        "primary-dim": "#00ed7d",
        "error-dim": "#d7383b",
        "surface-container": "#151a21",
        "on-tertiary-container": "#2c4065",
        "primary-container": "#00fd86",
        "tertiary-container": "#b3c7f3",
        "inverse-on-surface": "#51555c",
        "on-error": "#490006",
        "on-tertiary": "#35496e",
        "primary-fixed-dim": "#00ed7d",
        "on-tertiary-fixed": "#172c4f",
        "outline-variant": "#44484f",
        "error-container": "#9f0519",
        "surface-variant": "#20262f",
        "surface-container-low": "#0f141a",
        "on-secondary-fixed": "#453600",
        "inverse-primary": "#006e37",
        "on-background": "#f1f3fc",
        "surface-dim": "#0a0e14",
        "on-error-container": "#ffa8a3",
        "on-primary-fixed": "#004620",
        "tertiary-fixed-dim": "#a5b9e4",
        "surface-tint": "#a4ffb9",
        "secondary-fixed-dim": "#efc524",
        "on-secondary-container": "#fff7e9",
        "tertiary-fixed": "#b3c7f3",
        "on-tertiary-fixed-variant": "#35496e",
        "surface-container-highest": "#20262f",
        "on-surface-variant": "#a8abb3",
        "surface-bright": "#262c36",
        "inverse-surface": "#f8f9ff"
      },
      fontFamily: {
        "headline": ["Space Grotesk", "sans-serif"],
        "body": ["Manrope", "sans-serif"],
        "label": ["Inter", "sans-serif"]
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #a4ffb9 0%, #00fd86 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #ffd334 0%, #efc524 100%)',
        'gradient-dark': 'radial-gradient(circle at center, #1a242d 0%, #0a0e14 100%)',
      },
      boxShadow: {
        'glow': '0 0 32px rgba(164, 255, 185, 0.15)',
        'card': '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
        full: "9999px",
        DEFAULT: "0.125rem",
        xl: "0.5rem"
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
