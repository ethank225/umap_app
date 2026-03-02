import { useState, useEffect, useRef, useCallback } from "react"
import type { Violation } from "@/types/violation"

interface UseViolationsReturn {
  violations: Violation[]
  isLoading: boolean
  error: string | null
  lastFetchedAt: Date | null
  refetch: () => void
}

// Mon & Wed at 1am PST = 9am UTC
function getMostRecentRefreshTime(): Date | null {
  const now = new Date()
  const refreshDays = [1, 3] // Monday=1, Wednesday=3
  for (let daysBack = 0; daysBack <= 14; daysBack++) {
    const candidate = new Date(now)
    candidate.setUTCDate(candidate.getUTCDate() - daysBack)
    candidate.setUTCHours(9, 0, 0, 0)
    if (refreshDays.includes(candidate.getUTCDay()) && candidate <= now) {
      return candidate
    }
  }
  return null
}

export function useViolationsData(): UseViolationsReturn {
  const [violations, setViolations] = useState<Violation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastFetchedAt, setLastFetchedAt] = useState<Date | null>(null)
  const lastFetchedAtRef = useRef<Date | null>(null)

  const fetchViolations = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch('/api/violations')
      if (!response.ok) {
        throw new Error('Failed to fetch violations')
      }
      const data = await response.json()
      setViolations(data)
      const now = new Date()
      lastFetchedAtRef.current = now
      setLastFetchedAt(now)
    } catch (err) {
      console.error('Error fetching violations:', err)
      setError('Failed to load violations. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchViolations()
  }, [fetchViolations])

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState !== 'visible') return
      if (!lastFetchedAtRef.current) return
      const lastScheduled = getMostRecentRefreshTime()
      if (lastScheduled && lastFetchedAtRef.current < lastScheduled) {
        fetchViolations()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [fetchViolations])

  return { violations, isLoading, error, lastFetchedAt, refetch: fetchViolations }
}
