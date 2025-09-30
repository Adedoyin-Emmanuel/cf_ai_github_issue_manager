import { useMutation, useQuery } from "@tanstack/react-query";

import { api, type AnalyzeRepoResponse } from "@/lib/api";

export function useAnalyzeRepo() {
  return useMutation<AnalyzeRepoResponse, Error, string>({
    mutationFn: (repoUrl: string) => api.analyzeRepo(repoUrl),
    onError: (error) => {
      console.error("Failed to analyze repository:", error);
    },
  });
}

export function useAnalyzeRepoQuery(repoUrl: string, enabled: boolean = false) {
  return useQuery<AnalyzeRepoResponse, Error>({
    queryKey: ["analyze-repo", repoUrl],
    queryFn: () => api.analyzeRepo(repoUrl),
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
