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
  CreateInvestmentSchema,
  CreateInvestmentSchemaType,
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreateInvestment } from "@/app/(dashboard)/_actions/investments";
import { toast } from "sonner";
import { DateToUTCDate } from "@/lib/helpers";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getCurrentExchangeRate } from "@/lib/exchangeRates";

interface Props {
  trigger: ReactNode;
}

const CURRENCIES = [
  { code: "KES", name: "Kenyan Shilling", symbol: "KES" },
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "BTC", name: "Bitcoin", symbol: "₿" },
  { code: "USDT", name: "Tether", symbol: "USDT" },
];

function CreateInvestmentDialog({ trigger }: Props) {
  const form = useForm<CreateInvestmentSchemaType>({
    resolver: zodResolver(CreateInvestmentSchema),
    defaultValues: {
      dateInvested: new Date(),
      currency: "KES",
      exchangeRate: 1.0,
    },
  });

  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<any[]>({
    queryKey: ["investment-categories"],
    queryFn: () =>
      fetch("/api/investment-categories").then((res) => res.json()),
  });

  console.log("Categories:", categories);

  const { mutate, isPending } = useMutation({
    mutationFn: CreateInvestment,
    onSuccess: () => {
      toast.success("Investment created successfully 🎉", {
        id: "create-investment",
      });

      form.reset({
        dateInvested: new Date(),
        currency: "KES",
        exchangeRate: 1.0,
      });

      queryClient.invalidateQueries({ queryKey: ["investments"] });
      queryClient.invalidateQueries({ queryKey: ["overview"] });

      setOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message, { id: "create-investment" });
    },
  });

  const onSubmit = useCallback(
    (values: CreateInvestmentSchemaType) => {
      toast.loading("Creating investment...", { id: "create-investment" });
      mutate({
        ...values,
        dateInvested: DateToUTCDate(values.dateInvested),
      });
    },
    [mutate]
  );

  const selectedCurrency = form.watch("currency");
  const initialAmount = form.watch("initialAmount");
  const exchangeRate = form.watch("exchangeRate");

  const calculatedKesValue =
    initialAmount && exchangeRate ? initialAmount * exchangeRate : 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Create New <span className="text-emerald-500">Investment</span>
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Investment Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., FX Trading Account" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Investment Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select investment type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categoriesLoading ? (
                        <div className="p-2 text-sm text-muted-foreground">Loading...</div>
                      ) : categories.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground">No categories found</div>
                      ) : (
                        categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            <span className="flex items-center gap-2">
                              <span>{cat.icon}</span>
                              <span>{cat.name}</span>
                            </span>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select
                      onValueChange={async (value) => {
                        field.onChange(value);
                        if (value === "KES") {
                          form.setValue("exchangeRate", 1.0);
                        } else {
                          try {
                            const { rate } = await getCurrentExchangeRate(value, "KES");
                            form.setValue("exchangeRate", rate);
                          } catch (error) {
                            console.error("Failed to fetch exchange rate:", error);
                          }
                        }
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CURRENCIES.map((curr) => (
                          <SelectItem key={curr.code} value={curr.code}>
                            {curr.symbol} - {curr.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="initialAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Amount</FormLabel>
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
            </div>

            <FormField
              control={form.control}
              name="exchangeRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Exchange Rate {selectedCurrency !== "KES" && `(KES per ${selectedCurrency})`}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.0001"
                      placeholder="1.00"
                      disabled={selectedCurrency === "KES"}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {selectedCurrency === "KES"
                      ? "KES exchange rate is always 1.00"
                      : `Value in KES: ${calculatedKesValue.toLocaleString("en-KE", {
                          style: "currency",
                          currency: "KES",
                        })}`}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateInvested"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date Invested</FormLabel>
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
                      placeholder="Add any notes about this investment..."
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
                    Creating...
                  </>
                ) : (
                  "Create Investment"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateInvestmentDialog;
