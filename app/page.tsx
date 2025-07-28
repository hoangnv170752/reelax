"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Play, TrendingUp, Users, Zap, Youtube, Music } from "lucide-react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { AnimatedCounter } from "@/components/animations/animated-counter"
import { GSAPProvider } from "@/components/animations/gsap-provider"
import { AuthButton } from "@/components/auth/sign-in-button"
import { useAuth } from "@/components/auth/mock-auth-provider"

export default function LandingPage() {
  const { isSignedIn } = useAuth()
  const heroRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    // Hero animations
    const tl = gsap.timeline()

    tl.from(".hero-title", {
      y: 100,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
    })
      .from(
        ".hero-subtitle",
        {
          y: 50,
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
        },
        "-=0.5",
      )
      .from(
        ".hero-buttons",
        {
          y: 30,
          opacity: 0,
          duration: 0.6,
          ease: "power2.out",
        },
        "-=0.3",
      )

    // Feature cards animation
    gsap.from(".feature-card", {
      y: 60,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: featuresRef.current,
        start: "top 80%",
        once: true,
      },
    })

    // Stats animation
    gsap.from(".stat-item", {
      scale: 0.8,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: "back.out(1.7)",
      scrollTrigger: {
        trigger: statsRef.current,
        start: "top 80%",
        once: true,
      },
    })

    // Header animation
    gsap.from("header", {
      y: -100,
      opacity: 0,
      duration: 0.8,
      ease: "power2.out",
    })
  }, [])

  return (
    <GSAPProvider>
      <div className="min-h-screen bg-white text-gray-900">
        {/* Header */}
        <header className="border-b border-gray-200">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-black rounded-full"></div>
                <div className="w-1 h-1 bg-black rounded-full ml-1"></div>
              </div>
              <span className="text-xl font-bold">KIRO CREATE</span>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
                Features
              </Link>
              <Link href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
                Pricing
              </Link>
              <Link href="#about" className="text-gray-600 hover:text-gray-900 transition-colors">
                About
              </Link>
            </nav>
            <div className="flex items-center space-x-3">
              <AuthButton />
              {isSignedIn ? (
                <Button asChild className="bg-purple-600 hover:bg-purple-700">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              ) : (
                <Button asChild className="bg-purple-600 hover:bg-purple-700">
                  <Link href="/dashboard">Get Started</Link>
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section ref={heroRef} className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="hero-title text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Create Viral Videos
            </h1>
            <p className="hero-subtitle text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Generate compelling titles, descriptions, stunning thumbnails, and viral social media content for YouTube
              and TikTok.
            </p>
            <div className="hero-buttons flex flex-col sm:flex-row gap-4 justify-center mb-12">
              {!isSignedIn ? (
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-3" asChild>
                  <Link href="/dashboard">
                    <Play className="w-5 h-5 mr-2" />
                    Get Started
                  </Link>
                </Button>
              ) : (
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-3" asChild>
                  <Link href="/dashboard">
                    <Play className="w-5 h-5 mr-2" />
                    Go to Dashboard
                  </Link>
                </Button>
              )}
              <Button
                size="lg"
                variant="outline"
                className="border-gray-600 text-gray-900 hover:bg-gray-800 text-lg px-8 py-3 bg-transparent"
              >
                View Demo
              </Button>
            </div>

            {/* Stats */}
            <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="stat-item text-center">
                <AnimatedCounter end={1200} suffix="+" className="text-3xl font-bold text-purple-400 mb-2" />
                <div className="text-gray-500">Videos Created</div>
              </div>
              <div className="stat-item text-center">
                <AnimatedCounter end={50} suffix="M+" className="text-3xl font-bold text-purple-400 mb-2" />
                <div className="text-gray-500">Views Generated</div>
              </div>
              <div className="stat-item text-center">
                <AnimatedCounter end={500} suffix="+" className="text-3xl font-bold text-purple-400 mb-2" />
                <div className="text-gray-500">Creators</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" ref={featuresRef} className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              Everything you need to create viral content across all platforms
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="feature-card bg-white border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <Youtube className="w-12 h-12 text-red-500 mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-gray-900">YouTube Optimization</h3>
                <p className="text-gray-500">
                  Generate SEO-optimized titles, descriptions, and tags that boost your YouTube visibility and
                  engagement.
                </p>
              </CardContent>
            </Card>

            <Card className="feature-card bg-white border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <Music className="w-12 h-12 text-pink-500 mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-gray-900">TikTok Viral Content</h3>
                <p className="text-gray-500">
                  Create trending TikTok content with AI-powered hashtags, captions, and viral video concepts.
                </p>
              </CardContent>
            </Card>

            <Card className="feature-card bg-white border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <Zap className="w-12 h-12 text-yellow-500 mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-gray-900">AI-Powered Thumbnails</h3>
                <p className="text-gray-500">
                  Generate eye-catching thumbnails that increase click-through rates and drive more views.
                </p>
              </CardContent>
            </Card>

            <Card className="feature-card bg-white border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <TrendingUp className="w-12 h-12 text-green-500 mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Trend Analysis</h3>
                <p className="text-gray-500">
                  Stay ahead of trends with real-time analysis of what's viral across all social platforms.
                </p>
              </CardContent>
            </Card>

            <Card className="feature-card bg-white border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <Users className="w-12 h-12 text-blue-500 mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Multi-Channel Management</h3>
                <p className="text-gray-500">Manage multiple YouTube and TikTok channels from one unified dashboard.</p>
              </CardContent>
            </Card>

            <Card className="feature-card bg-white border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <Play className="w-12 h-12 text-purple-500 mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Content Scheduling</h3>
                <p className="text-gray-500">
                  Schedule and automate your content publishing across all platforms for maximum reach.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">Ready to Go Viral?</h2>
            <p className="text-xl text-gray-500 mb-8">
              Join thousands of creators who are already using KIRO CREATE to build their viral video empire.
            </p>
            {!isSignedIn ? (
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-3" asChild>
                <Link href="/dashboard">Start Creating Now</Link>
              </Button>
            ) : (
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-3" asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-200 py-8">
          <div className="container mx-auto px-4 text-center text-gray-500">
            <p>&copy; 2024 KIRO CREATE. Built for the Kiro Hackathon.</p>
          </div>
        </footer>
      </div>
    </GSAPProvider>
  )
}
