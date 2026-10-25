# Khant Aung — personal portfolio

A one-page portfolio built with the existing React, TypeScript, and Vite setup, using plain CSS and a dark palette.

```sh
npm install
npm run dev
npm run build
npm run preview
```

## Edit content

All portfolio copy, navigation, links, education, experience, projects, player information, and four highlight slots live in **`src/portfolio.ts`**. The page title and description are also read from this file.

The `name` constant is shared by the hero, player card, footer, and page metadata.

- Keep unknown values as `null`. The page shows a labelled placeholder without creating a fake link.
- Add experience or education by adding another object to the relevant array.
- Fill a project’s `title`, `description`, `tags`, and `links` to replace its placeholder.
- Add the FACEIT and Leetify URLs and player handle in `gaming`.
- For highlights, set `title`, `description`, `href`, and optionally `poster`. A supplied URL makes the whole clip card a real link. Put your local media in `public/clips/` and use paths like `/clips/highlight-01.mp4`.

## Artwork — next step

The hero reserves most of its width for an explicitly labelled **artwork placeholder**. The future pixel-art scene will include its own waves; no separate wave decoration is included. No Pikachu assets or animation are included yet. The reserved `<figure className="artwork-stage">` in `src/App.tsx` is the insertion point for the future interactive pixel-art component. `hero.artwork.src` also supports a static asset when ready.

## Styling and fonts

- `src/index.css`: reset, colour tokens, self-hosted font faces.
- `src/App.css`: layout and responsive styles.
- Section headings, the name, and header/footer use **Departure Mono**. Body text and titles within content blocks use **IBM Plex Mono**.
- Font files are bundled locally, with their SIL Open Font Licences in `src/assets/fonts/`.
- Fonts: [Departure Mono](https://departuremono.com/) by Helena Zhang; [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono) by IBM.

Run the commands above from this directory. The production output is `dist/`.
