const TITLE = "Game Store"

export default function AnimatedTitle({ className = "" }: { className?: string }) {
  return (
    <span aria-label={TITLE} className={`animated-site-title inline-block whitespace-nowrap font-black tracking-normal ${className}`}>
      {TITLE}
    </span>
  )
}
