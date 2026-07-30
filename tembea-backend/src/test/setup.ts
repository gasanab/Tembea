import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { AppModule } from "../app.module";
import { GlobalExceptionFilter } from "../common/filters/http-exception.filter";
import { ResponseInterceptor } from "../common/interceptors/response.interceptor";
import { PrismaService } from "../prisma/prisma.service";
import * as cookieParser from "cookie-parser";
import { ThrottlerGuard } from "@nestjs/throttler";

/**
 * Test helper utilities for integration tests
 */

const generatedTestEmails = new Set<string>();

export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(ThrottlerGuard)
    .useValue({ canActivate: () => true })
    .compile();

  const app = moduleFixture.createNestApplication();
  
  // Apply same global settings as main.ts
  app.use(cookieParser());
  app.setGlobalPrefix("api");
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
  
  await app.init();
  return app;
}

export async function cleanupApp(app: INestApplication): Promise<void> {
  const emails = [...generatedTestEmails];
  if (emails.length > 0) {
    const prisma = app.get(PrismaService);
    await prisma.user.deleteMany({
      where: {
        email: { in: emails },
      },
    });
    generatedTestEmails.clear();
  }

  await app.close();
}

export function generateTestEmail(): string {
  const email = `test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
  generatedTestEmails.add(email);
  return email;
}

export function generateTestName(): string {
  return `Test User ${Date.now()}`;
}
