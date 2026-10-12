# Critly

Design engineering concepts for people building with AI agents, live at
[critly.vercel.app](https://critly.vercel.app). Each concept is one idea with a
rule, real numbers and an interactive demo, and the same concepts ship as
agent skills, so your agent builds, reviews and audits with them.

```bash
npx skills add kausthubh-coder/craft -g   # install for all your agents
npx skills update -g                     # pull the latest concepts later
```

- `skills/critly`: build and review with the concepts (generated from `content/`)
- `skills/critly-audit`: a top-down audit of a whole app

## Credit

Critly began as a fork of [Craft](https://github.com/gustavo-fior/craft) by
[Gustavo Fior](https://gustavofior.com). He built the site, its design
language, the demo framework, the skill generator and the first concepts.
Critly completes the concepts that were still coming soon and adds the
Interaction and Content sections, the newer motion and performance concepts,
and the review and audit skills. See [NOTICE.md](NOTICE.md).

## Stack

- [Next.js](https://nextjs.org) (App Router, fully static) + Tailwind CSS v4
- [Content Collections](https://content-collections.dev) for typed MDX
- [Base UI](https://base-ui.com)-based components, [motion](https://motion.dev), [next-themes](https://github.com/pacocoursey/next-themes)
- [@web-kits/audio](https://audio.raphaelsalaja.com) for synthesized interface sounds
- Fonts: [Inter](https://rsms.me/inter/), JetBrains Mono

## Development

```bash
bun install
bun dev
```

Add a concept by dropping an `.mdx` file into `content/<section>/` with
`title`, `description`, `section`, `order`, and `publishedAt` frontmatter.
Interactive demos live in `src/components/demos` and are registered in
`src/components/app/mdx.tsx`. Add the slug to `src/lib/concepts.ts` to publish
it, then run `bun run build:skill` to regenerate the skill.

## License

MIT, see [LICENSE](LICENSE). Fonts keep their own licenses (Inter and
JetBrains Mono are SIL OFL).
