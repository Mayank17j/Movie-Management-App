//createCurated, getCurated
//to work with DB using sequelize

let { Op } = require("@sequelize/core");
const {
  curatedList: curatedListModel,
  curatedListItem: curatedListItemModel,
  movie: movieModel,
  review: reviewModel,
  watchlist: watchlistModel,
  wishlist: wishlistModel,
} = require("../models");
const { fetchMovieAndCastDetails } = require("./curatedController");

//Creating and Managing Curated Lists
const createCuratedList = async (req, res) => {
  //?NOTE:slug
  const { name, description = "No description", slug: movieSlug } = req.body;
  if (!name) return res.status(400).json({ error: "Name must be present to create CuratedList!" });
  //   let slug = req.body.slug;
  //   if (!slug) {
  //     slug = createSlug(name);
  //   }
  const slug = movieSlug || createSlug(name); // ✅ Assign slug only if not provided

  try {
    // const errors = await validCreateUserData(req.body);
    // console.log("LOG.dataController.createCuratedList.isValidData", errors);
    // if (errors.length > 0) return res.status(400).json({ errors: errors });
    const newCuratedList = await curatedListModel.create({
      name,
      slug,
      description,
    });

    res.status(201).json({
      message: "Curated list created successfully.",
      newCuratedList,
    });
  } catch (error) {
    console.log("LOG.dataController.createCuratedList.500", error);
    res.status(500).json({ message: "Failed to create CuratedList!", error: error.message });
  }
};

const updateCuratedList = async (req, res) => {
  const { curatedListId } = req.params;
  const { name, description, slug: movieSlug } = req.body;

  if (!curatedListId) return res.status(400).json({ error: "curatedListId must be present to update CuratedList!" });
  if (!name || !description)
    return res.status(400).json({
      error: "Both name and description require to update CuratedList!",
    });
  const slug = movieSlug || createSlug(name);

  try {
    const response = await curatedListModel.findByPk(curatedListId);
    if (!response)
      return res.status(404).json({
        message: `Curated list not found at id: ${curatedListId}`,
      });

    await curatedListModel.update(
      { name, description, slug },
      {
        where: { id: curatedListId },
      }
    );
    //console.log("LOG.dataController.updateCuratedList.response:", response);

    const updatedCuratedList = await curatedListModel.findByPk(curatedListId);

    res.status(201).json({
      message: "Curated list updated successfully.",
      updatedCuratedList: updatedCuratedList,
    });
  } catch (error) {
    console.log("LOG.dataController.updateCuratedList.500", error);
    res.status(500).json({ message: "Failed to update CuratedList!", error: error.message });
  }
};

// const createSlug = (name) => {
//   return name.toLowerCase().split(" ").join("-");
// };

//?NOTE: ✅ Simplified slug creation function
//No need of return in call back
const createSlug = (name) => name.toLowerCase().split(" ").join("-");

const saveMovieInWatchlist = async (req, res) => {
  const { movieId } = req.body;
  if (!movieId || !Number.isInteger(movieId)) return res.status(400).json({ error: "movieId is not present!" });
  console.log("LOG.saveMovieInWatchlist.movieId", movieId);

  try {
    let id = await movieExistsInDB(movieId);
    if (!id) {
      id = await fetchMovieAndCastDetails(movieId);
    } else {
      console.log(`Movie already in movie DB with movieId: ${id}!`);
    }

    const presentInWatchlist = await watchlistModel.findOne({
      where: { movieId: id },
    });
    if (presentInWatchlist)
      return res.status(200).json({
        message: "Movie already in watchlist!.",
        watchList: presentInWatchlist,
      });

    const watchList = await watchlistModel.create({ movieId: id });

    res.status(201).json({
      message: "Movie added to watchlist successfully.",
      watchList,
    });
  } catch (error) {
    console.log(`Failed to save movie: ${movieId} in watchList.500`);
    res.status(500).json({
      message: "Failed to save movie in watchlist!",
      error: error.message,
    });
  }
};

