"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { GetFormatterForCurrency } from "@/lib/helpers";
import { UpdateLoan, DeleteLoan } from "@/app/(dashboard)/_actions/loans";

interface LoanCardProps {
  loan: {
    id: string;
    person_name: string;
    amount: number;
    description: string;
    date_lent: string;
    is_paid_back: boolean;
    date_paid_back: string | null;
  };
  currency: string;
}

function LoanCard({ loan, currency }: LoanCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const queryClient = useQueryClient();
  const formatter = GetFormatterForCurrency(currency);

  const { mutate: updateLoan } = useMutation({
    mutationFn: UpdateLoan,
    onSuccess: () => {
      toast.success(
        loan.is_paid_back ? "Marked as unpaid" : "Marked as paid back"
      );
      queryClient.invalidateQueries({ queryKey: ["loans"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update loan");
    },
  });

  const { mutate: deleteLoan, isPending: isDeleting } = useMutation({
    mutationFn: DeleteLoan,
    onSuccess: () => {
      toast.success("Loan deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      setShowDeleteDialog(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete loan");
    },
  });

  const handleCheckboxChange = (checked: boolean) => {
    updateLoan({
      id: loan.id,
      isPaidBack: checked,
      datePaidBack: checked ? new Date() : undefined,
    });
  };

  const handleDelete = () => {
    deleteLoan({ id: loan.id });
  };

  return (
    <>
      <Card className={loan.is_paid_back ? "opacity-60" : ""}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <Checkbox
                checked={loan.is_paid_back}
                onCheckedChange={handleCheckboxChange}
                className="mt-1"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3
                    className={`font-semibold truncate ${
                      loan.is_paid_back ? "line-through" : ""
                    }`}
                  >
                    {loan.person_name}
                  </h3>
                  <span
                    className={`font-bold ml-2 ${
                      loan.is_paid_back
                        ? "text-emerald-500"
                        : "text-muted-foreground"
                    }`}
                  >
                    {formatter.format(loan.amount)}
                  </span>
                </div>
                {loan.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {loan.description}
                  </p>
                )}
                <div className="text-xs text-muted-foreground mt-2">
                  <p>Lent: {format(new Date(loan.date_lent), "PPP")}</p>
                  {loan.is_paid_back && loan.date_paid_back && (
                    <p className="text-emerald-500">
                      Paid back: {format(new Date(loan.date_paid_back), "PPP")}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="ml-2 text-destructive hover:text-destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Loan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this loan? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default LoanCard;
