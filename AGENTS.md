# Repository Guidelines

## Project Structure & Module Organization

This repository contains a Mendix web pluggable widget built with React and TypeScript.

- `src/TransferList.tsx`: main runtime component and interaction state.
- `src/components/`: panel, item, and transfer-control components.
- `src/utils/`: action execution and client-side filtering helpers.
- `src/ui/TransferList.css`: Atlas-compatible widget styles.
- `src/TransferList.xml`: Studio Pro property contract.
- `src/TransferList.editorConfig.ts` and `src/TransferList.editorPreview.tsx`: Studio Pro configuration and preview.
- `typings/TransferListProps.d.ts`: generated from the XML; never edit manually.
- `FunctionalTest.md`: manual functional test suite.
- `backlog/backlog.md`: source of truth for requested and planned backlog work.
- `backlog/`: additional feature plans and implementation notes.
- `MX_PW_WEB_CODING_GUIDELINES.md`: source of truth for coding conventions.

Keep end-user behavior and configuration documentation current in `README.md`.

Before planning or implementing feature work, review `backlog/backlog.md` for related requirements, constraints, and dependencies. Update it when requested backlog notes are added, removed, or materially changed. Read any linked feature-plan document before implementing that feature.

## Build, Test, and Development Commands

```bash
npm install --legacy-peer-deps  # Install dependencies
npm run dev                     # Start web development server with hot reload
npm start                       # Build and copy changes to the configured Mendix project
npm run build                   # Create a development build
npm run lint                    # Run ESLint and formatting checks
npm run lint:fix                # Apply supported lint and formatting fixes
npm run release                 # Lint and create a production release
```

No automated test runner is configured. Execute the relevant scenarios in `FunctionalTest.md` after behavioral or Studio Pro property changes.

## Coding Style & Naming Conventions

Read and follow `MX_PW_WEB_CODING_GUIDELINES.md` before editing source code. When this guide and another repository document disagree on coding style, that file takes precedence.

Use TypeScript, functional React components, declarative JSX, and early returns. Prefer interfaces over type aliases where practical. Use four-space indentation and Prettier formatting.

Use descriptive English filenames and camelCase identifiers; constants belong in `src/constants.ts` using `UPPER_SNAKE_CASE`. Add concise English JSDoc for new functions and comments only where behavior is not self-explanatory.

Use only `console.warn` or `console.error`, with `LOG_PREFIX` as the first argument. Preserve accessibility through keyboard handling, ARIA roles, and labels. Mendix XML property captions must be at most 24 characters, except `type="widgets"` captions.

## Architecture & Testing Notes

The widget renders two independent datasources. Moves call `onAdd` or `onRemove` once per item; configured Mendix actions must persist changes and refresh both datasources. Search filters only already-loaded items.

Test affected interaction modes, datasource refresh behavior, search, accessibility, and Studio Pro property visibility. For UI changes, include before/after screenshots in the pull request.

## Commit & Pull Request Guidelines

Follow the existing short, imperative style, optionally scoped, such as `Backlog: add clear selection button`. Keep commits focused. Pull requests should explain behavior changes, link relevant issues, list manual test scenarios, include screenshots for visual changes, and pass `npm run lint`.
