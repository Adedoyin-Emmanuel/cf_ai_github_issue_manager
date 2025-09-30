import { Bug, Sparkles, Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { AIAnalysis } from "@/lib/api";

interface IssueCardProps {
  issue: AIAnalysis;
  index: number;
  sortByImplementation: boolean;
  repoInfo: { owner: string; repo: string };
}

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

export function IssueCard({
  issue,
  index,
  sortByImplementation,
  repoInfo,
}: IssueCardProps) {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
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
              <Badge variant="outline" className="flex items-center gap-1">
                {getCategoryIcon(issue.category)}
                {issue.category}
              </Badge>
              <Badge
                variant={
                  getPriorityVariant(issue.priority) as
                    | "critical"
                    | "high"
                    | "medium"
                    | "low"
                    | "default"
                }
              >
                {issue.priority}
              </Badge>
              {issue.duplicates.length > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-sm text-slate-600">Duplicates:</span>
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
  );
}
