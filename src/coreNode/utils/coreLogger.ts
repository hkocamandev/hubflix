const coreLogger = {
  info: (message: string, data?: any) => console.log(`[SUCCESS] ${message}`, data ?? ""),
  error: (message: string, error?: any) => console.error(`[ERROR] ${message}`, error ?? ""),
  warn: (message: string, data?: any) => console.warn(`[WARN] ${message}`, data ?? "")
};

export default coreLogger;