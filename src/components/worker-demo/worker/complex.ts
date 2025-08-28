// @ts-ignore
import { expose } from "threads/worker"

interface ProcessDataOptions {
  numbers: number[]
  operation: "sum" | "multiply" | "sort"
}

interface ProcessResult {
  result: number | number[]
  processTime: number
}

// 模拟复杂计算
function processComplexData(options: ProcessDataOptions): ProcessResult {
  const startTime = performance.now()
  const { numbers, operation } = options

  let result: number | number[]

  switch (operation) {
    case "sum":
      result = numbers.reduce((acc, num) => acc + num, 0)
      break
    case "multiply":
      result = numbers.reduce((acc, num) => acc * num, 1)
      break
    case "sort":
      result = [...numbers].sort((a, b) => a - b)
      break
    default:
      throw new Error(`不支持的操作: ${operation}`)
  }

  // 模拟一些计算时间
  const delay = Math.random() * 1000 + 500
  const endTime = performance.now() + delay
  while (performance.now() < endTime) {
    // 模拟耗时操作
  }

  const processTime = performance.now() - startTime

  return { result, processTime }
}

// 生成1千万条数据
function generateLargeDataSet(): number[] {
  return Array.from(
    { length: 10000000 },
    () => Math.floor(Math.random() * 100) + 1,
  )
}

// 暴露函数供主线程调用
expose({
  add: (a: number, b: number) => a + b,
  processData: processComplexData,
  generateLargeDataSet,
})
