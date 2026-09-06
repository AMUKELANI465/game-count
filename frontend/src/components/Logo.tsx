/**
 * Original GameCount mark: a paw print framed by detection-viewfinder
 * corners, standing in for "AI detects wildlife". Renders in currentColor
 * so it can sit on either a dark badge (white) or plain text (inherited).
 */
export default function Logo({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M2.5 6V2.5H6M18 2.5h3.5V6M2.5 18v3.5H6M21.5 18v3.5H18"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <ellipse cx="12" cy="15.2" rx="4.6" ry="3.6" fill="currentColor" />
      <circle cx="7.4" cy="8.6" r="2.15" fill="currentColor" />
      <circle cx="12" cy="6.6" r="2.35" fill="currentColor" />
      <circle cx="16.6" cy="8.6" r="2.15" fill="currentColor" />
    </svg>
  );
}
