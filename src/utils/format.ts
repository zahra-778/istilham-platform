const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

export function toArabicDigits(value: number | string): string {
  return String(value).replace(/[0-9]/g, (d) => arabicDigits[Number(d)] ?? d);
}

export function toArabicNumber(value: number): string {
  return toArabicDigits(new Intl.NumberFormat("en-US").format(value)).replace(/,/g, "٬");
}

export function toArabicPercent(value: number): string {
  return `${toArabicDigits(Math.round(value))}٪`;
}
