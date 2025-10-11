"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  UpdateInvestmentValueSchema,
  UpdateInvestmentValueSchemaType,
} from "@/schema/investment";
import { ReactNode, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UpdateInvestmentValue } from "@/app/(dashboard)/_actions/investments";
import { toast } from "sonner";
import { DateToUTCDate } from "@/lib/helpers";
import { Textarea } from "@/components/ui/textarea";
import { Investment } from "@/lib/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface Props {
  trigger: ReactNode;
  investment: Investment;
}

function UpdateInvestmentDialog({ trigger, investment }: Props) {
  const form = useForm<UpdateInvestmentValueSchemaType>({
    resolver: zodResolver(UpdateInvestmentValueSchema),
    defaultValues: {
      investmentId: investment.id,
      updateType: "value_update",
      newAmount: investment.currentAmount,
      exchangeRate: investment.currentExchangeRate,
      updateDate: new Date(),
    },
  });

  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: UpdateInvestmentValue,
    onSuccess: () => {
      toast.success("Investment updated successfully 🎉", {
        id: "update-investment",
      });

      form.reset({
        investmentId: investment.id,
        updateType: "value_update",
        updateDate: new Date(),
      });

      queryClient.invalidateQueries({ queryKey: ["investments"] });
      queryClient.invalidateQueries({ queryKey: ["overview"] });

      setOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message, { id: "update-investment" });
    },
  });

  const onSubmit = useCallback(
    (values: UpdateInvestmentValueSchemaType) => {
      toast.loading("Updating investment...", { id: "update-investment" });
      mutate({
        ...values,
        updateDate: DateToUTCDate(values.updateDate),
      });
    },
    [mutate]
  );

  const updateType = form.watch("updateType");
  const newAmount = form.watch("newAmount");
  const exchangeRate = form.watch("exchangeRate");
  const additionalCapital = form.watch("additionalCapital");

  const currentGainCurrency = investment.currentAmount - investment.initialAmount;
  const currentGainPercentage =
    investment.initialAmount > 0
      ? (currentGainCurrency / investment.initialAmount) * 100
      : 0;

  const currentGainKes = investment.currentValueKes - investment.initialAmountKes;
  const currentGainPercentageKes =
    investment.initialAmountKes > 0
      ? (currentGainKes / investment.initialAmountKes) * 100
      : 0;

  const newValueKes = newAmount && exchangeRate ? newAmount * exchangeRate : 0;
  const changeCurrency = newAmount ? newAmount - investment.currentAmount : 0;
  const changePercentageCurrency =
    investment.currentAmount > 0
      ? (changeCurrency / investment.currentAmount) * 100
      : 0;
  const changeKes = newValueKes - investment.currentValueKes;
  const changePercentageKes =
    investment.currentValueKes > 0
      ? (changeKes / investment.currentValueKes) * 100
      : 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Update <span className="text-emerald-500">{investment.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2 p-4 bg-muted rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Currency</p>
              <p className="font-semibold">{investment.currency}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Initial Amount</p>
              <p className="font-semibold">
                {investment.initialAmount.toLocaleString()} {investment.currency}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Last Value</p>
              <p className="font-semibold">
                {investment.currentAmount.toLocaleString()} {investment.currency}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Last Value (KES)</p>
              <p className="font-semibold">
                {investment.currentValueKes.toLocaleString("en-KE", {
                  style: "currency",
                  currency: "KES",
                })}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-muted-foreground">Current Gain/Loss</p>
              <div className="flex gap-4">
                <p
                  className={cn(
                    "font-semibold",
                    currentGainCurrency >= 0 ? "text-emerald-500" : "text-red-500"
                  )}
                >
                  {currentGainCurrency >= 0 ? "+" : ""}
                  {currentGainCurrency.toFixed(2)} {investment.currency} (
                  {currentGainPercentage >= 0 ? "+" : ""}
                  {currentGainPercentage.toFixed(2)}%)
                </p>
                <p
                  className={cn(
                    "font-semibold",
                    currentGainKes >= 0 ? "text-emerald-500" : "text-red-500"
                  )}
                >
                  {currentGainKes >= 0 ? "+" : ""}
                  {currentGainKes.toLocaleString("en-KE", {
                    style: "currency",
                    currency: "KES",
                  })}{" "}
                  ({currentGainPercentageKes >= 0 ? "+" : ""}
                  {currentGainPercentageKes.toFixed(2)}%)
                </p>
              </div>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="updateType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Update Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="value_update" id="value_update" />
                        <Label htmlFor="value_update" className="font-normal cursor-pointer">
                          Update Current Value
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="capital_addition"
                          id="capital_addition"
                        />
                        <Label
                          htmlFor="capital_addition"
                          className="font-normal cursor-pointer"
                        >
                          Add More Capital
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {updateType === "capital_addition" && (
              <FormField
                control={form.control}
                name="additionalCapital"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Capital</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.0001"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Amount of new capital being added
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="newAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {updateType === "capital_addition"
                        ? "New Total Value"
                        : "Current Value"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.0001"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="exchangeRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exchange Rate (KES per {investment.currency})</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.0001"
                        placeholder="1.00"
                        disabled={investment.currency === "KES"}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {newAmount && exchangeRate && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg space-y-1">
                <p className="text-sm font-medium">Preview Changes:</p>
                <p className="text-sm">
                  New KES Value:{" "}
                  {newValueKes.toLocaleString("en-KE", {
                    style: "currency",
                    currency: "KES",
                  })}
                </p>
                <p
                  className={cn(
                    "text-sm font-semibold",
                    changeCurrency >= 0 ? "text-emerald-600" : "text-red-600"
                  )}
                >
                  Change: {changeCurrency >= 0 ? "+" : ""}
                  {changeCurrency.toFixed(4)} {investment.currency} (
                  {changePercentageCurrency >= 0 ? "+" : ""}
                  {changePercentageCurrency.toFixed(2)}%)
                </p>
                <p
                  className={cn(
                    "text-sm font-semibold",
                    changeKes >= 0 ? "text-emerald-600" : "text-red-600"
                  )}
                >
                  Change (KES): {changeKes >= 0 ? "+" : ""}
                  {changeKes.toLocaleString("en-KE", {
                    style: "currency",
                    currency: "KES",
                  })}{" "}
                  ({changePercentageKes >= 0 ? "+" : ""}
                  {changePercentageKes.toFixed(2)}%)
                </p>
                {updateType === "capital_addition" && additionalCapital && (
                  <p className="text-sm">
                    New Total Invested:{" "}
                    {(investment.totalInvested + Number(additionalCapital)).toLocaleString()}{" "}
                    {investment.currency}
                  </p>
                )}
              </div>
            )}

            <FormField
              control={form.control}
              name="updateDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Update Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(value) => {
                          if (!value) return;
                          field.onChange(value);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any notes about this update..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Save Update"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default UpdateInvestmentDialog;
