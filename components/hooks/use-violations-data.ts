import { useState, useEffect } from "react"

interface Violation {
  id: number
  created_at: string
  name: string
  umap_cleaned_name: string
  site: string
  gender: string
  umap_price: number
  list_price: number
  per_diff: number
  violation: boolean
  date: string
  product_link: string
  html_file: string
  immersive_product_page_token: string
  diff: number
}

interface UseViolationsReturn {
  violations: Violation[]
  isLoading: boolean
  error: string | null
}

export function useViolationsData(): UseViolationsReturn {
  const [violations, setViolations] = useState<Violation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchViolations = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch('/api/violations')
        if (!response.ok) {
          throw new Error('Failed to fetch violations')
        }
        const data = await response.json()
        setViolations(data)
      } catch (err) {
        console.error('Error fetching violations:', err)
        setError('Failed to load violations. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchViolations()
  }, [])

  return { violations, isLoading, error }
}
