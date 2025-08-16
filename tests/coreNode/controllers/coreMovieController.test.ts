import { handleCoreMovies } from "../../../src/coreNode/controllers/coreMovieController";
import * as movieService from "../../../src/coreNode/services/coreMovieService";
import * as coreBodyParser from "../../../src/coreNode/utils/coreBodyParser";
import coreLogger from "../../../src/coreNode/utils/coreLogger";
import { IncomingMessage, ServerResponse } from "http";

jest.mock("../../../src/coreNode/services/coreMovieService");
jest.mock("../../../src/coreNode/utils/coreBodyParser");
jest.mock("../../../src/coreNode/utils/coreLogger");

describe("CoreMovieController", () => {
  let req: Partial<IncomingMessage>;
  let res: Partial<ServerResponse>;
  let resEndSpy: jest.SpyInstance;

  beforeEach(() => {
    req = {};
    resEndSpy = jest.fn();

    res = {
      writeHead: jest.fn(),
      end: resEndSpy,
    } as unknown as ServerResponse;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // GET all
  test("GET all movies - success", async () => {
    const fakeMovies = [{ title: "Movie1" }];
    (movieService.getAllCoreMovies as jest.Mock).mockResolvedValue(fakeMovies);
    req.method = "GET";

    await handleCoreMovies(req as IncomingMessage, res as ServerResponse);

    expect(movieService.getAllCoreMovies).toHaveBeenCalled();
    expect(res.writeHead).toHaveBeenCalledWith(200, {
      "Content-Type": "application/json",
    });
    expect(resEndSpy).toHaveBeenCalledWith(JSON.stringify(fakeMovies));
    expect(coreLogger.info).toHaveBeenCalled();
  });

  // GET by ID
  test("GET movie by ID - not found", async () => {
    req.method = "GET";
    const fakeId = "64a05d29466b7a92f5411550";
    req.url = `/coreApi/movies/${fakeId}`;
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
    expect(resEndSpy).toHaveBeenCalledWith(
      JSON.stringify({ message: "Movie not found" })
    );
    expect(coreLogger.warn).toHaveBeenCalled();
  });

  // POST - invalid
  test("POST movie - validation error", async () => {
    req.method = "POST";
    (coreBodyParser.coreParseBody as jest.Mock).mockResolvedValue({
      title: "",
    });

    await handleCoreMovies(req as IncomingMessage, res as ServerResponse);

    expect(res.writeHead).toHaveBeenCalledWith(400, {
      "Content-Type": "application/json",
    });
    expect(resEndSpy).toHaveBeenCalledWith(
      expect.stringContaining("Validation failed")
    );
    expect(coreLogger.warn).toHaveBeenCalled();
  });

  // POST - valid
  test("POST movie - success", async () => {
    req.method = "POST";
    const newMovie = {
      title: "Inception",
      releaseDate: "2010-07-16",
      genre: "Sci-Fi",
      rating: 8.8,
      imdbId: "tt1375666",
      director: "507f1f77bcf86cd799439011", // valid ObjectId formatında sahte id
    };
    (coreBodyParser.coreParseBody as jest.Mock).mockResolvedValue(newMovie);
    (movieService.createCoreMovie as jest.Mock).mockResolvedValue({
      ...newMovie,
      _id: "123",
    });

    await handleCoreMovies(req as IncomingMessage, res as ServerResponse);

    expect(res.writeHead).toHaveBeenCalledWith(201, {
      "Content-Type": "application/json",
    });
    expect(resEndSpy).toHaveBeenCalledWith(
      JSON.stringify({ ...newMovie, _id: "123" })
    );
    expect(coreLogger.info).toHaveBeenCalled();
  });

  // PUT - invalid
  test("PUT movie - validation error", async () => {
    req.method = "PUT";
    const movieId = "64a05d29466b7a92f5411550";
    (coreBodyParser.coreParseBody as jest.Mock).mockResolvedValue({
      title: "",
    });

    await handleCoreMovies(
      req as IncomingMessage,
      res as ServerResponse,
      movieId
    );

    expect(res.writeHead).toHaveBeenCalledWith(400, {
      "Content-Type": "application/json",
    });
    expect(resEndSpy).toHaveBeenCalledWith(
      expect.stringContaining("Validation failed")
    );
    expect(coreLogger.warn).toHaveBeenCalled();
  });

  // PUT - valid
  test("PUT movie - success", async () => {
    req.method = "PUT";
    const movieId = "64a05d29466b7a92f5411550";

    const updatedMovie = {
      title: "Inception Updated",
      releaseDate: "2010-07-16",
      genre: "Sci-Fi",
      rating: 9.0,
      imdbId: "tt1375666",
      director: "507f1f77bcf86cd799439011",
    };
    (coreBodyParser.coreParseBody as jest.Mock).mockResolvedValue(updatedMovie);
    (movieService.replaceCoreMovie as jest.Mock).mockResolvedValue({
      ...updatedMovie,
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
    expect(resEndSpy).toHaveBeenCalledWith(
      JSON.stringify({ ...updatedMovie, _id: movieId })
    );
    expect(coreLogger.info).toHaveBeenCalled();
  });

  // PATCH - invalid
  test("PATCH movie - validation error", async () => {
    req.method = "PATCH";
    const movieId = "64a05d29466b7a92f5411550";
    (coreBodyParser.coreParseBody as jest.Mock).mockResolvedValue({
      rating: -1,
    });

    await handleCoreMovies(
      req as IncomingMessage,
      res as ServerResponse,
      movieId
    );

    expect(res.writeHead).toHaveBeenCalledWith(400, {
      "Content-Type": "application/json",
    });
    expect(resEndSpy).toHaveBeenCalledWith(
      expect.stringContaining("Validation failed")
    );
    expect(coreLogger.warn).toHaveBeenCalled();
  });

  // PATCH - valid
  test("PATCH movie - success", async () => {
    req.method = "PATCH";
    const movieId = "64a05d29466b7a92f5411550";
    const patchedMovie = { rating: 9.2 };
    (coreBodyParser.coreParseBody as jest.Mock).mockResolvedValue(patchedMovie);
    (movieService.updateCoreMovie as jest.Mock).mockResolvedValue({
      ...patchedMovie,
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
    expect(resEndSpy).toHaveBeenCalledWith(
      JSON.stringify({ ...patchedMovie, _id: movieId })
    );
    expect(coreLogger.info).toHaveBeenCalled();
  });

  // DELETE - not found
  test("DELETE movie - not found", async () => {
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
    expect(resEndSpy).toHaveBeenCalledWith(
      JSON.stringify({ message: "Movie not found" })
    );
    expect(coreLogger.warn).toHaveBeenCalled();
  });

  // DELETE - success
  test("DELETE movie - success", async () => {
    req.method = "DELETE";
    const movieId = "64a05d29466b7a92f5411550";
    const deletedMovie = { _id: movieId, title: "Inception" };
    (movieService.deleteCoreMovie as jest.Mock).mockResolvedValue(deletedMovie);

    await handleCoreMovies(
      req as IncomingMessage,
      res as ServerResponse,
      movieId
    );

    expect(res.writeHead).toHaveBeenCalledWith(200, {
      "Content-Type": "application/json",
    });
    expect(resEndSpy).toHaveBeenCalledWith(
      JSON.stringify({
        message: "Movie deleted successfully",
        data: deletedMovie,
      })
    );
    expect(coreLogger.info).toHaveBeenCalled();
  });
});
