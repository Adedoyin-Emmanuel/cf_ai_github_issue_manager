import axios from "axios";

export interface RepositoryInfo {
  url: string;
  name: string;
  openIssues: number;
  description: string;
}

export interface AIAnalysis {
  title: string;
  reasoning: string;
  duplicates: number[];
  issue_number: number;
  implementationOrder: number;
  priority: "Critical" | "High" | "Medium" | "Low";
  category: "Bug" | "Feature" | "Enhancement" | "Chore" | "Documentation";
}

export interface AnalyzeRepoRequest {
  repoUrl: string;
}

export interface AnalyzeRepoResponse {
  success: boolean;
  timestamp: string;
  issues: AIAnalysis[];
  repository: RepositoryInfo;
}

export interface AnalyzeRepoErrorResponse {
  error: string;
  details?: string;
}

const apiClient = axios.create({
  baseURL: `https://gh-issue-manager-api.adedoyine535.workers.dev/v1`,
  headers: {
    "Content-Type": "application/json",
  },
});

export const api = {
  analyzeRepo: async (repoUrl: string): Promise<AnalyzeRepoResponse> => {
    try {
      const response = await apiClient.post<AnalyzeRepoResponse>(
        "/analyze-repo",
        {
          repoUrl,
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as AnalyzeRepoErrorResponse;
        throw new Error(errorData.details || errorData.error);
      }

      throw error;
    }
  },
};

export default apiClient;
