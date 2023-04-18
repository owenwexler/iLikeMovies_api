require('dotenv').config();

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const app = express();

const corsAllowList = process.env.CORS_ALLOW_LIST.split(',');

const sampleData = require('./data/sampleData.json');

const { formatForLegacyFrontend } = require('./helper/formatForLegacyFrontend');

const { getOMDBMovie, formatOMDBMovie } = require('./omdb/omdb');

const cache = {}; // we're getting it working with a simple temp cache before we involve REDIS

for (let key in sampleData) {
  cache[key] = formatOMDBMovie({ title: sampleData[key]['Title'], movieData: sampleData[key] })
}

cache.userMovieList = Object.keys(sampleData);

const corsOptions = {
  origin: function (origin, callback) {
    if (corsAllowList.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}

app.use(cors(corsOptions));

const maxRequestsPerSecond = process.env.NODE_ENV === 'development' ? 30 : 15;

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

app.listen(process.env.PORT || 4200, () => console.log(`iLikeMovies API v${process.env.API_VERSION} API SERVER LISTENING IN ${process.env.NODE_ENV.toUpperCase()} MODE ON PORT ${process.env.PORT}`));