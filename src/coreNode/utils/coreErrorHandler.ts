import { ServerResponse } from "http";

/**
 * Interface representing the structure of an error response
 */
export interface IError {
  message: string;        // Human-readable error message
  statusCode?: number;    // Optional HTTP status code
  errors?: any;           // Optional detailed error information (e.g., validation errors)
}

/**
 * Centralized error handler for HTTP responses
 * Formats and sends a consistent JSON error response to the client.
 * 
 * @param res - ServerResponse object to send the error
 * @param err - The error object or value to handle
 * @param statusCode - Optional HTTP status code (default: 500)
 */
export const handleError = (
  res: ServerResponse,
  err: unknown,
  statusCode: number = 500
) => {
  let errorResponse: IError = { message: "Unknown error" };

  // If the error is an object with a message property, extract message and optional details
  if (err && typeof err === "object" && "message" in err) {
    errorResponse = {
      message: (err as any).message,
      errors: (err as any).errors,
    };
  }

  // Send standardized JSON response to client
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      message: errorResponse.message,
      errors: errorResponse.errors,
    })
  );
};
