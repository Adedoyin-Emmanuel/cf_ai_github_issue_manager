import { Github } from "lucide-react";

export function Header() {
  return (
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
  );
}
