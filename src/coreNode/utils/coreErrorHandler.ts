import { ServerResponse } from "http";

export interface IError {
  message: string;
  statusCode?: number;
  errors?: any;
}

export const handleError = (
  res: ServerResponse,
  err: unknown,
  statusCode: number = 500
) => {
  let errorResponse: IError = { message: "Unknown error" };

  if (err && typeof err === "object" && "message" in err) {
    errorResponse = {
      message: (err as any).message,
      errors: (err as any).errors,
    };
  }

  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      message: errorResponse.message,
      errors: errorResponse.errors,
    })
  );
};
