// Brand chart colors as plain constants so both server components and client
// chart components can import them (a "use client" module can't export values
// consumed by a server component).
export const chartColors = {
  growth: "hsl(158 64% 52%)",
  info: "hsl(217 91% 60%)",
  cyan: "hsl(198 90% 60%)",
  critical: "hsl(350 89% 60%)",
};
