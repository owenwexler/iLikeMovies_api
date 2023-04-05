const { formatOMDBMovie } = require('../omdb/omdb');
const sampleData = require('../data/sampleData.json');
const { expectedTestResult, expectedNotFoundTestResult, testSampleDataKey, testTitle } = require('../data/testData');

// no tests for getOMDBMovie needed - it's just an axios call to OMDB

describe('formatOMDBMovie function', () => {
  test('function works as expected with an existent movie containing a True response field', () => {
    expect(formatOMDBMovie({ title: testTitle, movieData: sampleData[testSampleDataKey] })).toEqual(expectedTestResult);
  });

  test('function works as expected with a nonexistent movie containing a False response field', () => {
    expect(formatOMDBMovie({ title: 'This Movie Does Not Exist', movieData: { Response: 'False', Error: 'Movie Not Found!' } })).toEqual(expectedNotFoundTestResult);
  });
});