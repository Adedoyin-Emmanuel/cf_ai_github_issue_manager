import { DateTime, Str } from "chanfana";
import type { Context } from "hono";
import { z } from "zod";

export type AppContext = Context<{ Bindings: Env }>;

export const Task = z.object({
  name: Str({ example: "lorem" }),
  slug: Str(),
  description: Str({ required: false }),
  completed: z.boolean().default(false),
  due_date: DateTime(),
});

// Firewall Logs API Types
export interface LogsRequest {
  apiToken: string;
  zoneId: string;
  queryParams?: {
    datetime_geq?: string; // Greater than or equal to (matches Cloudflare docs)
    datetime_leq?: string; // Less than or equal to (matches Cloudflare docs)
    limit?: number;
  };
}

export interface FirewallEventsAdaptiveFilter {
  datetime_geq?: string;
  datetime_leq?: string;
}

export interface FirewallEvent {
  action: string;
  clientAsn: string;
  clientCountryName: string;
  clientIP: string;
  clientRequestPath: string;
  clientRequestQuery: string;
  datetime: string;
  source: string;
  userAgent: string;
}

export interface LogsResponse {
  logs: FirewallEvent[];
}

export interface LogsErrorResponse {
  error: string;
  details?: unknown;
}

export interface GraphQLResponse {
  data?: {
    viewer: {
      zones: Array<{
        firewallEventsAdaptive: FirewallEvent[];
      }>;
    };
  };
  errors?: Array<{
    message: string;
    locations?: Array<{
      line: number;
      column: number;
    }>;
  }>;
}

// GitHub Repository Analysis Types
export interface AnalyzeRepoRequest {
  repoUrl: string;
}

export interface GitHubRepository {
  name: string;
  full_name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  html_url: string;
  owner: {
    login: string;
  };
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
