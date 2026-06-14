# TrustBridge Presentation Site — Technical Specification

## Goal

Build a standalone, visually premium presentation website for **HMD TrustBridge** — a hackathon project. The site should work as a pitch deck replacement: jury members open one URL and see a polished, scrollable narrative that covers the problem, solution, demo flow, and technical architecture.

**Deploy target:** Vercel (free tier)  
**URL pattern:** `trustbridge-pitch.vercel.app` or similar  
**Audience:** Hackathon jury — technical + business mixed  
**Tone:** Premium, confident, design-forward. Think Linear.app meets a product launch page.

---

## Tech stack

- **Next.js 14** (App Router) — `npx create-next-app@latest`
- **Tailwind CSS** — utility-first styling
- **TypeScript** — strict mode
- **No UI library** — custom components only
- **No backend** — fully static, `output: 'export'` optional
- **Fonts:** Inter (Google Fonts) for body, no display font needed
- **Icons:** Inline SVG only, no icon library

Brand colors (use as CSS variables or Tailwind config):
```
--hmd-blue: #0057B8
--hmd-teal: #00A99D
--navy:     #0A1B3D
```

---

## Site structure

Single-page scrolling site. No routing. One `app/page.tsx`.

Section order:
1. **Nav** — sticky top bar
2. **Hero** — full-screen opening
3. **Problem** — why this matters
4. **Solution** — what TrustBridge is
5. **How it works** — 6-step walkthrough
6. **Architecture** — technical deep-dive
7. **Live demo** — QR code + link
8. **Key decisions** — design principles
9. **Team / footer**

---

## Section 1 — Navigation (sticky)

Height: 64px. Sticky top, `z-50`, white/95 background with backdrop blur.

**Left:** `HMD TrustBridge` wordmark — small, teal, bold, uppercase tracking-wider

**Center (hidden on mobile):** anchor links — Problem · Solution · How it works · Architecture · Demo

**Right:** `See live demo →` button — hmd-blue fill, white text, rounded-xl

Smooth scroll on anchor click (`scroll-behavior: smooth` on html).

---

## Section 2 — Hero

Full viewport height (`min-h-screen`). Vertically centered content, light gradient background:
```css
background: radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,169,157,0.12) 0%, transparent 60%),
            linear-gradient(180deg, #F0F9FF 0%, #FFFFFF 60%);
```

**Layout (desktop):** 2 columns — left copy, right visual panel

**Left column:**
- Small pill badge: `🔒 Hackathon 2025 · HMD` — teal border, teal text, rounded-full
- H1 (large, bold, navy): `The safer smartphone path.` on one line, then `Built for parents.` on next line in hmd-teal
- Subtitle (gray-600, max-w-md): `TrustBridge turns a QR scan into a personalised digital safety plan for your child — in 60 seconds, with no account required.`
- Two buttons side by side:
  - Primary: `See live demo` → links to `https://hmd-trustbridge.vercel.app`
  - Secondary (outline): `How it works ↓` → scrolls to how-it-works section
- Three trust indicators below buttons (inline, small, with teal checkmarks): `No account needed` · `Works from any phone` · `Research-informed`

**Right column (hidden on mobile):**
- Mockup card — white, rounded-3xl, shadow-2xl, padding 24px, max-w 320px, floating slightly with subtle shadow
- Card header: tiny teal label `TrustBridge Result`, then `Your child's safer phone path`
- Three chips: `Guided Explorer` (teal filled) · `Screen-time` (amber outlined) · `Guided Independence` (blue outlined)
- Divider
- Three mini rows with teal bullet: `Set daily screen-time limits` / `Create phone-free zones` / `Agree on a nightly handover`
- HMD product row at bottom: small phone icon + `HMD Fusion X1` + `Recommended` badge (teal)

---

## Section 3 — Problem (`id="problem"`)

Background: white. Max-width container, padded section.

**Section label** (small, teal, uppercase, tracking-widest): `The problem`

**H2** (large, navy): `Parents face a high-stakes decision with almost no structured guidance.`

**Three problem cards** in a 3-column grid (stacks to 1 on mobile). Each card:
- White background, rounded-2xl, border border-gray-100, shadow-sm, padding 24px
- Top: colored icon in a soft rounded square (10×10px icon in 40×40 container)
- Title (bold, 15px, navy)
- Body text (gray-600, 13.5px, leading-relaxed)

