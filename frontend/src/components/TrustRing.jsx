// Signature visual motif: a circular progress ring reused across the app
// for trust score, squad match %, and anywhere a "confidence number" needs
// to feel immediate. Keeping one recognizable shape ties the trust layer,
// squad match, and other numeric signals into a single visual language.
export default function TrustRing({
  value = 0,
  size = 56,
  stroke = 5,
  color = "#6C56F0",
  track = "#EDEBFC",
  label,
  sublabel,
  className = "",
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="font-display font-bold" style={{ fontSize: size * 0.28 }}>
          {label ?? Math.round(value)}
        </span>
        {sublabel && <span className="text-[9px] text-ink-faint mt-0.5">{sublabel}</span>}
      </div>
    </div>
  );
}
