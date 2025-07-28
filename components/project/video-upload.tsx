"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Upload, File, X, CheckCircle } from "lucide-react"
import { useDropzone } from "react-dropzone"

export function VideoUpload() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsUploading(true)

    for (const file of acceptedFiles) {
      // Simulate upload progress
      const fileName = file.name
      setUploadProgress((prev) => ({ ...prev, [fileName]: 0 }))

      // Simulate VideoDB upload
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        setUploadProgress((prev) => ({ ...prev, [fileName]: progress }))
      }

      setUploadedFiles((prev) => [...prev, file])
    }

    setIsUploading(false)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".mov", ".avi", ".mkv"],
    },
    multiple: true,
  })

  const removeFile = (fileName: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.name !== fileName))
    setUploadProgress((prev) => {
      const newProgress = { ...prev }
      delete newProgress[fileName]
      return newProgress
    })
  }

  return (
    <div className="space-y-3">
      <Card
        {...getRootProps()}
        className={`cursor-pointer transition-colors border-2 border-dashed ${
          isDragActive ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <CardContent className="p-6 text-center">
          <input {...getInputProps()} />
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-1">{isDragActive ? "Drop videos here..." : "Upload video files"}</p>
          <p className="text-xs text-gray-500">MP4, MOV, AVI up to 100MB</p>
        </CardContent>
      </Card>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          {uploadedFiles.map((file) => (
            <div key={file.name} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <File className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                {uploadProgress[file.name] !== undefined && uploadProgress[file.name] < 100 && (
                  <Progress value={uploadProgress[file.name]} className="mt-1 h-1" />
                )}
              </div>
              {uploadProgress[file.name] === 100 ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <Button variant="ghost" size="sm" onClick={() => removeFile(file.name)} className="h-6 w-6 p-0">
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
