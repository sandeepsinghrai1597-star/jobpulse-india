---
name: JobPulse India
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#434653'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#737784'
  outline-variant: '#c3c6d5'
  surface-tint: '#2559bd'
  primary: '#00327d'
  on-primary: '#ffffff'
  primary-container: '#0047ab'
  on-primary-container: '#a5bdff'
  inverse-primary: '#b1c5ff'
  secondary: '#006591'
  on-secondary: '#ffffff'
  secondary-container: '#39b8fd'
  on-secondary-container: '#004666'
  tertiary: '#1a12af'
  on-tertiary: '#ffffff'
  tertiary-container: '#3636c5'
  on-tertiary-container: '#b7b8ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2ff'
  primary-fixed-dim: '#b1c5ff'
  on-primary-fixed: '#001946'
  on-primary-fixed-variant: '#00419e'
  secondary-fixed: '#c9e6ff'
  secondary-fixed-dim: '#89ceff'
  on-secondary-fixed: '#001e2f'
  on-secondary-fixed-variant: '#004c6e'
  tertiary-fixed: '#e1e0ff'
  tertiary-fixed-dim: '#c0c1ff'
  on-tertiary-fixed: '#07006c'
  on-tertiary-fixed-variant: '#2f2ebe'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: '1.3'
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style

The design system is engineered for a high-performance, AI-driven recruitment ecosystem. It balances the authority of a legacy financial institution with the agility of a modern tech startup. The target audience includes ambitious professionals and data-driven recruiters who require clarity, speed, and reliability.

The aesthetic is **Corporate Modern** with a focus on high-conversion layouts. It leverages heavy whitespace, precision alignment, and subtle **Glassmorphism** specifically for high-intent search areas to create a sense of focus. The emotional response should be one of "effortless progress"—reducing the anxiety of the job search through structured data visualization and a clean, non-distracting interface.

## Colors

The palette is anchored by **Pulse Blue (#0047AB)**, a deep, trustworthy primary shade that drives action and signals professionalism. 

- **Primary:** Pulse Blue is used for primary calls to action, active navigation states, and key brand identifiers.
- **Secondary/Accent:** A lighter sky blue and indigo are used sparingly for AI-powered features and data visualization highlights.
- **Backgrounds:** A tiered neutral system using #F8FAFC for the main canvas to separate modular widgets from the pure white (#FFFFFF) of the card surfaces.
- **Status:** Success (Emerald 600), Warning (Amber 500), and Error (Rose 600) follow standard accessibility patterns to ensure clear communication of application statuses.

## Typography

This design system uses a dual-font strategy. **Plus Jakarta Sans** provides a modern, slightly geometric touch for headlines and display text, making the brand feel approachable yet contemporary. **Inter** is utilized for all body copy, inputs, and labels due to its exceptional legibility at small sizes and neutral, systematic character.

Type scales strictly follow the 8px grid. Use `body-md` as the default for all standard text. For AI-generated insights or secondary meta-data, utilize `body-sm`. All display styles should use a slightly tighter letter-spacing to maintain a professional, high-end editorial feel.

## Layout & Spacing

The layout is built on a **12-column fluid grid** for desktop, transitioning to an **8-column grid** for tablets and a **4-column grid** for mobile. 

A strict **8px spatial system** governs all margins and padding, ensuring mathematical harmony across the UI. Modular widgets should always have a consistent 24px internal padding (`spacing.lg`). 

**Breakpoints:**
- Mobile: 0px - 639px (Margins: 16px)
- Tablet: 640px - 1023px (Margins: 24px)
- Desktop: 1024px+ (Margins: Auto, Container Max: 1280px)

Layout components like the Kanban board use a horizontal overflow pattern on mobile, while data visualization widgets stack vertically to maintain readability.

## Elevation & Depth

This design system employs a **Tonal Layering** approach combined with **Glassmorphism** for specific high-level interactions.

- **Level 0 (Background):** #F8FAFC. No shadow. Used for the main app canvas.
- **Level 1 (Cards/Widgets):** Pure white surface with a very soft, diffused shadow: `0px 1px 3px rgba(0,0,0,0.05), 0px 10px 15px -5px rgba(0,0,0,0.02)`.
- **Level 2 (Modals/Dropdowns):** Increased elevation with a deeper shadow to pull elements toward the user.
- **Glassmorphism Layer:** For the primary search bar and navigation overlays, use a backdrop blur of 12px and 80% opacity on the surface color. A subtle 1px white inner border (10% opacity) should be added to simulate the edge of glass.

## Shapes

The shape language is primarily **Rounded (0.5rem)** to maintain a balance between professional structure and modern softness. 

- **Standard Elements:** Cards, input fields, and buttons use a 0.5rem (8px) radius.
- **Pill Elements:** Tags, chips, and specific status indicators use a full pill shape (9999px) to distinguish them as interactive or categorizing metadata.
- **Container Elements:** Large onboarding modals or sections use `rounded-xl` (1.5rem) to feel more inviting and less institutional.

## Components

### Buttons & Inputs
Buttons use the `label-md` type style. Primary buttons are Pulse Blue with white text; secondary buttons use a Ghost style (border only). Input fields feature a 1px border (#E2E8F0) that transitions to Pulse Blue on focus with a 3px soft outer glow.

### Search Bar (Glassmorphic)
The hero search bar must use `backdrop-filter: blur(12px)` with a semi-transparent white background. It should span the center of the viewport with an integrated pill-shaped primary button.

### Kanban-style Progress Cards
Used for application tracking. These cards are white, `rounded-md`, and use vertical 4px accent bars on the left to denote status (Applied, Interviewing, Offered).

### Tags & Chips
Always pill-shaped. Use subtle background tints of the primary or secondary colors (10% opacity) with high-contrast text for accessibility.

### Motion & Feedback
All interactive transitions (hover, active, modal entry) must use a **300ms cubic-bezier(0.4, 0, 0.2, 1)** curve. 
- **Skeleton States:** Use a pulsing light-gray gradient (#F1F5F9 to #E2E8F0) for all data-heavy widgets during initial load.
- **Onboarding:** Progressive modals should slide up 20px while fading in to create a sense of mounting priority.