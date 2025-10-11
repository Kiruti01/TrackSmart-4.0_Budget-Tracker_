"use client";

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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { ReactNode } from "react";
import { toast } from "sonner";
import { DeleteInvestmentCategory } from "../_actions/investments";
import { InvestmentCategory } from "@/lib/types";

interface Props {
  trigger: ReactNode;
  category: InvestmentCategory;
}

function DeleteInvestmentCategoryDialog({ category, trigger }: Props) {
  const categoryIdentifier = `${category.name}`;
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: DeleteInvestmentCategory,
    onSuccess: async () => {
      toast.success("Investment category deleted successfully", {
        id: categoryIdentifier,
      });

      await queryClient.invalidateQueries({
        queryKey: ["investment-categories"],
      });
    },
    onError: () => {
      toast.error("Something went wrong", {
        id: categoryIdentifier,
      });
    },
  });
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            investment category
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              toast.loading("Deleting investment category...", {
                id: categoryIdentifier,
              });
              deleteMutation.mutate(category.id);
            }}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteInvestmentCategoryDialog;
