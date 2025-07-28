"use client"

import { Card, CardContent } from "@/components/ui/card"
import { FolderOpen, TrendingUp, Youtube, Music } from "lucide-react"
import { AnimatedCounter } from "@/components/animations/animated-counter"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Badge } from "@/components/ui/badge"
import { useProjectContext } from "./project-context"

export function StatsCards() {
  const [projectCount, setProjectCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const { refreshTrigger } = useProjectContext()

  useEffect(() => {
    async function fetchProjectCount() {
      try {
        setLoading(true)
        const { count, error } = await supabase
          .from('projects')
          .select('*', { count: 'exact', head: true })

        if (error) {
          console.error('Error fetching project count:', error)
          return
        }

        setProjectCount(count || 0)
      } catch (error) {
        console.error('Error fetching project count:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjectCount()
  }, [refreshTrigger])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="stat-card bg-white border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Projects</p>
              {loading ? (
                <div className="h-8 w-16 bg-gray-100 animate-pulse rounded"></div>
              ) : (
                <AnimatedCounter end={projectCount} className="text-2xl font-bold text-gray-900" />
              )}
            </div>
            <FolderOpen className="w-8 h-8 text-purple-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="stat-card bg-white border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-500">Total Views</p>
                <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">Coming Soon</Badge>
              </div>
              <AnimatedCounter end={0} className="text-2xl font-bold text-gray-900" />
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="stat-card bg-white border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-500">YouTube</p>
                <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">Coming Soon</Badge>
              </div>
              <AnimatedCounter end={0} className="text-2xl font-bold text-gray-900" />
            </div>
            <Youtube className="w-8 h-8 text-red-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="stat-card bg-white border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-500">TikTok</p>
                <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">Coming Soon</Badge>
              </div>
              <AnimatedCounter end={0} className="text-2xl font-bold text-gray-900" />
            </div>
            <Music className="w-8 h-8 text-pink-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
