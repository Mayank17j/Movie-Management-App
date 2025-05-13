//MS1_Assignment_1.8: Writing Unit and Integration Tests

//npm install jest
//npm run test
//const { Op } = require("sequelize");
const axiosInstance = require("../lib/axios.lib");
const { fetchMovieByQuery } = require("../controllers/curatedController");
const { updateCuratedList, saveMovieInWatchlist } = require("../controllers/dataController.js");

jest.mock("../lib/axios.lib.js"); // Mock axiosInstance globally

//UNIT TESTING: Unit tests focus on testing individual components or functions in isolation, without external dependencies like databases, APIs, or file systems. And Control the return value of the function.
describe("Unit test for Data Controller Functions", () => {
  let req, res;
  beforeEach(() => {
    req = { body: {}, params: {}, query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
    //TODO: Issue Jest did not exit one second after the test run has completed.
    // 'This usually means that there are asynchronous operations that weren't stopped in your tests. Consider running Jest with `--detectOpenHandles` to troubleshoot this issue.

    //"test": "jest --detectOpenHandles --runInBand" , --forceExit
    //jest.useFakeTimers(); // Prevents timers from causing issues
    //OR Jest might be holding unresolved promises due to incorrect mocking.
    // axiosInstance.put.mockResolvedValue({ data: { success: true } });
    // axiosInstance.get.mockResolvedValue({ data: { success: true } });
    // axiosInstance.post.mockResolvedValue({ data: { success: true } });
  });
  // Trying for Jest did not exit one second after the test run has completed
  // afterAll(() => {
  //   // Ensure all open handles are cleared
  //   jest.clearAllMocks();
  //   jest.resetAllMocks();
  //   jest.restoreAllMocks();
  //   jest.useRealTimers();
  // });

  describe("1. PUT CuratedList", () => {
    it("1. should return 201 if CuratedList is update successfully: updateCuratedList", async () => {
      req.body = {
        name: "Horror Movies",
        description: "A collection of the best horror films.",
        slug: "horror-movies",
      };

      req.params.curatedListId = 1;
      //const mockValue = { data: mockValue };
      //axiosInstance.put.mockResolvedValue(req.body);

      await updateCuratedList(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Curated list updated successfully.",
          updatedCuratedList: expect.objectContaining(req.body),
          //?NOTE: other option than expect.objectContaining
          //? createdAt: expect.anything(), // Accepts any value (including null)
          //? updatedAt: expect.any(Date), // Ensures updatedAt is a valid date
        })
      );
    });
    it("2. should return 400 if CuratedListId not found", async () => {
      req.params.curatedListId = 0;
      //axiosInstance.put.mockResolvedValue(null);
      await updateCuratedList(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "curatedListId must be present to update CuratedList!",
      });
    });
  });

  describe("2. POST saveMovieInWatchlist", () => {
    it("1. should return 201 if Watchlist created successfully", async () => {
      req.body = {
        movieId: 27205,
      };
      //axiosInstance.post.mockResolvedValue(req.body);

      await saveMovieInWatchlist(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Movie already in watchlist!.",
        watchList: expect.objectContaining({ id: 7, movieId: 1 }),
      });
    });
    it("2. should return 400 if CuratedListId not found", async () => {
      //axiosInstance.post.mockResolvedValue(null);
      await saveMovieInWatchlist(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "movieId is not present!",
      });
    });
  });
});

describe("Intregation test for Curated Controller Functions", () => {
  let req, res;
  beforeEach(() => {
    req = { body: {}, params: {}, query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  describe("1. get fetchMovieByQuery", () => {
    // /movies/search?query=Inception
    it("1. should return 201 if fetchMovieByQuery get result successfully", async () => {
      req.query.query = "Inception";
      const mockResponse = {
        data: {
          results: [
            {
              actors: "",
              description: "No description available",
              genre: "",
              title: "Inception",
              id: 27205,
              release_date: "2010/00/00",
              vote_average: 8.3,
            },
          ],
        },
      };
      axiosInstance.get.mockResolvedValue(mockResponse);
      //This mocking the value of movie in
      // const movies = await axiosInstance.get(`/search/movie?query=${query}`);

      await fetchMovieByQuery(req, res);

      expect(axiosInstance.get).toHaveBeenCalledWith(`/search/movie?query=Inception`);
      //expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining([
          {
            actors: "",
            description: "No description available",
            genre: "",
            rating: 8.3,
            releaseYear: "2010",
            title: "Inception",
            tmdbId: 27205,
          },
        ])
      );
    });
    it("2. should return 404 if fetchMovieByQuery not found!", async () => {
      req.query.query = "000alpha";
      axiosInstance.get.mockResolvedValue(null);
      await fetchMovieByQuery(req, res);

      expect(axiosInstance.get).toHaveBeenCalledWith(`/search/movie?query=000alpha`);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "unable to get axios response for movies",
      });
    });
  });
});
