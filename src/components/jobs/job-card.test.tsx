import React from 'react';
import { render, screen } from '@testing-library/react';
import { JobCard } from './job-card';
import { sampleJobs } from '@/lib/data/sample-seed';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: jest.fn(),
  }),
}));

describe('JobCard', () => {
  it('renders title and company', () => {
    render(
      <JobCard
        job={sampleJobs[0]}
        matchSummary={{
          jobId: sampleJobs[0].id,
          candidateId: "candidate-1",
          matchScore: 82,
          matchingSkills: ["SQL"],
          missingSkills: ["Python"],
          recommendation: "Recommended",
          reason: "Strong overlap.",
        }}
      />,
    );
    expect(screen.getByText(/Seed Data Analyst/i)).toBeInTheDocument();
    expect(screen.getByText(/SeedCorp/i)).toBeInTheDocument();
    expect(screen.getByText(/AI Match 82%/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save job/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /seed data analyst/i })).toBeInTheDocument();
  });
});
