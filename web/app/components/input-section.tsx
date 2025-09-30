import { Search } from "lucide-react";

import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";

interface InputSectionProps {
  repoUrl: string;
  isLoading: boolean;
  error: string | null;
  onAnalyze: () => void;
  setRepoUrl: (url: string) => void;
}

export function InputSection({
  error,
  repoUrl,
  onAnalyze,
  isLoading,
  setRepoUrl,
}: InputSectionProps) {
  return (
    <Card className="mb-8 shadow-lg">
      <CardHeader>
        <CardTitle className="text-center">Analyze Repository Issues</CardTitle>
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
            onKeyDown={(e) => e.key === "Enter" && onAnalyze()}
          />
          <Button
            onClick={onAnalyze}
            disabled={!repoUrl.trim() || isLoading}
            className="px-8"
          >
            {isLoading ? (
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
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">Error: {error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
