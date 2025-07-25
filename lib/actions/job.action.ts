'use server';

import countriesData from '@/data/countries.json';
import jobsData from '@/data/jobs.json';
import locationData from '@/data/location.json';

export async function fetchLocation(): Promise<string> {
  return locationData.country;
}

export async function fetchCountries(): Promise<Country[]> {
  try {
    return countriesData as Country[];
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function fetchJobs(filters: JobFilterParams): Promise<Job[]> {
  const { query, page = 1 } = filters;

  let filteredJobs = jobsData as Job[];

  if (query && query.trim() !== '') {
    const searchTerm = query.toLowerCase();
    filteredJobs = (jobsData as Job[]).filter(job =>
      job.job_title?.toLowerCase().includes(searchTerm)
      || job.employer_name?.toLowerCase().includes(searchTerm)
      || job.job_description?.toLowerCase().includes(searchTerm),
    );
  }

  const jobsPerPage = 10;
  const startIndex = (page - 1) * jobsPerPage;
  const endIndex = startIndex + jobsPerPage;

  return filteredJobs.slice(startIndex, endIndex);
}
