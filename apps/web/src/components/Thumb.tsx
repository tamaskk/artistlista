/* eslint-disable @next/next/no-img-element */

/** Kép vagy mock-stílusú csíkozott placeholder. */
export function Thumb({
  src,
  alt,
  label,
  className = "",
}: {
  src?: string;
  alt: string;
  label?: string;
  className?: string;
}) {
  if (src) {
    return <img src={src} alt={alt} className={`object-cover ${className}`} />;
  }
  return (
    <div className={`thumb-placeholder flex items-center justify-center ${className}`}>
      {label && <span className="font-mono text-[10px] text-faint">{label}</span>}
    </div>
  );
}
