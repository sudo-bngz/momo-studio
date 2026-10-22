export function Logo() {
  return (
    <svg viewBox="0 0 32 32" className="size-9" aria-hidden>
      <rect x="1" y="1" width="30" height="30" rx="7" fill="#202226" stroke="#3a3e45" />
      <circle cx="10" cy="11" r="3" fill="#f2a541" />
      <circle cx="22" cy="21" r="3" fill="#a78bfa" />
      <path d="M10 14 C10 22, 22 12, 22 18" stroke="#ecebe7" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}
