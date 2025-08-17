/**
 * Core logging utility for Hubflix backend
 * Provides standardized logging methods for info, warnings, and errors.
 * Logs are formatted with clear prefixes to easily distinguish log levels.
 */
const coreLogger = {
  /**
   * Logs informational messages (successful operations, general info)
   * @param message - Descriptive log message
   * @param data - Optional additional data to log
   */
  info: (message: string, data?: any) =>
    console.log(`[SUCCESS] ${message}`, data ?? ""),

  /**
   * Logs error messages (exceptions, failed operations)
   * @param message - Descriptive error message
   * @param error - Optional error object or details
   */
  error: (message: string, error?: any) =>
    console.error(`[ERROR] ${message}`, error ?? ""),

  /**
   * Logs warning messages (potential issues, validation warnings)
   * @param message - Descriptive warning message
   * @param data - Optional additional data to log
   */
  warn: (message: string, data?: any) =>
    console.warn(`[WARN] ${message}`, data ?? ""),
};

export default coreLogger;
