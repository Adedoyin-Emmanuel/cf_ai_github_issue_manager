import axios from "axios";

import {
  fetchIssues,
  parseRepoUrl,
  transformIssue,
  handleRateLimit,
  fetchRepository,
  transformRepository,
} from "../../utils/repo";
import {
  AnalyzeRepoRequest,
  AnalyzeRepoResponse,
  AnalyzeRepoErrorResponse,
} from "../types";
import type { AppContext } from "../types";

export async function analyzeRepo(c: AppContext): Promise<Response> {
  try {
    const body = (await c.req.json()) as AnalyzeRepoRequest;

    if (!body.repoUrl) {
      const errorResponse: AnalyzeRepoErrorResponse = {
        error: "Invalid repo URL",
        details: "repoUrl is required",
      };
      return c.json(errorResponse, 400);
    }

    const parsed = parseRepoUrl(body.repoUrl);

    if (!parsed) {
      const errorResponse: AnalyzeRepoErrorResponse = {
        error: "Invalid repo URL",
        details:
          "URL must be a valid GitHub repository URL (e.g., https://github.com/owner/repo)",
      };

      return c.json(errorResponse, 400);
    }

    const { owner, repo } = parsed;

    const [repositoryData, issuesData] = await Promise.all([
      fetchRepository(owner, repo),
      fetchIssues(owner, repo),
    ]);

    const repository = transformRepository(repositoryData);
    const issues = issuesData.map(transformIssue);

    const response: AnalyzeRepoResponse = {
      repository,
      issues,
    };

    return c.json(response);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const response = error.response;

      if (response) {
        if (handleRateLimit(response)) {
          const errorResponse: AnalyzeRepoErrorResponse = {
            error: "GitHub API rate limit exceeded",
            details: "Please try again later",
          };
          return c.json(errorResponse, 429);
        }

        if (response.status === 404) {
          const errorResponse: AnalyzeRepoErrorResponse = {
            error: "Repository not found",
            details:
              "The specified repository does not exist or is not accessible",
          };
          return c.json(errorResponse, 404);
        }

        const errorResponse: AnalyzeRepoErrorResponse = {
          error: "GitHub API error",
          details: `HTTP ${response.status}: ${response.statusText}`,
        };
        return c.json(errorResponse, response.status as any);
      }
    }

    const errorResponse: AnalyzeRepoErrorResponse = {
      error: "Internal server error",
      details: "Failed to analyze repository",
    };
    return c.json(errorResponse, 500);
  }
}
