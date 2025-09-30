"use client";

import { useState } from "react";
import {
  Github,
  Search,
  Bug,
  Sparkles,
  Settings,
  ExternalLink,
  ArrowUpDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Loader } from "@/components/ui/loader";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnalyzeRepo } from "@/hooks/use-analyze-repo";
import type { AIAnalysis } from "@/lib/api";

// Mock data for demo
const mockIssues = [
  {
    issue_number: 12,
    title: "Fix login timeout error",
    category: "Bug",
    priority: "Critical",
    duplicates: [18, 25],
    reasoning:
      "Frequent user reports, impacts core login functionality. This issue affects the primary authentication flow and prevents users from accessing the application.",
    implementationOrder: 1,
  },
  {
    issue_number: 22,
    title: "Add dark mode toggle",
    category: "Enhancement",
    priority: "Low",
    duplicates: [],
    reasoning:
      "Nice to have, no immediate user complaints. This is a quality of life improvement that would enhance user experience but doesn't impact core functionality.",
    implementationOrder: 5,
  },
  {
    issue_number: 34,
    title: "Profile page crashes on image upload",
    category: "Bug",
    priority: "High",
    duplicates: [],
    reasoning:
      "Affects usability but not a system-wide blocker. Users can still use the application, but this specific feature is broken and needs attention.",
    implementationOrder: 3,
  },
  {
    issue_number: 45,
    title: "Implement user notifications system",
    category: "Feature",
    priority: "Medium",
    duplicates: [],
    reasoning:
      "New feature request that would improve user engagement. Not critical but would add significant value to the application.",
    implementationOrder: 4,
  },
  {
    issue_number: 67,
    title: "Database connection timeout",
    category: "Bug",
    priority: "Critical",
    duplicates: [89, 91],
    reasoning:
      "System-wide issue affecting all database operations. This is a critical infrastructure problem that needs immediate attention.",
    implementationOrder: 2,
  },
];

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Bug":
      return <Bug className="h-4 w-4" />;
    case "Feature":
      return <Sparkles className="h-4 w-4" />;
    case "Enhancement":
      return <Settings className="h-4 w-4" />;
    default:
      return <Bug className="h-4 w-4" />;
  }
};

const getPriorityVariant = (priority: string) => {
  switch (priority.toLowerCase()) {
    case "critical":
      return "critical";
    case "high":
      return "high";
    case "medium":
      return "medium";
    case "low":
      return "low";
    default:
      return "default";
  }
};

