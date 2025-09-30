import { Search } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SummaryCardProps {
  isLoading: boolean;
  totalIssues: number;
  criticalBugs: number;
  duplicatesFound: number;
}

export function SummaryCard({
  isLoading,
  totalIssues,
  criticalBugs,
  duplicatesFound,
}: SummaryCardProps) {
  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Search className="h-5 w-5 mr-2" />
          Analysis Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center p-4 bg-slate-50 rounded-lg">
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
              <div className="text-sm text-orange-600">Duplicates Found</div>
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
  );
}
