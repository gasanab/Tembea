import { validate } from "./env.validation";

const developmentConfig = {
  DATABASE_URL: "postgresql://postgres:password@localhost:5432/tembea",
  NODE_ENV: "development",
  JWT_SECRET: "development-access-secret",
  JWT_REFRESH_SECRET: "development-refresh-secret",
};

const productionConfig = {
  ...developmentConfig,
  NODE_ENV: "production",
  FRONTEND_URL: "https://tembea.example",
  CORS_ORIGIN: "https://tembea.example,https://admin.tembea.example",
  JWT_SECRET: "production-access-secret-with-32-characters",
  JWT_REFRESH_SECRET: "production-refresh-secret-with-32-characters",
  CLOUDINARY_CLOUD_NAME: "tembea",
  CLOUDINARY_API_KEY: "cloudinary-key",
  CLOUDINARY_API_SECRET: "cloudinary-secret",
  RESEND_API_KEY: "resend-key",
  EMAIL_FROM: "support@tembea.example",
};

describe("environment validation", () => {
  it("accepts the minimal development configuration", () => {
    expect(validate(developmentConfig)).toMatchObject({
      NODE_ENV: "development",
      PAYMENTS_ENABLED: false,
      PAYMENT_WEBHOOKS_ENABLED: false,
    });
  });

  it("accepts explicit production origins and service configuration", () => {
    expect(validate(productionConfig)).toMatchObject({
      NODE_ENV: "production",
      FRONTEND_URL: "https://tembea.example",
    });
  });

  it("rejects localhost origins in production", () => {
    expect(() =>
      validate({
        ...productionConfig,
        FRONTEND_URL: "http://localhost:3000",
        CORS_ORIGIN: "http://localhost:3000",
      }),
    ).toThrow("Production FRONTEND_URL must be a public HTTPS URL");
  });

  it("requires signed webhooks whenever production payments are enabled", () => {
    expect(() =>
      validate({
        ...productionConfig,
        PAYMENTS_ENABLED: "true",
        PAYMENT_WEBHOOKS_ENABLED: "false",
        PAYMENT_REDIRECT_URL: "https://tembea.example/payment/callback",
        FLUTTERWAVE_SECRET_KEY: "flutterwave-secret",
      }),
    ).toThrow("Production payments require signed webhooks");
  });
});
