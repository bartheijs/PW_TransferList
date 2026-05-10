# Coding Guidelines

- This project's programming language are react, javascript and typescript
- Consider using early returns patterns
- Always add JSDoc documentation in english when creating new functions and classes
- Add comments to explain the code in english
- Add logging in english using consistent and clear messages; import `LOG_PREFIX` from `src/constants.ts` and use it as the first argument in every `console.warn` / `console.error` call (e.g. `console.warn(LOG_PREFIX, "message")`)
- Filenames are always descriptive and in english.
- Only use console.warn or console.error
- Always use the DRY coding concept
- Use functional and declarative programming patterns; NEVER use classes.
- Prefer iteration and modularization over code duplication.
- Use TypeScript for all code; prefer interfaces over types.
- Use functional components with TypeScript interfaces.
- Use declarative JSX.
- Use Prettier for consistent code formatting.
- Ensure high accessibility (a11y) standards using ARIA roles and accessibility props.
- NEVER edit the typings in the typings/*.d.ts file. This is handled in the "npm start" command.
- place hard coded values in capitalized constants on top of the file.
- Property `<caption>` text in './src/*.xml' can be max 24 characters (longer ones are not readable in Mendix Studio Pro UI). Exception: `type="widgets"` properties are not subject to this limit.
