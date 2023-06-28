import 'dotenv/config';

import express, {Express, Request, Response} from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit'

import { formatForLegacyFrontend } from './helper/formatForLegacyFrontend';

import { getOMDBMovie, formatOMDBMovie } from './omdb/omdb';

import type { MovieCache } from './interfaces/MovieCache';

import sampleData from './data/sampleData.json';

const app: Express = express();

const nodeEnv = process.env.NODE_ENV && process.env.NODE_ENV !== '' ? process.env.NODE_ENV as string : 'unknown';

const corsAllowListPSV = process.env.CORS_ALLOW_LIST as string;
const corsAllowList: string[] = corsAllowListPSV.split(',');

const port = process.env.PORT ? Number(process.env.PORT) : 4000;

const cache: MovieCache = {}; // we're getting it working with a simple temp cache before we involve REDIS

for (const key in sampleData) {
  cache[key] = formatOMDBMovie({ title: sampleData[key]['Title'], movieData: sampleData[key] })
}

const userMovieList = Object.keys(sampleData);

const corsOptions: cors.CorsOptions = {
  origin: corsAllowList
};

app.use(cors(corsOptions));

const maxRequestsPerSecond: number = process.env.NODE_ENV === 'development' ? 30 : 15;

const limiter = rateLimit({
  windowMs: 1000,
  max: maxRequestsPerSecond
});

app.use(limiter);

// routes will stay in index.js until REDIS is involved
app.get('/api/movies', (req, res) => {
  if (req.headers.apikey === process.env.ILM_API_KEY) { // if "|| undefined" is still in this condition GET IT OUT before going to production.  SERIOUS SECURITY ISSUE.  FOR DEVELOPEMENT ONLY.
    res.status(200).json(formatForLegacyFrontend(cache));
  } else {
    res.status(403).json({ error: '403 Forbidden' });
  }
});

app.post('/api/movie', async (req, res) => {
  if (req.headers.apikey === process.env.ILM_API_KEY) {
    const inputMovie = req.query.movie;

    // check if movie is in the cache already to avoid dupes and excess requests, return the cache if the movie is in the cache
    if (cache[inputMovie.toLowerCase()]) {
      res.status(200).json(cache)
    } else { // otherwise get the movie from OMDB and add it
      const movieResponse = await getOMDBMovie(inputMovie);

      // uncomment this and comment the OMDB call to test and debug a sad path without hitting OMDB repeatedly
      // const movieResponse = { Error: 'Movie Not Found!', Response: 'False' }

      const movieData = formatOMDBMovie({ title: inputMovie, movieData: movieResponse });
      const movieKey = inputMovie.toLowerCase();
      cache[movieKey] = movieData;
      cache.userMovieList.push(movieKey);
      res.status(200).json(formatForLegacyFrontend(cache))
    }

  } else {
    res.status(403).json({ error: '403 Forbidden' });
  }
});

app.put('/api/togglemoviewatched', (req, res) => {
  if (req.headers.apikey === process.env.ILM_API_KEY) {
    const inputMovie = req.query.movie.toLowerCase();
    if (cache[inputMovie]) {
      cache[inputMovie].watched = !cache[inputMovie].watched;
      res.status(200).json(formatForLegacyFrontend(cache));
    } else {
      res.status(404).json({ error: 'Movie not found in current user collection' })
    }
  } else {
    res.status(403).json({ error: '403 Forbidden' });
  }
});

app.delete('/api/deletemovie', (req, res) => {
  if (req.headers.apikey === process.env.ILM_API_KEY) {
    const inputMovie = req.query.movie.toLowerCase();
    if (cache[inputMovie]) {
      delete cache[inputMovie];
      const newUserMovieList = cache.userMovieList.filter(movie => movie !== inputMovie);
      cache.userMovieList = newUserMovieList;
      res.status(200).json(formatForLegacyFrontend(cache));
    } else {
      res.status(404).json({ error: 'Movie not found in current user collection' })
    }
  } else {
    res.status(403).json({ error: '403 Forbidden' });
  }
});

app.listen(process.env.PORT || 4200, () => console.log(`iLikeMovies API v${process.env.API_VERSION} API SERVER LISTENING IN ${nodeEnv.toUpperCase()} MODE ON PORT ${process.env.PORT}`));