"use client"

import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { FolderOpen, BarChart3, Calendar, Settings, Youtube, Twitter, Menu, X } from "lucide-react"
import { gsap } from "gsap"
import { useAuth } from "@/components/auth/supabase-auth-provider"
import { SettingsModal } from "./settings-modal"
import { useModalContext } from "./header"

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const { user, signOut } = useAuth()
  const sidebarRef = useRef<HTMLDivElement>(null)
  const [showSettings, setShowSettings] = useState(false)
  const { setIsSettingsOrLogoutClicked } = useModalContext()

  useEffect(() => {
    if (sidebarRef.current) {
      gsap.to(sidebarRef.current, {
        width: isCollapsed ? 80 : 256,
        duration: 0.3,
        ease: "power2.out",
      })
    }
  }, [isCollapsed])

  return (
    <>
      <aside
        ref={sidebarRef}
        className="relative h-full border-r border-gray-200 bg-white flex flex-col"
        style={{ width: isCollapsed ? 80 : 256 }}
      >
        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-4 z-10 h-6 w-6 rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-50"
          onClick={onToggle}
        >
          {isCollapsed ? <Menu className="h-3 w-3" /> : <X className="h-3 w-3" />}
        </Button>

        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full ml-1"></div>
            </div>
            {!isCollapsed && <span className="text-lg font-bold text-gray-900">Reelax</span>}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2">
          <div className="mb-6">
            <div className="bg-gray-100 rounded-md p-2">
              <a href="#" className="nav-item flex items-center text-gray-900 font-medium">
                <FolderOpen className="w-4 h-4 flex-shrink-0" />
                {!isCollapsed && <span className="ml-3">Projects</span>}
              </a>
            </div>
            <a
              href="#"
              className="nav-item flex items-center text-gray-600 hover:text-gray-900 p-2 mt-1 rounded-md hover:bg-gray-50"
            >
              <BarChart3 className="w-4 h-4 flex-shrink-0" />
              {!isCollapsed && <span className="ml-3">Analytics</span>}
            </a>
            <a
              href="#"
              className="nav-item flex items-center text-gray-600 hover:text-gray-900 p-2 mt-1 rounded-md hover:bg-gray-50"
            >
              <Calendar className="w-4 h-4 flex-shrink-0" />
              {!isCollapsed && <span className="ml-3">Schedule</span>}
            </a>
          </div>

          {!isCollapsed && (
            <div className="mb-6">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider px-2 mb-2">Connect to Platform</h3>
              <a
                href="#"
                className="nav-item flex items-center text-gray-600 hover:text-gray-900 p-2 rounded-md hover:bg-gray-50"
              >
                <Twitter className="w-4 h-4 flex-shrink-0" />
                <span className="ml-3">@reelax</span>
              </a>
              <a
                href="#"
                className="nav-item flex items-center text-gray-600 hover:text-gray-900 p-2 rounded-md hover:bg-gray-50"
              >
                <Youtube className="w-4 h-4 flex-shrink-0" />
                <span className="ml-3">@reelax</span>
              </a>
            </div>
          )}
        </nav>

        {/* User Profile */}
        <div className="p-2 border-t border-gray-200">
          {isCollapsed ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full h-12 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.imageUrl || "/placeholder.svg"} alt={user?.firstName} />
                    <AvatarFallback>
                      {user?.firstName?.[0]}
                      {user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" side="right">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {
                  setIsSettingsOrLogoutClicked(true);
                  signOut();
                }}>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.imageUrl || "/placeholder.svg"} alt={user?.firstName} />
                  <AvatarFallback>
                    {user?.firstName?.[0]}
                    {user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">Relaxing & Creating</p>
                </div>
              </div>
              <div className="space-y-1">
                <button
                  className="nav-item flex items-center text-gray-600 hover:text-gray-900 p-2 w-full rounded-md hover:bg-gray-50"
                  onClick={() => {
                    setIsSettingsOrLogoutClicked(true);
                    setShowSettings(true);
                  }}
                >
                  <Settings className="w-4 h-4 flex-shrink-0" />
                  <span className="ml-3">Settings</span>
                </button>
                
                <button
                  className="nav-item flex items-center text-gray-600 hover:text-gray-900 p-2 w-full rounded-md hover:bg-gray-50"
                  onClick={() => {
                    setIsSettingsOrLogoutClicked(true);
                    signOut();
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4 flex-shrink-0"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  <span className="ml-3">Logout</span>
                </button>
              </div>
            </>
          )}
        </div>
      </aside>

      <SettingsModal isOpen={showSettings} onOpenChange={setShowSettings} />
    </>
  )
}
