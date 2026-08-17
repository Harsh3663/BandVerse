import { Inter, Noto_Sans, Space_Grotesk } from "next/font/google";

/**
 * Font strategy — see docs/DesignSystem.md § Typography.
 *
 * All fonts are loaded via `next/font`, which self-hosts the font files at
 * build time (no runtime request to Google Fonts, zero layout shift, no
 * privacy/CSP concerns) and exposes each as a CSS variable applied on <html>.
 *
 * IMPORTANT — DISPLAY FONT PLACEHOLDER:
 * The Design System specifies "Cabinet Grotesk" for headings/display text.
 * Cabinet Grotesk is a Fontshare-licensed typeface, not distributed via
 * Google Fonts or npm, so it cannot be wired up here without the licensed
 * font files in hand. Until Design provides those files, `--font-display`
 * resolves to Space Grotesk — the closest free geometric grotesque on
 * Google Fonts — so every component can already reference `font-display`
 * and require ZERO code changes once the real files arrive.
 *
 * To swap in the real typeface later:
 *   1. Add the licensed .woff2 files to `public/fonts/cabinet-grotesk/`.
 *   2. Replace the `Space_Grotesk` import below with `next/font/local`,
 *      pointing at those files, keeping the exported `variable` name
 *      identical ("--font-display-placeholder" -> rename consistently).
 *   3. No changes needed anywhere else — every component consumes the
 *      `font-display` Tailwind utility, never the font name directly.
 */

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/** TODO(design): replace with next/font/local + licensed Cabinet Grotesk files. */
export const displayFontPlaceholder = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display-placeholder",
  display: "swap",
});

/**
 * Covers the Hindi / Marathi / Gujarati localization roadmap (PRD §9, §17).
 * Metrically designed to pair predictably alongside Inter's Latin glyphs.
 * Not applied by default anywhere yet — import and apply this class only
 * once localized routes/content actually exist, to avoid shipping unused
 * font weights to every visitor.
 */
export const notoSans = Noto_Sans({
  subsets: ["latin", "devanagari"],
  variable: "--font-noto-sans",
  display: "swap",
});

/** Combined variable class names to apply on the root <html> element. */
export const fontVariables = [
  inter.variable,
  displayFontPlaceholder.variable,
  notoSans.variable,
].join(" ");
