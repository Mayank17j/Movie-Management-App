//get curated items
//To query from client website through URL using axios
const axiosInstance = require("../lib/axios.lib");
const { movie: movieModel } = require("../models");

//GET fetchMovieByQuery search for photos from the TMDB API based on a user-provided search term.
// /movies/search?query=Inception
const fetchMovieByQuery = async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ error: "fetchMovieByQuery: query must present!" });
  //console.log("LOG.curatedController.fetchMovieByQuery.query", query);

  try {
    const movies = await axiosInstance.get(`/search/movie?query=${query}`);
    if (!movies?.data)
      return res.status(404).json({
        error: "unable to get axios response for movies",
      });
    //console.log("LOG.curatedController.fetchMovieByQuery.response.data.results", movies?.data?.results);

    //?NOTE:Promise, default values
    //Promise.allSettled() to allow partial failures (some actor requests might fail, but other movies still return data).
    //Promise.all() not to allow partial failures.
    const movie = await Promise.all(movies.data.results.map(async (movieData) => await formatedMovieData(movieData)));
    //console.log("LOG.curatedController.fetchMovieByQuery.movie.data", movie);

    res.status(200).json(movie);
  } catch (error) {
    //console.log("LOG.curatedController.fetchMovieByQuery.500", error);
    res.status(500).json({ error: error.message });
  }
};

const formatedMovieData = async (movieData) => {
  return {
    title: movieData.title || "Unknown",
    tmdbId: movieData.id || 0,
    genre: movieData.genre_ids?.join(", ") || movieData.genres?.map((genre) => genre.id).join(", ") || "", // extract genre
    actors: (await fetchActorsByMovieId(movieData.id)).join(", "), //at most 5
    releaseYear: movieData?.release_date?.substring(0, 4) || "0000", //get year value
    rating: movieData.vote_average || 0,
    description: movieData.overview || "No description available",
  };
};

const fetchActorsByMovieId = async (movieId) => {
  try {
    const movieDetails = await axiosInstance.get(`/movie/${movieId}/credits`);
    //?pass //movieDetails
    ////console.log(
    //   "LOG.curatedController.getActors.movieDetails.(movieDetails.data.cast)",
    //   movieDetails.data.cast
    // );
    //!undefined //movieDetails.cast

    return (
      movieDetails?.data?.cast
        ?.filter((actor) => actor.known_for_department === "Acting")
        ?.slice(0, 5)
        ?.map((actor) => actor.name) || []
    );
    //console.log("LOG.curatedController.getActors.actorsNames", actorsNames);
  } catch (error) {
    console.error(`Failed to fetch actors for movieId ${movieId}:`, error.message);
    return "Unable to fetch fetchActorsByMovieId";
  }
};

const fetchMovieByTmdbId = async (movieId) => {
  try {
    const movieDetails = await axiosInstance.get(`/movie/${movieId}`);
    if (!movieDetails?.data)
      return {
        error: "fetchMovieBytmdbId: unable to get axios response for movieDetails",
      };
    //console.log("LOG.fetchMovieBytmdbId.(movieDetails.data.movie_results)", movieDetails.data);

    const formattedMovie = await formatedMovieData(movieDetails.data);
    const movieDataCreated = await movieModel.create(formattedMovie);
    //console.log("LOG.fetchMovieBytmdbId.movieDataCreated.201", movieDataCreated?.dataValues);

    return movieDataCreated?.dataValues?.id || null;
  } catch (error) {
    //console.log("LOG.fetchMovieBytmdbId.500", error);
    return { error: error.message };
  }
};

const fetchMovieAndCastDetails = async (movieId) => {
  try {
    //const tmdbId=
    const id = await fetchMovieByTmdbId(movieId);
    //console.log("LOG.service.fetchMovieAndCastDetails.id", id);
    return id;
  } catch (error) {
    //console.log("LOG.service.fetchMovieAndCastDetails.500", error);
    return error;
  }
};

module.exports = {
  fetchMovieByQuery,
  fetchActorsByMovieId,
  fetchMovieByTmdbId,
  fetchMovieAndCastDetails,
};
