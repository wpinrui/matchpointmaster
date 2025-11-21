import { useState, useEffect } from 'react'

/**
 * Hook to load images from assets folder using Vite's import.meta.glob
 */
export const useImageLoader = (path: string, isOpen: boolean) => {
  const [imagePaths, setImagePaths] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) {
      setImagePaths([])
      setError(null)
      return
    }

    // Skip loading if this is for manager faces (handled by FaceCustomizer)
    if (path.includes('manager_faces')) {
      return
    }

    // Load from assets for other paths (like school crests)
    try {
      const images = import.meta.glob('/src/assets/**/*.{png,jpg,jpeg}', {
        eager: true
      })

      // Filter by path and extract the actual image URLs
      // With eager: true, Vite returns the imported modules directly
      const imageUrls: string[] = []
      Object.entries(images).forEach(([filePath, module]) => {
        if (filePath.includes(path)) {
          // For images, the module is typically a string URL or an object with default
          let imageUrl: string | undefined

          if (typeof module === 'string') {
            imageUrl = module
          } else if (typeof module === 'object' && module !== null) {
            // Check for default export
            if ('default' in module) {
              imageUrl = (module as { default: string }).default
            } else if ('src' in module) {
              imageUrl = (module as { src: string }).src
            }
          }

          if (imageUrl && typeof imageUrl === 'string') {
            imageUrls.push(imageUrl)
          }
        }
      })

      console.log('Loaded images:', imageUrls.length, 'for path:', path)
      setImagePaths(imageUrls)
      setError(imageUrls.length === 0 ? 'No images found in this folder' : null)
    } catch (err) {
      console.error('Error loading images:', err)
      setError('Failed to load images')
      setImagePaths([])
    }
  }, [path, isOpen])

  return { imagePaths, error, setError }
}

