const formatForLegacyFrontend = (data) => {
  return data.userMovieList.map(movie => data[movie]);
}

export {
  formatForLegacyFrontend
}