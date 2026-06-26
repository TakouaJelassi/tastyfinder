// Inline-SVG-Platzhalter (Gradient + Besteck-Icon), falls ein Rezeptbild nicht lädt.
export const FALLBACK_IMAGE =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#182A1C"/><stop offset="62%" stop-color="#111F15"/><stop offset="100%" stop-color="#08130B"/>
      </linearGradient></defs>
      <rect width="600" height="450" fill="url(#g)"/>
      <circle cx="300" cy="222" r="54" fill="#F47D4F" opacity=".12"/>
      <g fill="none" stroke="#F47D4F" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" transform="translate(256,170)">
        <path d="M22 0v44c0 10 8 18 18 18h10c10 0 18-8 18-18V0"/>
        <path d="M40 0v102"/>
        <path d="M92 66V0c-23 0-38 17-38 39v14c0 7 6 13 13 13h25Zm0 0v36"/>
      </g>
    </svg>`,
  );

export function onImageError(event: Event): void {
  const el = event.target as HTMLImageElement;
  if (el.src !== FALLBACK_IMAGE) el.src = FALLBACK_IMAGE;
}
