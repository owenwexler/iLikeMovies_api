import { formatOMDBMovie } from '../omdb/omdb';
import sampleData from '../data/sampleData.json';
import { expectedTestResult, expectedNotFoundTestResult, testSampleDataKey, testTitle } from '../data/testData';

// no tests for getOMDBMovie needed - it's just an axios call to the OMDB API

describe('formatOMDBMovie function', () => {
  test('function works as expected with an existent movie containing a True response field', () => {
    expect(formatOMDBMovie({ title: testTitle, movieData: sampleData[testSampleDataKey] })).toEqual(expectedTestResult);
  });

  test('function works as expected with a nonexistent movie containing a False response field', () => {
    expect(formatOMDBMovie({ title: 'This Movie Does Not Exist', movieData: { Response: 'False', Error: 'Movie Not Found!' } })).toEqual(expectedNotFoundTestResult);
  });
});