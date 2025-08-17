jest.mock("../../../src/coreNode/authMiddleware/authMiddleware", () => ({
  authMiddleware: (handler: any) => handler,
}));

import { IncomingMessage, ServerResponse } from "http";
import { handleCoreDirectors } from "../../../src/coreNode/controllers/coreDirectorController";
import * as directorService from "../../../src/coreNode/services/coreDirectorService";
import { coreParseBody } from "../../../src/coreNode/utils/coreBodyParser";

// Mock dependencies
jest.mock("../../../src/coreNode/services/coreDirectorService", () => ({
  getAllCoreDirectors: jest.fn(),
  getCoreDirectorById: jest.fn(),
  createCoreDirector: jest.fn(),
  updateCoreDirector: jest.fn(),
  patchCoreDirector: jest.fn(),
  deleteCoreDirector: jest.fn(),
}));

jest.mock("../../../src/coreNode/utils/coreBodyParser", () => ({
  coreParseBody: jest.fn(),
}));

jest.mock("../../../src/coreNode/utils/coreLogger", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

describe("CoreDirectorController", () => {
  let req: Partial<IncomingMessage>;
  let res: Partial<ServerResponse>;

  beforeEach(() => {
    req = { method: "" };
    res = {
      writeHead: jest.fn(),
      end: jest.fn(),
    };
    jest.clearAllMocks();
  });

  // --------------------
  // POST /directors
  // --------------------
  it("should create a director successfully", async () => {
    req.method = "POST";
    const body = {
      firstName: "Christopher",
      secondName: "Nolan",
      birthDate: "1970-07-30",
    };

    (coreParseBody as jest.Mock).mockResolvedValue(body);
    (directorService.createCoreDirector as jest.Mock).mockResolvedValue({
      _id: "1",
      ...body,
    });

    await handleCoreDirectors(req as IncomingMessage, res as ServerResponse);

    expect(directorService.createCoreDirector).toHaveBeenCalledWith(body);
    expect(res.writeHead).toHaveBeenCalledWith(201, {
      "Content-Type": "application/json",
    });
    expect(res.end).toHaveBeenCalledWith(JSON.stringify({ _id: "1", ...body }));
  });

  it("should return 400 if validation fails", async () => {
    req.method = "POST";
    const body = { secondName: "Nolan" }; // eksik firstName, birthDate
    (coreParseBody as jest.Mock).mockResolvedValue(body);

    await handleCoreDirectors(req as IncomingMessage, res as ServerResponse);

    expect(res.writeHead).toHaveBeenCalledWith(400, {
      "Content-Type": "application/json",
    });
    expect(res.end).toHaveBeenCalledWith(
      expect.stringContaining("Validation failed")
    );
  });

  // --------------------
  // DELETE /directors/:id
  // --------------------
  it("should return 400 if id is missing", async () => {
    req.method = "DELETE";
    await handleCoreDirectors(req as IncomingMessage, res as ServerResponse);

    expect(res.writeHead).toHaveBeenCalledWith(400, {
      "Content-Type": "application/json",
    });
    expect(res.end).toHaveBeenCalledWith(
      expect.stringContaining("Director ID required")
    );
  });

  it("should return 400 if id is invalid", async () => {
    req.method = "DELETE";
    const invalidId = "123"; // not a valid ObjectId
    await handleCoreDirectors(
      req as IncomingMessage,
      res as ServerResponse,
      invalidId
    );

    expect(res.writeHead).toHaveBeenCalledWith(400, {
      "Content-Type": "application/json",
    });
    expect(res.end).toHaveBeenCalledWith(
      expect.stringContaining("Invalid director ID")
    );
  });

  it("should return 404 if director not found", async () => {
    req.method = "DELETE";
    const validId = "507f1f77bcf86cd799439011"; // sahte valid ObjectId
    (directorService.deleteCoreDirector as jest.Mock).mockResolvedValue(null);

    await handleCoreDirectors(
      req as IncomingMessage,
      res as ServerResponse,
      validId
    );

    expect(res.writeHead).toHaveBeenCalledWith(404, {
      "Content-Type": "application/json",
    });
    expect(res.end).toHaveBeenCalledWith(
      expect.stringContaining("Director not found")
    );
  });

  it("should delete a director successfully", async () => {
    req.method = "DELETE";
    const validId = "507f1f77bcf86cd799439011";
    (directorService.deleteCoreDirector as jest.Mock).mockResolvedValue({
      _id: validId,
    });

    await handleCoreDirectors(
      req as IncomingMessage,
      res as ServerResponse,
      validId
    );

    expect(res.writeHead).toHaveBeenCalledWith(200, {
      "Content-Type": "application/json",
    });
    expect(res.end).toHaveBeenCalledWith(
      JSON.stringify({
        message: "Director deleted successfully",
        data: { _id: validId },
      })
    );
  });
});