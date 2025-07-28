"use client"

import { Card, CardContent } from "@/components/ui/card"
import { FolderOpen, TrendingUp, Youtube, Music } from "lucide-react"
import { AnimatedCounter } from "@/components/animations/animated-counter"

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="stat-card bg-white border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Projects</p>
              <AnimatedCounter end={12} className="text-2xl font-bold text-gray-900" />
            </div>
            <FolderOpen className="w-8 h-8 text-purple-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="stat-card bg-white border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Views</p>
              <AnimatedCounter end={5.2} suffix="M" className="text-2xl font-bold text-gray-900" />
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="stat-card bg-white border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">YouTube</p>
              <AnimatedCounter end={3} className="text-2xl font-bold text-gray-900" />
            </div>
            <Youtube className="w-8 h-8 text-red-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="stat-card bg-white border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">TikTok</p>
              <AnimatedCounter end={2} className="text-2xl font-bold text-gray-900" />
            </div>
            <Music className="w-8 h-8 text-pink-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
