export const currencies = [
  { value: "USD", label: "$ Dollar", locale: "en-US" },
  { value: "EUR", label: "€ Euro", locale: "de-DE" },
  { value: "GBP", label: "£ Pound", locale: "en-GB" },
  { value: "JPY", label: "¥ Yen", locale: "ja-JP" },
  { value: "KES", label: "KSh Kenyan Shilling", locale: "en-KE" },
  { value: "NGN", label: "₦ Naira", locale: "en-NG" },
  { value: "ZAR", label: "R Rand", locale: "en-ZA" },
  { value: "INR", label: "₹ Rupee", locale: "en-IN" },
  { value: "CNY", label: "¥ Yuan", locale: "zh-CN" },
  { value: "AUD", label: "A$ Australian Dollar", locale: "en-AU" },
  { value: "CAD", label: "C$ Canadian Dollar", locale: "en-CA" },
];

export type Currency = (typeof currencies)[number];

export function GetFormatterForCurrency(currency: string) {
  const locale = currencies.find((c) => c.value === currency)?.locale || "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  });
}
