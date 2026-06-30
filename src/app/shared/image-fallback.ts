// Inline SVG placeholder shown when a recipe image fails to load.
export const FALLBACK_IMAGE =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#FBF5EA"/>
          <stop offset="100%" stop-color="#F3EADC"/>
        </linearGradient>
      </defs>
      <rect width="600" height="450" fill="url(#g)"/>
      <circle cx="300" cy="214" r="68" fill="#C2674A" opacity=".08"/>
      <circle cx="300" cy="214" r="48" fill="none" stroke="#C2674A" stroke-width="3" opacity=".35"/>
      <g fill="none" stroke="#C2674A" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round" transform="translate(262,172)">
        <path d="M14 0v28c0 7 5 12 12 12h8c7 0 12-5 12-12V0"/>
        <line x1="26" y1="0" x2="26" y2="68"/>
        <path d="M62 44V0c-16 0-26 11-26 26v9c0 5 4 9 9 9h17Zm0 0v24"/>
      </g>
      <text x="300" y="318" text-anchor="middle" font-family="Georgia,serif" font-size="13"
            fill="#C2674A" opacity=".5" letter-spacing="2">NO IMAGE</text>
    </svg>`,
  );

export function onImageError(event: Event): void {
  const el = event.target as HTMLImageElement;
  if (el.src !== FALLBACK_IMAGE) el.src = FALLBACK_IMAGE;
}
