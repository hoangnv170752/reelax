"use client"

import { Card, CardContent } from "@/components/ui/card"
import { FolderOpen, TrendingUp, Youtube, Music } from "lucide-react"
import { AnimatedCounter } from "@/components/animations/animated-counter"

export function StatsCards() {
  const stats = [
    {
      title: "Total Projects",
      value: 12,
      icon: FolderOpen,
      color: "text-purple-500",
    },
    {
      title: "Total Views",
      value: 5.2,
      suffix: "M",
      icon: TrendingUp,
      color: "text-green-500",
    },
    {
      title: "YouTube",
      value: 3,
      icon: Youtube,
      color: "text-red-500",
    },
    {
      title: "TikTok",
      value: 2,
      icon: Music,
      color: "text-pink-500",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <Card key={stat.title} className="stat-card bg-white border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <AnimatedCounter
                  end={stat.value}
                  suffix={stat.suffix || ""}
                  className="text-2xl font-bold text-gray-900"
                />
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
