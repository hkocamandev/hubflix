import xss from "xss";

const sanitizeInput = (input: any): any => {
  if (typeof input === "string") {
    return xss(input); // XSS temizliği
  }

  if (Array.isArray(input)) {
    return input.map((item) => sanitizeInput(item));
  }

  if (typeof input === "object" && input !== null) {
    const sanitized: Record<string, any> = {};
    for (const key in input) {
      sanitized[key] = sanitizeInput(input[key]);
    }
    return sanitized;
  }

  return input;
};

export default sanitizeInput;