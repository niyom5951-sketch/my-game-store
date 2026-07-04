"use client"

import { useMemo } from "react"

type Particle = {
  id: number
  left: number // % ຈາກຊ້າຍ
  size: number // px
  duration: number // ວິນາທີທີ່ໃຊ້ຕົກລົງໝົດຈໍ
  delay: number // ວິນາທີກ່ອນເລີ່ມ
  drift: number // px, ໄຫຼລ່ຽງຊ້າຍ-ຂວາລະຫວ່າງຕົກ
  opacity: number
}

function createParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    size: 3 + Math.random() * 7, // 3px - 10px
    duration: 9 + Math.random() * 12, // 9s - 21s
    delay: Math.random() * 12,
    drift: (Math.random() - 0.5) * 80, // -40px ~ +40px
    opacity: 0.35 + Math.random() * 0.45,
  }))
}

export default function FallingParticles({ count = 20 }: { count?: number }) {
  const particles = useMemo(() => createParticles(count), [count])

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {particles.map((p) => (
        <span
          key={p.id}
          className="particle absolute top-[-8%] rounded-full bg-white"
          style={
            {
              left: `${p.left}%`,
              width: p.size,
              height: p.size,
              opacity: p.opacity,
              filter: "blur(0.4px)",
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              "--drift": `${p.drift}px`,
            } as React.CSSProperties
          }
        />
      ))}
      <style>{`
        .particle {
          animation-name: fall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        @keyframes fall {
          0% {
            transform: translate(0, 0);
            opacity: 0;
          }
          8% {
            opacity: var(--peak-opacity, 1);
          }
          92% {
            opacity: var(--peak-opacity, 1);
          }
          100% {
            transform: translate(var(--drift), 115vh);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}