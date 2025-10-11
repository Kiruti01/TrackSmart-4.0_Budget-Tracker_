"use client";

import { Investment } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import InvestmentCard from "./InvestmentCard";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function InvestmentsSection() {
  const { data: investments = [], isFetching } = useQuery<Investment[]>({
    queryKey: ["investments"],
    queryFn: () => fetch("/api/investments").then((res) => res.json()),
  });

  if (!isFetching && investments.length === 0) {
    return null;
  }

  return (
    <div className="container py-6">
      <h2 className="text-2xl font-bold mb-4">Your Investments</h2>
      <SkeletonWrapper isLoading={isFetching}>
        {investments.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Investments Yet</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Start tracking your investments by clicking the &quot;New Investment&quot;
                button above.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {investments.map((investment) => (
              <InvestmentCard key={investment.id} investment={investment} />
            ))}
          </div>
        )}
      </SkeletonWrapper>
    </div>
  );
}

export default InvestmentsSection;
