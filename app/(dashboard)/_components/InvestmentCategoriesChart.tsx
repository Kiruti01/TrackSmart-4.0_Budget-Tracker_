"use client";

import SkeletonWrapper from "@/components/SkeletonWrapper";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DateToUTCDate, GetFormatterForCurrency } from "@/lib/helpers";
import { useQuery } from "@tanstack/react-query";
import React, { useMemo } from "react";

interface Props {
  userSettings: { currency: string };
  from: Date;
  to: Date;
}

interface InvestmentCategoryData {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  totalValue: number;
  totalGain: number;
  gainPercentage: number;
}

export default function InvestmentCategoriesChart({
  userSettings,
  from,
  to,
}: Props) {
  const statsQuery = useQuery<InvestmentCategoryData[]>({
    queryKey: ["investments", "categories", from, to],
    queryFn: () =>
      fetch(
        `/api/investments/categories?from=${DateToUTCDate(
          from
        ).toISOString()}&to=${DateToUTCDate(to).toISOString()}`
      ).then((res) => res.json()),
  });

  const formatter = useMemo(() => {
    return GetFormatterForCurrency(userSettings.currency);
  }, [userSettings.currency]);

  const data = statsQuery.data || [];
  const total = data.reduce((acc, item) => acc + item.totalValue, 0);

  return (
    <SkeletonWrapper isLoading={statsQuery.isFetching}>
      <Card className="h-80 w-full">
        <CardHeader>
          <CardTitle className="grid grid-flow-row justify-between gap-2 text-muted-foreground md:grid-flow-col">
            Monthly Investments by category
          </CardTitle>
        </CardHeader>

        <div className="flex items-center justify-between gap-2">
          {data.length === 0 && (
            <div className="flex h-60 w-full flex-col items-center justify-center">
              No investment data for the selected period
              <p className="text-sm text-muted-foreground">
                Try selecting a different period or create new investments
              </p>
            </div>
          )}

          {data.length > 0 && (
            <ScrollArea className="h-60 w-full px-4">
              <div className="flex w-full flex-col gap-4 p-4">
                {data.map((item) => {
                  const percentage = (item.totalValue * 100) / (total || item.totalValue);

                  return (
                    <div key={item.categoryId} className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center text-gray-400">
                          {item.categoryIcon} {item.categoryName}
                          <span className="ml-2 text-xs text-muted-foreground">
                            ({percentage.toFixed(0)}%)
                          </span>
                        </span>

                        <span className="text-sm text-gray-400">
                          {formatter.format(item.totalValue)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Progress
                          value={percentage}
                          indicator={
                            item.totalGain >= 0 ? "bg-emerald-500" : "bg-red-500"
                          }
                        />
                        <span
                          className={`text-xs ${
                            item.totalGain >= 0
                              ? "text-emerald-500"
                              : "text-red-500"
                          }`}
                        >
                          {item.totalGain >= 0 ? "+" : ""}
                          {formatter.format(item.totalGain)} (
                          {item.gainPercentage.toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>
      </Card>
    </SkeletonWrapper>
  );
}
