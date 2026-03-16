import { useState, useEffect, useRef } from 'react'

/** Re-renders once per minute, returning the current Date for the time indicator. */
export function useCurrentTime(): Date {
  const [now, setNow] = useState(() => new Date())
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const msUntilNextMinute = (60 - new Date().getSeconds()) * 1000
    const timeout = setTimeout(() => {
      setNow(new Date())
      intervalRef.current = setInterval(() => setNow(new Date()), 60_000)
    }, msUntilNextMinute)
    return () => {
      clearTimeout(timeout)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  return now
}
