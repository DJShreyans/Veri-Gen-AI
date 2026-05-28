import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        panel: "#11131a",
        surface: "#171a23",
        ink: "#e8eefc",
        muted: "#8c95aa",
        line: "#2a2f3d",
        cyan: "#66e3ff",
        green: "#74f2a7",
        amber: "#f2c572"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(102, 227, 255, 0.16), 0 20px 80px rgba(0, 0, 0, 0.42)"
      }
    }
  },
  plugins: []
};

export default config;

