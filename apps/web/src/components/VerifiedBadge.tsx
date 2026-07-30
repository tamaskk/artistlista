/** Kék pipa — hivatalos, ellenőrzött előadó-profil. */
export function VerifiedBadge({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <span
      title="Ellenőrzött előadó"
      aria-label="Ellenőrzött előadó"
      className={`inline-flex shrink-0 ${className}`}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 1.5l2.6 1.9 3.2-.2 1 3 2.7 1.7-1 3 1 3-2.7 1.7-1 3-3.2-.2L12 22.5l-2.6-1.9-3.2.2-1-3L2.5 16l1-3-1-3 2.7-1.7 1-3 3.2.2L12 1.5z"
          fill="#1D9BF0"
        />
        <path
          d="M10.6 15.2l-2.9-2.9 1.3-1.3 1.6 1.6 3.8-3.8 1.3 1.3-5.1 5.1z"
          fill="#fff"
        />
      </svg>
    </span>
  );
}
