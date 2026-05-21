import { useState, useEffect, useCallback } from "react"
import type { AsyncState } from "@/lib/types"

export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = []
): AsyncState<T> & { refetch: () => Promise<void> } {
  const [data, setData] = useState<T>(null as unknown as T)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetcher()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    fetch()
  }, [fetch])

  return { data, loading, error, refetch: fetch }
}

export function useAsyncMutation<TResult, TArgs = void>() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const mutate = useCallback(
    async (mutation: (args: TArgs) => Promise<TResult>, args: TArgs): Promise<TResult | null> => {
      setLoading(true)
      setError(null)
      try {
        const result = await mutation(args)
        return result
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err))
        setError(e)
        return null
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { mutate, loading, error }
}
