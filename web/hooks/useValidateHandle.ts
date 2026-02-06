'use client'

import { useState, useEffect, useRef } from 'react'

interface HandleInfo {
  exists: boolean
  handle: string
  displayName: string | null
  bio: string | null
  followers: number | null
  avatar: string | null
  verified: boolean
}

interface UseValidateHandleResult {
  info: HandleInfo | null
  isLoading: boolean
  error: string | null
}

/**
 * Debounced X handle validation hook.
 * Calls /api/validate-handle after 500ms of no typing.
 */
export function useValidateHandle(handle: string): UseValidateHandleResult {
  const [info, setInfo] = useState<HandleInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const clean = handle.replace(/^@/, '').trim().toLowerCase()

  useEffect(() => {
    // Reset state on empty input
    if (!clean || !/^[a-zA-Z0-9_]{1,15}$/.test(clean)) {
      setInfo(null)
      setIsLoading(false)
      setError(null)
      return
    }

    // Debounce 500ms
    setIsLoading(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    if (abortRef.current) abortRef.current.abort()

    timerRef.current = setTimeout(async () => {
      const controller = new AbortController()
      abortRef.current = controller

      try {
        const res = await fetch(`/api/validate-handle?handle=${encodeURIComponent(clean)}`, {
          signal: controller.signal,
        })

        if (!res.ok) {
          const json = await res.json().catch(() => ({}))
          setError(json.error || 'Validation failed')
          setInfo(null)
          setIsLoading(false)
          return
        }

        const data: HandleInfo = await res.json()
        setInfo(data)
        setError(null)
      } catch (e: any) {
        if (e.name === 'AbortError') return
        setError('Failed to validate handle')
        setInfo(null)
      } finally {
        setIsLoading(false)
      }
    }, 500)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (abortRef.current) abortRef.current.abort()
    }
  }, [clean])

  return { info, isLoading, error }
}
