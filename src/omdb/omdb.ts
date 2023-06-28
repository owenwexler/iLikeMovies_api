import axios from 'axios';

import { movieNotFound } from '../data/movieNotFound';
import { OMDBMovieResponse } from '../interfaces/OMDBMovieResponse';
import { Movie } from '../interfaces/Movie';
import { OMDBRatingResponse } from '../interfaces/OMDBRatingResponse';
import { Rating } from '../interfaces/Rating';
import { OMDBError } from '../interfaces/OMDBError';
import { NetworkError } from '../interfaces/NetworkError';
import { blankOMDBResponse } from '../data/blankOMDBResponse';

const formatRatingsInOMDBResponse = (ratings: OMDBRatingResponse[]): Rating[] => {
  return ratings.map(rating => {
    return { source: rating.Source, value: rating.Value }
  });
}

const getOMDBMovie = async (movieTitle: string): Promise<OMDBMovieResponse | NetworkError> => {
  try {
    const result = await axios(`http://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&t=${movieTitle.toLowerCase()}&r=json&plot=short`);
    return result.data;
  } catch (error) {
    const err: string = error ? error.toString() : '';
    return { error: err }
  }
};

interface FormatOMDBMovieArgs {
  title: string;
  movieData: OMDBMovieResponse | OMDBError;
}

const formatOMDBMovie = (args: FormatOMDBMovieArgs): Movie => {
  const {
    title,
    movieData
  } = args;

  const typedMovieResponse = movieData.Response === 'True' ? movieData as OMDBMovieResponse : blankOMDBResponse;

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
    } = typedMovieResponse;

    return {
      id: '',
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

export {
  getOMDBMovie,
  formatOMDBMovie
};