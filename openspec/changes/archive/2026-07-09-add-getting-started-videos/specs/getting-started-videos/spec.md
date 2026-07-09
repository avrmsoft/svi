# getting-started-videos

## ADDED Requirements

### Requirement: README presents the Getting Started video tutorials
`README.md` SHALL contain a "Video tutorials" subsection at the top of the "Getting started" section that links to both Getting Started videos: Part 1 "Build a Simple Program with AI" (`https://youtu.be/YQ6GUTLWTQw`) and Part 2 "Multi-File Projects and Dependencies" (`https://youtu.be/c0OwT7mpoNc`). Each video MUST be rendered as a clickable YouTube thumbnail image (`https://img.youtube.com/vi/<id>/hqdefault.jpg`) with a visible title, and video URLs MUST be in canonical form without tracking parameters.

#### Scenario: Visitor discovers the videos on GitHub
- **WHEN** a visitor views the repository's README on GitHub and scrolls to "Getting started"
- **THEN** they see two labeled video thumbnails (Part 1 and Part 2) that open the corresponding YouTube videos when clicked

#### Scenario: Thumbnails render without repo-hosted assets
- **WHEN** GitHub renders the video subsection
- **THEN** thumbnail images load from YouTube's image CDN and no video assets exist inside the repository

### Requirement: Repository keeps a single canonical README
The repository SHALL contain exactly one top-level README (`README.md`). `README2.md` MUST be removed, and no file in the repository may reference it. The "No API key? Use your favorite AI chat" content in `README.md` MUST appear exactly once.

#### Scenario: README2 is gone and unreferenced
- **WHEN** the change is applied
- **THEN** `README2.md` does not exist and a repository-wide search for "README2" returns no matches

#### Scenario: Duplicate section is merged
- **WHEN** a reader scans `README.md`
- **THEN** the "No API key? Use your favorite AI chat" heading appears once, containing both the `svi run -c` command and the copy/paste workflow steps
