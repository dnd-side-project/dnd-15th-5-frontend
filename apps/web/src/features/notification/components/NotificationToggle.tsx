type NotificationToggleProps = {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: () => void;
};

export default function NotificationToggle({
  id,
  label,
  checked,
  onCheckedChange,
}: NotificationToggleProps) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onCheckedChange}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 ${
        checked ? 'bg-primary-500' : 'bg-neutral-300'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-neutral-00 shadow-sm transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}
