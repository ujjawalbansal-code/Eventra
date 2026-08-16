const VARIANTS = {
  primary: "bg-ink text-white hover:bg-violet-700 active:scale-[0.98]",
  accent: "bg-coral-500 text-white hover:bg-coral-600 active:scale-[0.98]",
  outline: "bg-transparent border border-ink/15 text-ink hover:border-ink/40",
  ghost: "bg-transparent text-ink hover:bg-ink/5",
  subtle: "bg-violet-50 text-violet-700 hover:bg-violet-100",
};

const SIZES = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3.5 text-base",
};

export default function Button({
  as: Comp = "button",
  variant = "primary",
  size = "md",
  className = "",
  disabled,
  loading,
  children,
  ...props
}) {
  return (
    <Comp
      className={`inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
      )}
      {children}
    </Comp>
  );
}
