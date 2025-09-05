"use client";

import { GetCategoriesStatsResponseType } from "@/app/api/stats/categories/route";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DateToUTCDate, GetFormatterForCurrency } from "@/lib/helpers";
import { TransactionType } from "@/lib/types";
// Define UserSettings type locally if not available from @prisma/client
type UserSettings = {
  currency: string;
  // Add other properties as needed
};
import { useQuery } from "@tanstack/react-query";
import React, { useMemo } from "react";

interface Props {
  userSettings: UserSettings;
  from: Date;
  to: Date;
}

function CategoriesStats({ userSettings, from, to }: Props) {
  const statsQuery = useQuery<GetCategoriesStatsResponseType>({
    queryKey: ["overview", "stats", "categories", from, to],
    queryFn: () =>
      fetch(
        `/api/stats/categories?from=${DateToUTCDate(from)}&to=${DateToUTCDate(
          to
        )}`
      ).then((res) => res.json()),
  });

  const formatter = useMemo(() => {
    return GetFormatterForCurrency(userSettings.currency);
  }, [userSettings.currency]);

  return (
    <div className="flex w-full flex-wrap gap-2 md:flex-nowrap">
      <SkeletonWrapper isLoading={statsQuery.isFetching}>
        <CategoriesCard
          formatter={formatter}
          type="income"
          data={statsQuery.data || []}
        />
      </SkeletonWrapper>
      <SkeletonWrapper isLoading={statsQuery.isFetching}>
        <CategoriesCard
          formatter={formatter}
          type="expense"
          data={statsQuery.data || []}
        />
      </SkeletonWrapper>
      <SkeletonWrapper isLoading={statsQuery.isFetching}>
        <CategoriesCard
          formatter={formatter}
          type="savings"
          data={statsQuery.data || []}
          title="Monthly Savings"
        />
      </SkeletonWrapper>
    </div>
  );
}

export default CategoriesStats;

function CategoriesCard({
  data,
  type,
  formatter,
  title,
}: {
  type: TransactionType;
  formatter: Intl.NumberFormat;
  data: GetCategoriesStatsResponseType;
  title?: string;
}) {
  const filteredData = data.filter((el: { type: string }) => el.type === type);
  const total = filteredData.reduce(
    (acc: any, el: { _sum: { amount: any } }) => acc + (el._sum?.amount || 0),
    0
  );

  return (
    <Card className="h-80 w-full col-span-6">
      <CardHeader>
        <CardTitle className="grid grid-flow-row justify-between gap-2 text-muted-foreground md:grid-flow-col">
          {title ||
            (type === "income"
              ? "Incomes"
              : type === "savings"
              ? "Savings"
              : "Expenses")}{" "}
          by category
        </CardTitle>
      </CardHeader>

      <div className="flex items-center justify-between gap-2">
        {filteredData.length === 0 && (
          <div className="flex h-60 w-full flex-col items-center justify-center">
            No data for the selected period
            <p className="text-sm text-muted-foreground">
              Try selecting a different period or try adding new{" "}
              {type === "income"
                ? "incomes"
                : type === "savings"
                ? "savings"
                : "expenses"}
            </p>
          </div>
        )}

        {filteredData.length > 0 && (
          <ScrollArea className="h-60 w-full px-4">
            <div className="flex w-full flex-col gap-4 p-4">
              {filteredData.map(
                (item: {
                  _sum: { amount: number };
                  category:
                    | boolean
                    | React.ReactElement<
                        any,
                        string | React.JSXElementConstructor<any>
                      >
                    | Iterable<React.ReactNode>
                    | Promise<React.AwaitedReactNode>
                    | React.Key
                    | null
                    | undefined;
                  categoryIcon:
                    | string
                    | number
                    | bigint
                    | boolean
                    | React.ReactElement<
                        any,
                        string | React.JSXElementConstructor<any>
                      >
                    | Iterable<React.ReactNode>
                    | React.ReactPortal
                    | Promise<React.AwaitedReactNode>
                    | null
                    | undefined;
                }) => {
                  const amount = item._sum.amount || 0;
                  const percentage = (amount * 100) / (total || amount);

                  return (
                    <div
                      key={String(item.category)}
                      className="flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex items-center text-gray-400">
                          {item.categoryIcon} {item.category}
                          <span className="ml-2 text-xs text-muted-foreground">
                            ({percentage.toFixed(0)}%)
                          </span>
                        </span>

                        <span className="text-sm text-gray-400">
                          {formatter.format(amount)}
                        </span>
                      </div>

                      <Progress
                        value={percentage}
                        indicator={
                          type === "income"
                            ? "bg-emerald-500"
                            : type === "expense"
                            ? "bg-red-500"
                            : type === "savings"
                            ? "bg-blue-500"
                            : "" // Add bg-blue-500 for savings
                        }
                      />
                    </div>
                  );
                }
              )}
            </div>
          </ScrollArea>
        )}
      </div>
    </Card>
  );
}
