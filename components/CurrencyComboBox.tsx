"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Drawer, DrawerTrigger, DrawerContent } from "@/components/ui/drawer";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Currencies, type Currency } from "@/lib/currencies";
import { toast } from "sonner";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UpdateUserCurrency } from "@/app/wizard/_actions/userSettings";

// Local type to match API response
type UserSettings = { currency: string };

export function CurrencyComboBox() {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [selectedOption, setSelectedOption] = React.useState<Currency | null>(
    null
  );
  const queryClient = useQueryClient();

  // Fetch current user settings from API route
  const userSettings = useQuery<UserSettings>({
    queryKey: ["userSettings"],
    queryFn: () => fetch("/api/user-settings").then((res) => res.json()),
  });

  React.useEffect(() => {
    if (!userSettings.data) return;
    const currency = Currencies.find(
      (c) => c.value === userSettings.data.currency
    );
    if (currency) setSelectedOption(currency);
  }, [userSettings.data]);

  const mutation = useMutation({
    mutationFn: UpdateUserCurrency,
    onSuccess: (data: UserSettings) => {
      toast.success("Currency updated successfully 🎉", { id: "update-currency" });
      setSelectedOption(
        Currencies.find((c) => c.value === data.currency) || null
      );

      queryClient.invalidateQueries({ queryKey: ["userSettings"] });
      queryClient.invalidateQueries({ queryKey: ["overview"] });
      queryClient.invalidateQueries({ queryKey: ["cumulative-savings"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
    onError: (err) => {
      console.error(err);
      toast.error("Could not update currency", { id: "update-currency" });
    },
  });

  const selectOption = (currency: Currency | null) => {
    if (!currency) {
      toast.error("Please select a currency");
      return;
    }

    toast.loading("Updating currency...", { id: "update-currency" });
    mutation.mutate(currency.value);
  };

  const OptionList = () => (
    <Command>
      <CommandInput placeholder="Filter currency..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {Currencies.map((currency) => (
            <CommandItem
              key={currency.value}
              value={currency.value}
              onSelect={(value) => {
                setSelectedOption(
                  Currencies.find((c) => c.value === value) || null
                );
                selectOption(Currencies.find((c) => c.value === value) || null);
                setOpen(false);
              }}
            >
              {currency.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start"
            disabled={mutation.status === "pending"}
          >
            {selectedOption ? selectedOption.label : "Set currency"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <OptionList />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start"
          disabled={mutation.status === "pending"}
        >
          {selectedOption ? selectedOption.label : "Set currency"}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mt-4 border-t">
          <OptionList />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
