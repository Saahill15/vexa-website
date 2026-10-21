# VEXA Digital website

Next.js (App Router) + React + TypeScript. Pages are statically prerendered.

| Page | File |
| --- | --- |
| Home | `app/page.tsx` |
| Services | `app/services/page.tsx` |
| About | `app/about/page.tsx` |
| Contact | `app/contact/page.tsx` |
| Articles | `app/articles/page.tsx`, `app/articles/[slug]/page.tsx` |
| Log in / Sign up (placeholders) | `app/login/page.tsx`, `app/signup/page.tsx` |

## Structure

- `app/layout.tsx` – root layout (fonts, header, footer, custom cursor)
- `app/globals.css` – the design system and all styles
- `components/` – `Header`, `Footer`, `Cta`, `Button`, `Reveal`, `Split`, `Pointer` and the `ContactForm`
- `content/articles.ts` – the articles (placeholder text; add or edit articles here)
- `lib/session.ts` – who is signed in (see Articles below)
- `lib/site.ts` – email, address and links in one place
- `lib/motion.ts` – scroll-reveal and motion-preference helpers
- `public/img/` – logos

## Run locally

Requires Node.js 22.

```sh
npm install
npm run dev      # http://localhost:3310 is configured in .claude/launch.json; default is :3000
npm run build    # production build and type-check
npm start        # serve the production build
```

## Contact form

There is no backend yet. On the last step the form opens a ready-written email to partnerships@vexadigital.in in the visitor's email app, with a copy button as a fallback. To receive submissions directly, add an API route or a form service later.

## Articles

- Anyone can read the opening of an article (`previewBlocks` in `content/articles.ts`). After that, signed-out readers see a log in / sign up wall. The server only sends the full text to signed-in readers, so it is not just hidden with CSS.
- Comments are visible to everyone, but posting requires being signed in.
- **There is no account system yet.** `lib/session.ts` always reports "signed out" in production, and `/login` and `/signup` are placeholders. When real authentication is added, replace `getSession()` and the placeholder pages.
- **Reviewing the signed-in view in development:** open `/signup` (or click Sign up in the gate) and choose "Continue as a preview reader". This sets a development-only cookie; it does nothing in production.
- **Comments are stored in the browser's localStorage for now.** `components/Comments.tsx` has `load` and `save` functions to swap for API calls once there is a database.
