"use client";

import { Investment } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import UpdateInvestmentDialog from "./UpdateInvestmentDialog";
import { TrendingUp, TrendingDown } from "lucide-react";

interface Props {
  investment: Investment;
}

function InvestmentCard({ investment }: Props) {
  // Add null safety with defaults
  const currentAmount = investment.currentAmount ?? investment.initialAmount ?? 0;
  const currentValueKes = investment.currentValueKes ?? investment.initialAmountKes ?? 0;
  const currentExchangeRate = investment.currentExchangeRate ?? investment.initialExchangeRate ?? 1;
  const initialAmount = investment.initialAmount ?? 0;
  const initialAmountKes = investment.initialAmountKes ?? 0;

  const gainCurrency = currentAmount - initialAmount;
  const gainPercentageCurrency =
    initialAmount > 0 ? (gainCurrency / initialAmount) * 100 : 0;

  const gainKes = currentValueKes - initialAmountKes;
  const gainPercentageKes =
    initialAmountKes > 0 ? (gainKes / initialAmountKes) * 100 : 0;

  const isKesOnly = investment.currency === "KES";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          {investment.category?.icon && (
            <span className="text-2xl">{investment.category.icon}</span>
          )}
          <span>{investment.name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isKesOnly ? (
          <div className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Current Value</p>
              <p className="text-2xl font-bold">
                {currentValueKes.toLocaleString("en-KE", {
                  style: "currency",
                  currency: "KES",
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Invested</p>
              <p className="text-sm font-medium">
                {initialAmountKes.toLocaleString("en-KE", {
                  style: "currency",
                  currency: "KES",
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gain/Loss</p>
              <div
                className={cn(
                  "flex items-center gap-1 font-semibold",
                  gainKes >= 0 ? "text-emerald-500" : "text-red-500"
                )}
              >
                {gainKes >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span>
                  {gainKes >= 0 ? "+" : ""}
                  {gainKes.toLocaleString("en-KE", {
                    style: "currency",
                    currency: "KES",
                  })}{" "}
                  ({gainPercentageKes >= 0 ? "+" : ""}
                  {gainPercentageKes.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Currency: {investment.currency}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="text-xl font-bold">
                    {currentAmount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 4,
                    })}{" "}
                    {investment.currency}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Invested</p>
                  <p className="text-sm">
                    {initialAmount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 4,
                    })}{" "}
                    {investment.currency}
                  </p>
                </div>
              </div>
              <div
                className={cn(
                  "flex items-center gap-1 font-semibold mt-1",
                  gainCurrency >= 0 ? "text-emerald-500" : "text-red-500"
                )}
              >
                {gainCurrency >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span className="text-sm">
                  {gainCurrency >= 0 ? "+" : ""}
                  {gainCurrency.toFixed(4)} {investment.currency} (
                  {gainPercentageCurrency >= 0 ? "+" : ""}
                  {gainPercentageCurrency.toFixed(2)}%)
                </span>
              </div>
            </div>

            <div className="border-t pt-2">
              <p className="text-xs text-muted-foreground mb-1">KES Value</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-muted-foreground">Current</p>
                  <p className="text-lg font-bold">
                    {currentValueKes.toLocaleString("en-KE", {
                      style: "currency",
                      currency: "KES",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Initial</p>
                  <p className="text-sm">
                    {initialAmountKes.toLocaleString("en-KE", {
                      style: "currency",
                      currency: "KES",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </p>
                </div>
              </div>
              <div
                className={cn(
                  "flex items-center gap-1 font-semibold mt-1",
                  gainKes >= 0 ? "text-emerald-500" : "text-red-500"
                )}
              >
                {gainKes >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span className="text-sm">
                  {gainKes >= 0 ? "+" : ""}
                  {gainKes.toLocaleString("en-KE", {
                    style: "currency",
                    currency: "KES",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}{" "}
                  ({gainPercentageKes >= 0 ? "+" : ""}
                  {gainPercentageKes.toFixed(2)}%)
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Rate: {currentExchangeRate.toLocaleString()} KES/
                {investment.currency}
              </p>
            </div>
          </div>
        )}

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Last updated:{" "}
            {investment.lastUpdated 
              ? formatDistanceToNow(new Date(investment.lastUpdated), {
                  addSuffix: true,
                })
              : "Never"}
          </p>
        </div>

        <UpdateInvestmentDialog
          trigger={
            <Button className="w-full" variant="outline">
              Update Value
            </Button>
          }
          investment={investment}
        />
      </CardContent>
    </Card>
  );
}

export default InvestmentCard;