Card content:
1. **Icon:** warning triangle (amber) · **Title:** `No readiness framework` · **Text:** `Most parents rely on gut feeling or peer advice. There's no standard way to assess whether a child is ready for smartphone independence.`
2. **Icon:** phone with X (red/rose) · **Title:** `Generic advice doesn't fit` · **Text:** `Online guidance is one-size-fits-all. A 9-year-old's first phone needs completely different handling than a 15-year-old's upgrade.`
3. **Icon:** shield (teal) · **Title:** `Retail moment is missed` · **Text:** `Parents make the decision at the point of purchase — exactly when personalised safety guidance could have the most impact.`

Below the cards, a wide soft callout box (teal-50 background, teal-100 border, rounded-2xl, padding 20px):
> `"52% of children report being contacted online by strangers. 43% of parents feel underprepared for their child's first smartphone."` — HMD Better Phone Research 2024

---

## Section 4 — Solution (`id="solution"`)

Background: very subtle blue-50/30 tint, or keep white.

**Section label:** `The solution`

**H2:** `A 60-second advisor that meets parents at the right moment.`

**Subtitle:** `TrustBridge is a QR-based, fully client-side digital safety advisor. Scan → answer 5 questions → get a personalised safer-phone plan with an HMD recommendation.`

**Three value columns** (3-col grid on desktop, stacked on mobile). Each column has:
- Large teal number (`01`, `02`, `03`) — font-size 48px, font-weight 800, opacity-20, navy
- Bold title
- Body text

Column content:
1. **`01`** · `Scan anywhere` · `Billboard, retail shelf, product box. Any QR code starts the flow. No app install, no account.`
2. **`02`** · `Personalised in 60 seconds` · `5–8 adaptive questions. The result is specific to this child's age, concern, and family situation — not generic advice.`
3. **`03`** · `HMD recommendation last` · `The plan comes first. The HMD device path appears only after the parent's specific need is understood.`

---

## Section 5 — How it works (`id="how-it-works"`)

Background: white.

**Section label:** `How it works`

**H2:** `Six steps from QR to plan.`

**Layout:** Alternating left/right rows on desktop (zigzag), stacked on mobile. Each row = one step.

Each step row:
- Step number badge (bold, teal, 13px, `Step 01` format)
- H3 title
- Body paragraph
- Optional: a small code/data snippet or mini UI mockup represented as a styled div

**Step 1 — QR Activation**
Title: `Parent scans a QR code`
Text: `From a billboard, retail display, or product package. Opens directly in the mobile browser — no app required. Page loads in under 2 seconds.`
Visual hint: A simple rectangle with dashed border labeled `QR CODE` + arrow → `hmd-trustbridge.vercel.app`

**Step 2 — Adaptive questionnaire**
Title: `5–8 questions, fully adaptive`
Text: `The question list is recomputed after every answer. Social media follow-ups only appear if the parent selected social media. Gaming questions only if games were selected. No irrelevant questions.`
Visual hint: Mini question card mockup showing advisor intro bubble + question + two option buttons

**Step 3 — Deterministic scoring**
Title: `Readiness score — no AI involved`
Text: `A rule-based algorithm computes a score from 0–100. Base score 70, adjusted for age, experience, concern type, and combination risk factors. The same inputs always produce the same score. No hallucination possible.`
Code block (styled, monospace, dark background):
```
Base score:     70
Age delta:     −18   (age 10)
First phone:    −5
Concern:        −8   (strangers)
Independence:   +3   (low)
─────────────────────
Score:          42   → moderate
```

**Step 4 — Concern-first device recommendation**
Title: `HMD path chosen by concern, not just score`
Text: `Two children with the same readiness score can receive different HMD recommendations based on what the parent is most worried about. Harmful content → HMD Fuse + HarmBlock+. Screen time → HMD Fusion X1.`
Visual hint: Small 2-column table:
| Concern | Path |
|---|---|
| Harmful content | HMD Fuse + HarmBlock+ |
| Strangers | HMD Fuse / Fusion X1 |
| Screen time | HMD Fusion X1 |

**Step 5 — Report generation**
Title: `Personalised narrative — 8 fields`
Text: `In demo mode: pre-written templates matched to readiness level × concern. In full mode: OpenAI GPT-4.1-mini writes the narrative using the scoring result as a structured prompt. The LLM never touches the score.`
Visual hint: 8 small label chips in a flex-wrap: `Headline` · `Summary` · `Why this score` · `Risk explanation` · `Safety strategy` · `Conversation starter` · `Why HMD fits` · `Confidence message`

