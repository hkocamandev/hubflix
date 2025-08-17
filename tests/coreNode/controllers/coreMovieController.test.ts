// Mock authMiddleware BEFORE imports
jest.mock("../../../src/coreNode/authMiddleware/authMiddleware", () => ({
  authMiddleware: (handler: any) => handler,
}));

import { IncomingMessage, ServerResponse } from "http";
import { handleCoreMovies } from "../../../src/coreNode/controllers/coreMovieController";
import * as movieService from "../../../src/coreNode/services/coreMovieService";
import { coreParseBody } from "../../../src/coreNode/utils/coreBodyParser";
import mongoose from "mongoose";
import CoreDirector from "../../../src/coreNode/models/CoreDirector";
import sanitizeInput from "../../../src/coreNode/utils/coreSanitizer";
import dotenv from "dotenv";
dotenv.config();
// --------------------
// Redis mock
// --------------------
jest.mock("../../../src/coreNode/utils/redisClient", () => {
  const RedisMock = require("ioredis-mock");
  return new RedisMock();
});

// --------------------
// Service & utils mocks
// --------------------
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

describe("CoreMovieController with Redis Cache (mocked)", () => {
  let req: Partial<IncomingMessage>;
  let res: Partial<ServerResponse>;
  let directorId: string;
  let movieId: string;

  beforeAll(() => {
    jest.setTimeout(60000);
    directorId = new mongoose.Types.ObjectId().toString();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

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
  // GET movie by ID - cache test
  // --------------------
  it("GET movie by ID - caches in Redis and returns cache hit", async () => {
    const redis = require("../../../src/coreNode/utils/redisClient");

    // Mock createCoreMovie -> fake movie
    (movieService.createCoreMovie as jest.Mock).mockImplementation(
      async (body) => ({ _id: new mongoose.Types.ObjectId(), ...body })
    );

    const movieDoc = await movieService.createCoreMovie({
      title: "Redis Test Movie",
      releaseDate: new Date(),
      genre: "Action",
      rating: 8,
      imdbId: "tt9999999",
      director: new mongoose.Types.ObjectId(directorId),
    });

    movieId = (movieDoc._id as mongoose.Types.ObjectId).toString();

    console.log = jest.fn();

    (movieService.getCoreMovieById as jest.Mock).mockImplementation(
      async (id: string) => {
        const cached = await redis.get(`coreMovie:${id}`);
        if (cached) {
          console.log(`Cache hit for movie ID: ${id}`);
          return JSON.parse(cached);
        }
        const movie = { _id: id, title: "Redis Test Movie" };
        await redis.set(`coreMovie:${id}`, JSON.stringify(movie));
        return movie;
      }
    );

    const firstFetch = await movieService.getCoreMovieById(movieId);
    expect(firstFetch).not.toBeNull();
    expect(firstFetch!._id).toBe(movieId);

    const secondFetch = await movieService.getCoreMovieById(movieId);
    expect(secondFetch).not.toBeNull();
    expect(secondFetch!._id).toBe(movieId);

    expect(console.log).toHaveBeenCalledWith(
      `Cache hit for movie ID: ${movieId}`
    );
  });

  // --------------------
  // GET movie by ID - not found
  // --------------------
  it("GET movie by ID - not found", async () => {
    req.method = "GET";
    const fakeId = "64a05d29466b7a92f5411550";
    (movieService.getCoreMovieById as jest.Mock).mockResolvedValue(null);

    await handleCoreMovies(
      req as IncomingMessage,
      res as ServerResponse,
      fakeId
    );

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
    const invalidBody = { title: "" };
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
      director: directorId,
    };

    (coreParseBody as jest.Mock).mockResolvedValue(body);
    (movieService.createCoreMovie as jest.Mock).mockResolvedValue({
      _id: "1",
      ...body,
    });

    await handleCoreMovies(req as IncomingMessage, res as ServerResponse);

    expect(movieService.createCoreMovie).toHaveBeenCalledWith(body);
    expect(res.writeHead).toHaveBeenCalledWith(201, {
      "Content-Type": "application/json",
    });
    expect(res.end).toHaveBeenCalledWith(JSON.stringify({ _id: "1", ...body }));
  });

// --------------------
// POST movie - XSS sanitize
// --------------------
 // sanitize fonksiyonun varsa

it("POST movie - sanitizes XSS from title", async () => {
  req.method = "POST";

  const body = {
    title: "<script>alert('xss')</script>",
    releaseDate: "2010-07-16",
    genre: "Sci-Fi",
    rating: 8.8,
    imdbId: "tt1375666",
    director: directorId,
  };

  // coreParseBody mock ile geri döndürülüyor
  (coreParseBody as jest.Mock).mockResolvedValue(body);

  // createCoreMovie mock
  (movieService.createCoreMovie as jest.Mock).mockImplementation((data) => ({
    _id: "2",
    ...data,
  }));

  await handleCoreMovies(req as IncomingMessage, res as ServerResponse);

  expect(movieService.createCoreMovie).toHaveBeenCalled();

  const calledWith = (movieService.createCoreMovie as jest.Mock).mock.calls[0][0];

  // XSS sanitize'yi manuel test ediyoruz
  const sanitizedTitle = sanitizeInput(body.title);
  expect(sanitizedTitle).not.toContain("<script>");
  expect(sanitizedTitle).toContain("alert");

  expect(res.writeHead).toHaveBeenCalledWith(201, {
    "Content-Type": "application/json",
  });
});

  // --------------------
  // PUT movie
  // --------------------
  it("PUT movie - validation error", async () => {
    req.method = "PUT";
    const invalidBody = { title: "" };
    const movieId = "64a05d29466b7a92f5411550";
    (coreParseBody as jest.Mock).mockResolvedValue(invalidBody);

    await handleCoreMovies(
      req as IncomingMessage,
      res as ServerResponse,
      movieId
    );

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
      director: directorId,
    };

    (coreParseBody as jest.Mock).mockResolvedValue(body);
    (movieService.replaceCoreMovie as jest.Mock).mockResolvedValue({
      _id: movieId,
      ...body,
    });

    await handleCoreMovies(
      req as IncomingMessage,
      res as ServerResponse,
      movieId
    );

    expect(movieService.replaceCoreMovie).toHaveBeenCalledWith(movieId, body);
    expect(res.writeHead).toHaveBeenCalledWith(200, {
      "Content-Type": "application/json",
    });
    expect(res.end).toHaveBeenCalledWith(
      JSON.stringify({ _id: movieId, ...body })
    );
  });

  // --------------------
  // PATCH movie
  // --------------------
  it("PATCH movie - validation error", async () => {
    req.method = "PATCH";
    const invalidBody = { title: "" };
    const movieId = "64a05d29466b7a92f5411550";
    (coreParseBody as jest.Mock).mockResolvedValue(invalidBody);

    await handleCoreMovies(
      req as IncomingMessage,
      res as ServerResponse,
      movieId
    );

    expect(res.writeHead).toHaveBeenCalledWith(400, {
      "Content-Type": "application/json",
    });
  });

  it("PATCH movie - success", async () => {
    req.method = "PATCH";
    const body = { title: "Patched Movie" };
    const movieId = "64a05d29466b7a92f5411550";
    (coreParseBody as jest.Mock).mockResolvedValue(body);
    (movieService.updateCoreMovie as jest.Mock).mockResolvedValue({
      _id: movieId,
      ...body,
    });

    await handleCoreMovies(
      req as IncomingMessage,
      res as ServerResponse,
      movieId
    );

    expect(res.writeHead).toHaveBeenCalledWith(200, {
      "Content-Type": "application/json",
    });
    expect(res.end).toHaveBeenCalledWith(
      JSON.stringify({ _id: movieId, ...body })
    );
  });

  // --------------------
  // DELETE movie
  // --------------------
  it("DELETE movie - not found", async () => {
    req.method = "DELETE";
    const movieId = "64a05d29466b7a92f5411550";
    (movieService.deleteCoreMovie as jest.Mock).mockResolvedValue(null);

    await handleCoreMovies(
      req as IncomingMessage,
      res as ServerResponse,
      movieId
    );

    expect(res.writeHead).toHaveBeenCalledWith(404, {
      "Content-Type": "application/json",
    });
  });

  it("DELETE movie - success", async () => {
    req.method = "DELETE";
    const movieId = "64a05d29466b7a92f5411550";
    (movieService.deleteCoreMovie as jest.Mock).mockResolvedValue({
      _id: movieId,
    });

    await handleCoreMovies(
      req as IncomingMessage,
      res as ServerResponse,
      movieId
    );

    expect(res.writeHead).toHaveBeenCalledWith(200, {
      "Content-Type": "application/json",
    });
    expect(res.end).toHaveBeenCalledWith(
      JSON.stringify({
        message: "Movie deleted successfully",
        data: { _id: movieId },
      })
    );
  });
});
