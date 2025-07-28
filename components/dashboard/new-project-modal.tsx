"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Youtube, Music, Instagram, Twitter } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth/supabase-auth-provider"
import { useProjectContext } from "./project-context"

interface NewProjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface ProjectData {
  name: string
  description: string
  platform: string
  tags: string[]
}

const suggestedTags = [
  "Viral",
  "Tutorial",
  "Review",
  "Entertainment",
  "Educational",
  "Comedy",
  "Music",
  "Gaming",
  "Lifestyle",
  "Tech",
]

const platforms = [
  { value: "youtube", label: "YouTube", icon: Youtube, color: "text-red-500" },
  { value: "tiktok", label: "TikTok", icon: Music, color: "text-pink-500" },
  { value: "instagram", label: "Instagram", icon: Instagram, color: "text-purple-500" },
  { value: "twitter", label: "Twitter", icon: Twitter, color: "text-blue-500" },
]

export function NewProjectModal({ open, onOpenChange }: NewProjectModalProps) {
  const [formData, setFormData] = useState<ProjectData>({
    name: "",
    description: "",
    platform: "",
    tags: [],
  })
  const [newTag, setNewTag] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth() // Get the current authenticated user
  const { refreshProjects } = useProjectContext() // Get the refresh function from context

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.description || !formData.platform) return

    setIsCreating(true)

    try {
      const { data: existingProjects, error: countError } = await supabase
        .from('projects')
        .select('id')
      
      if (countError) {
        throw countError
      }
      
      if (existingProjects && existingProjects.length >= 3) {
        toast({
          title: "Project limit reached",
          description: "You can have a maximum of 3 projects. Please delete an existing project to create a new one.",
          variant: "destructive",
        })
        setIsCreating(false)
        return
      }

      // Check if user is authenticated
      if (!user || !user.id) {
        throw new Error('User not authenticated')
      }
      
      // Create new project in Supabase
      const newProject = {
        title: formData.name,
        description: formData.description,
        platform: formData.platform,
        status: "Draft",
        views_count: 0,
        user_id: user.id, // Add the user_id field which is required
      }

      const { data, error } = await supabase
        .from('projects')
        .insert(newProject)
        .select()

      if (error) {
        throw error
      }

      // If project was created successfully and has tags, add them
      if (data && data[0] && formData.tags.length > 0) {
        // First, ensure all tags exist in the project_tags table
        for (const tagName of formData.tags) {
          // Check if tag exists
          const { data: existingTag } = await supabase
            .from('project_tags')
            .select('id')
            .eq('name', tagName)
            .single()
          
          let tagId
          
          if (!existingTag) {
            // Create tag if it doesn't exist
            const { data: newTag } = await supabase
              .from('project_tags')
              .insert({ name: tagName })
              .select('id')
              .single()
            
            if (newTag) tagId = newTag.id
          } else {
            tagId = existingTag.id
          }
          
          // If we have a tag ID, create the relation
          if (tagId) {
            await supabase
              .from('project_tag_relations')
              .insert({
                project_id: data[0].id,
                tag_id: tagId
              })
          }
        }
      }

      toast({
        title: "Project created",
        description: "Your new project has been created successfully",
      })

      // Refresh the projects grid
      refreshProjects()

      // Reset form
      setFormData({ name: "", description: "", platform: "", tags: [] })
      setNewTag("")
      onOpenChange(false)
    } catch (error) {
      console.error('Error creating project:', error)
      toast({
        title: "Error creating project",
        description: "Please try again later",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }))
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag(newTag)
    }
  }

  const isFormValid = formData.name && formData.description && formData.platform

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>Start your next viral content project. Fill in the details below.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Project Name *</Label>
            <Input
              id="name"
              placeholder="My Awesome Video Series"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe your project and target audience..."
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
              required
            />
          </div>

          {/* Platform */}
          <div className="space-y-2">
            <Label htmlFor="platform">Platform *</Label>
            <Select
              value={formData.platform}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, platform: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a platform" />
              </SelectTrigger>
              <SelectContent>
                {platforms.map((platform) => (
                  <SelectItem key={platform.value} value={platform.value}>
                    <div className="flex items-center">
                      <platform.icon className={`w-4 h-4 mr-2 ${platform.color}`} />
                      {platform.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => removeTag(tag)} />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <Button type="button" variant="outline" onClick={() => addTag(newTag)} disabled={!newTag}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              <span className="text-sm text-gray-500 mr-2">Suggested:</span>
              {suggestedTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => addTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isCreating}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isFormValid || isCreating} className="bg-blue-600 hover:bg-blue-700">
              {isCreating ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