**Step 6 — Results screen**
Title: `Full personalised plan delivered`
Text: `Child profile card, research evidence matched to their concern, 3 actionable steps, HMD device recommendation, and 6 expandable sections with conversation guides, comparisons, and a printable phone agreement.`
Visual hint: Mini mockup of the result card with chips + 3 step cards

---

## Section 6 — Architecture (`id="architecture"`)

Background: navy (`#0A1B3D`). Light text on dark. This section should feel technical and serious.

**Section label** (teal): `Architecture`

**H2** (white): `Two modes. One experience.`

**Subtitle** (gray-300): `The Vercel demo runs fully in the browser. The full backend adds OpenAI narrative generation and Supabase logging — without changing the scoring logic.`

**Two-column comparison cards** (side by side on desktop):

Left card — `Vercel Demo` (teal accent border):
- Background: slightly lighter navy (white/5)
- Badge: `Live now` (teal filled)
- List items with teal bullets:
  - Fully client-side TypeScript
  - Deterministic scoring in browser
  - Template-driven report narrative
  - Zero external API calls
  - Works offline after page load

Right card — `Full Backend` (blue accent border):
- Background: slightly lighter navy
- Badge: `Full version` (blue outlined)  
- List items with blue bullets:
  - FastAPI (Python) scoring endpoint
  - Same deterministic algorithm
  - OpenAI GPT-4.1-mini for narrative
  - Supabase session + step logging
  - Prompt hot-swap via Supabase

**Flow diagram** below the cards — monospace-style on dark background showing the pipeline:

```
QR scan → Landing → Questionnaire (5–8 steps)
                          ↓
              clientScoring.ts  ←  Pure TypeScript, no API
              ├─ readiness_score    (rule-based math)
              ├─ risk_profile       (concern × age × use)
              └─ report narrative   (templates / GPT-4.1-mini)
                          ↓
              HmdPathSection.tsx   ←  Concern-first device logic
                          ↓
              Results screen  →  Score · Steps · HMD · Accordions
```

Render this as a styled `<pre>` block with teal highlighting on key terms.

---

## Section 7 — Live demo (`id="demo"`)

Background: white, centered content.

**Section label:** `Live demo`

**H2:** `Try it now. Scan or tap.`

**Subtitle:** `Works on any phone. No account, no install. Takes 60 seconds.`

**Layout:** Centered. Large QR code image placeholder (or real QR) in a white card with shadow. Below it: the URL `hmd-trustbridge.vercel.app` in large teal monospace text with a copy button.

Two CTA buttons:
- Primary (hmd-blue): `Open TrustBridge →` — links to `https://hmd-trustbridge.vercel.app`
- Secondary (outline): `View source on GitHub →` — links to GitHub repo if available

**Note below:** Small gray text: `Demo runs fully in the browser. No data is stored. No account required.`

---

## Section 8 — Key decisions (`id="decisions"`)

Background: gray-50.

**Section label:** `Design decisions`

**H2:** `Built on four principles.`

**Four cards** in 2×2 grid (stacks to 1 on mobile). Each card:
- White background, rounded-2xl, border border-gray-100, shadow-sm, padding 24px
- Left border accent (4px, teal)
- Bold title (13px, navy, uppercase)
- Body text (gray-600, 13px, leading-relaxed)

Cards:
1. **`Score is never set by AI`** · `The readiness score is computed deterministically from the inputs. The LLM only writes narrative text. This eliminates hallucination risk for safety-critical numbers.`
2. **`Concern beats score for device path`** · `The parent's stated worry drives the HMD recommendation. Two children with identical scores receive different paths based on what the parent is most concerned about.`
3. **`HMD recommendation is secondary`** · `The safer-phone plan is delivered first. The device recommendation appears only after the parent's need is understood. Feels helpful, not sales-driven.`
4. **`No personal data collected`** · `No name, email, or account required. The entire assessment runs in the browser session. Nothing is stored without explicit backend deployment.`

---

## Section 9 — Footer

Background: navy (`#0A1B3D`).

**Left:** `HMD TrustBridge` wordmark (white, small, uppercase)

**Center:** `Hackathon 2025 · Built with Next.js + Tailwind + OpenAI`

**Right:** `hmd-trustbridge.vercel.app` (teal, small)

Simple horizontal rule above footer content.

---

## Visual design system

