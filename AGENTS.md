# AGENTS Instructions for meh-trics Repository

This project contains a wellness tracking app built with Encore (backend) and React + Vite (frontend). These guidelines apply to the entire repository.

## General Practices
- Use modern TypeScript throughout the codebase.
- Keep functions and variables typed; avoid using `any`.
- When backend endpoints change, regenerate the frontend client:
  ```bash
  cd backend
  encore gen client --target leap
  ```
- Keep documentation up to date in `README.md` whenever new features or commands are added.

## Checks Before Commit
1. Format and lint the repository:
   ```bash
   bun x biome format .
   bun x biome check .
   ```
2. Run all tests:
   ```bash
   bun run test
   ```
3. Commit only after tests pass and formatting issues are resolved.

