import { Movie } from "./Movie";

interface MovieCache {
  [key: string]: Movie;
}

export type {
  MovieCache
}