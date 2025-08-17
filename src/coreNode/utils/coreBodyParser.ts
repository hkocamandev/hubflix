import { IncomingMessage } from "http";

/**
 * Utility function to parse the HTTP request body.
 * Buffers incoming data chunks and parses them as JSON.
 * Returns a Promise that resolves with the parsed object.
 * 
 * @param req - IncomingMessage object from the HTTP server
 * @returns Promise resolving to the parsed request body
 * @throws JSON parsing errors or request stream errors
 */
export const coreParseBody = (req: IncomingMessage): Promise<any> => {
  return new Promise((resolve, reject) => {
    let body = "";

    // Collect incoming data chunks
    req.on("data", (chunk) => (body += chunk.toString()));

    // On end of request, parse the accumulated body as JSON
    req.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}")); // Default to empty object if body is empty
      } catch (err) {
        reject(err); // Reject promise on invalid JSON
      }
    });

    // Reject promise if request stream emits an error
    req.on("error", (err) => reject(err));
  });
};
