// Inline SVG placeholder shown when a recipe image fails to load.
export const FALLBACK_IMAGE =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#FFF8EE"/>
          <stop offset="52%" stop-color="#F3EADC"/>
          <stop offset="100%" stop-color="#DFC7AC"/>
        </linearGradient>
        <radialGradient id="plate" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stop-color="#FFFDF7"/>
          <stop offset="100%" stop-color="#E9D7BF"/>
        </radialGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#5F4630" flood-opacity=".2"/>
        </filter>
      </defs>
      <rect width="600" height="450" fill="url(#bg)"/>
      <circle cx="112" cy="86" r="72" fill="#91B681" opacity=".18"/>
      <circle cx="508" cy="358" r="96" fill="#F47D4F" opacity=".14"/>
      <g filter="url(#shadow)">
        <ellipse cx="300" cy="236" rx="154" ry="118" fill="url(#plate)"/>
        <ellipse cx="300" cy="236" rx="104" ry="76" fill="#F7E6C8"/>
        <path d="M230 236c28-44 83-58 126-20 30 27 22 76-18 92-48 19-114-13-108-72Z" fill="#D67945"/>
        <circle cx="278" cy="218" r="18" fill="#7EA766"/>
        <circle cx="330" cy="246" r="20" fill="#F4B657"/>
        <circle cx="356" cy="214" r="13" fill="#C95D45"/>
        <path d="M248 270c42 22 94 24 137 2" fill="none" stroke="#7A4F2A" stroke-width="8" stroke-linecap="round" opacity=".35"/>
      </g>
      <path d="M120 346c35-26 71-31 110-14" fill="none" stroke="#5F7D54" stroke-width="8" stroke-linecap="round" opacity=".45"/>
      <path d="M392 112c33 13 61 37 78 70" fill="none" stroke="#C2674A" stroke-width="8" stroke-linecap="round" opacity=".35"/>
    </svg>`,
  );

export function onImageError(event: Event): void {
  const el = event.target as HTMLImageElement;
  if (el.src !== FALLBACK_IMAGE) el.src = FALLBACK_IMAGE;
}
