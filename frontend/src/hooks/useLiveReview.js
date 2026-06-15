import { useCallback, useEffect, useRef, useState } from 'react'
import { submitReview } from '../api/reviewApi'

const MIN_CODE_LENGTH = 20

export function useLiveReview({ language, context, code }) {
  const [review, setReview] = useState(null)
  const [meta, setMeta] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const abortControllerRef = useRef(null)
  const requestIdRef = useRef(0)
  const lastSubmittedSignatureRef = useRef('')

  const requestReview = useCallback(
    async ({ immediate = false } = {}) => {
      const trimmedCode = code.trim()

      if (!trimmedCode) {
        setError('')
        setReview(null)
        setMeta(null)
        setIsLoading(false)
        return
      }

      if (trimmedCode.length < MIN_CODE_LENGTH) {
        setError('')
        setReview(null)
        setMeta(null)
        setIsLoading(false)
        return
      }

      const payload = { language, context, code: trimmedCode }
      const signature = JSON.stringify(payload)

      if (!immediate && signature === lastSubmittedSignatureRef.current) {
        return
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      const controller = new AbortController()
      abortControllerRef.current = controller
      const currentRequestId = requestIdRef.current + 1
      requestIdRef.current = currentRequestId

      setError('')
      setIsLoading(true)

      try {
        const result = await submitReview(payload, { signal: controller.signal })

        if (currentRequestId !== requestIdRef.current) {
          return
        }

        lastSubmittedSignatureRef.current = signature
        setReview(result.review)
        setMeta(result.meta)
      } catch (requestError) {
        if (requestError?.code === 'ERR_CANCELED') {
          return
        }

        if (currentRequestId !== requestIdRef.current) {
          return
        }

        setError(requestError.message)
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setIsLoading(false)
        }
      }
    },
    [code, context, language],
  )

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    review,
    meta,
    isLoading,
    error,
    submitNow: () => requestReview({ immediate: true }),
  }
}