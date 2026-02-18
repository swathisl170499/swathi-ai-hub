# Swathi AI Hub — Portfolio Story

Hi! I’m **Lakshmi Swathi Sreedhar**.
This website is my AI engineering portfolio, but I designed it to feel more like an intelligent conversation than a static resume page.

Instead of just showing links, this site tells the story of:
- who I am as an AI engineer,
- what I’ve built in production,
- the impact those systems created,
- and how recruiters or collaborators can quickly explore the work that fits their need.

---

## What this page does (from a visitor point of view)

When someone lands on the homepage, they can:
1. **Understand my profile quickly** — role focus, strengths, and experience highlights.
2. **Open key links fast** — resume, GitHub, LinkedIn, and contact.
3. **Use the AI Concierge (Beta)** — ask natural questions like:
   - “What healthcare project did you build?”
   - “Show me your SQL project impact.”
   - “Summarize your resume in voice.”
4. **Hear a voice summary** — the page can narrate a concise resume summary using browser text-to-speech (female-preferred voice when available).

So this is not only a portfolio — it is a small **agentic experience** for recruiters.

---

## My build story (what I built and why)

I built this portfolio around one core idea:
**Recruiters should get answers instantly, not dig through sections manually.**

### 1) Conversational project explorer
The assistant maps user questions to the most relevant project(s) and responds with:
- what I built,
- the technical approach,
- and measurable impact.

Example behavior:
- A “healthcare” query surfaces the **Clinical RAG Copilot**.
- A “SQL” query surfaces the **Text2SQL Intelligence System**.
- A “robotics/autonomous” query surfaces the **TurtleBot** work.

### 2) Voice-enabled resume summary
Visitors can click a button to hear a spoken summary of my profile and experience.
- Uses browser `speechSynthesis`.
- Prefers female-sounding voices if available on that device.
- Falls back gracefully when such voices are unavailable.

### 3) Lightweight visitor intent tracking
Important interactions can be sent to a webhook so I can get notified when someone:
- opens the resume,
- clicks GitHub/LinkedIn,
- interacts with chat,
- triggers voice playback.

This helps turn passive portfolio traffic into actionable hiring signals.

---

## What someone can see on this website

- **Home (`index.html`)**
  - profile + positioning
  - AI Concierge section
  - voice summary controls
  - experience, skills, education, certifications, publications

- **Projects (`projects.html`)**
  - project cards with impact statements
  - links to GitHub repos

- **Blogs (`blogs.html`)**
  - writing and thought leadership content

- **Assets (`assets/`)**
  - resume PDF

---

## Automation / notifications setup

Tracking logic is in `agentic.js`.

1. Create a webhook endpoint (Zapier, Make, Pipedream, or your own backend).
2. Set your endpoint in `agentic.js`:

```js
const WEBHOOK_URL = "https://your-webhook-url";
```

3. Route events to notifications:
- `resume_opened`
- `assistant_message`
- `assistant_reply`
- `voice_resume_clicked`
- `voice_resume_started`
- `github_click`
- `linkedin_click`

---

## Important privacy note

This site can track **interaction intent**, but not guaranteed personal identity by default.

You can know:
- what was clicked,
- when it happened,
- what question was asked,
- basic browser metadata.

You cannot reliably know “exactly who” viewed resume content unless users self-identify via:
- form submit,
- email,
- login,
- or explicit consent flow.

---

## In one line

This portfolio showcases my AI engineering work as a **human-friendly, conversational, and measurable experience** — not just a static resume page.
