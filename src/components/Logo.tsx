export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <defs><linearGradient id="vx" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#A78BFA" /><stop offset="1" stopColor="#7C3AED" /></linearGradient></defs>
      <rect width="32" height="32" rx="8" fill="#191927" />
      <path d="M7 9l9 15 9-15" fill="none" stroke="url(#vx)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
export const Logo = () => (
  <span className="inline-flex items-center gap-2 font-semibold tracking-tight"><LogoMark /><span>Veltrix <span className="text-brand2">Studio</span></span></span>
)
