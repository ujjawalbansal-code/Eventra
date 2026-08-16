export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center text-center py-16 px-6">
      {Icon && (
        <div className="w-14 h-14 rounded-full bg-violet-50 flex items-center justify-center mb-4">
          <Icon size={26} className="text-violet-500" />
        </div>
      )}
      <h3 className="font-display font-semibold text-lg text-ink">{title}</h3>
      {description && <p className="text-ink-faint text-sm mt-1.5 max-w-xs">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
