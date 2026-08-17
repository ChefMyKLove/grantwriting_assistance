# grants.chefmyklove — Design Spec

Date: 2026-08-17
Status: approved by user, ready for implementation planning

## 1. Purpose

A site that gets Michael Needham working as a grant writer, built around two offerings:

1. **The hook**: Canada Council for the Arts' Application Assistance program. Canada Council pays a support person (Michael) to help eligible artists complete grant applications, at no cost to the artist within covered hours. This is the primary conversion driver — it's free to the client, which is a rare and compelling offer.
2. **The broader business**: general grant-writing services (research + full application) on Michael's standard sliding scale, for people who don't qualify for CC Assistance or need help with other grants.

Design and copy lead with #1; #2 is the fallback path for anyone the hook doesn't cover.

## 2. Audience & tone

Primary audience: artists navigating disability self-identification and government grant forms — often anxious about bureaucracy, some with ADHD/attention differences, some Deaf/hard of hearing, some First Nations/Inuit/Métis facing cultural or geographic barriers.

Tone: **warm copy, precise structure.** The writing is empathetic and plain-spoken (acknowledges forms are genuinely hard, no jargon); the visual design and information architecture are clean and procedural. Reassurance comes from both competence and warmth, not one alone.

## 3. Brand identity

**Standalone identity** — does not carry the ChefMyKLove chef/kitchen persona or visual language. This audience responds better to a calmer aesthetic without the kitchen conceit. (Michael's chef-to-developer backstory, if included at all, lives in an "About/Why me" section as biography, not as the site's driving metaphor.)

**Direction: "Open Door."** A doorway/access visual motif stands in for the site's core promise — finding a way through paperwork that feels closed off. Warm, human, and explicitly moves away from the "official government form" aesthetic (stamps, carbon-copy paper) that was the initial draft's default, in favor of something that reduces anxiety rather than reminding visitors of bureaucracy.

## 4. Visual design system

**Palette:**
- Cream `#FAF3E7` (background), Card `#F3E9D8` (panels)
- Ink `#2B2620` (text), Sub `#5c5245` (secondary text)
- Terracotta `#C1663D` (primary accent/CTA), Moss `#6B7A5E` (doorway/secondary)
- Gold glow `rgba(224,158,90,0.55)` (light/warmth accents)

**Typography:**
- Display headlines: **Fraunces** (serif), large sizes only, where its character doesn't cost legibility
- Body/UI/labels: **Atkinson Hyperlegible** throughout (not Work Sans, not IBM Plex Mono) — purpose-built by the Braille Institute for low-vision readers, with strong disambiguation between similar characters (1/l/I, 6/8/9). Directly appropriate for this audience; reads warm rather than clinical.

**Doorway motif:** solid filled arch (not thin outline) — `border-radius: 50% 50% X% X% / Y% Y% X% X%` using percentage/slash syntax so the arch shape stays proportional at any size (hero-scale door vs. small per-category doors), not a fixed pixel radius.

## 5. Accessibility

**Baseline (always on, non-negotiable):**
- WCAG 2.2 AA contrast throughout
- Full keyboard operability, visible focus states
- Semantic landmarks, correct heading hierarchy, skip-to-content link
- Real form labels (not placeholder-only text), accessible error messaging
- `prefers-reduced-motion` respected everywhere — every animation/transition in this spec has a reduced-motion fallback that still delivers the content, just without the motion
- OS dark/light mode support
- 44px+ touch targets
- Layout reflows cleanly at 200% browser zoom

