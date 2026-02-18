# Swathi AI Hub Portfolio

This is a static portfolio site with:
- profile + experience
- projects and blogs pages
- resume link
- lightweight **agentic concierge** (rule-based conversational assistant)
- voice resume summary using browser Text-to-Speech
- event tracking hooks so you can get notified when visitors interact with key actions

## Make the website "agentic"

The homepage AI Concierge can:
- answer recruiter/visitor questions conversationally
- explain your top projects in plain business impact language
- speak a short resume summary with a voice button
- fire interaction events (`page_view`, `resume_opened`, `assistant_message`, `voice_resume_started`, etc.)

## Get notified when someone clicks/interacts

Tracking logic is in `agentic.js`.

1. Create a webhook endpoint in one of these:
   - Zapier Catch Hook
   - Make.com webhook
   - Pipedream HTTP trigger
   - your own backend endpoint

2. Open `agentic.js` and set:

```js
const WEBHOOK_URL = "https://your-webhook-url";
```

3. In your automation flow, map events to notifications:
   - `resume_opened` -> send email or Slack ping
   - `assistant_message` -> log visitor questions for analytics
   - `voice_resume_clicked` / `voice_resume_started` -> high-intent signal
   - `github_click` / `linkedin_click` -> lead-interest signal

## Voice agent behavior

- Uses the browser Web Speech API (`speechSynthesis`) for resume narration.
- Works best in Chromium-based browsers.
- If voice is unavailable, concierge still works in text mode.

## Important privacy note

On a normal static website, you **cannot know exactly who viewed your resume** unless they identify themselves (e.g., submit a form, send email, sign in, or provide contact details).

What you *can* track:
- anonymous interaction events
- timestamp + page + click intent
- rough device/browser metadata

To identify users, add an explicit form or gated resume flow with consent.
