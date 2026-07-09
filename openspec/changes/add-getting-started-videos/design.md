# Design: Add Getting Started Videos to Documentation

## Context

`README.md` is the project's GitHub landing page. Two YouTube tutorials exist but are not referenced anywhere in the repo:

- Part 1 — Build a Simple Program with AI: `https://youtu.be/YQ6GUTLWTQw` (video ID `YQ6GUTLWTQw`)
- Part 2 — Multi-File Projects and Dependencies: `https://youtu.be/c0OwT7mpoNc` (video ID `c0OwT7mpoNc`)

`README2.md` is an outdated earlier draft of `README.md` (pre-dates `.svi.md` support, chat mode `-c`, and the provider list). `README.md` also contains an accidental duplication: "No API key? Use your favorite AI chat" appears twice (as `###` at line 36 and as `##` at line 46) with overlapping content.

## Goals / Non-Goals

**Goals:**

- Make the video tutorials discoverable on the GitHub front page, rendered attractively.
- Remove `README2.md` without losing anything of value.
- Clean up the duplicated README section touched while editing.

**Non-Goals:**

- No restructuring of the rest of README.md or the `docs/` tree.
- No hosting of video assets in the repo (thumbnails come from YouTube's image CDN).
- No changes to code, CLI output, or package metadata.

## Decisions

1. **Presentation: clickable YouTube thumbnails, side by side.** GitHub Markdown cannot embed video players, so the established pattern is an image linked to the video: `[![title](https://img.youtube.com/vi/<id>/hqdefault.jpg)](https://youtu.be/<id>)`. Use a two-column Markdown table so Part 1 and Part 2 sit side by side with captions underneath. Alternatives considered: plain text links (less visible, "do it good" asks for more), GIF previews stored in `images/` (repo bloat, maintenance), `maxresdefault.jpg` thumbnails (not generated for every video — `hqdefault.jpg` always exists, so it is the safe choice).

2. **Placement: a "Video tutorials" subsection at the top of "# Getting started".** Viewers looking for onboarding land there, and the section titles ("Getting Started - Part 1/2") match the README section name. A pointer is enough elsewhere; we avoid pushing the core value proposition below the fold at the top of the README.

3. **Clean URLs.** Strip the `?si=` share-tracking parameter from the Part 2 link; use canonical `https://youtu.be/<id>` form for both.

4. **Delete `README2.md` outright, merging nothing.** Line-by-line comparison shows it is a strict-older draft: every section exists in `README.md` in newer form. Its only unique wording — the "Eliminate copy-paste between chat and your codebase" benefit bullet — contradicts the current README, which now presents the copy/paste chat workflow (`svi run -c`) as a supported feature. Before deleting, grep the repo for references to `README2` to confirm nothing links to it.

5. **Fix the duplicated "No API key?" section by merging into one.** Keep a single `###` subsection under "## Bring your own AI model" containing both the `svi run -c` command and the 3-step copy/paste explanation, deleting the stray second `##` copy.

## Risks / Trade-offs

- [YouTube thumbnail URLs could break if YouTube changes its image CDN] → Low probability; the `img.youtube.com/vi/` pattern has been stable for over a decade, and the links themselves still work even if a thumbnail fails to render.
- [Video titles or URLs may change on YouTube] → Links are plain data in one README section; trivial to update.
- [README2.md might be referenced by external links] → It was never a published entry point (npm and GitHub render README.md); grep confirms no internal references before deletion.

## Open Questions

None — the Part 2 URL was confirmed by the author.
