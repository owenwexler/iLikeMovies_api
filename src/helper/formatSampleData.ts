import sampleData from '../data/sampleData.json';
import { KeyValueOMDBResponses } from '../interfaces/KeyValueOMDBResponses';
import { OMDBMovieResponse } from '../interfaces/OMDBMovieResponse';

const formatSampleData = () => {
  const result: KeyValueOMDBResponses = {};

  for (const key in sampleData) {
    const sampleDataKey = key as keyof typeof sampleData;
    result[key] = sampleData[sampleDataKey] as OMDBMovieResponse;
  }

  return result;
}

export {
  formatSampleData
}