### Typography scale
```
Hero H1:      48–60px, font-weight 800, line-height 1.1, color: navy
Section H2:   32–40px, font-weight 700, line-height 1.2, color: navy
Card H3:      16–18px, font-weight 700, color: navy
Body:         14px, line-height 1.65, color: gray-600
Small/label:  10–12px, font-weight 600–700, uppercase, tracking-widest
```

### Spacing rhythm
- Section padding: `py-24` (desktop), `py-16` (mobile)
- Section inner content: `max-w-6xl mx-auto px-6`
- Card gaps: `gap-5` or `gap-6`
- Between heading and body: `mt-4 mb-10`

### Component patterns

**Section label:**
```tsx
<p className="text-xs font-bold tracking-widest text-hmd-teal uppercase mb-4">
  The problem
</p>
```

**Primary button:**
```tsx
<a className="inline-flex items-center gap-2 bg-hmd-blue text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-hmd-blue/90 transition-all shadow-lg">
```

**Secondary button:**
```tsx
<a className="inline-flex items-center gap-2 border-2 border-gray-200 text-gray-700 font-semibold px-7 py-3.5 rounded-xl hover:border-gray-300 transition-all">
```

**Card:**
```tsx
<div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
```

**Dark card (for architecture section):**
```tsx
<div className="bg-white/5 rounded-2xl border border-white/10 p-6">
```

**Code block:**
```tsx
<pre className="bg-[#0D1117] text-green-400 rounded-xl p-5 text-sm font-mono leading-relaxed overflow-x-auto">
```

---

## Animation / interaction

Keep it minimal and CSS-only:

- `transition-all` on hover states for cards and buttons
- `scroll-behavior: smooth` on `<html>` element
- No JavaScript animations, no framer-motion, no GSAP
- Cards can have `hover:-translate-y-0.5` for subtle lift
- Nav links can have `hover:text-gray-900 transition-colors`

---

## Tailwind config additions

```js
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      'hmd-blue': '#0057B8',
      'hmd-teal': '#00A99D',
      'navy':     '#0A1B3D',
    },
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
    },
  },
}
```

---

## File structure

```
app/
  layout.tsx       — Inter font import, metadata, html/body
  page.tsx         — all sections in one file, kept readable
  globals.css      — Tailwind directives + smooth scroll
public/
  qr-code.png      — QR code image pointing to hmd-trustbridge.vercel.app
                     (generate at qr-code-generator.com, 400×400px)
tailwind.config.ts
next.config.ts
```

Keep everything in `app/page.tsx`. Do not split into component files — this is a single-page presentation, not an app.

---

## Deployment

1. `npx create-next-app@latest trustbridge-pitch --typescript --tailwind --app --no-src-dir`
2. Replace generated files with the implementation
3. `git init && git add . && git commit -m "init"`
4. `npx vercel` or push to GitHub and connect to Vercel dashboard
5. Domain: accept the auto-generated `.vercel.app` URL

No environment variables needed. No backend. No API routes.

---

## Content — exact copy to use

### Problem section stats
> "52% of children report being contacted online by strangers."  
> Source: HMD Better Phone Research 2024

> "1 in 3 parents say they felt underprepared when their child got their first smartphone."  
> Source: HMD Better Phone Research 2024

### Solution tagline
> "TrustBridge is the first QR-activated, concern-first digital safety advisor built for the moment parents actually make the decision."

### Architecture callout
> "The LLM never calculates the score. It only writes the explanation. This is intentional."

### Demo CTA
> "Try it now. No account. No install. 60 seconds."

---

## What NOT to do

- Do not add page transitions or complex animations
- Do not use a component library (Shadcn, Radix, etc.)
- Do not add a blog, CMS, or dynamic routes
- Do not use `use client` unless strictly needed (interactive nav toggle only)
- Do not add placeholder `Lorem ipsum` text — use the copy above
- Do not add more than one font family
- Do not make the dark architecture section anything other than navy — no gradients there
- Do not add cookie banners, analytics, or tracking of any kind

---

## Quality bar

Before deploying, verify:
- [ ] Lighthouse mobile performance > 90
- [ ] All sections visible and readable on iPhone SE (375px width)
- [ ] No horizontal scroll on mobile
- [ ] Nav anchor links scroll correctly to each section
- [ ] Live demo link opens `https://hmd-trustbridge.vercel.app` in a new tab
- [ ] TypeScript compiles with no errors (`npx tsc --noEmit`)
- [ ] Dark architecture section is readable (contrast ratio > 4.5:1)
