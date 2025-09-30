import axios from "axios";

export interface RepositoryInfo {
  url: string;
  name: string;
  forks: number;
  owner: string;
  stars: number;
  openIssues: number;
  description: string | null;
}

export interface IssueInfo {
  url: string;
  body: string;
  title: string;
  state: string;
  author: string;
  labels: string[];
  created_at: string;
  updated_at: string;
  issue_number: number;
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
  issues: IssueInfo[];
  aiAnalysis?: AIAnalysis[];
  repository: RepositoryInfo;
}

export interface AnalyzeRepoErrorResponse {
  error: string;
  details?: string;
}

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787/v1",
  timeout: 60000, // Increased to 60 seconds for AI processing
  headers: {
    "Content-Type": "application/json",
  },
});

export const api = {
  analyzeRepo: async (repoUrl: string): Promise<AnalyzeRepoResponse> => {
    const response = await apiClient.post<AnalyzeRepoResponse>(
      "/analyze-repo",
      {
        repoUrl,
      }
    );
    return response.data;
  },
};

export default apiClient;
