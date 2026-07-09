# Tasks: Add Getting Started Videos to Documentation

## 1. Add video tutorials to README.md

- [x] 1.1 Add a "Video tutorials" subsection at the top of the "# Getting started" section: a two-column table with clickable YouTube thumbnails (`https://img.youtube.com/vi/YQ6GUTLWTQw/hqdefault.jpg` → `https://youtu.be/YQ6GUTLWTQw`; `https://img.youtube.com/vi/c0OwT7mpoNc/hqdefault.jpg` → `https://youtu.be/c0OwT7mpoNc`) and visible titles "Part 1 — Build a Simple Program with AI" / "Part 2 — Multi-File Projects and Dependencies"
- [x] 1.2 Verify both thumbnail URLs resolve (HTTP 200) and both video links open the correct videos

## 2. Clean up duplicated README section

- [x] 2.1 Merge the two "No API key? Use your favorite AI chat" sections (README.md lines ~36–56) into a single `###` subsection under "## Bring your own AI model" that contains both the `svi run -c` command and the 3-step copy/paste workflow

## 3. Remove README2.md

- [x] 3.1 Grep the repository for "README2" to confirm nothing references it (excluding this change's artifacts)
- [x] 3.2 Delete `README2.md` (analysis confirmed nothing worth merging; its unique "eliminate copy-paste" bullet contradicts the current chat-mode messaging)

## 4. Verify rendering

- [x] 4.1 Preview README.md rendering (VS Code Markdown preview or `gh` render) to confirm the table layout, thumbnails, headings, and that the "No API key" heading appears exactly once
