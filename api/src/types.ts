import type { Context } from "hono";

export type AppContext = Context<{ Bindings: Env & { GITHUB_TOKEN?: string } }>;

export interface AnalyzeRepoRequest {
  repoUrl: string;
}

export interface GitHubRepository {
  name: string;
  html_url: string;
  full_name: string;
  forks_count: number;
  stargazers_count: number;
  description: string | null;
  owner: {
    login: string;
  };
  open_issues_count: number;
}

export interface GitHubIssue {
  number: number;
  title: string;
  state: string;
  labels: Array<{
    name: string;
  }>;
  user: {
    login: string;
  };
  created_at: string;
  updated_at: string;
  body: string | null;
  html_url: string;
  pull_request?: {
    url: string;
    html_url: string;
    diff_url: string;
    patch_url: string;
  };
}

export interface RepositoryInfo {
  name: string;
  owner: string;
  description: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  url: string;
}

export interface IssueInfo {
  issue_number: number;
  title: string;
  state: string;
  labels: string[];
  author: string;
  created_at: string;
  updated_at: string;
  body: string;
  url: string;
}

export interface AnalyzeRepoResponse {
  repository: RepositoryInfo;
  issues: IssueInfo[];
  aiAnalysis?: Array<{
    title: string;
    reasoning: string;
    duplicates: number[];
    issue_number: number;
    implementationOrder: number;
    priority: "Critical" | "High" | "Medium" | "Low";
    category: "Bug" | "Feature" | "Enhancement" | "Chore" | "Documentation";
  }>;
}

export interface AnalyzeRepoErrorResponse {
  error: string;
  details?: string;
}

export interface IssueManagementResponse {
  success: boolean;
  timestamp: string;
  repository: {
    url: string;
    name: string;
    openIssues: number;
    description: string;
  };
  issues: Array<{
    title: string;
    reasoning: string;
    duplicates: number[];
    issue_number: number;
    implementationOrder: number;
    priority: "Critical" | "High" | "Medium" | "Low";
    category: "Bug" | "Feature" | "Enhancement" | "Chore" | "Documentation";
  }>;
}
