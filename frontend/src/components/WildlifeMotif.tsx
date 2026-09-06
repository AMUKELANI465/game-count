/**
 * Original, license-free decorative backdrop: simplified silhouettes of the
 * four supported species, scattered at low opacity. Purely typographic/flat
 * shapes (no traced or copied artwork) so it stays safe to ship indefinitely.
 */
export default function WildlifeMotif({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 1200 400"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {/* elephant */}
      <g transform="translate(60 150)" fill="currentColor">
        <ellipse cx="70" cy="70" rx="62" ry="42" />
        <circle cx="118" cy="42" r="30" />
        <path d="M140 40c10 4 14 16 10 30-3 10-11 16-19 18 6-10 9-20 9-30 0-7-1-13 0-18z" />
        <path d="M96 58c-6 14-6 30 2 46 3 6-4 10-8 5-10-13-11-34-3-51z" />
        <rect x="40" y="98" width="14" height="34" rx="6" />
        <rect x="68" y="100" width="14" height="36" rx="6" />
        <rect x="96" y="98" width="14" height="34" rx="6" />
      </g>

      {/* giraffe */}
      <g transform="translate(320 40)" fill="currentColor">
        <rect x="30" y="0" width="20" height="150" rx="10" transform="rotate(8 40 0)" />
        <circle cx="55" cy="8" r="16" />
        <ellipse cx="46" cy="190" rx="46" ry="36" />
        <rect x="18" y="220" width="12" height="46" rx="5" />
        <rect x="66" y="222" width="12" height="46" rx="5" />
        <circle cx="47" cy="-6" r="3" />
        <circle cx="63" cy="-6" r="3" />
      </g>

      {/* impala / antelope, leaping */}
      <g transform="translate(560 220)" fill="currentColor">
        <ellipse cx="60" cy="30" rx="50" ry="22" transform="rotate(-12 60 30)" />
        <circle cx="108" cy="10" r="14" />
        <path d="M112 -2c4-10 12-16 20-16-2 8-8 14-16 18z" />
        <path d="M118 -4c6-8 15-12 23-10-4 7-12 12-20 14z" />
        <rect x="18" y="34" width="10" height="38" rx="4" transform="rotate(20 18 34)" />
        <rect x="86" y="42" width="10" height="34" rx="4" transform="rotate(-25 86 42)" />
      </g>

      {/* second elephant, smaller, further right */}
      <g transform="translate(900 190) scale(0.7)" fill="currentColor">
        <ellipse cx="70" cy="70" rx="62" ry="42" />
        <circle cx="118" cy="42" r="30" />
        <path d="M140 40c10 4 14 16 10 30-3 10-11 16-19 18 6-10 9-20 9-30 0-7-1-13 0-18z" />
        <rect x="40" y="98" width="14" height="34" rx="6" />
        <rect x="68" y="100" width="14" height="36" rx="6" />
        <rect x="96" y="98" width="14" height="34" rx="6" />
      </g>

      {/* second impala, smaller, upper right */}
      <g transform="translate(1000 40) scale(0.65)" fill="currentColor">
        <ellipse cx="60" cy="30" rx="50" ry="22" transform="rotate(-12 60 30)" />
        <circle cx="108" cy="10" r="14" />
        <path d="M112 -2c4-10 12-16 20-16-2 8-8 14-16 18z" />
        <rect x="18" y="34" width="10" height="38" rx="4" transform="rotate(20 18 34)" />
        <rect x="86" y="42" width="10" height="34" rx="4" transform="rotate(-25 86 42)" />
      </g>
    </svg>
  );
}
