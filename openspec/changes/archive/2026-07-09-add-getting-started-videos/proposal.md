# Add Getting Started Videos to Documentation

## Why

Two "SVI Getting Started" video tutorials now exist on YouTube, but the README does not mention them — new visitors on GitHub miss the easiest onboarding path. Additionally, the repository contains `README2.md`, an outdated earlier draft of `README.md` that adds noise and risks confusing contributors, and `README.md` itself contains a duplicated "No API key? Use your favorite AI chat" section.

## What Changes

- Add a "Video Tutorials" presence to `README.md`, visible near the Getting Started content, linking to:
  - Part 1 — Build a Simple Program with AI: https://youtu.be/YQ6GUTLWTQw
  - Part 2 — Multi-File Projects and Dependencies: https://youtu.be/c0OwT7mpoNc
- Present the videos in a GitHub-friendly way (clickable YouTube thumbnails, since GitHub Markdown cannot embed players).
- Delete `README2.md`. Analysis confirmed it is an older draft of `README.md`; the only wording not already covered ("Eliminate copy-paste between chat and your codebase" benefit bullet) is folded into `README.md` if judged useful.
- Fix the duplicated "No API key? Use your favorite AI chat" section in `README.md` (currently appears twice, lines 36–56).

## Capabilities

### New Capabilities

- `getting-started-videos`: The project README presents the Getting Started video tutorials in a discoverable, GitHub-rendered-friendly way, and the repository keeps a single canonical README.

### Modified Capabilities

(none — no existing specs)

## Impact

- `README.md` — new video section, duplicate section removed, possible one-bullet merge from README2.
- `README2.md` — deleted.
- No code, package, or API changes; documentation only.
