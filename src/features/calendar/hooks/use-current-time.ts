import { useState, useEffect } from 'react'

/** Re-renders once per minute, returning the current Date for the time indicator. */
export function useCurrentTime(): Date {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    // Align the first tick to the start of the next minute
    const msUntilNextMinute = (60 - new Date().getSeconds()) * 1000
    const timeout = setTimeout(() => {
      setNow(new Date())
      // Then tick every 60s
      const interval = setInterval(() => setNow(new Date()), 60_000)
      return () => clearInterval(interval)
    }, msUntilNextMinute)

    return () => clearTimeout(timeout)
  }, [])

  return now
}
