import axios, { AxiosResponse } from "axios";

import {
  IssueInfo,
  GitHubIssue,
  RepositoryInfo,
  GitHubRepository,
} from "../src/types";

export const parseRepoUrl = (
  repoUrl: string
): { owner: string; repo: string } | null => {
  try {
    const url = new URL(repoUrl);

    if (url.hostname !== "github.com") {
      return null;
    }

    const pathParts = url.pathname.split("/").filter((part) => part.length > 0);

    if (pathParts.length < 2) {
      return null;
    }

    const [owner, repo] = pathParts;

    const cleanRepo = repo.replace(/\.git$/, "");

    return { owner, repo: cleanRepo };
  } catch {
    return null;
  }
};

export const fetchRepository = async (
  owner: string,
  repo: string,
  authToken?: string
): Promise<GitHubRepository> => {
  const response: AxiosResponse<GitHubRepository> = await axios.get(
    `https://api.github.com/repos/${owner}/${repo}`,
    {
      headers: {
        Accept: "application/vnd.github.v3+json",
      },
    }
  );

  return response.data;
};

export const fetchIssues = async (
  owner: string,
  repo: string,
  authToken?: string
): Promise<GitHubIssue[]> => {
  try {
    const response: AxiosResponse<GitHubIssue[]> = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/issues`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "Cloudflare-Worker-API",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        params: {
          state: "open",
          per_page: 50,
          sort: "updated",
          direction: "desc",
        },
      }
    );

    return response.data.filter((issue) => !issue.pull_request);
  } catch (error) {
    return [];
  }
};

export const transformRepository = (
  githubRepo: GitHubRepository
): RepositoryInfo => {
  return {
    name: githubRepo.name,
    url: githubRepo.html_url,
    forks: githubRepo.forks_count,
    owner: githubRepo.owner.login,
    stars: githubRepo.stargazers_count,
    description: githubRepo.description,
    openIssues: githubRepo.open_issues_count,
  };
};

export const transformIssue = (githubIssue: GitHubIssue): IssueInfo => {
  return {
    title: githubIssue.title,
    state: githubIssue.state,
    url: githubIssue.html_url,
    author: githubIssue.user.login,
    issue_number: githubIssue.number,
    created_at: githubIssue.created_at,
    updated_at: githubIssue.updated_at,
    labels: githubIssue.labels.map((label) => label.name),
    body: githubIssue.body ? githubIssue.body.substring(0, 150) : "",
  };
};

export const handleRateLimit = (response: AxiosResponse): boolean => {
  const remaining = response.headers["x-ratelimit-remaining"];
  return remaining === "0";
};
