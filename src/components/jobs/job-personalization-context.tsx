"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { JobMatchSummary } from "@/types";

interface ResumeOption {
  id: string;
  title: string;
  updatedAt: string;
}

interface JobInteractionState {
  isApplied: boolean;
  isSaved: boolean;
}

interface JobPersonalizationValue {
  isLoading: boolean;
  isSignedIn: boolean;
  matchSummaries: Record<string, JobMatchSummary>;
  resumeOptions: ResumeOption[];
  stateByJobId: Record<string, JobInteractionState>;
}

const JobPersonalizationContext = createContext<JobPersonalizationValue | null>(null);

export function JobPersonalizationProvider({
  children,
  jobIds,
  includeMatches = false,
  includeResumes = false,
}: {
  children: ReactNode;
  jobIds: string[];
  includeMatches?: boolean;
  includeResumes?: boolean;
}) {
  const uniqueJobIds = useMemo(
    () => [...new Set(jobIds.filter(Boolean))],
    [jobIds],
  );
  const emptyValue = useMemo<JobPersonalizationValue>(() => ({
    isLoading: false,
    isSignedIn: false,
    matchSummaries: {},
    resumeOptions: [],
    stateByJobId: {},
  }), []);
  const [loadedValue, setLoadedValue] = useState<JobPersonalizationValue>(() => ({
    isLoading: true,
    isSignedIn: false,
    matchSummaries: {},
    resumeOptions: [],
    stateByJobId: Object.fromEntries(
      uniqueJobIds.map((jobId) => [jobId, { isApplied: false, isSaved: false }]),
    ),
  }));

  useEffect(() => {
    if (uniqueJobIds.length === 0) {
      return;
    }

    const controller = new AbortController();
    const params = new URLSearchParams();

    for (const jobId of uniqueJobIds) {
      params.append("ids", jobId);
    }

    if (includeMatches) {
      params.set("includeMatches", "true");
    }

    if (includeResumes) {
      params.set("includeResumes", "true");
    }

    async function loadPersonalization() {
      try {
        const response = await fetch(`/api/jobs/personalization?${params.toString()}`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load personalization");
        }

        const result = (await response.json()) as JobPersonalizationValue;
        setLoadedValue({
          isLoading: false,
          isSignedIn: result.isSignedIn,
          matchSummaries: result.matchSummaries ?? {},
          resumeOptions: result.resumeOptions ?? [],
          stateByJobId:
            result.stateByJobId ??
            Object.fromEntries(
              uniqueJobIds.map((jobId) => [jobId, { isApplied: false, isSaved: false }]),
            ),
        });
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return;
        }

        setLoadedValue((current) => ({
          ...current,
          isLoading: false,
        }));
      }
    }

    void loadPersonalization();

    return () => controller.abort();
  }, [includeMatches, includeResumes, uniqueJobIds]);

  const value =
    uniqueJobIds.length === 0
      ? emptyValue
      : loadedValue;

  return (
    <JobPersonalizationContext.Provider value={value}>
      {children}
    </JobPersonalizationContext.Provider>
  );
}

export function useJobPersonalization() {
  const value = useContext(JobPersonalizationContext);

  if (!value) {
    throw new Error("useJobPersonalization must be used within JobPersonalizationProvider");
  }

  return value;
}
