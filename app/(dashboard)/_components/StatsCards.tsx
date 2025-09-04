"use client";

import { GetBalanceStatsResponseType } from "@/app/api/stats/balance/route";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import { Card } from "@/components/ui/card";
import { DateToUTCDate, GetFormatterForCurrency } from "@/lib/helpers";
import { UserSettings } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { Landmark, HandCoins,TrendingDown, TrendingUp, Wallet } from "lucide-react";
import React, { ReactNode, useCallback, useMemo } from "react";
import CountUp from "react-countup";

interface Props {
  from: Date;
  to: Date;
  userSettings: UserSettings;
}

function StatsCards({ from, to, userSettings }: Props) {
  const statsQuery = useQuery<GetBalanceStatsResponseType>({
    queryKey: ["overview", "stats", from, to],
    queryFn: () =>
      fetch(
        `/api/stats/balance?from=${DateToUTCDate(from)}&to=${DateToUTCDate(to)}`
      ).then((res) => res.json()),
  });

  // Query for cumulative savings data
  const cumulativeSavingsQuery = useQuery({
    queryKey: ["cumulative-savings"],
    queryFn: () =>
      fetch(`/api/stats/cumulative-savings`).then((res) => res.json()),
  });
  const formatter = useMemo(() => {
    return GetFormatterForCurrency(userSettings.currency);
  }, [userSettings.currency]);

  const income = statsQuery.data?.income || 0;
  const expense = statsQuery.data?.expense || 0;
  const currentPeriodSavings = statsQuery.data?.savings || 0;
  const totalBalanceBeforePeriod = statsQuery.data?.totalBalanceBeforePeriod || 0;

  // Get cumulative savings data
  const totalCumulativeSavings = cumulativeSavingsQuery.data?.totalCumulativeSavings || 0;

  // Calculate current period balance
  const currentPeriodBalance = income - expense - currentPeriodSavings;
  
  // Calculate total balance including carry-over from previous periods
  const balance = totalBalanceBeforePeriod + currentPeriodBalance;
  
  // Calculate total net worth (balance + total cumulative savings)
  const total = balance + totalCumulativeSavings;

  //experiments

  const expensePercentage = parseFloat(((expense / income) * 100).toFixed(2));
  const savingsPercentage = parseFloat(((currentPeriodSavings / income) * 100).toFixed(2));
  const balancePercentage = income > 0 ? parseFloat(((currentPeriodBalance / income) * 100).toFixed(2)) : 0;
  const incomePercentage = 100;

  //

  return (
    <div className="relative flex w-full flex-wrap gap-2 md:flex-nowrap">
      <SkeletonWrapper isLoading={statsQuery.isFetching}>
        <StatCard
          formatter={formatter}
          value={income}
          title="Income"
          percentage={incomePercentage}
          icon={
            <TrendingUp className="h-12 w-12 items-center rounded-lg p-2 text-emerald-500 bg-emerald-400/10" />
          }
        />
      </SkeletonWrapper>

      <SkeletonWrapper isLoading={statsQuery.isFetching}>
        <StatCard
          formatter={formatter}
          value={expense}
          title="Expense"
          percentage={expensePercentage}
          icon={
            <TrendingDown className="h-12 w-12 items-center rounded-lg p-2 text-red-500 bg-red-400/10" />
          }
        />
      </SkeletonWrapper>

      <SkeletonWrapper isLoading={statsQuery.isFetching}>
        <StatCard
          formatter={formatter}
          value={balance}
          title="Balance"
          percentage={balancePercentage}
          icon={
            <Wallet className="h-12 w-12 items-center rounded-lg p-2 text-violet-500 bg-violet-400/10" />
          }
        />
      </SkeletonWrapper>
      
      <SkeletonWrapper isLoading={cumulativeSavingsQuery.isFetching}>
        <StatCard
          formatter={formatter}
          value={currentPeriodSavings}
          title="Monthly Savings"
          percentage={savingsPercentage}
          icon={
            <Landmark className="h-12 w-12 items-center rounded-lg p-2 text-blue-500 bg-blue-400/10" />
          }
        />
      </SkeletonWrapper>
      
      <SkeletonWrapper isLoading={cumulativeSavingsQuery.isFetching}>
        <StatCard
          formatter={formatter}
          value={totalCumulativeSavings}
          title="Total Savings"
          icon={
            <Landmark className="h-12 w-12 items-center rounded-lg p-2 text-green-500 bg-green-400/10" />
          }
        />
      </SkeletonWrapper>
      
      <SkeletonWrapper isLoading={statsQuery.isFetching || cumulativeSavingsQuery.isFetching}>
        <StatCard
          formatter={formatter}
          value={total}
          title="Net Worth"
          icon={
            < HandCoins  className="h-12 w-12 items-center rounded-lg p-2 text-green-500 bg-green-400/10" />
          }
        />
      </SkeletonWrapper>
    </div>
  );
}

export default StatsCards;

function StatCard({
  formatter,
  value,
  title,
  icon,
  percentage,
}: {
  formatter: Intl.NumberFormat;
  icon: ReactNode;
  title: String;
  value: number;
  percentage?: number; // Change the type of percentage to number
}) {
  const formatFn = useCallback(
    (value: number) => {
      return formatter.format(value);
    },
    [formatter]
  );

  return (
    <Card className="flex h-24 w-full items-center gap-2 p-4">
      {icon}
      <div className="flex flex-col items-start gap-0">
        <p className="text-muted-foreground">{title}</p>
        <CountUp
          preserveValue
          redraw={false}
          end={value}
          decimals={2}
          formattingFn={formatFn}
          className="text-2xl"
        />
        {percentage !== undefined && ( // Include incomePercentage here
          <p className="text-sm text-muted-foreground mt-1">
            {percentage}% of income
          </p>
        )}
      </div>
    </Card>
  );
}
