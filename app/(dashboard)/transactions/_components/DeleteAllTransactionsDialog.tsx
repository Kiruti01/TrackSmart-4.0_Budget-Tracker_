"use client";

import { DeleteAllTransactions } from "@/app/(dashboard)/transactions/_actions/deleteAllTransactions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import React, { ReactNode } from "react";
import { toast } from "sonner";

interface Props {
  trigger?: ReactNode;
}

function DeleteAllTransactionsDialog({ trigger }: Props) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: DeleteAllTransactions,
    onSuccess: async () => {
      toast.success("All transactions deleted successfully", {
        id: "delete-all-transactions",
      });

      // Invalidate all relevant queries
      await queryClient.invalidateQueries({
        queryKey: ["transactions"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["overview"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["cumulative-savings"],
      });
    },
    onError: () => {
      toast.error("Something went wrong", {
        id: "delete-all-transactions",
      });
    },
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button variant="destructive" size="sm" className="gap-2">
            <Trash2 className="h-4 w-4" />
            Delete All
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete All Transactions</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete ALL your
            transactions, reset your savings to zero, and clear all financial history.
            Are you absolutely sure you want to continue?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              toast.loading("Deleting all transactions...", {
                id: "delete-all-transactions",
              });
              deleteMutation.mutate();
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete All Transactions
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteAllTransactionsDialog;