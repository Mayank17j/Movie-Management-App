const express = require("express");
require("dotenv").config();
const app = express();
const cors = require("cors");
const { sequelize } = require("./models");

app.use(cors());
app.use(express.json());

const axiosInstance = require("./lib/axios.lib");
//console.log("Log.index.axiosInstance.SET");
axiosInstance
  .get(`/configuration`)
  .then((response) => console.log("Log.index.axiosInstance.SUCCESS.RESULT,configuration images =", response.data.images.base_url))
  .catch((error) =>
    console.log({
      message: "LOG.Error fetching axiosInstance health",
      error: error.message,
    })
  );

const {
  createCuratedList,
  updateCuratedList,
  saveMovieInWatchlist,
  saveMovieInWishlist,
  saveMovieInCuratedListItems,
  saveMovieReviews,
  filterMovies,
  sortMovieList,
  getTopRatedMovies,
} = require("./controllers/dataController");
const { fetchMovieByQuery } = require("./controllers/curatedController");
app.get("/movies/search", fetchMovieByQuery);
/*
  MS1_Assignment_2.2: Making API Calls From TMDB
  /movies/search?query=Inception
  Extract (title, tmdbId , genre, actors, releaseYear, rating , and description)
  http://localhost:3000/api/movies/search?query=Inception
  Output:
  {
  movies':[
    {
    title': 'Inception',
    tmdbId': 27205,
    genre': '28, 878, 12',
    actors': 'Leonardo DiCaprio, Joseph Gordon-Levitt, Ken Watanabe, Tom Hardy, Elliot Page',
    releaseYear': '2010',
    rating': 8.368,
    description': 'Cobb, a skilled thief who commits ....'
    },
  ...
  ] 
}*/

app.post("/curated-lists", createCuratedList);
app.put("/curated-lists/:curatedListId", updateCuratedList);
/*
  MS1_Assignment_2.3: Creating and Managing Curated Lists
  PUT /curated-lists/:curatedListId Managing
  POST /curated-lists create
    http://localhost:3000/api/curated-lists
  Request Body:
    {
    name': 'Horror Movies',
    description': 'A collection of the best horror films.',
    slug': 'horror-movies'
    }
  Output:
    {
    message': 'Curated list created successfully.'
    }
  Type: PUT
  API Endpoint:
  http://localhost:3000/api/curated-lists/:curatedListId
  Request Body`
    {
    name': 'Updated List Name',
    description': 'Updated description.'
    }
  Output:
    {
    message': 'Curated list updated successfully.'
    }
*/

app.post("/movies/watchlist", saveMovieInWatchlist);
app.post("/movies/wishlist", saveMovieInWishlist);
app.post("/movies/curated-list-items", saveMovieInCuratedListItems);
/*
MS1_Assignment_2.4: Saving Movies to Watchlist, Wishlist, and Curated Lists
API Spec:
Type: POST
API Endpoint:
http://localhost:3000/api/movies/watchlist
Request Body:
{
"movieId": 27205
}
Output:
{
message': 'Movie added to watchlist successfully.'
}
Type: POST
API Endpoint:
http://localhost:3000/api/movies/wishlist
Request Body:
{
movieId': 27205
}
Output:
{
message': 'Movie added to wishlist successfully.'
}
Type: POST
API Endpoint:
http://localhost:3000/api/movies/curated-list
Request Body:
{
"movieId": 27205,
"curatedListId": 1
}
Output:
{
message': 'Movie added to curated list successfully.'
}
Hint:
Ensure that you validate the movie ID and check if the movie already exists in the curated list.
*/

app.post("/movies/:movieId/reviews", saveMovieReviews);
/*
MS1_Assignment_2.5: Adding Reviews and Ratings to Movies
Create an API to add reviews and ratings to movies.
Instructions:
  Allow users to submit a rating and review for movies.
  Store these reviews in your database.
API Spec:
Type: POST
API Endpoint:
http://localhost:3000/api/movies/:movieId/reviews
Request Body:
{
"rating": 4.5,
"reviewText": 'Great movie with a brilliant plot.'
}
Output:
{
message': 'Review added successfully.'
}
Validations:
Rating: Must be a float between 0 and 10.
Review Text: Maximum of 500 characters.
*/

app.get("/movies/searchByGenreAndActor", filterMovies);
/*
MS1_Assignment_2.6: Searching Lists by Genre and Actor
http://localhost:3000/api/movies/searchByGenreAndActor?genre=Action&actor=Leonardo DiCaprio
Output:
{
movies':[
{
id': 1,
title': 'Inception',
tmdbId': 27205,
genre': 'Action, Science Fiction, Adventure',
actors': 'Leonardo DiCaprio, Joseph Gordon-Levitt, Ken Watanabe, Tom Hardy, Elliot Page',
releaseYear': 2010,
rating': 8.368,
description': 'Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible: \\'inception\\', the implantation of another person's idea into a target's subconscious.',
createdAt': '2024-10-29T05:46:57.144Z',
updatedAt': '2024-10-29T05:46:57.144Z'
}
]
}*/

app.get("/movies/sort", sortMovieList);
/*
MS1_Assignment_2.7: Sorting by Ratings or Year of Release
Implement sorting for the Watchlist, Wishlist, and CuratedLists by rating or year of release.
http://localhost:3000/api/movies/sort?list=watchlist&sortBy=rating&order=ASC
Output:
{
  movies': [
    {
    title': 'Thor: Love and Thunder',
    tmdbId': 616037,
    genre': 'Fantasy, Action, Comedy',
    actors': 'Chris Hemsworth, Natalie Portman, Christian Bale, Tessa Thompson, Russell Crowe',
    releaseYear': 2022,
    rating': 6.4
    },
    {
    title': 'Inception',
    tmdbId': 27205,
    genre': 'Action, Science Fiction, Adventure',
    actors': 'Leonardo DiCaprio, Joseph Gordon-Levitt, Ken Watanabe, Tom Hardy, Elliot Page',
    releaseYear': 2010,
    rating': 8.368
    }
  ]
}*/

app.get("/movies/top5", getTopRatedMovies);
/*
MS1_Assignment_2.8: Get Top 5 Movies by Rating + Detailed Review
Create an API to get the top 5 movies by rating and display their detailed reviews (with word count).
Instructions:
  Query the database for the top 5 highest-rated movies and retrieve their associated reviews.
  Count the number of words in each review and include that information in the response.
API Spec:
Type: GET
API Endpoint:
http://localhost:3000/api/movies/top5
Output:
{
  movies': [
    {
      title': 'Inception',
      rating': 8.368,
      review': {
        text': 'Great movie with a brilliant plot.',
        wordCount': 6
        }
      },
      {
      title': 'Thor',
      rating': 6.769,
      review': {
      text': 'Betest one',
      wordCount': 2
      }
      },
      {
      title': 'Thor: Love and Thunder',
      rating': 6.4,
      review': {
      text': 'bestest movoe ever seen',
      wordCount': 4
      }
    }
  ]
}
Hint: Use JavaScript’s .length(' ') method to calculate the word count for each review.
*/
//TODO:Testing
/*
MS1_Assignment_2.9: Testing and Final Touches
Task:
Write unit and integration tests for the APIs, ensuring all functionalities are working as expected.
Instructions:
Use Jest or another testing framework to write unit tests for the core functionality (e.g., adding to watchlist, submitting reviews).
Write integration tests to ensure the APIs are functioning end-to-end.
*/

sequelize
  .authenticate()
  .then(() => {
    console.log("Database connected");
  })
  .catch((error) => {
    console.error("Unable to connect database", error);
  });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running in port ${PORT}`);
});
