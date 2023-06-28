import type { Movie } from "../interfaces/Movie"

const movieNotFound: Movie = {
  title: 'title',
  year: 'Unknown',
  rated: 'No rating info available',
  released: 'Unknown',
  runtime: 'No runtime available',
  genre: 'Unknown Genre',
  director: 'Unknown',
  writer: 'Unknown',
  actors: 'No info available',
  plot: 'No plot available',
  language: 'No language info available',
  country: 'No info available',
  awards: 'No info available',
  poster: 'No info available',
  ratings: [],
  metascore: 'No info available',
  imdbRating: 'No info available',
  imdbVotes: 'No info available',
  imdbID: 'Unknown',
  type: 'movie',
  dvd: 'No info available',
  boxOffice: 'No info available',
  production: 'N/A',
  website: 'N/A',
  response: 'False',
  watched: false
}

export {
  movieNotFound
}