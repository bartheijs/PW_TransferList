# GEMINI.md

This file provides guidance to Gemini (Antigravity) coding agents when working with code in this repository.

## Project Overview

This is a Mendix Pluggable Widget (`TransferList`) that allows Mendix app users to transfer objects from one list to another.

- **Package path:** `conclusion low code company.transferlist`
- **Supported platform:** Web only
- **Tooling:** `@mendix/pluggable-widgets-tools` v10.15.0
- **Primary stack:** React, TypeScript, Vanilla CSS (Atlas-compatible styles in `src/ui/TransferList.css`)

## Project Structure & Module Organization

- `src/TransferList.tsx`: Main runtime component and interaction state.
- `src/components/`: Panel, item, and transfer-control components.
- `src/utils/`: Action execution and client-side filtering helpers.
- `src/ui/TransferList.css`: Atlas-compatible widget styles.
- `src/TransferList.xml`: Studio Pro property contract.
- `src/TransferList.editorConfig.ts` and `src/TransferList.editorPreview.tsx`: Studio Pro configuration and canvas preview.
- `typings/TransferListProps.d.ts`: Generated automatically from the XML; **never edit manually**.
- `FunctionalTest.md`: Manual functional test suite.
- `backlog/backlog.md`: Source of truth for requested and planned backlog work.
- `backlog/`: Additional feature plans and implementation notes.
- `MX_PW_WEB_CODING_GUIDELINES.md`: Source of truth for coding conventions.

## Build, Test, and Development Commands

Before running command-line tasks, use the `run_command` tool. If the user denies or restricts permissions, ask/clarify or focus on the code generation and editing.

```powershell
# Install dependencies
npm install --legacy-peer-deps

# Start web development server with hot reload
npm run dev

# Build and copy changes to the Mendix test project automatically
npm start

# Create a development build
npm run build

# Run ESLint and formatting checks
npm run lint

# Apply supported lint and formatting fixes
npm run lint:fix

# Lint and create a production release
npm run release
```

*Note: No automated test runner is configured. Execute the relevant scenarios in `FunctionalTest.md` after behavioral or property changes.*

## Coding Style & Naming Conventions

Always adhere to [MX_PW_WEB_CODING_GUIDELINES.md](file:///C:/Mendix/PW_TransferList-main/PluggableWidgets/PW_TransferList/MX_PW_WEB_CODING_GUIDELINES.md).

- **Frameworks:** React, TypeScript, and functional components. **Never use classes.**
- **Indentation:** Use 4-space indentation and Prettier formatting.
- **Naming:** CamelCase for functions and variables. Constants belong in `src/constants.ts` using `UPPER_SNAKE_CASE`.
- **Indication of selection:** Rename internal state sets (e.g. `leftChecked`) to prevent name collisions with Mendix selection properties (`leftSelection`).
- **JSDoc/Comments:** Add concise English JSDoc for new functions and comments where logic is complex.
- **Logging:** Use only `console.warn` or `console.error` with `LOG_PREFIX` (from `src/constants.ts`) as the first argument:
  ```typescript
  console.warn(LOG_PREFIX, "Your message here");
  ```
- **Accessibility:** Use correct ARIA roles (`listbox`, `option`, `status`), keyboard focus handlers, and labels to preserve accessibility.
- **Captions in XML:** Mendix XML property captions must be at most 24 characters (exception: `type="widgets"` captions).

## Workspace Skills for Gemini

Use these specialized skills when modifying or reviewing their corresponding components:
- [clcc-pw-lists](file:///C:/Mendix/PW_TransferList-main/PluggableWidgets/PW_TransferList/.agents/skills/clcc-pw-lists/SKILL.md): Linked properties, pagination, sorting, filtering, selection, `ListValue`, and `ObjectItem` APIs.
- [clcc-pw-property-types](file:///C:/Mendix/PW_TransferList-main/PluggableWidgets/PW_TransferList/.agents/skills/clcc-pw-property-types/SKILL.md): XML properties mapping to TypeScript props (e.g. `selection`, `datasource`, `widgets`).
- [clcc-pw-xml](file:///C:/Mendix/PW_TransferList-main/PluggableWidgets/PW_TransferList/.agents/skills/clcc-pw-xml/SKILL.md): Pluggable widget XML definition layout guidelines.

## Code Editing & Tool Best Practices

1. **Precision Edits:** Use `replace_file_content` for single contiguous edits and `multi_replace_file_content` for multiple non-contiguous edits in the same file. Avoid replacing whole files as it is expensive and error-prone.
2. **Path Scheme:** Always use lowercase `file:///` schemes with forward slashes for clickable links when referencing files (e.g. `[filename](file:///C:/absolute/path/to/file)`).
3. **Verify Codegen:** After modifying `src/TransferList.xml`, execute `npm run build` or `npm start` (if allowed) to regenerate `typings/TransferListProps.d.ts` before modifying React code to avoid TS compile-time errors.
