import axios from "axios";

export interface RepositoryInfo {
  url: string;
  name: string;
  openIssues: number;
  description: string;
}

export interface AIAnalysis {
  issue_number: number;
  title: string;
  category: "Bug" | "Feature" | "Enhancement" | "Chore" | "Documentation";
  priority: "Critical" | "High" | "Medium" | "Low";
  duplicates: number[];
  reasoning: string;
  implementationOrder: number;
}

export interface AnalyzeRepoRequest {
  repoUrl: string;
}

export interface AnalyzeRepoResponse {
  success: boolean;
  repository: RepositoryInfo;
  issues: AIAnalysis[];
  timestamp: string;
}

export interface AnalyzeRepoErrorResponse {
  error: string;
  details?: string;
}

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787/v1",
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
