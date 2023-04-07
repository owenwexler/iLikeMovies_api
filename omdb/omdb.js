const axios = require('axios');

const { movieNotFound } = require('../data/movieNotFound');

const formatRatingsInOMDBResponse = (ratings) => {
  return ratings.map(rating => {
    return { source: rating.Source, value: rating.Value }
  });
}

const getOMDBMovie = async (movie) => {
  try {
    const result = await axios(`http://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&t=${movie.toLowerCase()}&r=json&plot=short`);
    return result.data;
  } catch (error) {
    return { error: error }
  }
};

const formatOMDBMovie = (args) => {
  const {
    title,
    movieData
  } = args;

  if (movieData.Response === 'False') {
    return {
      ...movieNotFound,
      title
    }
  } else {
    const {
      Title,
      Year,
      Rated,
      Released,
      Runtime,
      Genre,
      Director,
      Writer,
      Actors,
      Plot,
      Language,
      Country,
      Awards,
      Poster,
      Ratings,
      Metascore,
      imdbRating,
      imdbVotes,
      imdbID,
      Type,
      DVD,
      BoxOffice,
      Production,
      Website,
      Response
    } = movieData;

    return {
      title: Title,
      year: Year,
      rated: Rated,
      released: Released,
      runtime: Runtime,
      genre: Genre,
      director: Director,
      writer: Writer,
      actors: Actors,
      plot: Plot,
      language: Language,
      country: Country,
      awards: Awards,
      poster: Poster,
      ratings: formatRatingsInOMDBResponse(Ratings),
      metascore: Metascore,
      imdbRating,
      imdbVotes,
      imdbID,
      type: Type,
      dvd: DVD,
      boxOffice: BoxOffice,
      production: Production,
      website: Website,
      response: Response,
      watched: false
    }
  }
};

module.exports = {
  getOMDBMovie,
  formatOMDBMovie
};