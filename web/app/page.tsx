"use client";

import { useState } from "react";
import { api, type AnalyzeRepoResponse } from "@/lib/api";
import { Header } from "./components/header";
import { InputSection } from "./components/input-section";
import { RepositoryInfoCard } from "./components/repository-info";
import { SummaryCard } from "./components/summary-card";
import { IssuesList } from "./components/issues-list";

export default function Home() {
  const [repoUrl, setRepoUrl] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [sortByImplementation, setSortByImplementation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalyzeRepoResponse | null>(null);

  const handleAnalyze = async () => {
    if (!repoUrl.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await api.analyzeRepo(repoUrl);
      setData(result);
      setShowResults(true);
    } catch (error) {
      console.error("Error analyzing repository:", error);
      setError(
        error instanceof Error ? error.message : "Failed to analyze repository"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeAnother = () => {
    setShowResults(false);
    setRepoUrl("");
    setData(null);
    setError(null);
  };

  const issuesToDisplay = data?.issues || [];
  const repository = data?.repository;

  const totalIssues = issuesToDisplay.length;
  const duplicatesFound = issuesToDisplay.filter(
    (issue) => issue.duplicates.length > 0
  ).length;
  const criticalBugs = issuesToDisplay.filter(
    (issue) => issue.priority === "Critical"
  ).length;

  const sortedIssues = sortByImplementation
    ? [...issuesToDisplay].sort(
        (a, b) => a.implementationOrder - b.implementationOrder
      )
    : issuesToDisplay;

  const repoInfo = (() => {
    if (repository) {
      const match = repository.url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (match) {
        return { owner: match[1], repo: match[2].replace(".git", "") };
      }
    }

    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (match) {
      return { owner: match[1], repo: match[2].replace(".git", "") };
    }

    return { owner: "owner", repo: "repo" };
  })();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Header />

        {!showResults && (
          <InputSection
            repoUrl={repoUrl}
            setRepoUrl={setRepoUrl}
            isLoading={isLoading}
            error={error}
            onAnalyze={handleAnalyze}
          />
        )}

        {showResults && (
          <div className="space-y-6">
            {repository && <RepositoryInfoCard repository={repository} />}

            <SummaryCard
              isLoading={isLoading}
              totalIssues={totalIssues}
              duplicatesFound={duplicatesFound}
              criticalBugs={criticalBugs}
            />

            <IssuesList
              isLoading={isLoading}
              sortedIssues={sortedIssues}
              sortByImplementation={sortByImplementation}
              setSortByImplementation={setSortByImplementation}
              onAnalyzeAnother={handleAnalyzeAnother}
              repoInfo={repoInfo}
            />
          </div>
        )}
      </div>
    </div>
  );
}