export default function Home() {
  const [repoUrl, setRepoUrl] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [sortByImplementation, setSortByImplementation] = useState(false);

  const analyzeRepoMutation = useAnalyzeRepo();

  const handleAnalyze = async () => {
    if (!repoUrl.trim()) return;

    try {
      const result = await analyzeRepoMutation.mutateAsync(repoUrl);
      setShowResults(true);
    } catch (error) {
      console.error("Error analyzing repository:", error);
      // Error handling is done in the mutation
    }
  };

  // Use API data if available, otherwise fall back to mock data
  const issuesToDisplay = analyzeRepoMutation.data?.aiAnalysis || mockIssues;
  const repository = analyzeRepoMutation.data?.repository;

  const totalIssues = issuesToDisplay.length;
  const duplicatesFound = issuesToDisplay.filter(
    (issue) => issue.duplicates.length > 0
  ).length;
  const criticalBugs = issuesToDisplay.filter(
    (issue) => issue.priority === "Critical"
  ).length;

  // Sort issues based on current sort preference
  const sortedIssues = sortByImplementation
    ? [...issuesToDisplay].sort(
        (a, b) => a.implementationOrder - b.implementationOrder
      )
    : issuesToDisplay;

  // Use actual repository data if available, otherwise extract from URL
  const repoInfo = repository
    ? {
        owner: repository.owner,
        repo: repository.name,
      }
    : (() => {
        const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (match) {
          return { owner: match[1], repo: match[2].replace(".git", "") };
        }
        return { owner: "owner", repo: "repo" }; // fallback for demo
      })();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Github className="h-8 w-8 text-slate-600 mr-3" />
            <h1 className="text-3xl font-bold text-slate-900">
              GitHub Issue Analyzer
            </h1>
          </div>
          <p className="text-slate-600 text-lg">
            AI-powered analysis of GitHub repository issues
          </p>
        </div>

        {/* Input Section */}
        {!showResults && (
          <Card className="mb-8 shadow-lg">
            <CardHeader>
              <CardTitle className="text-center">
                Analyze Repository Issues
              </CardTitle>
              <CardDescription className="text-center">
                Paste a GitHub repository URL to get AI-powered issue analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Input
                  placeholder="https://github.com/owner/repo"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="flex-1"
                  onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                />
                <Button
                  onClick={handleAnalyze}
                  disabled={!repoUrl.trim() || analyzeRepoMutation.isPending}
                  className="px-8"
                >
                  {analyzeRepoMutation.isPending ? (
                    <>
                      <Loader size={16} className="mr-2" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Analyze Issues
                    </>
                  )}
                </Button>
              </div>
              {analyzeRepoMutation.isError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">
                    Error:{" "}
                    {analyzeRepoMutation.error?.message ||
                      "Failed to analyze repository"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Results Section */}
        {showResults && (
          <div className="space-y-6">
            {/* Summary Card */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Search className="h-5 w-5 mr-2" />
                  Analysis Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analyzeRepoMutation.isPending ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="text-center p-4 bg-slate-50 rounded-lg"
                      >
                        <Skeleton className="h-8 w-16 mx-auto mb-2" />
                        <Skeleton className="h-4 w-24 mx-auto" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <div className="text-2xl font-bold text-slate-900">
                        {totalIssues}
                      </div>
                      <div className="text-sm text-slate-600">Total Issues</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {duplicatesFound}
                      </div>
                      <div className="text-sm text-orange-600">
                        Duplicates Found
                      </div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {criticalBugs}
                      </div>
                      <div className="text-sm text-red-600">Critical Bugs</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Issues Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">
                  Issues Analysis
                </h2>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSortByImplementation(!sortByImplementation)
                    }
                    className="flex items-center gap-2"
                  >
                    <ArrowUpDown className="h-4 w-4" />
                    {sortByImplementation
                      ? "View by Priority"
                      : "View in Order of Implementation"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowResults(false);
                      setRepoUrl("");
                    }}
                    className="flex items-center gap-2"
                  >
                    <Search className="h-4 w-4" />
                    Analyze Another Repository
                  </Button>
                </div>
              </div>
              <div className="grid gap-4">
                {analyzeRepoMutation.isPending
                  ? // Skeleton loading for issues
                    Array.from({ length: 3 }).map((_, index) => (
                      <Card key={index} className="shadow-md">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-4 w-48" />
                              </div>
                              <div className="flex items-center gap-3">
                                <Skeleton className="h-6 w-16" />
                                <Skeleton className="h-6 w-20" />
                              </div>
                            </div>
                          </div>
                          <Skeleton className="h-4 w-full mb-2" />
                          <Skeleton className="h-4 w-3/4" />
                        </CardContent>
                      </Card>
                    ))
                  : sortedIssues.map((issue, index) => (
                      <Card
                        key={issue.issue_number}
                        className="shadow-md hover:shadow-lg transition-shadow"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {sortByImplementation && (
                                  <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-semibold mr-2">
                                    {index + 1}
                                  </div>
                                )}
                                <a
                                  href={`https://github.com/${repoInfo.owner}/${repoInfo.repo}/issues/${issue.issue_number}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-semibold text-slate-900 hover:text-blue-600 transition-colors underline hover:no-underline"
                                >
                                  #{issue.issue_number}
                                </a>
                                <a
                                  href={`https://github.com/${repoInfo.owner}/${repoInfo.repo}/issues/${issue.issue_number}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-semibold text-slate-900 hover:text-blue-600 transition-colors underline hover:no-underline"
                                >
                                  {issue.title}
                                </a>
                              </div>
                              <div className="flex items-center gap-3">
                                <Badge
                                  variant="outline"
                                  className="flex items-center gap-1"
                                >
                                  {getCategoryIcon(issue.category)}
                                  {issue.category}
                                </Badge>
                                <Badge
                                  variant={
                                    getPriorityVariant(issue.priority) as any
                                  }
                                >
                                  {issue.priority}
                                </Badge>
                                {issue.duplicates.length > 0 && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-sm text-slate-600">
                                      Duplicates:
                                    </span>
                                    {issue.duplicates.map((dup: number) => (
                                      <a
                                        key={dup}
                                        href={`https://github.com/${repoInfo.owner}/${repoInfo.repo}/issues/${dup}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:opacity-80 transition-opacity"
                                      >
                                        <Badge
                                          variant="secondary"
                                          className="text-xs hover:bg-slate-200 transition-colors"
                                        >
                                          #{dup}
                                        </Badge>
                                      </a>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <Accordion type="single" collapsible>
                            <AccordionItem value="reasoning">
                              <AccordionTrigger className="text-sm text-slate-600 hover:text-slate-900">
                                View detailed analysis
                              </AccordionTrigger>
                              <AccordionContent>
                                <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">
                                  {issue.reasoning}
                                </p>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </CardContent>
                      </Card>
                    ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
