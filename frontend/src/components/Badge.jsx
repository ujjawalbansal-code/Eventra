const TONES = {
  violet: "bg-violet-50 text-violet-700",
  coral: "bg-coral-50 text-coral-600",
  mint: "bg-mint-50 text-mint-600",
  sun: "bg-yellow-50 text-yellow-700",
  neutral: "bg-ink/5 text-ink-soft",
};

export default function Badge({ tone = "neutral", children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
