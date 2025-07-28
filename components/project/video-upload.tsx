"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Upload, File, X, CheckCircle, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"

interface UploadedFile {
  id: string
  name: string
  size: number
  progress: number
  status: "uploading" | "completed" | "error"
  url?: string
}

interface VideoUploadProps {
  onVideoUploaded?: (videoData: any) => void
  projectId?: string
  projectName?: string
}

export function VideoUpload({ onVideoUploaded, projectId, projectName: initialProjectName }: VideoUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [projectName, setProjectName] = useState<string | undefined>(initialProjectName)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  
  // Fetch project name if not provided and projectId exists
  useEffect(() => {
    if (projectId && !projectName) {
      const fetchProjectName = async () => {
        try {
          const { data, error } = await supabase
            .from('projects')
            .select('title')
            .eq('id', projectId)
            .single()
            
          if (error) {
            console.error('Error fetching project name:', error)
            return
          }
          
          if (data?.title) {
            setProjectName(data.title)
          } else {
            setProjectName(`Project ${projectId.substring(0, 8)}`)
          }
        } catch (error) {
          console.error('Error fetching project name:', error)
          // Set a fallback name in case of error
          setProjectName(`Project ${projectId.substring(0, 8)}`)
        }
      }
      
      fetchProjectName()
    }
  }, [projectId, projectName])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    handleFiles(files)
  }

  const handleFiles = (files: File[]) => {
    const videoFiles = files.filter((file) => file.type.startsWith("video/"))
    
    if (videoFiles.length === 0) {
      toast({
        title: 'Invalid file type',
        description: 'Please select video files only (MP4, MOV, AVI, etc.)',
        variant: 'destructive'
      })
      return
    }
    
    // Check file size limit (500MB)
    const oversizedFiles = videoFiles.filter(file => file.size > 500 * 1024 * 1024)
    if (oversizedFiles.length > 0) {
      toast({
        title: 'File too large',
        description: 'Video files must be under 500MB in size.',
        variant: 'destructive'
      })
      return
    }

    videoFiles.forEach((file) => {
      const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const newFile: UploadedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        progress: 0,
        status: "uploading",
      }

      setUploadedFiles((prev) => [...prev, newFile])

      // Upload to Supabase
      uploadToSupabase(fileId, file)
    })
  }

  const uploadToSupabase = async (fileId: string, file: File) => {
    try {
      console.log('Starting upload to Supabase for file:', file.name, 'size:', file.size, 'type:', file.type)
      
      // Check if videos bucket exists, if not create it
      console.log('Checking if video bucket exists...')
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
      
      if (bucketsError) {
        console.error('Error listing buckets:', bucketsError)
      }
      
      console.log('Available buckets:', buckets?.map(b => b.name))
      const videosBucketExists = buckets?.some(bucket => bucket.name === 'video')
      console.log('Video bucket exists:', videosBucketExists)
      
      if (!videosBucketExists) {
        console.log('Creating video bucket...')
        const { data: newBucket, error: createBucketError } = await supabase.storage.createBucket('video', {
          public: true,
          fileSizeLimit: 500000000 // 500MB
        })
        
        if (createBucketError) {
          console.error('Error creating bucket:', createBucketError)
        } else {
          console.log('Bucket created successfully:', newBucket)
        }
      }
      
      // Generate a unique file name to prevent overwriting
      const fileExt = file.name.split('.').pop()
      const fileName = `${projectId || 'general'}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
      console.log('Generated filename for upload:', fileName)
      
      // Simulate progress while uploading
      const simulateProgress = async () => {
        for (let progress = 10; progress < 90; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, file.size / 1000000 * 50)); // Adjust based on file size
          setUploadedFiles(prev => 
            prev.map(f => f.id === fileId ? { ...f, progress } : f)
          );
          console.log(`Upload progress simulation: ${progress}%`)
        }
      };
      
      // Start progress simulation
      console.log('Starting progress simulation')
      const progressSimulation = simulateProgress();
      
      // Upload file
      console.log('Starting actual file upload to Supabase...')
      const { data, error } = await supabase.storage
        .from('video')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      console.log('Upload response:', { data, error })
      
      // Set progress to 95% after upload completes
      setUploadedFiles(prev => 
        prev.map(f => f.id === fileId ? { ...f, progress: 95 } : f)
      );
      console.log('Set progress to 95% after upload')
        
      if (error) {
        console.error('Upload error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack,
          // Log the entire error object for debugging
          fullError: JSON.stringify(error)
        })
        throw error
      }
      
      // Get public URL
      console.log('Getting public URL for uploaded file')
      const { data: publicUrl } = supabase.storage
        .from('video')
        .getPublicUrl(fileName)
      console.log('Public URL:', publicUrl)
      
      // Mark as completed
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? {
                ...f,
                status: "completed",
                url: publicUrl.publicUrl,
              }
            : f,
        ),
      )
      
      // Call the callback
      onVideoUploaded?.({
        id: fileId,
        name: file.name,
        size: file.size,
        url: publicUrl.publicUrl,
        path: fileName
      })
      
      toast({
        title: 'Upload successful',
        description: `${file.name} has been uploaded to the videos bucket.`,
      })
      
    } catch (error: any) {
      console.error('Error uploading to Supabase:', error)
      
      // Mark as error
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? {
                ...f,
                status: "error",
              }
            : f,
        ),
      )
      
      toast({
        title: 'Upload failed',
        description: error.message || 'There was a problem uploading your video.',
        variant: 'destructive'
      })
    }
  }

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="space-y-4">
      <Card
        className={`border-2 border-dashed transition-colors ${
          isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="p-6 text-center">
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-4" />
          <p className="text-sm text-gray-600 mb-2">Drag and drop your video files here</p>
          <p className="text-xs text-gray-500 mb-4">Supports MP4, MOV, AVI up to 500MB</p>
          {projectId ? (
            <p className="text-xs text-blue-500 mb-2 flex items-center">
              Files will be uploaded to project: 
              <span className="font-medium ml-1">
                {projectName || (
                  <span className="inline-flex items-center">
                    <svg className="animate-spin h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </span>
                )}
              </span>
            </p>
          ) : (
            <p className="text-xs text-amber-500 mb-2">No project ID provided, files will be uploaded to general folder</p>
          )}
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            Browse Files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
        </CardContent>
      </Card>

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">Uploaded Files</h4>
          {uploadedFiles.map((file) => (
            <Card key={file.id} className="p-3">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {file.status === "completed" && <CheckCircle className="w-5 h-5 text-green-500" />}
                  {file.status === "error" && <AlertCircle className="w-5 h-5 text-red-500" />}
                  {file.status === "uploading" && <File className="w-5 h-5 text-blue-500" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <Button variant="ghost" size="sm" onClick={() => removeFile(file.id)} className="h-6 w-6 p-0">
                      <X className="w-3 h-3" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{formatFileSize(file.size)}</span>
                    <Badge
                      variant={
                        file.status === "completed" ? "default" : file.status === "error" ? "destructive" : "secondary"
                      }
                      className="text-xs"
                    >
                      {file.status}
                    </Badge>
                  </div>

                  {file.status === "uploading" && <Progress value={file.progress} className="mt-2 h-1" />}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
