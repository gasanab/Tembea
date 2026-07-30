import { z } from "zod";

const booleanFlag = z
  .preprocess((value) => {
    if (typeof value !== "string") return value;
    if (["true", "1", "yes", "on"].includes(value.toLowerCase())) return true;
    if (["false", "0", "no", "off", ""].includes(value.toLowerCase())) return false;
    return value;
  }, z.boolean())
  .default(false);

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.string().optional().default("4000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  CORS_ORIGIN: z
    .string()
    .refine(
      (value) =>
        value
          .split(",")
          .map((origin) => origin.trim())
          .filter(Boolean)
          .every((origin) => {
            try {
              new URL(origin);
              return true;
            } catch {
              return false;
            }
          }),
      "CORS_ORIGIN must be a comma-separated list of absolute URLs",
    )
    .default("http://localhost:3000"),
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),
  BOOKING_HOLD_MINUTES: z
    .preprocess(
      (value) => (value === undefined ? value : Number(value)),
      z.number().int().min(5).max(120),
    )
    .default(15),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default("24h"),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  CLOUDINARY_UPLOAD_FOLDER: z.string().min(1).default("tembea"),
  PAYMENTS_ENABLED: booleanFlag,
  PAYMENT_WEBHOOKS_ENABLED: booleanFlag,
  PAYMENT_PROVIDER: z.enum(["flutterwave"]).default("flutterwave"),
  PAYMENT_REDIRECT_URL: z.string().url().optional(),
  FLUTTERWAVE_API_BASE_URL: z.string().url().default("https://api.flutterwave.com/v3"),
  FLUTTERWAVE_SECRET_KEY: z.string().optional(),
  FLUTTERWAVE_WEBHOOK_HASH: z.string().optional(),
  PLATFORM_COMMISSION_RATE: z
    .preprocess((value) => (value === undefined ? value : Number(value)), z.number().min(0).lt(1))
    .default(0.1),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),
  ALLOW_DEV_PASSWORD_RESET_LOG: booleanFlag,
}).superRefine((config, context) => {
  if (config.NODE_ENV === "production") {
    for (const field of [
      "CLOUDINARY_CLOUD_NAME",
      "CLOUDINARY_API_KEY",
      "CLOUDINARY_API_SECRET",
      "RESEND_API_KEY",
      "EMAIL_FROM",
    ] as const) {
      if (!config[field]) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: [field],
          message: "Required in production",
        });
      }
    }

    const frontendUrl = new URL(config.FRONTEND_URL);
    if (
      frontendUrl.protocol !== "https:" ||
      ["localhost", "127.0.0.1"].includes(frontendUrl.hostname)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["FRONTEND_URL"],
        message: "Production FRONTEND_URL must be a public HTTPS URL",
      });
    }

    const corsOrigins = config.CORS_ORIGIN.split(",").map((origin) => origin.trim());
    if (
      corsOrigins.some((origin) => {
        const url = new URL(origin);
        return (
          url.protocol !== "https:" ||
          ["localhost", "127.0.0.1"].includes(url.hostname)
        );
      })
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["CORS_ORIGIN"],
        message: "Production CORS origins must be public HTTPS URLs",
      });
    }

    if (config.JWT_SECRET.length < 32 || config.JWT_REFRESH_SECRET.length < 32) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["JWT_SECRET"],
        message: "Production JWT secrets must contain at least 32 characters",
      });
    }
    if (config.JWT_SECRET === config.JWT_REFRESH_SECRET) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["JWT_REFRESH_SECRET"],
        message: "Access and refresh token secrets must be different",
      });
    }
    if (config.PAYMENTS_ENABLED && !config.PAYMENT_WEBHOOKS_ENABLED) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["PAYMENT_WEBHOOKS_ENABLED"],
        message: "Production payments require signed webhooks",
      });
    }
  }

  if (config.PAYMENTS_ENABLED) {
    if (!config.FLUTTERWAVE_SECRET_KEY) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["FLUTTERWAVE_SECRET_KEY"],
        message: "Required when PAYMENTS_ENABLED=true",
      });
    }
    if (!config.PAYMENT_REDIRECT_URL) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["PAYMENT_REDIRECT_URL"],
        message: "Required when PAYMENTS_ENABLED=true",
      });
    }
  }
  if (config.PAYMENT_WEBHOOKS_ENABLED) {
    if (!config.FLUTTERWAVE_WEBHOOK_HASH) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["FLUTTERWAVE_WEBHOOK_HASH"],
        message: "Required when PAYMENT_WEBHOOKS_ENABLED=true",
      });
    }
    if (!config.FLUTTERWAVE_SECRET_KEY) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["FLUTTERWAVE_SECRET_KEY"],
        message: "Required when PAYMENT_WEBHOOKS_ENABLED=true",
      });
    }
  }
});

export function validate(config: Record<string, unknown>) {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    throw new Error(`Environment validation failed:\n${result.error.message}`);
  }
  return result.data;
}
