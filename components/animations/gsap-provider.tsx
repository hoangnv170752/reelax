"use client"

import type React from "react"

import { useEffect } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

export function GSAPProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    // Set default GSAP settings
    gsap.defaults({
      duration: 0.6,
      ease: "power2.out",
    })
  }, [])

  return <>{children}</>
}
