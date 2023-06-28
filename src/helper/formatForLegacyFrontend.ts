import { MovieCache } from "../interfaces/MovieCache";

const formatForLegacyFrontend = (cache: MovieCache, userMovieList: string[]) => {
  return userMovieList.map(movie => cache[movie]);
}

export {
  formatForLegacyFrontend
}