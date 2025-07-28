"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"

interface AnimatedCounterProps {
  end: number
  suffix?: string
  className?: string
}

export function AnimatedCounter({ end, suffix = "", className }: AnimatedCounterProps) {
  const counterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!counterRef.current) return

    const counter = { value: 0 }

    gsap.to(counter, {
      value: end,
      duration: 2,
      ease: "power2.out",
      onUpdate: () => {
        if (counterRef.current) {
          const value = Math.floor(counter.value)
          counterRef.current.textContent = `${value}${suffix}`
        }
      },
      scrollTrigger: {
        trigger: counterRef.current,
        start: "top 80%",
        once: true,
      },
    })
  }, [end, suffix])

  return (
    <div ref={counterRef} className={className}>
      0{suffix}
    </div>
  )
}