**On-page accessibility toolbar** — lives in the sticky nav (not a floating bottom-corner widget, which risks covering page content), collapsed by default, opens as a dropdown under a button labeled "Accessibility":
- Text size control (A− / A / A+)
- High-contrast mode toggle
- Reduce-motion toggle (independent of OS setting, for users who can't easily find that setting)
- Dyslexia-friendly font toggle

The toolbar's icon is a small key that visually turns (rotates) when the panel opens — ties the accessibility control into the doorway/key motif rather than reading as a bolted-on generic widget. All four preferences persist via `localStorage`.

## 6. Signature interactions

Calibrated deliberately lighter than the ChefMyKLove reference site's full physics playground — that maximalism suits a portfolio-flex audience; this audience may include people sensitive to excess motion (ADHD, vestibular issues), and the agreed tone is "calm and quietly authoritative," not playful spectacle. Two tiers of motion, kept distinct so the big moment stays special:

**Tier 1 — ambient, repeatable, low-key:**
- **Scroll-reveal doors**: each door in "Which door is yours" fades/rises into place via IntersectionObserver as it enters view, staggered ~130ms apart (same proven mechanic as the original draft's autofill-demo reveal).
- **Hinge-open on click**: clicking a door swings it open on a real hinge (CSS 3D `rotateY` on the door leaf, `transform-origin: left`, inside a `perspective`-bearing frame), with a warm light glow behind it. The category label fades out as it opens (so it doesn't overlap the revealed description) and the eligibility description fades in where the door used to be.
- **Numeral + tint differentiation**: each door carries a field number (01–04, echoing the "Field 1/2/3/4" numbering already used in the how-it-works section) and a subtly distinct warm-tint gradient — deliberately *not* pictorial category icons. A generic icon for "First Nations, Inuit, Métis" risks reducing several distinct peoples to a stereotyped symbol; numeral+tint sidesteps that risk for every category, not just that one, while still making the four doors visually distinct at rest.
- **Restrained tilt/glare on hover/tap**: a toned-down version of the ChefMyKLove bubble-tilt trick (~4° max, no drag physics) plus a glare highlight that tracks cursor position — tactile without becoming a toy.

**Tier 2 — one-time, deliberate, high-impact:**
- **Camera-swoop transition**: clicking the hero's primary CTA ("Find your way in") *or* the hero door graphic itself triggers: (1) the hero door swings open on its hinge (same mechanic as the small doors, larger scale), (2) ~200ms later, a warm-light iris (`clip-path: circle()`) expands from the door's actual on-screen position (not a fixed screen center) to fill the viewport — this is what sells "flying into the light of the door" rather than a generic wipe, (3) once fully covered, the page jump-scrolls to its destination hidden behind the flash, (4) the flash fades out to reveal the arrival.
- This transition is reused for two separate hops, each swooping from its own trigger element to its own destination — never straight from hero to the intake form, which would skip the eligibility check entirely:
  - Hero CTA/door → swoops to the "Which door is yours" section
  - A second CTA below the doors ("Start your application →") → swoops to the real intake form
- `prefers-reduced-motion`: both tiers collapse to instant state changes / instant scroll — no motion, but no missing content either.

## 7. Program accuracy (from Application Assistance.odt — authoritative source)

The initial draft's "how it works" and eligibility content did not fully match the real Canada Council process. Corrections locked into this spec:

**Eligibility — 4 categories, not 5:**
1. Deaf, hard of hearing, having a disability, or living with mental illness
2. First Nations, Inuit, or Métis facing language, geographic, or cultural barriers

(Presented as 4 doors for visual/copy purposes: Deaf/hard of hearing, Disability, Mental illness, First Nations/Inuit/Métis.) **Neurodivergence (ADHD etc.) is not a separate category** — the Disability and Mental illness door descriptions must each note that neurodivergent conditions qualify under them, so nobody self-excludes for not seeing an ADHD-specific option. No 5th "not sure, get in touch" door — considered and deliberately dropped to avoid inviting a flood of pre-qualification inquiries.

**Real process (replaces the simplified 4-step draft):**
1. **Self-ID form** — Portal → My Account → Self-ID. Required for eligibility. Private; only the client can complete it, and no third party (including Michael) can modify it.
2. **Request Application Assistance approval, per grant** — Portal → Help → "Log a Case," selecting "Application," with a free-text description (a suggested wording template exists). Canada Council reviews in **3–5 business days**. If approved, the client receives a **case number** — this is what Michael needs to invoice Canada Council for that grant. Once approved, eligibility itself doesn't need re-proving for future grants, but each new grant still needs its own case-number confirmation.
3. **Nominate Michael as third party (optional)** — only relevant if the client wants Michael to actually enter content into the application on the portal. Available only after the client has completed the application's basic info sections. Real limits that must be stated accurately: only one active third party at a time; a third party **cannot** see Account Info/Self-ID/Strategic Group Info/Applicant Profiles (stays private to the client); a third party **cannot submit** the application — the client always submits it themselves.

This content directly informs the backend case-tracking data model (§9) — `case_number` is a required field, not optional.

## 8. Page structure

1. **Hero** — eyebrow, headline, subhead, hero door graphic, primary CTA ("Find your way in"), secondary link ("How it works")
2. **Which door is yours** — 4 doors (§6, §7), scroll-revealed, hinge-open on click
3. **How it works** — the real 3-step process from §7, restyled to the Open Door palette, numbered fields
4. **Services & covered hours** — CC Assistance hour-cap table (Account setup ≤2hrs, Microgrants/travel ≤7hrs, Project grants ≤10hrs, Composite/long-term ≤17hrs, Progress & final reports ≤5hrs, Grant acceptance paperwork ≤2hrs — carried over from the original draft), plus general grant-writing service (sliding scale) as the path for people who don't qualify for CC funding
5. **Why me** — short credibility section. Flagged as the single biggest trust gap in the current draft (zero testimonials for grant-writing specifically, unlike ChefMyKLove's web-dev kudos) — needs real content from Michael (experience, track record, why he understands this program's mechanics) before launch. Content gap, not a design gap; this spec reserves the section, doesn't fabricate the copy.
6. **Start here** — the real intake form (name, email, grant type/deadline, project description, send) — reached via the Tier-2 swoop from the doors section
7. **Footer** — contact info, independence/non-affiliation disclaimer

## 9. Backend & tech architecture

**Scope for this build**: public site + lead/case tracking. Accounting/tax/invoicing is explicitly **out of scope** — deliberately deferred to a future, separately-scoped project once this system is live and generating real data, per the decomposition agreed at the start of this planning session. The data model below is structured so it's usable as an input to that future work (clean hours/dates/rates/case numbers), without building accounting features now.

**Hosting**: Vercel (not GitHub Pages — Pages can't run backend code, and this project needs it for both form handling and the admin view).

**Stack**: hand-written HTML/CSS/JS front end, zero framework, zero build step — consistent with every other site in Michael's stable (ChefMyKLove, kathleenyearwood.com, selinamartin.com). Backend is the one departure from "pure static": Vercel serverless functions + a small hosted database (Vercel Postgres or Turso) for the two things that genuinely need persistence.

**Data model:**
- `leads`: name, email, project description, submitted_at, status
- `cases`: linked to a lead — grant/funding opportunity name, hour-cap tier, hours_used, **case_number** (from Canada Council, required for invoicing per §7), deadline, submission_status

**Admin access**: a single password-gated page, not a public route, not linked from the public site nav. No client login of any kind — clients never need to see this. Michael-only.

## 10. Explicitly out of scope

- Accounting/tax/invoicing system (future project, informed by data collected here)
- Client-facing login/portal (clients interact only via the public intake form and, separately, Canada Council's own portal — never Michael's backend)
- SEO copywriting, testimonial content, and a referral/discoverability plan — all flagged during this session as more important to actually getting clients than any visual polish, but they're content/marketing work, not something this design spec builds. Recommended as immediate next steps after launch.
