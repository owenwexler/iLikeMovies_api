require('dotenv').config();

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const app = express();

const corsAllowList = process.env.CORS_ALLOW_LIST.split(',');

const corsOptions = {
  origin: function (origin, callback) {
    if (corsAllowList.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  methods: 'GET'
}

app.use(cors(corsOptions));
const maxRequestsPerSecond = process.env.NODE_ENV === 'development' ? 30 : 15;

const limiter = rateLimit({
  windowMs: 1000,
  max: maxRequestsPerSecond
});

app.use(limiter);
app.listen(process.env.PORT || 4000, () => console.log(`iLikeMovies API v${process.env.API_VERSION} API SERVER LISTENING IN ${process.env.NODE_ENV.toUpperCase()} MODE ON PORT ${process.env.PORT}`));