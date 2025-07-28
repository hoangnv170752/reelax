"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { GSAPProvider } from "@/components/animations/gsap-provider"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Sidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { ProjectsGrid } from "@/components/dashboard/projects-grid"

function DashboardContent() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const mainRef = useRef<HTMLDivElement>(null)

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
  }

  useEffect(() => {
    // Initial animations
    gsap.from(sidebarRef.current, {
      x: -300,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
    })

    gsap.from(mainRef.current, {
      x: 50,
      opacity: 0,
      duration: 0.8,
      delay: 0.2,
      ease: "power2.out",
    })

    // Stats cards animation
    gsap.from(".stat-card", {
      y: 30,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      delay: 0.4,
      ease: "back.out(1.7)",
    })

    // Project cards animation
    gsap.from(".project-card", {
      y: 40,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      delay: 0.6,
      ease: "power2.out",
    })

    // Add hover animations to project cards
    const projectCards = document.querySelectorAll(".project-card")
    projectCards.forEach((card) => {
      card.addEventListener("mouseenter", () => {
        gsap.to(card, {
          y: -5,
          scale: 1.02,
          duration: 0.3,
          ease: "power2.out",
        })
      })

      card.addEventListener("mouseleave", () => {
        gsap.to(card, {
          y: 0,
          scale: 1,
          duration: 0.3,
          ease: "power2.out",
        })
      })
    })

    // Sidebar navigation hover effects
    const navItems = document.querySelectorAll(".nav-item")
    navItems.forEach((item) => {
      item.addEventListener("mouseenter", () => {
        gsap.to(item, {
          x: 5,
          duration: 0.2,
          ease: "power2.out",
        })
      })

      item.addEventListener("mouseleave", () => {
        gsap.to(item, {
          x: 0,
          duration: 0.2,
          ease: "power2.out",
        })
      })
    })
  }, [])

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div ref={sidebarRef}>
        <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
      </div>

      {/* Main Content */}
      <main ref={mainRef} className="flex-1 overflow-auto">
        <DashboardHeader />

        <div className="p-6">
          <StatsCards />
          <ProjectsGrid />
        </div>
      </main>
    </div>
  )
}

export default function Dashboard() {
  return (
    <GSAPProvider>
      <ProtectedRoute>
        <DashboardContent />
      </ProtectedRoute>
    </GSAPProvider>
  )
}
