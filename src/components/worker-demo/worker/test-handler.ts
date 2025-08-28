self.onmessage = function (event) {
  if (event.data.type === "PROCESS_DATA") {
    const result = processData(event.data.payload)
    // 处理完成后通知主线程
    self.postMessage({ type: "PROCESS_DONE", result })
  }
}

function processData(data: any) {
  // 这里写你的数据处理逻辑
  return data // 示例：直接返回
}
