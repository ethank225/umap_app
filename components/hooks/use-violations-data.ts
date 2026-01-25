import { useState, useEffect } from "react"
import type { Violation } from "@/types/violation"

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
