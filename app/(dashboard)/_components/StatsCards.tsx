"use client";

import { GetBalanceStatsResponseType } from "@/app/api/stats/balance/route";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import { Card } from "@/components/ui/card";
import { DateToUTCDate, GetFormatterForCurrency } from "@/lib/helpers";
import { useIsDesktop } from "@/lib/useIsDesktop";
// import { UserSettings } from "@prisma/client";
type UserSettings = {
  currency: string;
  // Add other properties as needed
};
import { useQuery } from "@tanstack/react-query";
import {
  Landmark,
  HandCoins,
  TrendingDown,
  TrendingUp,
  Wallet,
  LineChart,
} from "lucide-react";
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
    queryFn: () => {
      const fromDate = DateToUTCDate(from); // Start of day
      const toDate = DateToUTCDate(to); // End of day

      // console.log("StatsCards date conversion:", {
      //   originalFrom: from,
      //   originalTo: to,
      //   convertedFrom: fromDate.toISOString(),
      //   convertedTo: toDate.toISOString(),
      // });

      return fetch(
        `/api/stats/balance?from=${fromDate.toISOString()}&to=${toDate.toISOString()}`
      ).then((res) => res.json());
    },
  });

  // Query for cumulative savings data
  const cumulativeSavingsQuery = useQuery({
    queryKey: ["cumulative-savings"],
    queryFn: () =>
      fetch(`/api/stats/cumulative-savings`).then((res) => res.json()),
  });

  // Query for investments data
  const investmentsQuery = useQuery({
    queryKey: ["investments", "stats", from, to],
    queryFn: () => {
      const fromDate = DateToUTCDate(from);
      const toDate = DateToUTCDate(to);
      return fetch(
        `/api/investments/stats?from=${fromDate.toISOString()}&to=${toDate.toISOString()}`
      ).then((res) => res.json());
    },
  });
  const formatter = useMemo(() => {
    return GetFormatterForCurrency(userSettings.currency);
  }, [userSettings.currency]);

  const income = statsQuery.data?.income || 0;
  const expense = statsQuery.data?.expense || 0;
  const currentPeriodSavings = statsQuery.data?.savings || 0;
  const totalBalanceBeforePeriod =
    statsQuery.data?.totalBalanceBeforePeriod || 0;

  // Get cumulative savings data
  const totalCumulativeSavings =
    cumulativeSavingsQuery.data?.totalCumulativeSavings || 0;

  // Get investments data
  const totalInvestmentsValue =
    investmentsQuery.data?.totalCurrentValueKes || 0;
  const investedThisMonth = investmentsQuery.data?.investedThisMonth || 0;
  const totalInvestmentGain = investmentsQuery.data?.totalGainKes || 0;
  const totalInvestmentGainPercentage =
    investmentsQuery.data?.totalGainPercentage || 0;

  // Calculate current period balance
  const currentPeriodBalance = income - expense - currentPeriodSavings;

  // Calculate total balance including carry-over from previous periods
  const balance = totalBalanceBeforePeriod + currentPeriodBalance;

  // Calculate total net worth (balance + total cumulative savings + investments)
  const total = balance + totalCumulativeSavings + totalInvestmentsValue;

  //experiments

  const expensePercentage = parseFloat(((expense / income) * 100).toFixed(2));
  const savingsPercentage = parseFloat(
    ((currentPeriodSavings / income) * 100).toFixed(2)
  );
  const balancePercentage =
    income > 0
      ? parseFloat(((currentPeriodBalance / income) * 100).toFixed(2))
      : 0;
  const incomePercentage = 100;

  //

  return (
    <div className="relative grid w-full gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <SkeletonWrapper isLoading={statsQuery.isFetching}>
        <StatCard
          formatter={formatter}
          value={income}
          title="Income this Month"
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
          title="Expense this Month"
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
          // percentage={balancePercentage}
          icon={
            <Wallet className="h-12 w-12 items-center rounded-lg p-2 text-violet-500 bg-violet-400/10" />
          }
        />
      </SkeletonWrapper>

      <SkeletonWrapper isLoading={cumulativeSavingsQuery.isFetching}>
        <StatCard
          formatter={formatter}
          value={currentPeriodSavings}
          title="Savings this Month"
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

      <SkeletonWrapper isLoading={investmentsQuery.isFetching}>
        <StatCard
          formatter={formatter}
          value={totalInvestmentsValue}
          title="Investments Value"
          subtitle={`Gain: ${totalInvestmentGain >= 0 ? "+" : ""}${formatter.format(totalInvestmentGain)} (${totalInvestmentGainPercentage >= 0 ? "+" : ""}${totalInvestmentGainPercentage.toFixed(2)}%)`}
          subtitleColor={totalInvestmentGain >= 0 ? "text-emerald-500" : "text-red-500"}
          icon={
            <LineChart className="h-12 w-12 items-center rounded-lg p-2 text-amber-500 bg-amber-400/10" />
          }
        />
      </SkeletonWrapper>

      <SkeletonWrapper
        isLoading={statsQuery.isFetching || cumulativeSavingsQuery.isFetching || investmentsQuery.isFetching}
      >
        <StatCard
          formatter={formatter}
          value={total}
          title="Net Worth"
          icon={
            <HandCoins className="h-12 w-12 items-center rounded-lg p-2 text-green-500 bg-green-400/10" />
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
  subtitle,
  subtitleColor,
}: {
  formatter: Intl.NumberFormat;
  icon: ReactNode;
  title: String;
  value: number;
  percentage?: number;
  subtitle?: string;
  subtitleColor?: string;
}) {
  const isDesktop = useIsDesktop();

  const formatFn = useCallback(
    (value: number) => {
      if (isDesktop && value >= 1_000_000) {
        return (value / 1_000_000).toFixed(2) + " M"; // Only shorten on desktop
      }
      return formatter.format(value); // Use normal formatting on mobile/tablet
    },
    [formatter, isDesktop]
  );

  return (
    <Card className="flex h-24 w-full items-center gap-2 p-4 min-w-0">
      {icon}
      <div className="flex flex-col items-start gap-0 min-w-0 flex-1">
        <p className="text-muted-foreground text-sm truncate">{title}</p>
        <CountUp
          preserveValue
          redraw={false}
          end={value}
          decimals={2}
          formattingFn={formatFn}
          className="text-lg font-semibold truncate"
        />
        {percentage !== undefined && (
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {percentage}% of income
          </p>
        )}
        {subtitle && (
          <p className={`text-xs mt-1 truncate font-semibold ${subtitleColor}`}>
            {subtitle}
          </p>
        )}
      </div>
    </Card>
  );
}
