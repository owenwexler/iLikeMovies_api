import 'dotenv/config';

import express, {Express, Request, Response} from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit'

import { formatForLegacyFrontend } from './helper/formatForLegacyFrontend';

import { getOMDBMovie, formatOMDBMovie } from './omdb/omdb';

import type { MovieCache } from './interfaces/MovieCache';

import { formatSampleData } from './helper/formatSampleData';
import { blankOMDBResponse } from './data/blankOMDBResponse';
import { OMDBMovieResponse } from './interfaces/OMDBMovieResponse';

const app: Express = express();

const nodeEnv = process.env.NODE_ENV && process.env.NODE_ENV !== '' ? process.env.NODE_ENV as string : 'unknown';
const port = process.env.PORT ? Number(process.env.PORT) : 4000;

const apiVersion = Number(process.env.API_VERSION);

const corsAllowListPSV = process.env.CORS_ALLOW_LIST as string;
const corsAllowList: string[] = corsAllowListPSV.split(',');

const cache: MovieCache = {}; // we're getting it working with a simple temp cache before we involve REDIS

const formattedSampleData = formatSampleData();

for (const key in formattedSampleData) {
  cache[key] = formatOMDBMovie({ title: formattedSampleData[key]['Title'], movieData: formattedSampleData[key] })
}

let userMovieList = Object.keys(formattedSampleData);

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
app.get('/api/movies', (req: Request, res: Response) => {
  if (req.headers.apikey === process.env.ILM_API_KEY) { // if "|| undefined" is still in this condition GET IT OUT before going to production.  SERIOUS SECURITY ISSUE.  FOR DEVELOPEMENT ONLY.
    res.status(200).json(formatForLegacyFrontend(cache, userMovieList));
  } else {
    res.status(403).json({ error: '403 Forbidden' });
  }
});

app.post('/api/movie', async (req: Request, res: Response) => {
  if (req.headers.apikey === process.env.ILM_API_KEY) {
    const inputMovie = req.query.movie ? req.query.movie as string : '';

    // check if movie is in the cache already to avoid dupes and excess requests, return the cache if the movie is in the cache
    if (cache[inputMovie.toLowerCase()]) {
      res.status(200).json(cache)
    } else { // otherwise get the movie from OMDB and add it
      try {
        const movieResponse = await getOMDBMovie(inputMovie);
        // uncomment this and comment the OMDB call to test and debug a sad path without hitting OMDB repeatedly
        // const movieResponse = { Error: 'Movie Not Found!', Response: 'False' }

        const typedMovieResponse = movieResponse ? movieResponse as OMDBMovieResponse : blankOMDBResponse;

        const movieData = formatOMDBMovie({ title: inputMovie, movieData: typedMovieResponse });
        const movieKey = inputMovie.toLowerCase();
        cache[movieKey] = movieData;
        userMovieList.push(movieKey);
        res.status(200).json(formatForLegacyFrontend(cache, userMovieList))
      } catch (err) {
        res.status(500).json({ error: err });
      }
    }
  } else {
    res.status(403).json({ error: '403 Forbidden' });
  }
});

app.put('/api/togglemoviewatched', (req: Request, res: Response) => {
  if (req.headers.apikey === process.env.ILM_API_KEY) {
    const inputMovie = req.query.movie ? req.query.movie as string : '';
    if (cache[inputMovie]) {
      cache[inputMovie].watched = !cache[inputMovie].watched;
      res.status(200).json(formatForLegacyFrontend(cache, userMovieList));
    } else {
      res.status(404).json({ error: 'Movie not found in current user collection' })
    }
  } else {
    res.status(403).json({ error: '403 Forbidden' });
  }
});

app.delete('/api/deletemovie', (req: Request, res: Response) => {
  if (req.headers.apikey === process.env.ILM_API_KEY) {
    const inputMovie = req.query.movie ? req.query.movie as string : '';
    if (cache[inputMovie]) {
      delete cache[inputMovie];
      const newUserMovieList = userMovieList.filter(movie => movie !== inputMovie);
      userMovieList = newUserMovieList;
      res.status(200).json(formatForLegacyFrontend(cache, userMovieList));
    } else {
      res.status(404).json({ error: 'Movie not found in current user collection' })
    }
  } else {
    res.status(403).json({ error: '403 Forbidden' });
  }
});

app.listen(port, () => console.log(`iLikeMovies API V${apiVersion} API SERVER LISTENING IN ${nodeEnv.toUpperCase()} MODE ON PORT ${port}`));