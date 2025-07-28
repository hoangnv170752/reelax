"use client"

import { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FolderOpen, Youtube, Settings, BarChart3, Calendar, Twitter, ChevronLeft, ChevronRight } from "lucide-react"
import { useAuth } from "@/components/auth/mock-auth-provider"
import { gsap } from "gsap"
import { SettingsModal } from "./settings-modal"

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const { user, signOut } = useAuth()
  const sidebarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (sidebarRef.current) {
      gsap.to(sidebarRef.current, {
        width: isCollapsed ? "80px" : "256px",
        duration: 0.3,
        ease: "power2.out",
      })
    }

    // Animate nav items
    const navItems = document.querySelectorAll(".nav-item")
    navItems.forEach((item) => {
      const textElements = item.querySelectorAll(".nav-text")
      textElements.forEach((text) => {
        gsap.to(text, {
          opacity: isCollapsed ? 0 : 1,
          duration: 0.2,
          ease: "power2.out",
        })
      })
    })
  }, [isCollapsed])

  const NavItem = ({ icon: Icon, label, isActive = false }: { icon: any; label: string; isActive?: boolean }) => (
    <a
      href="#"
      className={`nav-item flex items-center p-2 rounded-md transition-colors ${
        isActive ? "bg-gray-100 text-gray-900 font-medium" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
      }`}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className={`nav-text ml-3 ${isCollapsed ? "hidden" : "block"}`}>{label}</span>
    </a>
  )

  return (
    <aside
      ref={sidebarRef}
      className="border-r border-gray-200 flex flex-col h-full bg-white relative transition-all duration-300"
      style={{ width: isCollapsed ? "80px" : "256px" }}
    >
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className="absolute -right-3 top-6 z-10 h-6 w-6 rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-50"
      >
        {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </Button>

      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
              <div className="w-3 h-3 bg-black rounded-full"></div>
              <div className="w-1 h-1 bg-black rounded-full ml-1"></div>
            </div>
            {!isCollapsed && <span className="text-lg font-bold text-gray-900">KIRO CREATE</span>}
          </div>
          {!isCollapsed && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.imageUrl || "/placeholder.svg"} alt={user?.firstName} />
                    <AvatarFallback>
                      {user?.firstName?.[0]}
                      {user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        <div className="mb-6">
          <NavItem icon={FolderOpen} label="Projects" isActive />
          <div className="mt-1">
            <NavItem icon={BarChart3} label="Analytics" />
          </div>
          <div className="mt-1">
            <NavItem icon={Calendar} label="Schedule" />
          </div>
        </div>

        {!isCollapsed && (
          <div className="mb-6">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider px-2 mb-2">Connect</h3>
            <NavItem icon={Twitter} label="@kiroCreate" />
            <div className="mt-1">
              <NavItem icon={Youtube} label="@kiroCreate" />
            </div>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-gray-200">
        <SettingsModal
          trigger={
            <button className="nav-item flex items-center text-gray-600 hover:text-gray-900 p-2 w-full text-left">
              <Settings className="w-4 h-4 flex-shrink-0" />
              <span className={`nav-text ml-3 ${isCollapsed ? "hidden" : "block"}`}>Settings</span>
            </button>
          }
        />
      </div>
    </aside>
  )
}