const saveMovieInWishlist = async (req, res) => {
  const { movieId } = req.body;
  if (!movieId || !Number.isInteger(movieId)) return res.status(400).json({ error: "movieId is not present!" });
  console.log("LOG.saveMovieInWishlist.movieId", movieId);

  try {
    let id = await movieExistsInDB(movieId);
    if (!id) {
      id = await fetchMovieAndCastDetails(movieId);
    } else {
      console.log(`Movie already in movie DB with movieId: ${id}!`);
    }

    const presentInWishlist = await wishlistModel.findOne({
      where: { movieId: id },
    });
    if (presentInWishlist)
      return res.status(200).json({
        message: "Movie already in wishlist!.",
        watchList: presentInWishlist,
      });

    const wishlist = await wishlistModel.create({ movieId: id });

    res.status(201).json({
      message: "Movie added to wishlist successfully.",
      wishlist,
    });
  } catch (error) {
    console.log(`Failed to save movie: ${movieId} in wishlist.500`);
    res.status(500).json({
      message: "Failed to save movie in wishlist!",
      error: error.message,
    });
  }
};

const saveMovieInCuratedListItems = async (req, res) => {
  const { movieId, curatedListId } = req.body;
  if (!Number.isInteger(movieId)) return res.status(400).json({ error: "Invalid or missing movieId!" });
  console.log("LOG.saveMovieInCuratedListItems.movieId", movieId);
  if (!Number.isInteger(curatedListId)) return res.status(400).json({ error: "Invalid or missing curatedListId!" });
  console.log("LOG.saveMovieInCuratedListItems.curatedListId", curatedListId);

  try {
    let id = await movieExistsInDB(movieId);
    if (!id) {
      id = await fetchMovieAndCastDetails(movieId);
    } else {
      console.log(`Movie already in movie DB with movieId: ${id}!`);
    }

    const curatedList = await curatedListModel.findByPk(curatedListId);
    if (!curatedList)
      return res.status(404).json({
        message: `CuratedList not present with id: ${curatedListId}.`,
      });

    const existingCuratedListItem = await curatedListItemModel.findOne({
      where: { movieId: id, curatedListId: curatedListId },
    });
    if (existingCuratedListItem)
      return res.status(200).json({
        message: "Movie already in curatedListItem!.",
        curatedListItem: existingCuratedListItem,
      });

    const newCuratedListItemModel = await curatedListItemModel.create({
      movieId: id,
      curatedListId: curatedListId,
    });

    res.status(201).json({
      message: "Movie added to curatedListItems successfully.",
      newCuratedListItemModel,
    });
  } catch (error) {
    console.error(`LOG.saveMovieInCuratedListItems.500`);
    res.status(500).json({
      message: "Failed to add in curatedListItems!",
      error: error.message,
    });
  }
};

//service function to check if the movie is present in your Movies table
const movieExistsInDB = async (movieId) => {
  try {
    const response = await movieModel.findOne({ where: { tmdbId: movieId } });

    console.log("LOG.dataController.movieExistsInDB.response", response?.dataValues);
    return response?.id || false;
  } catch (error) {
    console.log("LOG.dataController.movieExistsInDB.500", error);
    return error;
  }
};

const saveMovieReviews = async (req, res) => {
  //for exist movieId in movieDB
  const { rating, reviewText } = req.body;
  const movieId = parseInt(req.params.movieId); //TMDB_ID

  console.log("LOG.saveMovieReviews.movieId", movieId);
  if (!Number.isInteger(movieId)) return res.status(400).json({ error: "Invalid or missing movieId!" });
  console.log("LOG.saveMovieReviews.rating", rating);
  if (!rating && !reviewText) return res.status(400).json({ error: "Rating or Review is invalid!" });
  else {
    if (rating < 0 || rating > 10) return res.status(400).json({ error: "Invalid rating!" });
    console.log("LOG.saveMovieReviews.reviewText", reviewText);
    if (reviewText?.length > 500) return res.status(400).json({ error: "Invalid or missing reviewText!" });
  }

  try {
    let id = await movieExistsInDB(movieId);
    if (!id) {
      id = await fetchMovieAndCastDetails(movieId);
    } else {
      console.log(`Movie already in movie DB with movieId: ${id}!`);
    }

    //check if review exist
    const existingReview = await reviewModel.findOne({
      where: { movieId: id },
    });
    if (existingReview)
      return res.status(200).json({
        message: "Review already in exist for this movie!",
        existingReview: existingReview,
      });

    const newReview = await reviewModel.create({
      movieId: id,
      ...req.body,
    });

    res.status(201).json({
      message: "Review added successfully.",
      newReview,
    });
  } catch (error) {
    console.error(`LOG.saveMovieReviews.500`, error);
    res.status(500).json({
      message: "Failed to save movie reviews!",
      error: error.message,
    });
  }
};

