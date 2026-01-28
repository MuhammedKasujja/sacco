export function formatPrice(amount: number, { showZeroAsNumber = false } = {}) {
  const formatter = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  });

  if (amount === 0 && !showZeroAsNumber) return "Free";
  return formatter.format(amount);
}

export function formatNumber(
  number: number,
  options?: Intl.NumberFormatOptions
) {
  const formatter = new Intl.NumberFormat(undefined, options);
  return formatter.format(number);
}

export function formatDate(
  date: Date | string | number | undefined,
  opts: Intl.DateTimeFormatOptions = {}
) {
  if (!date) return "";
  try {
    return new Intl.DateTimeFormat(undefined, {
      // month: opts.month ?? "long",
      // day: opts.day ?? "numeric",
      // year: opts.year ?? "numeric",
      dateStyle: "medium",
      timeStyle: "short",
      ...opts,
    }).format(new Date(date));
  } catch (_) { // eslint-disable-line @typescript-eslint/no-unused-vars
    return "";
  }
}

export function formatPlural(
  count: number,
  { singular, plural }: { singular: string; plural: string },
  { includeCount = true } = {}
) {
  const word = count === 1 ? singular : plural;

  return includeCount ? `${count} ${word}` : word;
}

export const formatDateTime = (
  datetime: Date | string | number | undefined | null,
  options?: Intl.DateTimeFormatOptions
) => {
  if (!datetime) return "";
  try {
    return new Date(datetime).toLocaleTimeString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
      ...options,
    });
  } catch (_) { // eslint-disable-line @typescript-eslint/no-unused-vars
    return "";
  }
};
