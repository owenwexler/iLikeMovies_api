const { movieNotFound } = require("./movieNotFound");

 const expectedTestResult = {
  // ... properly formatted OMDB response for your movie of choice
};

const expectedNotFoundTestResult = {
  ...movieNotFound,
  title: 'This Movie Does Not Exist'
}

const testSampleDataKey = 'title of your movie of choice in lowercase';

const testTitle = 'Title Of Your Movie Of Choice';

module.exports = {
  expectedTestResult,
  expectedNotFoundTestResult,
  testSampleDataKey,
  testTitle
}