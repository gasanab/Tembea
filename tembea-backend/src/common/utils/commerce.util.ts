import { BadRequestException } from "@nestjs/common";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}(?:T.*)?$/;

export function asRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function normalizeCurrency(value: unknown, fallback = "USD"): string {
  const candidate = typeof value === "string" ? value.trim().toUpperCase() : "";
  return /^[A-Z]{3}$/.test(candidate) ? candidate : fallback;
}

export function listingCurrency(extraData: unknown): string {
  return normalizeCurrency(asRecord(extraData).currency);
}

export function roundMoney(value: number): number {
  if (!Number.isFinite(value) || value < 0) {
    throw new BadRequestException("Calculated amount is invalid");
  }
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function positiveInteger(
  value: unknown,
  fieldName: string,
  fallback?: number,
): number {
  const candidate = value === undefined || value === null ? fallback : Number(value);
  if (!Number.isInteger(candidate) || Number(candidate) < 1) {
    throw new BadRequestException(`${fieldName} must be a positive integer`);
  }
  return Number(candidate);
}

export function billableDays(
  startValue: unknown,
  endValue: unknown,
  startName: string,
  endName: string,
): number {
  if (
    typeof startValue !== "string" ||
    typeof endValue !== "string" ||
    !ISO_DATE.test(startValue) ||
    !ISO_DATE.test(endValue)
  ) {
    throw new BadRequestException(`${startName} and ${endName} are required`);
  }

  const start = new Date(startValue);
  const end = new Date(endValue);
  const duration = end.getTime() - start.getTime();
  const days = Math.ceil(duration / 86_400_000);
  if (!Number.isFinite(days) || days < 1) {
    throw new BadRequestException(`${endName} must be after ${startName}`);
  }
  return days;
}

export function moneyEquals(left: number, right: number): boolean {
  return Math.abs(roundMoney(left) - roundMoney(right)) < 0.005;
}
