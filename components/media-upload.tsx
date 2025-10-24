"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, Image, File } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface MediaUploadProps {
  entityType: "sighting" | "hazard"
  entityId: string
  onUploadComplete?: () => void
}

export function MediaUpload({ entityType, entityId, onUploadComplete }: MediaUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const { toast } = useToast()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    // Validacija
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/')
      const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB max
      
      if (!isValidType) {
        toast({
          title: "Greška",
          description: "Samo slike i video fajlovi su podržani",
          variant: "destructive",
        })
        return false
      }
      
      if (!isValidSize) {
        toast({
          title: "Greška",
          description: "Fajl je prevelik (max 10MB)",
          variant: "destructive",
        })
        return false
      }
      
      return true
    })
    
    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles])
      toast({
        title: "Fajlovi dodati",
        description: `Dodano ${validFiles.length} fajlova za upload`,
      })
    }
    
    e.target.value = "" // Reset input
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "Greška",
        description: "Nema fajlova za upload",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Niste prijavljeni")

      for (const file of selectedFiles) {
        // Upload file to Supabase Storage
        const fileExt = file.name.split('.').pop()
        const fileName = `${entityType}_${entityId}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`
        const filePath = `${entityType}s/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('media-attachments')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('media-attachments')
          .getPublicUrl(filePath)

        // Save to database
        const { error: dbError } = await supabase
          .from('media_attachments')
          .insert({
            user_id: user.id,
            entity_type: entityType,
            entity_id: entityId,
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            file_url: publicUrl,
          })

        if (dbError) throw dbError
      }

      toast({
        title: "Uspešno",
        description: `${selectedFiles.length} fajlova je uspešno dodano`,
      })

      setSelectedFiles([])
      onUploadComplete?.()

    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Greška",
        description: "Došlo je do greške pri uploadu fajlova",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const clearAllFiles = () => {
    setSelectedFiles([])
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Dodaj fotografije ili video</Label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
          <Input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
            id="media-upload"
          />
          <Label htmlFor="media-upload" className="cursor-pointer">
            <div className="space-y-2">
              <Upload className="w-8 h-8 mx-auto text-gray-400" />
              <p className="text-sm text-gray-600">
                Kliknite ili prevucite fajlove ovdje
              </p>
              <p className="text-xs text-gray-500">
                Podržani formati: JPG, PNG, MP4 (max 10MB)
              </p>
            </div>
          </Label>
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Odabrani fajlovi ({selectedFiles.length}):</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearAllFiles}
              className="text-xs"
            >
              Obriši sve
            </Button>
          </div>
          
          <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  {file.type.startsWith('image/') ? (
                    <Image className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  ) : (
                    <File className="w-4 h-4 text-green-500 flex-shrink-0" />
                  )}
                  <span className="text-sm truncate flex-1">{file.name}</span>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    ({(file.size / 1024 / 1024).toFixed(2)}MB)
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="flex-shrink-0 ml-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
          
          <div className="flex space-x-2">
            <Button
              type="button"
              onClick={uploadFiles}
              disabled={isUploading}
              className="flex-1"
            >
              {isUploading ? "Upload u toku..." : `Upload ${selectedFiles.length} fajlova`}
            </Button>
          </div>
        </div>
      )}

      {selectedFiles.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          <p className="text-sm">Nema odabranih fajlova</p>
          <p className="text-xs">Odaberite fajlove iznad da biste ih dodali</p>
        </div>
      )}
    </div>
  )
}