<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Critly checks itself

- UI work: use the `critly` skill. Read `.critly/policy.json` before choosing spacing, type or color, use only its values, and never edit it to pass.
- After any UI change, run `bun run lint:ui` (with the dev server on :3000) and fix every error until it exits 0. Exit 2 means it couldn't run; say so, it is not a pass. Then run `bun run taste:ui`, open the squint and overlay images for each changed screen, and fix each look or say why the screen needs it before saying it's done.
