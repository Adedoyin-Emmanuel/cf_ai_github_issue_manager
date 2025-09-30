import { Github, ExternalLink } from "lucide-react";

import type { RepositoryInfo } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RepositoryInfoProps {
  repository: RepositoryInfo;
}

export function RepositoryInfoCard({ repository }: RepositoryInfoProps) {
  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Github className="h-5 w-5 mr-2" />
          Repository Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-slate-900 mb-2">
              <a
                href={repository.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-600 transition-colors flex items-center gap-2"
              >
                {repository.name}
                <ExternalLink className="h-4 w-4" />
              </a>
            </h3>
            <p className="text-slate-600 text-sm mb-2">
              {repository.description}
            </p>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span>{repository.openIssues} open issues</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