const filterMovies = async (req, res) => {
  const { genre, actor } = req.query;

  console.log("LOG.filterMovies.genre", genre);
  console.log("LOG.filterMovies.actor", actor);
  if (!genre && !actor) return res.status(400).json({ error: "Actor or Genre is invalid!" });

  try {
    //?NOTE: dynamic filter where condition
    let whereCondition = {};
    if (actor) whereCondition.actors = { [Op.like]: `%${actor},%` };
    if (genre) whereCondition.genre = { [Op.like]: `%${genre},%` };

    const movieList = await movieModel.findAll({
      where: whereCondition,
    });
    console.log("LOG.filterMovies.movie", movieList);

    res.status(201).json({
      message: "Movie found succesfully.",
      movies: movieList,
    });
  } catch (error) {
    console.error(`LOG.filterMovies.500`, error);
    res.status(500).json({
      message: "Failed to filterMovies!",
      error: error.message,
    });
  }
};

const sortMovieList = async (req, res) => {
  const { list = "watchlist", sortBy = "rating", order = "ASC" } = req.query;
  //list = "watchlist || wishlist || curatedlist", sortBy = "rating || releaseYear", order = "ASC || DESC"
  console.log("LOG.sortMovieList.query: ", list, sortBy, order);

  try {
    let model; //based on list value
    if (list === "curatedlist") model = curatedListItemModel;
    else if (list === "wishlist") model = wishlistModel;
    else model = watchlistModel;

    const movieList = await model.findAll({
      include: [
        {
          model: movieModel, // Join with movieModel using foreignKey 'movieId'
          required: true, // Ensures only existing movies are fetched
        },
      ],
      order: [[movieModel, sortBy, order]], //?NOTE: if sorting main table use [], for sorting associated table use [[modelName]]
      attributes: [], // Exclude model attributes
      raw: true, // Fetch raw movie data not include header
      nest: true, // Nest the movie object, prevent key as string Ex. movie.id: 1 not 'movie.id': 1
    });

    const formatedMovies = movieList.map((item) => item.movie);
    console.log("LOG.sortMovieList.movies:", formatedMovies);
    res.status(200).json({
      movies: formatedMovies,
    });
  } catch (error) {
    console.error(`LOG.sortMovieList.500`, error);
    res.status(500).json({
      message: "Failed to sortMovieList!",
      error: error.message,
    });
  }
};

const getTopRatedMovies = async (req, res) => {
  try {
    //get movielist sort by rating
    const movieList = await movieModel.findAll({
      order: [["rating", "DESC"]], //double array for multiple sorting
      attributes: ["title", "rating"],
      include: [
        {
          model: reviewModel,
          required: true,
          attributes: ["reviewText"],
        },
      ],
      limit: 5,
      nest: true, // Nest objects properly
    });
    console.log("LOG.getTopRatedMovies.movie", movieList);

    //?NOTE: wordCount
    const formattedMovies = movieList.map((movie) => {
      const reviewText = movie.reviews[0]?.reviewText || "";
      return {
        title: movie.title,
        rating: movie.rating,
        review: {
          text: reviewText,
          wordCount: reviewText ? reviewText.split(" ").length : 0,
        },
      };
    });

    res.status(200).json({
      movies: formattedMovies,
    });
  } catch (error) {
    console.error(`LOG.getTopRatedMovies.500`, error);
    res.status(500).json({
      message: "Failed to getTopRatedMovies!",
      error: error.message,
    });
  }
};

module.exports = {
  createCuratedList,
  updateCuratedList,
  saveMovieInWatchlist,
  saveMovieInWishlist,
  saveMovieInCuratedListItems,
  saveMovieReviews,
  filterMovies,
  sortMovieList,
  getTopRatedMovies,
};
