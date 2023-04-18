const formatForLegacyFrontend = (data) => {
  return data.userMovieList.map(movie => data[movie]);
}

module.exports = {
  formatForLegacyFrontend
}