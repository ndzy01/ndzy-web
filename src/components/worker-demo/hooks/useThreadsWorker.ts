import { useRef, useState } from "react"

// @ts-ignore
import { Thread, Worker, spawn } from "threads"

export function useThreadsWorker<T>() {
  const workerRef = useRef<T | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const initWorker = async () => {
    if (workerRef.current) {
      handleTerminate()
    }

    try {
      setError(null)
      workerRef.current = await spawn<T>(
        new Worker(new URL("../worker/complex.ts", import.meta.url), {
          type: "module",
        }),
      )
      setIsReady(true)
    } catch (err) {
      setError(err as Error)
      console.error("Worker 初始化失败：", err)
    }
  }

  const handleTerminate = () => {
    if (workerRef.current) {
      Thread.terminate(workerRef.current)
      workerRef.current = null
      setIsReady(false)
    }
  }

  return {
    isReady,
    error,
    execute: workerRef.current,
    handleTerminate,
    initWorker,
  }
}
