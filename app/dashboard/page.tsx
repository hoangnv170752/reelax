"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { GSAPProvider } from "@/components/animations/gsap-provider"
import { Sidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { ProjectsGrid } from "@/components/dashboard/projects-grid"
import { ProjectProvider } from "@/components/dashboard/project-context"

function DashboardContent() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const mainRef = useRef<HTMLDivElement>(null)

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
  }

  useEffect(() => {
    // Clear any existing GSAP animations first
    gsap.killTweensOf([sidebarRef.current, mainRef.current, ".stat-card", ".project-card"])
    
    // Reset element states to ensure proper animation
    if (sidebarRef.current) gsap.set(sidebarRef.current, { clearProps: "all" })
    if (mainRef.current) gsap.set(mainRef.current, { clearProps: "all" })
    gsap.set(".stat-card", { clearProps: "all" })
    gsap.set(".project-card", { clearProps: "all" })
    
    const animationTimeout = setTimeout(() => {
      if (sidebarRef.current) {
        gsap.from(sidebarRef.current, {
          x: -300,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
        })
      }

      if (mainRef.current) {
        gsap.from(mainRef.current, {
          x: 50,
          opacity: 0,
          duration: 0.8,
          delay: 0.2,
          ease: "power2.out",
        })
      }

      // Stats cards animation - only if they exist in the DOM
      const statCards = document.querySelectorAll(".stat-card")
      if (statCards.length > 0) {
        gsap.from(".stat-card", {
          y: 30,
          opacity: 0,
          duration: 0.6,
          stagger: 0.1,
          delay: 0.4,
          ease: "back.out(1.7)",
        })
      }

      const projectCards = document.querySelectorAll(".project-card")
      if (projectCards.length > 0) {
        gsap.from(".project-card", {
          y: 20,
          duration: 0.4,
          stagger: 0.1,
          delay: 0.6,
          ease: "power2.out",
        })
      }
    }, 50) // Small delay to ensure DOM is ready
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
    return () => {
      clearTimeout(animationTimeout)
      // Clean up animations when component unmounts
      gsap.killTweensOf([sidebarRef.current, mainRef.current, ".stat-card", ".project-card"])
    }
  }, [])

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div ref={sidebarRef} className="flex-shrink-0">
        <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
      </div>

      {/* Main Content */}
      <main ref={mainRef} className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-shrink-0">
          <DashboardHeader />
        </div>

        <div className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            <StatsCards />
            <ProjectsGrid />
          </div>
        </div>
      </main>
    </div>
  )
}

export default function Dashboard() {
  return (
    <GSAPProvider>
      <ProjectProvider>
        <DashboardContent />
      </ProjectProvider>
    </GSAPProvider>
  )
}
