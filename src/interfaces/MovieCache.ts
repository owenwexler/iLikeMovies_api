import type { OMDBMovieResponse } from "./OMDBMovieResponse";

interface MovieCache {
  [key: string]: OMDBMovieResponse;
}

export type {
  MovieCache
}