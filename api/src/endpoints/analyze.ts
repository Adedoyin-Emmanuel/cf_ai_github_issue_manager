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
  AnalyzeRepoErrorResponse,
  IssueManagementResponse,
} from "../types";
import type { AppContext } from "../types";
import { getCachedAnalysis, setCachedAnalysis } from "../utils/cache";

interface IssueManagementPayload {
  repository: {
    url: string;
    name: string;
    openIssues: number;
    description: string;
  };
  issues: Array<{
    url: string;
    body: string;
    title: string;
    state: string;
    labels: string[];
    issue_number: number;
  }>;
}

async function callAIWorker(
  payload: IssueManagementPayload,
  env: Env
): Promise<IssueManagementResponse> {
  try {
    // Service bindings require a Request with an absolute URL in production
    const request = new Request("https://ai.internal/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const response = await env.AI_WORKER.fetch(request);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `AI Worker responded with status: ${response.status} - ${errorText}`
      );
    }

    const result = (await response.json()) as IssueManagementResponse;

    return result;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("AI Worker request timed out after 50 seconds");
    }
    throw error;
  }
}

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

    const cachedResult = await getCachedAnalysis(c.env.REPO_CACHE, owner, repo);
    if (cachedResult) {
      console.log(`Cache hit for ${owner}/${repo}`);
      return c.json(cachedResult);
    }

    const [repositoryData, issuesData] = await Promise.all([
      fetchRepository(owner, repo),
      fetchIssues(owner, repo),
    ]);

    const repository = transformRepository(repositoryData);
    const issues = issuesData.map(transformIssue);

    const aiPayload: IssueManagementPayload = {
      repository: {
        url: repository.url,
        name: repository.name,
        openIssues: repository.openIssues,
        description: repository.description || "",
      },
      issues: issues.map((issue) => ({
        url: issue.url,
        body: issue.body,
        title: issue.title,
        state: issue.state,
        labels: issue.labels,
        issue_number: issue.issue_number,
      })),
    };

    const aiResponse = await callAIWorker(aiPayload, c.env);

    await setCachedAnalysis(c.env.REPO_CACHE, owner, repo, aiResponse, {
      ttlHours: 24,
    });

    return c.json(aiResponse);
  } catch (error) {
    console.log(error);
    if (error instanceof Error && error.message.includes("timed out")) {
      const errorResponse: AnalyzeRepoErrorResponse = {
        error: "AI processing timeout",
        details:
          "The AI analysis is taking longer than expected. Please try again with a smaller repository or fewer issues.",
      };
      return c.json(errorResponse, 408);
    }

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
      details:
        error instanceof Error ? error.message : "Failed to analyze repository",
    };

    return c.json(errorResponse, 500);
  }
}
