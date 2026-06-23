// Inline-SVG-Platzhalter (Gradient + Besteck-Icon), falls ein Rezeptbild nicht lädt.
export const FALLBACK_IMAGE =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#FFF7ED"/><stop offset="100%" stop-color="#FFE4CC"/>
      </linearGradient></defs>
      <rect width="600" height="450" fill="url(#g)"/>
      <g fill="none" stroke="#F97316" stroke-width="6" stroke-linecap="round" transform="translate(270,180)">
        <path d="M5 0v40c0 6 5 11 11 11h22c6 0 11-5 11-11V0"/>
        <path d="M16 0v90"/>
        <path d="M55 60V0a25 25 0 0 0-25 25v25c0 6 5 11 11 11h14Zm0 0v30"/>
      </g>
    </svg>`,
  );

export function onImageError(event: Event): void {
  const el = event.target as HTMLImageElement;
  if (el.src !== FALLBACK_IMAGE) el.src = FALLBACK_IMAGE;
}
