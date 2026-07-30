import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { GlobalExceptionFilter } from "./common/filters/http-exception.filter";
import { ResponseInterceptor } from "./common/interceptors/response.interceptor";
import * as cookieParser from "cookie-parser";
import helmet from "helmet";

const parseCorsOrigins = (value?: string) => {
  const origins = (value ?? "http://localhost:3000,http://localhost:3001,http://localhost:3002")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return origins.length > 1 ? origins : origins[0];
};

async function bootstrap() {
  // Preserve the exact request bytes for payment webhook signature checks.
  const app = await NestFactory.create(AppModule, { rawBody: true });

  // Security
  app.use(helmet());
  app.use(cookieParser());

  app.setGlobalPrefix('api');

  // CORS - allow the Next.js frontend
  app.enableCors({
    origin: parseCorsOrigins(process.env.CORS_ORIGIN),
    credentials: true, // required for cookie-based auth
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,       // auto-transform query params to correct types
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global response wrapper
  app.useGlobalInterceptors(new ResponseInterceptor());

  const swaggerEnabled = process.env.NODE_ENV !== "production";
  if (swaggerEnabled) {
    const config = new DocumentBuilder()
      .setTitle("Tembea API")
      .setDescription("Rwanda tourism marketplace backend")
      .setVersion("1.0")
      .addBearerAuth()
      .addCookieAuth("tembea_token")
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api/docs", app, document, {
      swaggerOptions: { persistAuthorization: false },
    });
  }

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  console.log(`\n🚀 Tembea API running at http://localhost:${port}`);
  if (swaggerEnabled) {
    console.log(`📚 Swagger docs at http://localhost:${port}/api/docs\n`);
  }
}

bootstrap();
