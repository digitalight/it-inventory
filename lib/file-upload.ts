// lib/file-upload.ts
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export interface UploadedFile {
  fileName: string
  filePath: string
  fileSize: number
  mimeType: string
}

export async function saveUploadedFiles(files: File[], orderId: string): Promise<UploadedFile[]> {
  const uploadDir = join(process.cwd(), 'uploads', 'orders', orderId)
  
  // Create directory if it doesn't exist
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true })
  }

  const uploadedFiles: UploadedFile[] = []

  for (const file of files) {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Generate unique filename to avoid conflicts
    const timestamp = Date.now()
    const fileName = `${timestamp}_${file.name}`
    const filePath = join(uploadDir, fileName)
    
    await writeFile(filePath, buffer)
    
    uploadedFiles.push({
      fileName: file.name, // Original name
      filePath: filePath, // Full path to saved file
      fileSize: file.size,
      mimeType: file.type
    })
  }

  return uploadedFiles
}
