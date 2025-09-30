import { Search, ArrowUpDown } from "lucide-react";

import { IssueCard } from "./issue-card";
import type { AIAnalysis } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

interface IssuesListProps {
  isLoading: boolean;
  sortedIssues: AIAnalysis[];
  sortByImplementation: boolean;
  setSortByImplementation: (value: boolean) => void;
  onAnalyzeAnother: () => void;
  repoInfo: { owner: string; repo: string };
}

export function IssuesList({
  isLoading,
  sortedIssues,
  sortByImplementation,
  setSortByImplementation,
  onAnalyzeAnother,
  repoInfo,
}: IssuesListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">
          Issues Analysis
        </h2>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortByImplementation(!sortByImplementation)}
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
            onClick={onAnalyzeAnother}
            className="flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            Analyze Another Repository
          </Button>
        </div>
      </div>
      <div className="grid gap-4">
        {isLoading
          ? Array.from({ length: 3 }).map((_, index) => (
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
              <IssueCard
                key={issue.issue_number}
                issue={issue}
                index={index}
                sortByImplementation={sortByImplementation}
                repoInfo={repoInfo}
              />
            ))}
      </div>
    </div>
  );
}
