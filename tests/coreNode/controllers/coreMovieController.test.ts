// Mock authMiddleware BEFORE imports
jest.mock("../../../src/coreNode/authMiddleware/authMiddleware", () => ({
  authMiddleware: (handler: any) => handler,
}));

import { IncomingMessage, ServerResponse } from "http";
import { handleCoreMovies } from "../../../src/coreNode/controllers/coreMovieController";
import * as movieService from "../../../src/coreNode/services/coreMovieService";
import { coreParseBody } from "../../../src/coreNode/utils/coreBodyParser";

// Mock dependencies
jest.mock("../../../src/coreNode/services/coreMovieService", () => ({
  getAllCoreMovies: jest.fn(),
  getCoreMovieById: jest.fn(),
  createCoreMovie: jest.fn(),
  updateCoreMovie: jest.fn(),
  patchCoreMovie: jest.fn(),
  deleteCoreMovie: jest.fn(),
  replaceCoreMovie: jest.fn(), 
}));

jest.mock("../../../src/coreNode/utils/coreBodyParser", () => ({
  coreParseBody: jest.fn(),
}));

jest.mock("../../../src/coreNode/utils/coreLogger", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

describe("CoreMovieController", () => {
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
  // GET all movies
  // --------------------
  it("GET all movies - success", async () => {
    req.method = "GET";
    (movieService.getAllCoreMovies as jest.Mock).mockResolvedValue([
      { _id: "1", title: "Movie 1" },
    ]);

    await handleCoreMovies(req as IncomingMessage, res as ServerResponse);

    expect(movieService.getAllCoreMovies).toHaveBeenCalled();
    expect(res.writeHead).toHaveBeenCalledWith(200, {
      "Content-Type": "application/json",
    });
    expect(res.end).toHaveBeenCalledWith(
      JSON.stringify([{ _id: "1", title: "Movie 1" }])
    );
  });

  // --------------------
  // GET movie by ID
  // --------------------
  it("GET movie by ID - not found", async () => {
    req.method = "GET";
    const fakeId = "64a05d29466b7a92f5411550";
    (movieService.getCoreMovieById as jest.Mock).mockResolvedValue(null);

    await handleCoreMovies(req as IncomingMessage, res as ServerResponse, fakeId);

    expect(movieService.getCoreMovieById).toHaveBeenCalledWith(fakeId);
    expect(res.writeHead).toHaveBeenCalledWith(404, {
      "Content-Type": "application/json",
    });
  });

  // --------------------
  // POST movie
  // --------------------
  it("POST movie - validation error", async () => {
    req.method = "POST";
    const invalidBody = { title: "" }; // örnek eksik alan
    (coreParseBody as jest.Mock).mockResolvedValue(invalidBody);

    await handleCoreMovies(req as IncomingMessage, res as ServerResponse);

    expect(res.writeHead).toHaveBeenCalledWith(400, {
      "Content-Type": "application/json",
    });
    expect(res.end).toHaveBeenCalledWith(
      expect.stringContaining("Validation failed")
    );
  });

it("POST movie - success", async () => {
  req.method = "POST";

  const body = {
    title: "Inception",
    releaseDate: "2010-07-16",
    genre: "Sci-Fi",
    rating: 8.8,
    imdbId: "tt1375666",
    director: "507f1f77bcf86cd799439011",
  };

  // Body parse mock
  (coreParseBody as jest.Mock).mockResolvedValue(body);
  // Service mock
  (movieService.createCoreMovie as jest.Mock).mockResolvedValue({ _id: "1", ...body });

  await handleCoreMovies(req as IncomingMessage, res as ServerResponse);

  expect(movieService.createCoreMovie).toHaveBeenCalledWith(body);
  expect(res.writeHead).toHaveBeenCalledWith(201, { "Content-Type": "application/json" });
  expect(res.end).toHaveBeenCalledWith(JSON.stringify({ _id: "1", ...body }));
});

  // --------------------
  // PUT movie
  // --------------------
  it("PUT movie - validation error", async () => {
    req.method = "PUT";
    const invalidBody = { title: "" };
    const movieId = "64a05d29466b7a92f5411550";
    (coreParseBody as jest.Mock).mockResolvedValue(invalidBody);

    await handleCoreMovies(req as IncomingMessage, res as ServerResponse, movieId);

    expect(res.writeHead).toHaveBeenCalledWith(400, {
      "Content-Type": "application/json",
    });
  });

it("PUT movie - success", async () => {
  req.method = "PUT";
  const movieId = "64a05d29466b7a92f5411550";

  const body = {
    title: "Updated Movie",
    releaseDate: "2020-01-01",
    genre: "Action",
    rating: 7.5,
    imdbId: "tt1234567",
    director: "507f1f77bcf86cd799439011",
  };

  // coreParseBody mock
  (coreParseBody as jest.Mock).mockResolvedValue(body);

  // replaceCoreMovie mock (PUT controller bunu çağırıyor)
  (movieService.replaceCoreMovie as jest.Mock).mockResolvedValue({
    _id: movieId,
    ...body,
  });

  await handleCoreMovies(req as IncomingMessage, res as ServerResponse, movieId);

  // Servis çağrısı
  expect(movieService.replaceCoreMovie).toHaveBeenCalledWith(movieId, body);

  // Response kontrolü
  expect(res.writeHead).toHaveBeenCalledWith(200, {
    "Content-Type": "application/json",
  });
  expect(res.end).toHaveBeenCalledWith(JSON.stringify({ _id: movieId, ...body }));
});
  // --------------------
  // PATCH movie
  // --------------------
  it("PATCH movie - validation error", async () => {
    req.method = "PATCH";
    const invalidBody = { title: "" };
    const movieId = "64a05d29466b7a92f5411550";
    (coreParseBody as jest.Mock).mockResolvedValue(invalidBody);

    await handleCoreMovies(req as IncomingMessage, res as ServerResponse, movieId);

    expect(res.writeHead).toHaveBeenCalledWith(400, {
      "Content-Type": "application/json",
    });
  });

  it("PATCH movie - success", async () => {
    req.method = "PATCH";
    const body = { title: "Patched Movie" };
    const movieId = "64a05d29466b7a92f5411550";
    (coreParseBody as jest.Mock).mockResolvedValue(body);
    (movieService.updateCoreMovie as jest.Mock).mockResolvedValue({ _id: movieId, ...body });

    await handleCoreMovies(req as IncomingMessage, res as ServerResponse, movieId);

    expect(res.writeHead).toHaveBeenCalledWith(200, {
      "Content-Type": "application/json",
    });
    expect(res.end).toHaveBeenCalledWith(JSON.stringify({ _id: movieId, ...body }));
  });

  // --------------------
  // DELETE movie
  // --------------------
  it("DELETE movie - not found", async () => {
    req.method = "DELETE";
    const movieId = "64a05d29466b7a92f5411550";
    (movieService.deleteCoreMovie as jest.Mock).mockResolvedValue(null);

    await handleCoreMovies(req as IncomingMessage, res as ServerResponse, movieId);

    expect(res.writeHead).toHaveBeenCalledWith(404, {
      "Content-Type": "application/json",
    });
  });

  it("DELETE movie - success", async () => {
    req.method = "DELETE";
    const movieId = "64a05d29466b7a92f5411550";
    (movieService.deleteCoreMovie as jest.Mock).mockResolvedValue({ _id: movieId });

    await handleCoreMovies(req as IncomingMessage, res as ServerResponse, movieId);

    expect(res.writeHead).toHaveBeenCalledWith(200, {
      "Content-Type": "application/json",
    });
    expect(res.end).toHaveBeenCalledWith(
      JSON.stringify({ message: "Movie deleted successfully", data: { _id: movieId } })
    );
  });
});
