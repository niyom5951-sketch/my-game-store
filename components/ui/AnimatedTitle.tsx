"use client"
import { useEffect, useState } from "react"

const TITLE = "Game Store"
const PAUSE = 10000 // 10 ວິ

export default function AnimatedTitle() {
  const [displayed, setDisplayed] = useState("")
  const [phase, setPhase] = useState<"typing" | "pause" | "deleting">("typing")
  const [index, setIndex] = useState(0)

  useEffect(() => {
    let timeout: NodeJS.Timeout

    if (phase === "typing") {
      if (index < TITLE.length) {
        timeout = setTimeout(() => {
          setDisplayed(TITLE.slice(0, index + 1))
          setIndex(index + 1)
        }, 120)
      } else {
        timeout = setTimeout(() => setPhase("pause"), PAUSE)
      }
    } else if (phase === "pause") {
      timeout = setTimeout(() => setPhase("deleting"), 500)
    } else if (phase === "deleting") {
      if (index > 0) {
        timeout = setTimeout(() => {
          setDisplayed(TITLE.slice(0, index - 1))
          setIndex(index - 1)
        }, 70)
      } else {
        timeout = setTimeout(() => setPhase("typing"), 400)
      }
    }

    return () => clearTimeout(timeout)
  }, [phase, index])

  return (
    <span className="font-bold text-lg text-gray-900 dark:text-white tracking-tight">
      {displayed}
      <span className="inline-block w-0.5 h-4 bg-blue-600 ml-0.5 animate-pulse align-middle" />
    </span>
  )
}