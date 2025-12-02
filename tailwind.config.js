/**
 * McCal Media Tailwind Config
 * Comprehensive design tokens for widgets and site components.
 * Extends default Tailwind with brand-specific values.
 */
module.exports = {
  content: [
    "./thesis/**/*.html",
    "./src/pages/**/*.{jsx,html}",
    "./src/widgets/**/*.html",
    "./src/site/**/*.{html,js}",
  ],
  theme: {
    extend: {
      // Brand color palette
      colors: {
        // Primary brand colors
        brand: {
          primary: "#ff4d6d",
          secondary: "#4d79ff",
          accent: "#00d4aa",
          dark: "#0a0a0a",
          light: "#f5f5f5",
        },
        // UI semantic colors
        ui: {
          bg: {
            DEFAULT: "#ffffff",
            dark: "#0b0c0f",
            panel: "rgba(255, 255, 255, 0.82)",
            "panel-dark": "rgba(20, 20, 20, 0.78)",
          },
          fg: {
            DEFAULT: "#0e0f10",
            dark: "#f3f4f6",
            muted: "#6b7280",
            "muted-dark": "#a3aab7",
          },
          line: {
            DEFAULT: "#e7e7e7",
            dark: "#22252a",
          },
          accent: {
            DEFAULT: "#4d79ff",
            hover: "#7aa0ff",
            muted: "rgba(77, 121, 255, 0.6)",
          },
        },
        // Legacy support (backwards compatibility)
        ink: "#1a1a1a",
        accent: "#0b5fff",
        accentMuted: "#6fa8ff",
        paper: "#f8f9fa",
        edge: "#e2e8f0",
      },

      // Typography scale
      fontFamily: {
        display: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        body: [
          "ui-sans-serif",
          "system-ui",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        mono: ["ui-monospace", "SF Mono", "Monaco", "Consolas", "monospace"],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }], // 12px
        sm: ["0.875rem", { lineHeight: "1.25rem" }], // 14px
        base: ["1rem", { lineHeight: "1.5rem" }], // 16px
        lg: ["1.125rem", { lineHeight: "1.75rem" }], // 18px
        xl: ["1.25rem", { lineHeight: "1.75rem" }], // 20px
        "2xl": ["1.5rem", { lineHeight: "2rem" }], // 24px
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }], // 30px
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }], // 36px
        "5xl": ["3rem", { lineHeight: "1" }], // 48px
      },
      fontWeight: {
        light: "300",
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
        extrabold: "800",
        black: "900",
      },

      // Spacing scale (extends default)
      spacing: {
        "2xs": "0.125rem", // 2px
        xs: "0.5rem", // 8px
        sm: "0.75rem", // 12px
        md: "1rem", // 16px
        lg: "1.5rem", // 24px
        xl: "2rem", // 32px
        "2xl": "2.5rem", // 40px
        "3xl": "3rem", // 48px
        "4xl": "4rem", // 64px
        "5xl": "6rem", // 96px
      },

      // Border radius
      borderRadius: {
        sm: "0.25rem", // 4px
        DEFAULT: "0.5rem", // 8px
        md: "0.625rem", // 10px
        lg: "0.75rem", // 12px
        xl: "1rem", // 16px
        "2xl": "1.5rem", // 24px
        full: "9999px",
      },

      // Box shadows
      boxShadow: {
        focus: "0 0 0 3px rgba(77, 121, 255, 0.35)",
        "focus-accent": "0 0 0 4px rgba(255, 77, 109, 0.25)",
        soft: "0 2px 8px rgba(0, 0, 0, 0.08)",
        medium: "0 4px 12px rgba(0, 0, 0, 0.15)",
        hard: "0 8px 24px rgba(0, 0, 0, 0.25)",
        glow: "0 0 16px rgba(77, 121, 255, 0.3)",
      },

      // Animation durations
      transitionDuration: {
        fast: "150ms",
        base: "250ms",
        slow: "350ms",
      },

      // Z-index scale
      zIndex: {
        modal: "2147483647",
        "modal-content": "2147483648",
        tooltip: "1000",
        dropdown: "900",
        sticky: "800",
        fixed: "700",
      },

      // Backdrop blur
      backdropBlur: {
        xs: "2px",
        sm: "4px",
        DEFAULT: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
      },
    },
  },
  darkMode: "class", // Enable class-based dark mode
  plugins: [],
};
