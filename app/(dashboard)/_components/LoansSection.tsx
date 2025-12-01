"use client";

import { useQuery } from "@tanstack/react-query";
import { HandCoins, Plus } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import { GetFormatterForCurrency } from "@/lib/helpers";
import CreateLoanDialog from "./CreateLoanDialog";
import LoanCard from "./LoanCard";
import { GetLoansResponseType } from "@/app/api/loans/route";

interface LoansSectionProps {
  userSettings: {
    currency: string;
  };
}

function LoansSection({ userSettings }: LoansSectionProps) {
  const loansQuery = useQuery<GetLoansResponseType>({
    queryKey: ["loans"],
    queryFn: () => fetch("/api/loans").then((res) => res.json()),
  });

  const loans = loansQuery.data || [];
  const unpaidLoans = loans.filter((loan) => !loan.is_paid_back);
  const paidLoans = loans.filter((loan) => loan.is_paid_back);

  const totalUnpaid = unpaidLoans.reduce((sum, loan) => sum + loan.amount, 0);
  const totalPaid = paidLoans.reduce((sum, loan) => sum + loan.amount, 0);

  const formatter = GetFormatterForCurrency(userSettings.currency);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <HandCoins className="h-6 w-6" />
          Money Lent
        </h2>
        <CreateLoanDialog
          trigger={
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Loan
            </Button>
          }
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unpaid Loans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SkeletonWrapper isLoading={loansQuery.isLoading}>
              <div className="text-2xl font-bold text-amber-600">
                {formatter.format(totalUnpaid)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {unpaidLoans.length}{" "}
                {unpaidLoans.length === 1 ? "person" : "people"} owe you
              </p>
            </SkeletonWrapper>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Paid Back
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SkeletonWrapper isLoading={loansQuery.isLoading}>
              <div className="text-2xl font-bold text-emerald-600">
                {formatter.format(totalPaid)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {paidLoans.length} {paidLoans.length === 1 ? "loan" : "loans"}{" "}
                repaid
              </p>
            </SkeletonWrapper>
          </CardContent>
        </Card>
      </div>

      <SkeletonWrapper isLoading={loansQuery.isLoading}>
        {loans.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                No loans yet. Click the button above to add one.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {unpaidLoans.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
                  Unpaid ({unpaidLoans.length})
                </h3>
                <div className="space-y-2">
                  {unpaidLoans.map((loan) => (
                    <LoanCard
                      key={loan.id}
                      loan={loan}
                      currency={userSettings.currency}
                    />
                  ))}
                </div>
              </div>
            )}

            {unpaidLoans.length > 0 && paidLoans.length > 0 && (
              <Separator className="my-4" />
            )}

            {paidLoans.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
                  Paid Back ({paidLoans.length})
                </h3>
                <div className="space-y-2">
                  {paidLoans.map((loan) => (
                    <LoanCard
                      key={loan.id}
                      loan={loan}
                      currency={userSettings.currency}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </SkeletonWrapper>
    </div>
  );
}

export default LoansSection;
