import { Bodoni_Moda, Roboto, Urbanist, WindSong } from "next/font/google";

// Figma uses PP Telegraf (commercial, not licensed here). Urbanist is the
// closest free match with the same 200/400/800 weights. To switch to a
// licensed Telegraf, load it with next/font/local under `--font-urbanist`.
export const urbanist = Urbanist({
  subsets: ["latin"],
  weight: ["200", "400", "800"],
  variable: "--font-urbanist",
  display: "swap",
});

// Hero headline: OPTIDiode in Figma (commercial) -> Bodoni Moda.
export const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-bodoni",
  display: "swap",
});

// Hero script line: WindSong is used as-is.
export const windsong = WindSong({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-windsong",
  display: "swap",
});

// Review text is set in Roboto in the design.
export const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-roboto",
  display: "swap",
});

export const fontVariables = [urbanist, bodoni, windsong, roboto]
  .map((font) => font.variable)
  .join(" ");
