export default function AnimatedTitle({ 
  className = "", 
  title = "Game Store" 
}: { 
  className?: string
  title?: string 
}) {
  return (
    <span aria-label={title} className={`animated-site-title inline-block whitespace-nowrap font-black tracking-normal ${className}`}>
      {title}
    </span>
  )
}