"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { useProjectContext } from "./project-context"
import { Trash2, X, Plus } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

// Define the Project interface to match Supabase schema
interface Project {
  id: string
  title: string
  description: string
  platform: string
  status: string
  tags?: string[]
}

// Define form validation schema
const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters"),
  platform: z.enum(["YouTube", "TikTok", "Instagram", "Podcast"]),
  status: z.enum(["Draft", "In Progress", "Published"]),
  tags: z.array(z.string()).optional(),
})

interface EditProjectDialogProps {
  project: Project | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditProjectDialog({ project, open, onOpenChange }: EditProjectDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const { toast } = useToast()
  const { refreshProjects } = useProjectContext()

  // Initialize form with project data
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: project?.title || "",
      description: project?.description || "",
      platform: (project?.platform as any) || "YouTube",
      status: (project?.status as any) || "Draft",
      tags: project?.tags || [],
    },
  })

  // Update form values when project changes
  useEffect(() => {
    if (project && open) {
      form.reset({
        title: project.title,
        description: project.description,
        platform: project.platform as any,
        status: project.status as any,
        tags: project.tags || [],
      })
    }
  }, [project, open, form])

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!project?.id) return

    try {
      setIsSubmitting(true)

      // Update project details
      const { error: projectError } = await supabase
        .from('projects')
        .update({
          title: values.title,
          description: values.description,
          platform: values.platform,
          status: values.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', project.id)

      if (projectError) {
        throw projectError
      }

      // Handle tag updates
      if (values.tags && values.tags.length > 0) {
        // First, delete existing tag relations for this project
        const { error: deleteError } = await supabase
          .from('project_tag_relations')
          .delete()
          .eq('project_id', project.id)

        if (deleteError) {
          throw deleteError
        }

        // For each tag, check if it exists, if not create it, then create the relation
        for (const tagName of values.tags) {
          // Check if tag exists
          let { data: existingTags } = await supabase
            .from('project_tags')
            .select('id')
            .eq('name', tagName)
            .limit(1)

          let tagId

          if (!existingTags || existingTags.length === 0) {
            // Create new tag
            const { data: newTag, error: tagError } = await supabase
              .from('project_tags')
              .insert({ name: tagName })
              .select('id')
              .single()

            if (tagError) {
              throw tagError
            }

            tagId = newTag.id
          } else {
            tagId = existingTags[0].id
          }

          // Create relation between project and tag
          const { error: relationError } = await supabase
            .from('project_tag_relations')
            .insert({
              project_id: project.id,
              tag_id: tagId
            })

          if (relationError) {
            throw relationError
          }
        }
      } else {
        // If no tags, delete all tag relations for this project
        await supabase
          .from('project_tag_relations')
          .delete()
          .eq('project_id', project.id)
      }

      toast({
        title: "Project updated",
        description: "Your project has been updated successfully",
      })

      // Trigger refresh of projects list
      refreshProjects()
      
      // Close the dialog
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating project:', error)
      toast({
        title: "Error updating project",
        description: "Please try again later",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle project deletion
  const handleDelete = async () => {
    if (!project?.id) return

    try {
      setIsDeleting(true)

      // First delete any tag relations
      await supabase
        .from('project_tag_relations')
        .delete()
        .eq('project_id', project.id)

      // Then delete the project
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id)

      if (error) {
        throw error
      }

      toast({
        title: "Project deleted",
        description: "Your project has been deleted successfully",
      })

      // Trigger refresh of projects list
      refreshProjects()
      
      // Close both dialogs
      setShowDeleteConfirm(false)
      onOpenChange(false)
    } catch (error) {
      console.error('Error deleting project:', error)
      toast({
        title: "Error deleting project",
        description: "Please try again later",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update your project information. Click save when you're done.
            </DialogDescription>
          </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Project title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Project description" 
                      className="resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="platform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="YouTube">YouTube</SelectItem>
                        <SelectItem value="TikTok">TikTok</SelectItem>
                        <SelectItem value="Instagram">Instagram</SelectItem>
                        <SelectItem value="Podcast">Podcast</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {(field.value || []).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <button
                            type="button"
                            onClick={() => {
                              const newTags = [...(field.value || [])];
                              newTags.splice(index, 1);
                              field.onChange(newTags);
                            }}
                            className="ml-1 rounded-full hover:bg-muted p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        id="new-tag"
                        placeholder="Add a tag"
                        className="flex-1"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const input = e.currentTarget;
                            const value = input.value.trim();
                            if (value && !field.value?.includes(value)) {
                              field.onChange([...field.value || [], value]);
                              input.value = '';
                            }
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const input = document.getElementById('new-tag') as HTMLInputElement;
                          const value = input.value.trim();
                          if (value && !field.value?.includes(value)) {
                            field.onChange([...field.value || [], value]);
                            input.value = '';
                          }
                        }}
                      >
                        <Plus className="h-4 w-4" />
                        Add
                      </Button>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex justify-between w-full">
              <Button 
                type="button" 
                variant="destructive" 
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-1"
              >
                <Trash2 className="h-4 w-4" />
                Delete Project
              </Button>
              <div className="flex gap-2">
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your project
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? "Deleting..." : "Delete Project"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
