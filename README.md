```markdown
# Movie Management App

A web application for discovering, organizing, and reviewing movies using the TMDB API.

## Features

- Search for movies using the TMDB API
- Add movies to watchlists and wishlists
- Create and manage curated movie lists
- Add reviews and ratings for movies
- Filter movies by genre and actor
- Sort movies by rating or release year
- View top-rated movies with reviews

## Tech Stack

- **Backend** : Node.js, Express
- **Database** : Sequelize (SQL)
- **API** : TMDB (The Movie Database)
- **Testing** : Jest (TODO)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/movie-curator.git
   cd movie-management-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with your TMDB API key:
   ```
   API_KEY=your_tmdb_api_key_here
   ```

4. Set up the database:
   ```bash
   npx sequelize-cli db:migrate
   ```

5. Start the server:
   ```bash
   npm start
   ```

## API Endpoints

### Movie Search
- `GET /movies/search?query={query}` - Search for movies by title
- `GET /movies/searchByGenreAndActor?genre={genre}&actor={actor}` - Filter movies by genre and actor

### Lists Management
- `POST /curated-lists` - Create a new curated list
- `PUT /curated-lists/:curatedListId` - Update a curated list

### Movie Organization
- `POST /movies/watchlist` - Add movie to watchlist
- `POST /movies/wishlist` - Add movie to wishlist
- `POST /movies/curated-list-items` - Add movie to curated list

### Reviews
- `POST /movies/:movieId/reviews` - Add review and rating for a movie

### Sorting and Top Movies
- `GET /movies/sort?list={list}&sortBy={field}&order={ASC|DESC}` - Sort movies in a list
- `GET /movies/top5` - Get top 5 rated movies with reviews

## Database Models

### Movie
- Stores movie details (title, TMDB ID, genre, actors, release year, rating, description)
- Has relationships with Review, Watchlist, Wishlist, and CuratedListItem

### Watchlist
- Tracks movies users want to watch
- Belongs to Movie

### Wishlist
- Tracks movies users want to see
- Belongs to Movie

### Review
- Stores user ratings and reviews
- Belongs to Movie

### CuratedList
- Contains named collections of movies
- Has many CuratedListItems

### CuratedListItem
- Junction table for CuratedList and Movie
- Belongs to both CuratedList and Movie

## Development

### Running Tests
```bash
npm test
```

### Environment Variables
- `API_KEY`: Your TMDB API key
- `PORT`: Server port (default: 3000)

## Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Acknowledgments
- [The Movie Database (TMDB)](https://www.themoviedb.org/) for their API
- Sequelize for ORM
- Express for web framework
