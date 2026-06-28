"use client"
import { useState, useEffect } from "react"

export default function AnimatedTitle({ 
  className = "", 
  title = "Game Store" 
}: { 
  className?: string
  title?: string 
}) {
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    // ລໍຖ້າໜ້ອຍໜຶ່ງ ແລ້ວຈຶ່ງເລີ່ມ animation
    const t = setTimeout(() => setAnimate(true), 50)
    return () => clearTimeout(t)
  }, [title])

  return (
    <span
      key={title}
      aria-label={title}
      className={`${animate ? "animated-site-title" : ""} inline-block whitespace-nowrap font-black tracking-normal ${className}`}
      style={!animate ? {
        color: "transparent",
        background: "linear-gradient(90deg, #111827 0%, #2563eb 48%, #059669 100%)",
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      } : undefined}
    >
      {title}
    </span>
  )
}