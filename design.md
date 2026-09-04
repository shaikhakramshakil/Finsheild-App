---
version: alpha
name: tellnova
description: "tellnova is a developer-tool brand built for speed and focus: a warm off-white canvas (#F2EFE7) paired with near-black ink (#171916) gives the site an editorial, terminal-adjacent calm, while a punchy burnt-orange accent (#FF5B35/#FF795A) marks CTAs, links and highlights against the muted sage-grey text hierarchy. Headlines lean on a huge, tightly-tracked Manrope display cut, body copy runs in relaxed Manrope/Inter paragraphs, and IBM Plex Mono in small tracked caps handles labels, nav links and micro-UI — a mix that reads like a technical product with a crafted editorial voice. Surfaces stay flat and low-radius (7–14px) with a dark full-bleed footer, a transparent absolute-positioned header, and soft ambient glows/drop shadows reserved for hero and card elevation."
colors:
  primary: "#FF5B35"
  primary-focus: "#A23C27"
  secondary: "#FF795A"
  secondary-dark: "#5E2A1E"
  ink: "#171916"
  ink-secondary: "#2B2D2A"
  body: "#555951"
  muted: "#7F837B"
  muted-secondary: "#92978E"
  muted-tertiary: "#A7AAA3"
  hairline: "#62665F"
  surface: "#F2EFE7"
  surface-dark: "#0D0E0D"
  surface-alt: "#E7E4DB"
  on-primary: "#FFFFFF"
typography:
  display-hero:
    fontFamily: Manrope
    fontSize: 86.4px
    fontWeight: 650
    lineHeight: 0.9
    letterSpacing: -6.48px
  title-strong:
    fontFamily: Manrope
    fontSize: 22px
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: normal
  title-md:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: normal
  quote:
    fontFamily: Cormorant Garamond
    fontSize: 25px
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: normal
  body:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: normal
  body-loose:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.75
    letterSpacing: normal
  body-tight:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: normal
  body-alt:
    fontFamily: Inter
    fontSize: 15.5px
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: normal
  caption:
    fontFamily: Manrope
    fontSize: 11px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: normal
  nav-link:
    fontFamily: IBM Plex Mono
    fontSize: 9px
    fontWeight: 700
    lineHeight: 1
    letterSpacing: 0.72px
  label-caps:
    fontFamily: IBM Plex Mono
    fontSize: 10px
    fontWeight: 600
    lineHeight: 1
    letterSpacing: 1px
  micro-label:
    fontFamily: IBM Plex Mono
    fontSize: 9px
    fontWeight: 600
    lineHeight: 1
    letterSpacing: 1.35px
  micro-caption:
    fontFamily: IBM Plex Mono
    fontSize: 8px
    fontWeight: 600
    lineHeight: 1
    letterSpacing: 1.12px
  list-item:
    fontFamily: IBM Plex Mono
    fontSize: 9px
    fontWeight: 500
    lineHeight: 1
    letterSpacing: normal
  body-mono:
    fontFamily: IBM Plex Mono
    fontSize: 10px
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: normal
rounded:
  sm: 7px
  md: 11px
  lg: 14px
  full: 9999px
spacing:
  space-1: 3px
  space-2: 4px
  space-3: 5px
  space-4: 8px
  space-5: 9px
  space-6: 12px
  space-7: 18px
  space-8: 20px
  space-9: 22px
  space-10: 24px
  space-11: 30px
  section: 72px
components:
  navbar:
    backgroundColor: transparent
    textColor: "{colors.ink}"
    height: 29px
    borderWidth: 0px
    position: absolute
  nav-link:
    textColor: "{colors.on-primary}"
    typography: "{typography.nav-link}"
  footer:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.surface}"
    height: 181px
    borderWidth: 1px
    position: static
    columns: "5"
  footer-link:
    textColor: "{colors.muted-tertiary}"
    typography: "{typography.caption}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
    padding: 12px 24px
    typography: "{typography.label-caps}"
  button-primary-active:
    backgroundColor: "{colors.primary-focus}"
    textColor: "{colors.on-primary}"
  button-secondary:
    backgroundColor: transparent
    textColor: "{colors.primary}"
    borderColor: "{colors.primary}"
    borderWidth: 1px
    rounded: "{rounded.md}"
  card:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.hairline}"
    borderWidth: 1px
    rounded: "{rounded.lg}"
    boxShadow: rgba(23, 25, 22, 0.19) 0px 35px 90px 0px
  hero-panel:
    backgroundColor: "{colors.surface}"
    boxShadow: rgb(242, 239, 231) 0px 0px 38px 26px, rgba(242, 239, 231, 0.82) 0px 0px 96px 58px
  modal:
    backgroundColor: "{colors.surface}"
    boxShadow: rgba(0, 0, 0, 0.4) 0px 40px 100px 0px
    rounded: "{rounded.lg}"
  badge:
    backgroundColor: "{colors.surface-alt}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    typography: "{typography.micro-label}"
  input:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.hairline}"
    borderWidth: 1px
    rounded: "{rounded.sm}"
    textColor: "{colors.ink}"
  avatar:
    rounded: "{rounded.full}"
  link:
    textColor: "{colors.primary}"
    typography: "{typography.body}"
---
